import { useState, useEffect } from 'react'
import { ShoppingCart, Pill, Heart, Car, Laptop, UtensilsCrossed, Shirt, MoreHorizontal, Plus, X } from 'lucide-react'
import { supabase } from '../../src/lib/supabase'

const PRESET_ICONS = [ShoppingCart, Pill, Heart, Car, Laptop, UtensilsCrossed, Shirt, MoreHorizontal]
const PRESET_COLORS = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-gray-500']

interface Category {
  id: string
  name: string
  color: string
  receipts_count?: number
  total_spent?: number
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)

    const { data: receipts } = await supabase
      .from('receipts')
      .select('category_id, total_amount')
      .eq('user_id', user.id)

    const enriched = (cats ?? []).map(cat => {
      const related = (receipts ?? []).filter(r => r.category_id === cat.id)
      return {
        ...cat,
        receipts_count: related.length,
        total_spent: related.reduce((sum, r) => sum + (r.total_amount ?? 0), 0)
      }
    })

    setCategories(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('categories').insert({
      user_id: user.id,
      name: newName.trim(),
      color: newColor
    })

    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setShowModal(false)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          No categories yet — add your first one!
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = PRESET_ICONS[index % PRESET_ICONS.length]
            const color = category.color ?? PRESET_COLORS[index % PRESET_COLORS.length]
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative group">
                <button
                  onClick={() => handleDelete(category.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`w-3 h-3 ${color} rounded-full`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{category.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receipts</span>
                    <span className="text-sm font-medium text-gray-800">{category.receipts_count ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total spent</span>
                    <span className="text-sm font-medium text-gray-800">
                      {(category.total_spent ?? 0).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add category</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Groceries"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-8 h-8 rounded-full ${color} ${newColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}