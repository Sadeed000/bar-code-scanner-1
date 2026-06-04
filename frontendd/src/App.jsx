import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PublicProfile from "./pages/PublicProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditBrand from "./pages/AdminEditBrand";
import AdminBrands from "./pages/AdminBrands";
import AdminSellers from "./pages/AdminSellers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminPayments from "./pages/AdminPayments";
import AdminSettings from "./pages/AdminSettings";
import AdminLayout from "./layout/AdminLayout";
import BulkReview from "./pages/BulkReview";
import AdminContactInbox from "./pages/AdminContactInbox";

function requireAuth(element) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/p/:slug" element={<PublicProfile />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={requireAuth(<AdminLayout />)}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/brands" element={<AdminBrands />} />
          <Route path="/admin/brands/:id" element={<AdminEditBrand />} />
          <Route path="/admin/contact-inbox" element={<AdminContactInbox />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/payments" element={<AdminPayments />} />

          <Route path="/admin/reviews" element={<BulkReview />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/p/cafe-bliss" replace />} />
      </Routes>
    </BrowserRouter>
  );
}