import { BrowserRouter, Routes, Route } from 'react-router'
import LandingPage from './components/LandingPage'
import SignUpPage from './components/SignUpPage'
import SignInPage from './components/SignInPage'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import UploadReceipt from './components/UploadReceipt'
import ProcessingScreen from './components/ProcessingScreen'
import ReviewExtractedData from './components/ReviewExtractedData'
import ReceiptsHistory from './components/ReceiptsHistory'
import ReceiptDetail from './components/ReceiptDetail'
import Analytics from './components/Analytics'
import Categories from './components/Categories'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './components/NotFoundPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadReceipt />} />
            <Route path="processing" element={<ProcessingScreen />} />
            <Route path="review" element={<ReviewExtractedData />} />
            <Route path="receipts" element={<ReceiptsHistory />} />
            <Route path="receipts/:id" element={<ReceiptDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="categories" element={<Categories />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}