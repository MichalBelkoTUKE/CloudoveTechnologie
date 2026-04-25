import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { analyzeReceiptWithTextract } from '../services/textract'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    cb(null, allowed.includes(file.mimetype))
  }
})

// POST /api/receipts/upload
router.post('/upload', upload.single('receipt'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    const userId = req.headers['x-user-id'] as string

    if (!file) return res.status(400).json({ error: 'Súbor nebol nahraný' })
    if (!userId) return res.status(401).json({ error: 'Neautorizovaný' })

    // 1. Ulož obrázok do Supabase Storage
    const fileName = `${userId}/${uuidv4()}.${file.mimetype.split('/')[1]}`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file.buffer, { contentType: file.mimetype })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)

    // 2. Vytvor záznam v DB so statusom "processing"
    const { data: receipt, error: insertError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 3. Analyzuj s AWS Textract
    const extracted = await analyzeReceiptWithTextract(file.buffer, file.mimetype)

    // 4. Ulož výsledky do DB
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

    if (updateError) throw updateError

    // 5. Ulož položky bločku
    if (extracted.items.length > 0) {
      await supabase.from('receipt_items').insert(
        extracted.items.map(item => ({
          receipt_id: receipt.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }))
      )
    }

    return res.status(201).json({
      success: true,
      receiptId: receipt.id,
      extracted
    })

  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Chyba pri spracovaní bločku' })
  }
})

// GET /api/receipts
router.get('/', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Neautorizovaný' })

  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// GET /api/receipts/:id
router.get('/:id', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  const { id } = req.params

  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return res.status(404).json({ error: 'Bloček nenájdený' })
  return res.json(data)
})

// PATCH /api/receipts/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string
  const { id } = req.params
  const updates = req.body

  const { data, error } = await supabase
    .from('receipts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

export default router