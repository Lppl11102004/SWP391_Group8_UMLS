import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookMarked,
  BookOpen,
  AlertTriangle,
  ShieldBan,
  Library,
  RefreshCw,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { librarianApi } from '../../api/librarian';

export const LibrarianLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleScanOverdue = async () => {
    setScanning(true);
    try {
      const res = await librarianApi.scanOverdue();
      showToast(res.data?.message || 'Đã kích hoạt quét sách quá hạn toàn hệ thống!', 'success');
    } catch (err) {
      console.error('Scan overdue error:', err);
      showToast(err.response?.data?.message || 'Không thể quét sách quá hạn', 'error');
    } finally {
      setScanning(false);
    }
  };

  const navLinks = [
    { to: '/librarian', label: 'Bảng Điều Khiển', icon: LayoutDashboard, end: true },
    { to: '/librarian/reservations', label: 'Duyệt Phiếu Đặt Giữ', icon: BookMarked },
    { to: '/librarian/borrows', label: 'Mượn Trả Tại Quầy', icon: BookOpen },
    { to: '/librarian/fines', label: 'Quản Lý Thu Phạt', icon: AlertTriangle },
    { to: '/librarian/blacklists', label: 'Danh Sách Hạn Chế', icon: ShieldBan },
    { to: '/librarian/books', label: 'Kho Sách & Bản Sao', icon: Library },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-rose-600 text-white shadow-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden bg-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-tight">ULMS • Quản Trị Thủ Thư</span>
        </div>
        <Link
          to="/"
          className="text-xs text-indigo-200 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Trang Độc Giả</span>
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between z-40 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">ULMS LIBRARIAN</h2>
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider block">
                Nghiệp vụ thư viện
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={handleScanOverdue}
            disabled={scanning}
            className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Quét các phiếu mượn quá hạn và tự động sinh bản ghi phạt"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Đang quét...' : 'Quét trễ hạn thủ công'}</span>
          </button>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="w-full py-2 px-3 bg-violet-950/70 hover:bg-violet-900 text-violet-300 border border-violet-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
              <span>Về Bàn Tổng Quản Trị (Admin)</span>
            </Link>
          )}

          <Link
            to="/"
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem trang Độc Giả</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName || 'Thủ thư'}</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> {user?.role || 'LIBRARIAN'}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default LibrarianLayout;
