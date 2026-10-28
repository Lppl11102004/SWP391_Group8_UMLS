import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_GOOGLE_CLIENT_ID = '941993683678-dt4n7voum0li8te1g40tib57p8v683gs.apps.googleusercontent.com';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasNativeGoogleBtn, setHasNativeGoogleBtn] = useState(false);

  const googleBtnRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

  const getRedirectPath = (roleStr, fromPath) => {
    const role = (roleStr || '').toUpperCase();
    if (role.includes('ADMIN')) {
      if (fromPath && (fromPath.startsWith('/admin') || fromPath.startsWith('/librarian'))) {
        return fromPath;
      }
      return '/admin';
    }
    if (role.includes('LIBRARIAN')) {
      if (fromPath && fromPath.startsWith('/librarian')) {
        return fromPath;
      }
      return '/librarian';
    }
    // READER: Never redirect to /admin or /librarian
    if (fromPath && fromPath !== '/' && !fromPath.startsWith('/login') && !fromPath.startsWith('/admin') && !fromPath.startsWith('/librarian')) {
      return fromPath;
    }
    return '/';
  };

  // Handle Google Token Response from GIS
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('Không nhận được token xác thực từ Google');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.googleLogin(response.credential);
      const resData = res.data;
      if (resData.success && resData.data?.accessToken) {
        login(resData.data.accessToken, resData.data);
        const role = resData.data?.role;
        const targetPath = getRedirectPath(role, from);
        navigate(targetPath, { replace: true });
      } else {
        setError(resData.message || 'Đăng nhập bằng Google không thành công');
      }
    } catch (err) {
      console.error('Google login backend error:', err);
      setError(
        err.response?.data?.message ||
          'Xác thực Google thất bại trên máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    let checkInterval = null;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: 360,
              logo_alignment: 'left',
            });
            setTimeout(() => {
              if (googleBtnRef.current && googleBtnRef.current.children.length > 0) {
                setHasNativeGoogleBtn(true);
              }
            }, 300);
          }
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          setupGoogle();
        }
      }, 250);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const doLogin = async (credentials) => {
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(credentials);
      const resData = res.data;
      if (resData.success && resData.data?.accessToken) {
        login(resData.data.accessToken, resData.data);
        const role = resData.data?.role;
        const targetPath = getRedirectPath(role, from);
        navigate(targetPath, { replace: true });
      } else {
        setError(resData.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin({
      email: formData.email ? formData.email.trim() : '',
      password: formData.password ? formData.password.trim() : '',
    });
  };

  const handleCustomGoogleClick = () => {
    if (googleBtnRef.current && googleBtnRef.current.children.length > 0) {
      const el = googleBtnRef.current.querySelector('div[role=button], iframe, button');
      if (el) {
        el.click();
        return;
      }
    }
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google prompt status:', notification);
          }
        });
      } catch (e) {
        console.warn('Google prompt err:', e);
      }
    } else {
      setError('Đang kết nối dịch vụ Google Sign-In, vui lòng thử lại sau vài giây.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Nhập Độc Giả</h2>
          <p className="mt-2 text-sm text-slate-500">
            Truy cập hệ thống thư viện trực tuyến ULMS
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex flex-col space-y-2">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('chưa được kích hoạt') && (
              <Link
                to={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                className="mt-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold text-center transition-colors"
              >
                Nhập mã OTP kích hoạt tài khoản ngay &rarr;
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="reader@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Đăng nhập</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Hoặc</span>
          </div>
        </div>

        {/* Google Login Container */}
        <div className="w-full flex flex-col items-center">
          {/* Native Google GIS Render Target */}
          <div
            ref={googleBtnRef}
            className={`w-full flex justify-center ${hasNativeGoogleBtn ? 'block' : 'hidden'}`}
          ></div>

          {/* Guaranteed Visible Google Button */}
          {!hasNativeGoogleBtn && (
            <button
              type="button"
              onClick={handleCustomGoogleClick}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all flex items-center justify-center space-x-2.5 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng nhập với Google</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 space-y-2">
          <p className="text-xs text-slate-500">
            Chưa có tài khoản độc giả?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Đã đăng ký nhưng chưa xác thực?{' '}
            <Link to="/verify-email" className="text-indigo-600 font-semibold hover:underline">
              Xác thực OTP kích hoạt
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
