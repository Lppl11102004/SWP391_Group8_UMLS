import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  ShoppingBag, 
  Bell, 
  User, 
  LogOut, 
  BookMarked, 
  Sparkles, 
  CheckCheck, 
  Menu, 
  X,
  CreditCard,
  Receipt,
  AlertTriangle,
  Star,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead 
  } = useNotification();

  const [keyword, setKeyword] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/books?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.notificationId || notif.id);
    }
    setShowNotifications(false);
    if (notif.type === 1 || notif.title?.includes('mượn') || notif.title?.includes('Ticket')) {
      navigate('/reservations');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="bg-indigo-600 group-hover:bg-indigo-700 transition-colors p-2 rounded-xl text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                ULMS
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Library
              </span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-8 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm sách theo tên, ISBN, tác giả..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 rounded-full border border-transparent focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/books"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Kho sách
            </Link>
            <Link
              to="/authors"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Tác giả
            </Link>
            <Link
              to="/plans"
              className="px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/70 rounded-lg transition-colors flex items-center space-x-1 border border-amber-200/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gói Hội Viên</span>
            </Link>
            {(user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
              <Link
                to="/librarian"
                className="px-3 py-2 text-sm font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center space-x-1.5 border border-indigo-200 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Bàn Thủ Thư</span>
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-bold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors flex items-center space-x-1.5 border border-violet-200 shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-violet-600" />
                <span>Tổng Quản Trị</span>
              </Link>
            )}
          </nav>

          {/* User Controls & Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Borrow Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Giỏ mượn sách"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                    title="Thông báo"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
                          {unreadCount > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 font-medium"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Đọc tất cả</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            Không có thông báo nào
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.notificationId || n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-semibold ${!n.isRead ? 'text-indigo-900' : 'text-slate-800'}`}>
                                  {n.title}
                                </h4>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-slate-600 mt-1 line-clamp-2">{n.message || n.content}</p>
                              <span className="text-[10px] text-slate-400 mt-2 block">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                          to="/reservations"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          Xem lịch sử mượn trả
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline-block text-xs font-medium text-slate-700 max-w-[100px] truncate">
                      {user?.fullName || 'Độc giả'}
                    </span>
                  </button>

                  {/* Dropdown items */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-medium rounded-full">
                          Vai trò: {user?.role || 'READER'}
                        </span>
                      </div>

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-violet-700 bg-violet-50/70 hover:bg-violet-100 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-violet-600" />
                          <span>Khu Vực Tổng Quản Trị (Admin)</span>
                        </Link>
                      )}

                      {(user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
                        <>
                          <Link
                            to="/librarian"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Khu Vực Quản Trị Thủ Thư</span>
                          </Link>
                          <div className="border-t border-slate-100 my-1"></div>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <Link
                        to="/reservations"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-slate-400" />
                        <span>Phiếu đặt mượn sách</span>
                      </Link>

                      <Link
                        to="/borrow-records"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span>Lịch sử mượn trả & Gia hạn</span>
                      </Link>

                      <Link
                        to="/fines"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Khoản nợ phạt cá nhân</span>
                      </Link>

                      <Link
                        to="/payments"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Receipt className="w-4 h-4 text-slate-400" />
                        <span>Sao kê giao dịch & Biên lai</span>
                      </Link>

                      <Link
                        to="/my-reviews"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Đánh giá sách của tôi</span>
                      </Link>

                      <Link
                        to="/plans"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Gói hội viên & E-Book</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/verify-email"
                  className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                >
                  Xác thực OTP
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm rounded-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Trang chủ
          </Link>
          <Link
            to="/books"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Kho sách
          </Link>
          <Link
            to="/authors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Tác giả
          </Link>
          <Link
            to="/plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg"
          >
            Gói hội viên & E-Book
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg"
            >
              👑 Tổng Quản Trị (Admin)
            </Link>
          )}
          {(user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
            <Link
              to="/librarian"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg"
            >
              🛡️ Bàn Thủ Thư (Nghiệp vụ)
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700"
              >
                <span>Giỏ mượn sách</span>
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </Link>
              <Link
                to="/reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700"
              >
                Phiếu đặt mượn
              </Link>
              <Link
                to="/borrow-records"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700"
              >
                Lịch sử mượn trả & Gia hạn
              </Link>
              <Link
                to="/fines"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-rose-600"
              >
                Khoản nợ phạt cá nhân
              </Link>
              <Link
                to="/payments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700"
              >
                Lịch sử giao dịch & Biên lai
              </Link>
              <Link
                to="/my-reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-amber-700"
              >
                Đánh giá của tôi
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700"
              >
                Hồ sơ cá nhân
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Đăng ký
                </Link>
              </div>
              <Link
                to="/verify-email"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg"
              >
                Xác thực tài khoản (Nhập OTP)
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
