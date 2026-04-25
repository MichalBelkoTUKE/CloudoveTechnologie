import { Upload, Scan, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPageSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-teal-50">
      <nav className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          SmartReceipt AI
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors">
            Sign in
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all">
            Create account
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">
            Scan receipts. Track expenses.<br />Understand your spending.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload receipts and let AI extract and categorize your expenses automatically.
            Take control of your finances with smart analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg text-lg hover:shadow-xl transition-all">
              Create account
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-lg text-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
              Sign in
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-20">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-64 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Upload className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600">Upload your receipt</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl p-8 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-32 h-32 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">View your analytics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload receipt</h3>
              <p className="text-gray-600">
                Take a photo or upload a scan of your receipt
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI extracts data</h3>
              <p className="text-gray-600">
                Our AI reads and extracts all important information
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track your expenses</h3>
              <p className="text-gray-600">
                Review, categorize, and analyze your spending
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-600">
          <p>&copy; 2026 SmartReceipt AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
