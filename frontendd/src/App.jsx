import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { initializeAuthToken } from "./api/client";
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

function ProtectedAdminRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminLayout />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/p/:slug" element={<PublicProfile />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedAdminRoutes />}>
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
  );
}

export default function App() {
  useEffect(() => {
    // Initialize auth token from localStorage on app load
    initializeAuthToken();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}