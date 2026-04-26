import { createBrowserRouter } from "react-router";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import SignInPage from "./components/SignInPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import UploadReceipt from "./components/UploadReceipt";
import ProcessingScreen from "./components/ProcessingScreen";
import ReviewExtractedData from "./components/ReviewExtractedData";
import ReceiptsHistory from "./components/ReceiptsHistory";
import ReceiptDetail from "./components/ReceiptDetail";
import Analytics from "./components/Analytics";
import Categories from "./components/Categories";
import Profile from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
  {
    path: "/signin",
    Component: SignInPage,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "upload", Component: UploadReceipt },
          { path: "processing", Component: ProcessingScreen },
          { path: "review", Component: ReviewExtractedData },
          { path: "receipts", Component: ReceiptsHistory },
          { path: "receipts/:id", Component: ReceiptDetail },
          { path: "analytics", Component: Analytics },
          { path: "categories", Component: Categories },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
]);
