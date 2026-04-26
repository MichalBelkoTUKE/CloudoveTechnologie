import { TextractClient, AnalyzeExpenseCommand } from '@aws-sdk/client-textract'
import dotenv from 'dotenv'
dotenv.config()

const textractClient = new TextractClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export interface ExtractedReceiptData {
  merchantName: string | null
  totalAmount: number | null
  currency: string | null
  date: string | null
  items: Array<{
    name: string
    quantity: number | null
    unitPrice: number | null
    totalPrice: number | null
  }>
  rawText: string
}

const SKIP_WORDS = ['medzisucet', 'ziava', 'zlava', 'zľava', 'discount', 'subtotal']

export async function analyzeReceiptWithTextract(imageBuffer: Buffer): Promise<ExtractedReceiptData> {
  const command = new AnalyzeExpenseCommand({ Document: { Bytes: imageBuffer } })
  const response = await textractClient.send(command)

  let merchantName: string | null = null
  let totalAmount: number | null = null
  let currency: string | null = null
  let date: string | null = null
  const items: ExtractedReceiptData['items'] = []
  const rawTextParts: string[] = []

  for (const field of response.ExpenseDocuments?.[0]?.SummaryFields ?? []) {
    const type = field.Type?.Text
    const value = field.ValueDetection?.Text
    if (!value) continue
    rawTextParts.push(value)
    switch (type) {
      case 'NAME': case 'VENDOR_NAME': merchantName = value; break
      case 'TOTAL': case 'AMOUNT_PAID': totalAmount = parseFloat(value.replace(',', '.').replace(/[^0-9.]/g, '')); break
      case 'INVOICE_RECEIPT_DATE': date = value; break
      case 'CURRENCY': currency = value; break
    }
  }

  for (const group of response.ExpenseDocuments?.[0]?.LineItemGroups ?? []) {
    for (const lineItem of group.LineItems ?? []) {
      let itemName: string | null = null
      let itemQty: number | null = null
      let itemUnitPrice: number | null = null
      let itemTotal: number | null = null

      for (const field of lineItem.LineItemExpenseFields ?? []) {
        const type = field.Type?.Text
        const value = field.ValueDetection?.Text
        if (!value) continue
        rawTextParts.push(value)

        switch (type) {
          case 'ITEM': {
            const qtyMatch = value.match(/(\d+)\s*ks\s*$/i)
            if (qtyMatch && !itemQty) {
              itemQty = parseInt(qtyMatch[1])
            }
            itemName = value.replace(/\s+\d+\s*ks\s*$/i, '').trim()
            break
          }
          case 'QUANTITY': itemQty = parseFloat(value); break
          case 'UNIT_PRICE': itemUnitPrice = parseFloat(value.replace(',', '.').replace(/[^0-9.]/g, '')); break
          case 'PRICE': itemTotal = parseFloat(value.replace(',', '.').replace(/[^0-9.]/g, '')); break
        }
      }

      const shouldSkip = itemName
        ? SKIP_WORDS.some(word => itemName!.toLowerCase().includes(word))
        : false

      if (itemName && !shouldSkip) {
        items.push({
          name: itemName,
          quantity: itemQty,
          unitPrice: itemUnitPrice,
          totalPrice: itemTotal
        })
      }
    }
  }

  return {
    merchantName,
    totalAmount,
    currency: currency ?? 'EUR',
    date,
    items,
    rawText: rawTextParts.join(' ')
  }
}