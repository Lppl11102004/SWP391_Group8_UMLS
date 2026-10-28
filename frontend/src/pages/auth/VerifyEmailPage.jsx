import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/auth';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authApi.verifyEmail({
        email,
        OTP: otp.trim(),
        tokenType: false, // false = account activation OTP
      });

      if (res.data?.success) {
        setSuccess('Kích hoạt tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Xác thực email thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email để nhận lại mã OTP');
      return;
    }
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await authApi.resendOtp({
        email,
        OTP: '',
        tokenType: false,
      });
      if (res.data?.success) {
        setSuccess('Mã OTP mới đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!');
      } else {
        setError(res.data?.message || 'Không thể gửi lại mã OTP lúc này');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gửi lại OTP thất bại');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Xác Thực Email</h2>
          <p className="mt-2 text-sm text-slate-500">
            Nhập mã OTP gồm 6 chữ số đã được gửi tới hòm thư của bạn
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mã xác thực OTP (6 chữ số)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all tracking-widest font-mono text-center text-lg"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              <span>Kích hoạt tài khoản</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>Chưa nhận được mã? Gửi lại OTP</span>
          </button>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 space-y-1 text-left">
          <p className="font-bold flex items-center space-x-1">
            <span>💡 Mẹo nhận mã OTP nhanh:</span>
          </p>
          <p className="text-amber-700 leading-relaxed">
            Mã OTP gồm 6 chữ số đã được tạo và gửi đến hòm thư của bạn. Nếu bạn đang chạy ứng dụng nội bộ (localhost), mã OTP cũng được in trực tiếp trong cửa sổ <b>Console / Terminal của Backend Spring Boot</b> (dòng <i>OTP xác thực tài khoản</i>).
          </p>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Quay lại{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
