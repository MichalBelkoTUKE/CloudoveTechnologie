import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";
import {
  deleteReceipt,
  getReceipt,
  rescanReceipt,
  updateReceipt,
} from "../../src/lib/api";

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
}

interface Receipt {
  id: string;
  merchant_name: string | null;
  total_amount: number | null;
  currency: string | null;
  receipt_date: string | null;
  status: string;
  raw_text: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  receipt_items: ReceiptItem[];
}

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawText, setShowRawText] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Re-scan
  const [rescanning, setRescanning] = useState(false);

  async function load() {
    if (!id) return;
    const data = await getReceipt(id);
    setReceipt(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  const handleEdit = () => {
    if (!receipt) return;
    setEditName(receipt.merchant_name ?? "");
    setEditDate(receipt.receipt_date ?? "");
    setEditTotal(receipt.total_amount?.toString() ?? "");
    setEditCurrency(receipt.currency ?? "EUR");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!receipt) return;
    setSaving(true);
    await updateReceipt(receipt.id, {
      merchant_name: editName,
      receipt_date: editDate || null,
      total_amount: parseFloat(editTotal) || null,
      currency: editCurrency,
    });
    setSaving(false);
    setEditing(false);
    load();
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    await deleteReceipt(id);
    navigate("/dashboard/receipts");
  };

  const handleRescan = async () => {
    if (!receipt?.image_url || !id) return;
    setRescanning(true);

    // Nastav status na processing cez backend
    await updateReceipt(id, { status: "processing" });

    // Stiahni obrázok zo Storage
    const imageResponse = await fetch(receipt.image_url);
    const imageBlob = await imageResponse.blob();
    const imageFile = new File([imageBlob], "receipt.jpg", {
      type: imageBlob.type,
    });

    // Pošli na rescan endpoint
    await rescanReceipt(imageFile, id);

    setRescanning(false);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Receipt not found.</p>
        <Link
          to="/dashboard/receipts"
          className="text-blue-600 hover:underline"
        >
          Back to receipts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard/receipts"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Receipt Detail</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Original Receipt
          </h2>
          <div className="aspect-3/4 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
            {receipt.image_url ? (
              <img
                src={receipt.image_url}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Receipt Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Store</span>
                {editing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm w-48 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-medium text-gray-800">
                    {receipt.merchant_name ?? "—"}
                  </span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date</span>
                {editing ? (
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-medium text-gray-800">
                    {receipt.receipt_date ?? "—"}
                  </span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total</span>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editTotal}
                      onChange={(e) => setEditTotal(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm w-24 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>EUR</option>
                      <option>USD</option>
                      <option>GBP</option>
                      <option>CZK</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-medium text-gray-800">
                    {receipt.total_amount
                      ? `${receipt.total_amount.toFixed(2)} ${receipt.currency ?? "€"}`
                      : "—"}
                  </span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    receipt.status === "done"
                      ? "bg-green-100 text-green-700"
                      : receipt.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : receipt.status === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {receipt.status}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Created at</span>
                <span className="text-sm text-gray-800">
                  {new Date(receipt.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Items{" "}
              {receipt.receipt_items.length > 0 &&
                `(${receipt.receipt_items.length})`}
            </h2>
            {receipt.receipt_items.length === 0 ? (
              <p className="text-gray-400 text-sm">No items extracted yet.</p>
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
                    {receipt.receipt_items.map((item) => (
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

          {receipt.raw_text && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  Raw OCR Text
                </span>
                {showRawText ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {showRawText && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                    {receipt.raw_text}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {editing ? (
              <>
                <button
                  onClick={async () => {
                    await handleSave();
                    navigate("/dashboard/analytics");
                  }}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => navigate("/dashboard/analytics")}
                  className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleRescan}
                  disabled={rescanning}
                  className="px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw
                    className={`w-4 h-4 ${rescanning ? "animate-spin" : ""}`}
                  />
                  {rescanning ? "Scanning..." : "Re-scan"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete receipt?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This will permanently delete the receipt and all its items. This
              action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
