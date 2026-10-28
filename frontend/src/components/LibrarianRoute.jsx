import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export const LibrarianRoute = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase();
  const isLibrarianOrAdmin = role === 'LIBRARIAN' || role === 'ADMIN';

  if (!isLibrarianOrAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Truy Cập Bị Giới Hạn
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khu vực này chỉ dành riêng cho tài khoản có vai trò <b>LIBRARIAN (Thủ thư)</b> hoặc <b>ADMIN</b>. Tài khoản hiện tại của bạn là <b>{role || 'READER'}</b>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản Thủ thư</span>
            </button>
            <Link
              to="/"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về trang độc giả</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default LibrarianRoute;
