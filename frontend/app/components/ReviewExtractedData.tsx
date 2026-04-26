import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { AlertCircle } from "lucide-react";
import {
  deleteReceipt,
  getCategories,
  getReceipt,
  updateReceipt,
} from "../../src/lib/api";

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number | null;
  total_price: number | null;
}

export default function ReviewExtractedData() {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptId = location.state?.receiptId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (!receiptId) {
      setLoading(false);
      return;
    }

    const currentReceiptId = receiptId;

    async function load() {
      const receipt = await getReceipt(currentReceiptId);

      if (receipt) {
        setImageUrl(receipt.image_url ?? "");
        setMerchantName(receipt.merchant_name ?? "");
        setDate(receipt.receipt_date ?? "");
        setTotal(receipt.total_amount?.toString() ?? "");
        setCurrency(receipt.currency ?? "EUR");
        setItems(receipt.receipt_items ?? []);
        setCategoryId(receipt.category_id ?? "");
      }

      const cats = await getCategories();
      setCategories(cats ?? []);
      setLoading(false);
    }
    load();
  }, [receiptId]);

  const handleSave = async () => {
    if (!receiptId) return;
    setSaving(true);
    await updateReceipt(receiptId, {
      merchant_name: merchantName,
      receipt_date: date || null,
      total_amount: parseFloat(total) || null,
      currency,
      category_id: categoryId || null,
      status: "done",
    });
    navigate("/dashboard/receipts");
  };

  const handleDelete = async () => {
    if (!receiptId || !confirm("Delete this receipt?")) return;
    await deleteReceipt(receiptId);
    navigate("/dashboard/receipts");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!receiptId) {
    return (
      <div className="text-center py-16 text-gray-400">
        No receipt to review.{" "}
        <button
          onClick={() => navigate("/dashboard/upload")}
          className="text-blue-600 hover:underline"
        >
          Upload one
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Review Extracted Data
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-blue-800 text-sm">
          Please review the extracted data before saving. You can edit any field
          if needed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Receipt Image
          </h2>
          <div className="aspect-3/4 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-gray-400 text-sm">No image available</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Receipt Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store name
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>CZK</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">— Select category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Extracted Items
            </h2>
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm">No items extracted.</p>
            ) : (
              <div className="overflow-auto max-h-64">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {item.quantity ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800">
                          {item.total_price
                            ? `${item.total_price.toFixed(2)} €`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save receipt"}
            </button>
            <button
              onClick={() => navigate("/dashboard/upload")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Re-scan
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
