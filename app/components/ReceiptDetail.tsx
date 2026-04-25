import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { ArrowLeft, Edit, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../src/lib/supabase'

interface ReceiptItem {
  id: string
  name: string
  quantity: number | null
  unit_price: number | null
  total_price: number | null
}

interface Receipt {
  id: string
  merchant_name: string | null
  total_amount: number | null
  currency: string | null
  receipt_date: string | null
  status: string
  raw_text: string | null
  image_url: string | null
  created_at: string
  updated_at: string | null
  receipt_items: ReceiptItem[]
}

export default function ReceiptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRawText, setShowRawText] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      setReceipt(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this receipt?')) return
    setDeleting(true)
    await supabase.from('receipts').delete().eq('id', id)
    navigate('/dashboard/receipts')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Receipt not found.</p>
        <Link to="/dashboard/receipts" className="text-blue-600 hover:underline">Back to receipts</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/receipts" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Receipt Detail</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Original Receipt</h2>
          <div className="aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
            {receipt.image_url ? (
              <img src={receipt.image_url} alt="Receipt" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Receipt Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Store</span>
                <span className="font-medium text-gray-800">{receipt.merchant_name ?? '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-800">{receipt.receipt_date ?? '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total</span>
                <span className="font-medium text-gray-800">
                  {receipt.total_amount ? `${receipt.total_amount.toFixed(2)} ${receipt.currency ?? '€'}` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium text-gray-800">{receipt.currency ?? '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  receipt.status === 'done' ? 'bg-green-100 text-green-700' :
                  receipt.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  receipt.status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {receipt.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Created at</span>
                <span className="text-sm text-gray-800">
                  {new Date(receipt.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Items {receipt.receipt_items.length > 0 && `(${receipt.receipt_items.length})`}
            </h2>
            {receipt.receipt_items.length === 0 ? (
              <p className="text-gray-400 text-sm">No items extracted yet.</p>
            ) : (
              <div className="overflow-auto max-h-64">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipt.receipt_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.quantity ?? '—'}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800">
                          {item.total_price ? `${item.total_price.toFixed(2)} €` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {receipt.raw_text && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">Raw OCR Text</span>
                {showRawText ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
              {showRawText && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{receipt.raw_text}</pre>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Re-scan
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}