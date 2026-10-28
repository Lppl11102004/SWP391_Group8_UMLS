import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Receipt, 
  CreditCard,
  RotateCw,
  Home
} from 'lucide-react';
import { paymentApi } from '../api/payment';
import { useAuth } from '../context/AuthContext';

export const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  const timerRef = useRef(null);

  // 1. Xác thực giao dịch với Backend
  useEffect(() => {
    const verifyPayment = async () => {
      const successParam = searchParams.get('success');
      if (successParam !== null) {
        setResult({
          success: successParam === 'true',
          txnRef: searchParams.get('txnRef'),
          responseCode: searchParams.get('responseCode'),
          paymentType: searchParams.get('paymentType'),
          message: searchParams.get('message'),
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        const res = await paymentApi.handleCallback(params);
        setResult(res.data?.data);
      } catch (err) {
        console.error('Payment verification failed:', err);
        const errData = err.response?.data?.data;
        if (errData) {
          setResult(errData);
        } else {
          setError(err.response?.data?.message || 'Giao dịch thanh toán thất bại hoặc bị huỷ');
        }
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.toString()) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPay');
    }
  }, [searchParams]);

  // 2. Xác định đích đến quay về (Target URL & Target Name)
  const isStaff = user?.role?.roleId === 2 || user?.role?.roleId === 3;
  const pType = Number(searchParams.get('paymentType') || result?.paymentType);

  let targetUrl = '/';
  let targetLabel = 'Trang chủ';

  const savedUrl = sessionStorage.getItem('vnpay_return_url');
  if (savedUrl) {
    targetUrl = savedUrl;
    if (savedUrl.includes('/fines')) {
      targetLabel = isStaff && savedUrl.includes('/librarian') ? 'Danh sách khoản phạt (Thủ thư)' : 'Danh sách khoản phạt';
    } else if (savedUrl.includes('/plans')) {
      targetLabel = 'Gói hội viên thư viện';
    } else if (savedUrl.includes('/borrow')) {
      targetLabel = isStaff && savedUrl.includes('/librarian') ? 'Quản lý mượn trả (Thủ thư)' : 'Lịch sử mượn trả';
    } else {
      targetLabel = 'Trang trước đó';
    }
  } else if (pType === 1) {
    targetUrl = isStaff ? '/librarian/fines' : '/fines';
    targetLabel = isStaff ? 'Danh sách khoản phạt (Thủ thư)' : 'Danh sách khoản phạt';
  } else if (pType === 2) {
    targetUrl = '/plans';
    targetLabel = 'Gói hội viên thư viện';
  } else if (pType === 3) {
    targetUrl = isStaff ? '/librarian/borrows' : '/borrow-records';
    targetLabel = isStaff ? 'Quản lý mượn trả (Thủ thư)' : 'Lịch sử mượn trả';
  }

  // 3. Hàm thực thi chuyển hướng
  const handleDoRedirect = () => {
    if (redirecting) return;
    setRedirecting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    sessionStorage.removeItem('vnpay_return_url');
    navigate(targetUrl, { replace: true });
  };

  // 4. Đồng hồ đếm ngược 5 giây tự động chuyển về
  useEffect(() => {
    if (loading) return;

    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleDoRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, targetUrl]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-700">
          Đang xác thực kết quả giao dịch từ cổng VNPay... Vui lòng chờ trong giây lát.
        </p>
      </div>
    );
  }

  const isSuccess = result?.success || result?.responseCode === '00';
  const displayTxnRef = result?.txnRef || searchParams.get('txnRef') || searchParams.get('vnp_TxnRef') || 'N/A';

  // Xác định thông điệp theo từng loại dịch vụ
  let serviceName = 'Dịch vụ thư viện';
  let successDescription = result?.message || 'Giao dịch thanh toán thành công!';

  if (pType === 1) {
    serviceName = 'Nộp phí phạt thư viện';
    successDescription = 'Khoản tiền phạt đã được thanh toán thành công và tự động gỡ hạn chế trên hệ thống!';
  } else if (pType === 2) {
    serviceName = 'Đăng ký gói hội viên';
    successDescription = 'Chúc mừng bạn đã kích hoạt gói hội viên thành công! Bạn có thể sử dụng đầy đủ đặc quyền ngay bây giờ.';
  } else if (pType === 3) {
    serviceName = 'Tiền đặt cọc mượn sách';
    successDescription = 'Thanh toán tiền cọc thành công! Bạn có thể đến quầy thư viện để nhận sách.';
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Thanh Toán Thành Công!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                {successDescription}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2.5 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã giao dịch:</span>
                <span className="font-mono font-bold text-slate-800">#{displayTxnRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cổng thanh toán:</span>
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> VNPay Sandbox
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nội dung thanh toán:</span>
                <span className="font-bold text-slate-800">{serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Đã hoàn tất
                </span>
              </div>
            </div>

            {/* Auto Redirect Countdown Notice & Progress Bar */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-medium">
                <span>Tự động quay về <b>{targetLabel}</b> sau:</span>
                <span className="inline-flex items-center justify-center font-mono font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-lg shadow-xs">
                  {countdown} giây
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDoRedirect}
                disabled={redirecting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {redirecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Chuyển về {targetLabel} ngay ({countdown}s)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/"
                className="py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về trang chủ thư viện</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Failure Icon */}
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-100">
              <XCircle className="w-10 h-10" />
            </div>

            {/* Failure Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Giao Dịch Chưa Hoàn Tất
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                {result?.message || error || 'Giao dịch thanh toán không thành công hoặc đã bị huỷ bởi người dùng.'}
              </p>
            </div>

            {displayTxnRef !== 'N/A' && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-slate-600 flex justify-between items-center">
                <span>Mã giao dịch tham chiếu:</span>
                <span className="font-mono font-bold text-rose-700">#{displayTxnRef}</span>
              </div>
            )}

            {/* Countdown for failure too */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <span>Tự động quay về <b>{targetLabel}</b>:</span>
              <span className="font-mono font-bold text-slate-800">{countdown}s</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDoRedirect}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Quay lại {targetLabel} ngay ({countdown}s)</span>
              </button>
              <Link
                to="/"
                className="py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về trang chủ thư viện</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
