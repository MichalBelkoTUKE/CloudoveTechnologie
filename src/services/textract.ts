import {
  TextractClient,
  AnalyzeExpenseCommand
} from '@aws-sdk/client-textract'
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

export async function analyzeReceiptWithTextract(
  imageBuffer: Buffer,
  _mimeType: string
): Promise<ExtractedReceiptData> {
  const command = new AnalyzeExpenseCommand({
    Document: { Bytes: imageBuffer }
  })

  const response = await textractClient.send(command)

  let merchantName: string | null = null
  let totalAmount: number | null = null
  let currency: string | null = null
  let date: string | null = null
  const items: ExtractedReceiptData['items'] = []
  const rawTextParts: string[] = []

  const summaryFields = response.ExpenseDocuments?.[0]?.SummaryFields ?? []
  const lineItemGroups = response.ExpenseDocuments?.[0]?.LineItemGroups ?? []

  for (const field of summaryFields) {
    const type = field.Type?.Text
    const value = field.ValueDetection?.Text
    if (!value) continue
    rawTextParts.push(value)

    switch (type) {
      case 'NAME':
      case 'VENDOR_NAME':
        merchantName = value
        break
      case 'TOTAL':
      case 'AMOUNT_PAID':
        totalAmount = parseFloat(value.replace(/[^0-9.]/g, ''))
        break
      case 'INVOICE_RECEIPT_DATE':
        date = value
        break
      case 'CURRENCY':
        currency = value
        break
    }
  }

  for (const group of lineItemGroups) {
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
          case 'ITEM': itemName = value; break
          case 'QUANTITY': itemQty = parseFloat(value); break
          case 'UNIT_PRICE': itemUnitPrice = parseFloat(value.replace(/[^0-9.]/g, '')); break
          case 'PRICE': itemTotal = parseFloat(value.replace(/[^0-9.]/g, '')); break
        }
      }

      if (itemName) {
        items.push({ name: itemName, quantity: itemQty, unitPrice: itemUnitPrice, totalPrice: itemTotal })
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