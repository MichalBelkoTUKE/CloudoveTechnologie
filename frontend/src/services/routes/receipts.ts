import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { analyzeReceiptWithTextract } from '../services/textract'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    cb(null, allowed.includes(file.mimetype))
  }
})

router.post('/upload', upload.single('receipt'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    const userId = req.headers['x-user-id'] as string
    if (!file) { res.status(400).json({ error: 'Súbor nebol nahraný' }); return }
    if (!userId) { res.status(401).json({ error: 'Neautorizovaný' }); return }

    const ext = file.mimetype.split('/')[1]
    const fileName = `${userId}/${uuidv4()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file.buffer, { contentType: file.mimetype })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)

    const { data: receipt, error: insertError } = await supabase
      .from('receipts')
      .insert({ user_id: userId, image_url: urlData.publicUrl, status: 'processing' })
      .select()
      .single()
    if (insertError) throw insertError

    console.log('Receipt created:', receipt.id)

    const extracted = await analyzeReceiptWithTextract(file.buffer)

    console.log('Textract done, updating...')

    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        merchant_name: extracted.merchantName,
        total_amount: extracted.totalAmount,
        currency: extracted.currency,
        receipt_date: extracted.date,
        raw_text: extracted.rawText,
        extracted_data: extracted,
        status: 'done'
      })
      .eq('id', receipt.id)

    console.log('Update error:', updateError)
    if (updateError) throw updateError

    if (extracted.items.length > 0) {
      const { error: itemsError } = await supabase.from('receipt_items').insert(
        extracted.items.map(item => ({
          receipt_id: receipt.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }))
      )
      console.log('Items error:', itemsError)
    }

    res.status(201).json({ success: true, receiptId: receipt.id, extracted })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Chyba pri spracovaní bločku' })
  }
})

router.post('/rescan', upload.single('receipt'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    const userId = req.headers['x-user-id'] as string
    const receiptId = req.body.receiptId
    if (!file) { res.status(400).json({ error: 'Súbor nebol nahraný' }); return }
    if (!userId || !receiptId) { res.status(401).json({ error: 'Neautorizovaný' }); return }

    const extracted = await analyzeReceiptWithTextract(file.buffer)

    await supabase.from('receipts').update({
      merchant_name: extracted.merchantName,
      total_amount: extracted.totalAmount,
      currency: extracted.currency,
      receipt_date: extracted.date,
      raw_text: extracted.rawText,
      extracted_data: extracted,
      status: 'done'
    }).eq('id', receiptId).eq('user_id', userId)

    if (extracted.items.length > 0) {
      await supabase.from('receipt_items').insert(
        extracted.items.map(item => ({
          receipt_id: receiptId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }))
      )
    }

    res.json({ success: true, extracted })
  } catch (err) {
    console.error('Rescan error:', err)
    res.status(500).json({ error: 'Chyba pri rescanovaní' })
  }
})

router.get('/', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) { res.status(401).json({ error: 'Neautorizovaný' }); return }
  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.get('/:id', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  const { id } = req.params
  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) { res.status(404).json({ error: 'Bloček nenájdený' }); return }
  res.json(data)
})

router.patch('/:id', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  const { id } = req.params
  const { data, error } = await supabase
    .from('receipts')
    .update(req.body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

export default router