import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { myPaymentsApi } from '../api/myPayments';
import { formatVND } from '../utils/format';

export const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncingRef, setSyncingRef] = useState(null);
  const [message, setMessage] = useState(null);

  // Filters
  const [paymentType, setPaymentType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (paymentType !== '') params.paymentType = paymentType;
      if (paymentMethod !== '') params.paymentMethod = paymentMethod;
      if (status !== '') params.status = status;

      const res = await myPaymentsApi.getPaymentHistory(params);
      const pageData = res.data?.data;
      if (pageData) {
        setPayments(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setPayments([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [paymentType, paymentMethod, status, page]);

  // Sync with VNPay QueryDR
  const handleSyncPayment = async (txnRef) => {
    setSyncingRef(txnRef);
    try {
      const res = await myPaymentsApi.syncPayment(txnRef);
      setMessage({
        type: 'success',
        text: res.data?.message || 'Đồng bộ giao dịch thành công! Dịch vụ đã được cập nhật.',
      });
      await fetchPayments();
    } catch (err) {
      console.error('Error syncing payment:', err);
      let errorMsg = err.response?.data?.message || 'Không thể đồng bộ giao dịch với VNPay.';
      if (errorMsg.includes('NullPointerException') || errorMsg.includes('Cannot invoke') || errorMsg.includes('membershipPlan')) {
        errorMsg = 'Giao dịch chưa được hệ thống ghi nhận đầy đủ hoặc không tìm thấy dữ liệu gói tương ứng. Vui lòng liên hệ thủ thư để được trợ giúp.';
      }
      setMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setSyncingRef(null);
    }
  };

  const getTypeLabel = (type) => {
    switch (Number(type)) {
      case 1:
        return 'Nộp tiền phạt';
      case 2:
        return 'Gói hội viên';
      case 3:
        return 'Đặt cọc mượn sách';
      case 4:
        return 'Hoàn trả tiền cọc';
      default:
        return 'Giao dịch khác';
    }
  };

  const getMethodBadge = (method) => {
    switch (Number(method)) {
      case 2:
        return (
          <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            VNPay
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            Tiền mặt (CASH)
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">Không rõ</span>;
    }
  };

  const renderStatusBadge = (s) => {
    switch (Number(s)) {
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Thành công
          </span>
        );
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Chờ xử lý (Pending)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Thất bại / Hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-600" />
            Lịch Sử Giao Dịch & Biên Lai
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu sao kê các khoản phí, tiền cọc mượn sách, nộp phạt và mua gói hội viên.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Làm mới
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Bộ lọc:
          </span>

          {/* Payment Type */}
          <select
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value);
              setPage(0);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="2">Gói hội viên (MEMBERSHIP)</option>
            <option value="3">Đặt cọc mượn sách (DEPOSIT)</option>
            <option value="1">Nộp tiền phạt (FINE)</option>
            <option value="4">Hoàn trả cọc (REFUND)</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(0);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Mọi hình thức</option>
            <option value="2">VNPay Online</option>
            <option value="1">Tiền mặt tại quầy</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Mọi trạng thái</option>
            <option value="1">Thành công</option>
            <option value="0">Chờ xử lý (Pending)</option>
            <option value="2">Thất bại</option>
          </select>
        </div>

        {(paymentType !== '' || paymentMethod !== '' || status !== '') && (
          <button
            onClick={() => {
              setPaymentType('');
              setPaymentMethod('');
              setStatus('');
              setPage(0);
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Main Table / Cards */}
      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải lịch sử giao dịch...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Chưa có giao dịch nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Bạn chưa thực hiện bất kỳ giao dịch nào hoặc không có bản ghi khớp với bộ lọc đã chọn.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã giao dịch (TxnRef)</th>
                    <th className="py-3.5 px-4">Loại giao dịch</th>
                    <th className="py-3.5 px-4">Hình thức</th>
                    <th className="py-3.5 px-4 text-right">Số tiền</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.map((p) => {
                    const isPending = Number(p.status) === 0;
                    const isVNPay = Number(p.paymentMethod) === 2;

                    return (
                      <tr key={p.paymentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          #{p.txnRef || p.paymentId}
                          {p.bankCode && (
                            <span className="block font-normal text-[10px] text-slate-400">
                              Ngân hàng: {p.bankCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {getTypeLabel(p.paymentType)}
                          </span>
                          {p.note && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                              {p.note}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">{getMethodBadge(p.paymentMethod)}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                          {formatVND(p.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleString('vi-VN')
                            : p.createdAt
                            ? new Date(p.createdAt).toLocaleString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">{renderStatusBadge(p.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          {isVNPay && isPending && (
                            <button
                              onClick={() => handleSyncPayment(p.txnRef)}
                              disabled={syncingRef === p.txnRef}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] transition-all disabled:opacity-50 cursor-pointer"
                              title="Kiểm tra lại trạng thái giao dịch với VNPay Sandbox"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${syncingRef === p.txnRef ? 'animate-spin' : ''}`}
                              />
                              {syncingRef === p.txnRef ? 'Đang tra cứu...' : 'Đồng bộ'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 px-3">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPayments;
