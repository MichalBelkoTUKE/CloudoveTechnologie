import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Receipt, TrendingUp, ShoppingCart, Euro } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getReceipts } from "../../src/lib/api";

const COLORS = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444"];

interface ReceiptRow {
  id: string;
  merchant_name: string | null;
  total_amount: number | null;
  currency: string | null;
  receipt_date: string | null;
  status: string;
  category_id: string | null;
}

export default function Dashboard() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getReceipts();
      setReceipts(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalSpent = receipts.reduce(
    (sum, r) => sum + (r.total_amount ?? 0),
    0,
  );
  const avgValue = receipts.length > 0 ? totalSpent / receipts.length : 0;

  // Spending over time (group by month)
  const spendingByMonth: Record<string, number> = {};
  receipts.forEach((r) => {
    if (!r.receipt_date) return;
    const month = new Date(r.receipt_date).toLocaleString("en", {
      month: "short",
    });
    spendingByMonth[month] =
      (spendingByMonth[month] ?? 0) + (r.total_amount ?? 0);
  });
  const spendingOverTime = Object.entries(spendingByMonth).map(
    ([month, amount]) => ({ month, amount: Math.round(amount) }),
  );

  // Category mock (keď nemáme kategórie priradené)
  const categoryData = [
    { name: "Uncategorized", value: totalSpent, color: "#8b5cf6" },
  ];

  const recentReceipts = receipts.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">
              Total spent this month
            </span>
            <Euro className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {totalSpent.toFixed(2)} €
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Receipts uploaded</span>
            <Receipt className="w-5 h-5 text-violet-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {receipts.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Top category</span>
            <ShoppingCart className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {receipts.length > 0 ? "Uncategorized" : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Average receipt value</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {avgValue.toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Spending by category
          </h2>
          {receipts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(e) => `${e.name}: ${e.value}€`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
            Spending over time
          </h2>
          {spendingOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={spendingOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent receipts
          </h2>
          <Link
            to="/dashboard/upload"
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
          >
            Upload new receipt
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentReceipts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No receipts yet —{" "}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReceipts.map((receipt) => (
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
