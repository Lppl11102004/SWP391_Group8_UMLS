import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  Database,
  BarChart3,
  Megaphone,
  Library,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navLinks = [
    { to: '/admin', label: 'Bảng Điều Khiển', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
    { to: '/admin/settings', label: 'Cấu Hình Hệ Thống', icon: Settings },
    { to: '/admin/memberships', label: 'Gói Hội Viên', icon: Sparkles },
    { to: '/admin/master-data', label: 'Danh Mục Dữ Liệu', icon: Database },
    { to: '/admin/reports', label: 'Sổ Cái & Doanh Thu', icon: BarChart3 },
    { to: '/admin/broadcast', label: 'Phát Thông Báo', icon: Megaphone },
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
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
            ULMS • Tổng Quản Trị
          </span>
        </div>
        <Link
          to="/"
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Độc Giả</span>
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-950 text-white flex flex-col justify-between z-40 transition-transform duration-200 border-r border-slate-800/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                ULMS ADMIN
              </h2>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                Tổng quản trị hệ thống
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
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          <Link
            to="/librarian"
            className="w-full py-2 px-3 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            title="Truy cập khu vực nghiệp vụ của thủ thư"
          >
            <Library className="w-3.5 h-3.5" />
            <span>Khu Vực Bàn Thủ Thư</span>
          </Link>

          <Link
            to="/"
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem trang Độc Giả</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName || 'Quản trị viên'}</p>
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  ★ ADMIN ROOT
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet context={{ showToast }} />
      </main>
    </div>
  );
};

export default AdminLayout;
