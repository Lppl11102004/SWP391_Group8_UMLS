import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LibrarianRoute from './components/LibrarianRoute';
import AdminRoute from './components/AdminRoute';
import AiChatWidget from './components/AiChatWidget';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Pages - Core (Reader)
import Home from './pages/Home';
import BookCatalog from './pages/BookCatalog';
import BookDetail from './pages/BookDetail';
import EBookReader from './pages/EBookReader';
import Authors from './pages/Authors';
import BorrowCart from './pages/BorrowCart';
import MyReservations from './pages/MyReservations';
import BorrowRecords from './pages/BorrowRecords';
import MyFines from './pages/MyFines';
import MyPayments from './pages/MyPayments';
import MyReviews from './pages/MyReviews';
import MembershipPlans from './pages/MembershipPlans';
import PaymentCallback from './pages/PaymentCallback';
import Profile from './pages/Profile';

// Pages - Librarian Operations
import LibrarianLayout from './pages/librarian/LibrarianLayout';
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import ReservationManagement from './pages/librarian/ReservationManagement';
import BorrowManagement from './pages/librarian/BorrowManagement';
import FineManagement from './pages/librarian/FineManagement';
import BlacklistManagement from './pages/librarian/BlacklistManagement';
import BookInventory from './pages/librarian/BookInventory';

// Pages - Admin Operations
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';
import MembershipManagement from './pages/admin/MembershipManagement';
import MasterDataManagement from './pages/admin/MasterDataManagement';
import ReportManagement from './pages/admin/ReportManagement';
import BroadcastManagement from './pages/admin/BroadcastManagement';

function AppContent() {
  const location = useLocation();
  const isLibrarianPortal = location.pathname.startsWith('/librarian');
  const isAdminPortal = location.pathname.startsWith('/admin');
  const isManagementPortal = isLibrarianPortal || isAdminPortal;
  const isPaymentCallback = location.pathname.startsWith('/payment/callback') || location.pathname.startsWith('/api/payment/vnpay-callback');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {!isManagementPortal && !isPaymentCallback && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:id" element={<Authors />} />
          <Route path="/plans" element={<MembershipPlans />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* VNPay payment callback */}
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/api/payment/vnpay-callback" element={<PaymentCallback />} />

          {/* Protected routes (READER only) */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <BorrowCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow-records"
            element={
              <ProtectedRoute>
                <BorrowRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fines"
            element={
              <ProtectedRoute>
                <MyFines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <MyPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/read"
            element={
              <ProtectedRoute>
                <EBookReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Librarian Operations (LIBRARIAN / ADMIN) */}
          <Route
            path="/librarian"
            element={
              <LibrarianRoute>
                <LibrarianLayout />
              </LibrarianRoute>
            }
          >
            <Route index element={<LibrarianDashboard />} />
            <Route path="reservations" element={<ReservationManagement />} />
            <Route path="borrows" element={<BorrowManagement />} />
            <Route path="fines" element={<FineManagement />} />
            <Route path="blacklists" element={<BlacklistManagement />} />
            <Route path="books" element={<BookInventory />} />
          </Route>

          {/* Admin Operations (ADMIN only) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="memberships" element={<MembershipManagement />} />
            <Route path="master-data" element={<MasterDataManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="broadcast" element={<BroadcastManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isManagementPortal && !isPaymentCallback && <AiChatWidget />}
      {!isManagementPortal && !isPaymentCallback && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
