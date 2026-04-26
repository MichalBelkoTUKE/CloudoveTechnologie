import { Link } from 'react-router'
import { Receipt } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-teal-50 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl mb-6">
          <Receipt className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page not found</h2>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go home
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}