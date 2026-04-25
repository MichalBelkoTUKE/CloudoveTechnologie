const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function uploadReceipt(file: File, userId: string) {
  const formData = new FormData()
  formData.append('receipt', file)

  const res = await fetch(`${API_URL}/api/receipts/upload`, {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: formData
  })

  if (!res.ok) throw new Error('Chyba pri nahrávaní')
  return res.json()
}

export async function getReceipts(userId: string) {
  const res = await fetch(`${API_URL}/api/receipts`, {
    headers: { 'x-user-id': userId }
  })
  if (!res.ok) throw new Error('Chyba pri načítaní')
  return res.json()
}

export async function getReceipt(id: string, userId: string) {
  const res = await fetch(`${API_URL}/api/receipts/${id}`, {
    headers: { 'x-user-id': userId }
  })
  if (!res.ok) throw new Error('Bloček nenájdený')
  return res.json()
}

export async function updateReceipt(id: string, userId: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/receipts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Chyba pri aktualizácii')
  return res.json()
}