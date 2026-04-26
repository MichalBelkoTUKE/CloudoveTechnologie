import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Euro, Receipt, ShoppingCart, Store } from "lucide-react";
import { getReceipts } from "../../src/lib/api";

const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#10b981",
];

interface ReceiptRow {
  id: string;
  merchant_name: string | null;
  total_amount: number | null;
  receipt_date: string | null;
  currency: string | null;
}

export default function Analytics() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function load() {
      const data = await getReceipts();
      const doneReceipts = (data ?? [])
        .filter((receipt: { status?: string }) => receipt.status === "done")
        .sort(
          (
            a: { receipt_date?: string | null },
            b: { receipt_date?: string | null },
          ) => {
            const aTime = a.receipt_date
              ? new Date(a.receipt_date).getTime()
              : 0;
            const bTime = b.receipt_date
              ? new Date(b.receipt_date).getTime()
              : 0;
            return aTime - bTime;
          },
        );
      setReceipts(doneReceipts);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = receipts.filter((r) => {
    if (!r.receipt_date) return true;
    return r.receipt_date >= dateFrom && r.receipt_date <= dateTo;
  });

  const totalSpent = filtered.reduce(
    (sum, r) => sum + (r.total_amount ?? 0),
    0,
  );

  // Monthly spending
  const byMonth: Record<string, number> = {};
  filtered.forEach((r) => {
    if (!r.receipt_date) return;
    const month = new Date(r.receipt_date).toLocaleString("en", {
      month: "short",
    });
    byMonth[month] = (byMonth[month] ?? 0) + (r.total_amount ?? 0);
  });
  const monthlySpending = Object.entries(byMonth).map(([month, amount]) => ({
    month,
    amount: Math.round(amount * 100) / 100,
  }));

  // Top stores
  const byStore: Record<string, { receipts: number; total: number }> = {};
  filtered.forEach((r) => {
    const store = r.merchant_name ?? "Unknown";
    if (!byStore[store]) byStore[store] = { receipts: 0, total: 0 };
    byStore[store].receipts++;
    byStore[store].total += r.total_amount ?? 0;
  });
  const topStores = Object.entries(byStore)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([store, data]) => ({ store, ...data }));

  const mostVisited = topStores[0];

  // Category data (placeholder — reálne kategórie pridáme neskôr)
  const categoryData = topStores.map((s, i) => ({
    name: s.store,
    value: Math.round(s.total * 100) / 100,
    color: COLORS[i % COLORS.length],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total spent</span>
            <Euro className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {totalSpent.toFixed(2)} €
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Number of receipts</span>
            <Receipt className="w-5 h-5 text-violet-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {filtered.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Top store by spending</span>
            <ShoppingCart className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {topStores[0]?.store ?? "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {topStores[0] ? `${topStores[0].total.toFixed(2)} €` : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Most visited store</span>
            <Store className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {mostVisited?.store ?? "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {mostVisited ? `${mostVisited.receipts} receipts` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Spending by store
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={(e) => `${e.name}: ${e.value}€`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly spending
          </h2>
          {monthlySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Top stores by spending
          </h2>
        </div>
        {topStores.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No data yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Receipts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total spent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topStores.map((store, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {store.store}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {store.receipts}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {store.total.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
