import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Eye } from "lucide-react";
import { getReceipts } from "../../src/lib/api";

interface ReceiptRow {
  id: string;
  merchant_name: string | null;
  total_amount: number | null;
  currency: string | null;
  receipt_date: string | null;
  status: string;
}

export default function ReceiptsHistory() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [filtered, setFiltered] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getReceipts();
      setReceipts(data ?? []);
      setFiltered(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...receipts];

    if (search) {
      result = result.filter((r) =>
        r.merchant_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (dateFrom) {
      result = result.filter(
        (r) => r.receipt_date && r.receipt_date >= dateFrom,
      );
    }
    if (dateTo) {
      result = result.filter((r) => r.receipt_date && r.receipt_date <= dateTo);
    }
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    if (minAmount) {
      result = result.filter(
        (r) => (r.total_amount ?? 0) >= parseFloat(minAmount),
      );
    }
    if (maxAmount) {
      result = result.filter(
        (r) => (r.total_amount ?? 0) <= parseFloat(maxAmount),
      );
    }

    setFiltered(result);
  }, [search, dateFrom, dateTo, status, minAmount, maxAmount, receipts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Receipts</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by store"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min €
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="mt-4 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max €
          </label>
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="1000.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No receipts found —{" "}
              <Link
                to="/dashboard/upload"
                className="text-blue-600 hover:underline"
              >
                upload your first one!
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {receipt.receipt_date ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {receipt.merchant_name ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {receipt.total_amount
                        ? `${receipt.total_amount.toFixed(2)} ${receipt.currency ?? "€"}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/dashboard/receipts/${receipt.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
