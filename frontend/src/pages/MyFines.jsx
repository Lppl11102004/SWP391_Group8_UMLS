import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  FileText
} from 'lucide-react';
import { finesApi } from '../api/fines';

export const MyFines = () => {
  const [selectedStatus, setSelectedStatus] = useState(''); // '' means all
  const [fines, setFines] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Pay Modal
  const [payModal, setPayModal] = useState(null); // fine object
  const [paymentMethod, setPaymentMethod] = useState(2); // 2: VNPay, 1: Cash

  // Detail Modal
  const [activeDetail, setActiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chưa thanh toán (Nợ)', value: '0' },
    { label: 'Đã thanh toán', value: '1' },
    { label: 'Được miễn giảm', value: '2' },
  ];

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await finesApi.getMyFines(selectedStatus, page, 8);
      const pageData = res.data?.data;
      if (pageData) {
        setFines(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setFines([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching fines:', err);
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [selectedStatus, page]);

  // View detail
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await finesApi.getFineDetail(id);
      setActiveDetail(res.data?.data);
    } catch (err) {
      console.error('Error fetching fine detail:', err);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết khoản phạt' });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Pay fine
  const handleSubmitPay = async () => {
    if (!payModal) return;
    setActionLoading(true);
    try {
      const res = await finesApi.payFine(payModal.fineId, paymentMethod);
      if (paymentMethod === 2 && res.data?.data) {
        // Redirect to VNPay
        sessionStorage.setItem('vnpay_return_url', '/fines');
        window.location.href = res.data.data;
        return;
      }
      setMessage({ type: 'success', text: res.data?.message || 'Xử lý thanh toán tiền phạt thành công!' });
      setPayModal(null);
      await fetchFines();
    } catch (err) {
      console.error('Error paying fine:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thanh toán tiền phạt thất bại.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getReasonLabel = (reason) => {
    switch (Number(reason)) {
      case 1:
        return 'Quá hạn trả sách';
      case 2:
        return 'Làm hỏng sách / rách trang';
      case 3:
        return 'Làm mất sách';
      default:
        return 'Vi phạm quy định mượn';
    }
  };

  const renderStatusBadge = (status) => {
    switch (Number(status)) {
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Chưa thanh toán
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Đã thanh toán
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Được miễn giảm
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate total unpaid amount in current loaded list
  const totalUnpaidAmount = fines
    .filter((f) => Number(f.status) === 0)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            Quản Lý Tiền Phạt Cá Nhân
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi các khoản bồi hoàn quá hạn, làm mất hoặc hỏng sách và thanh toán online hoặc tại quầy.
          </p>
        </div>

        <Link
          to="/borrow-records"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto"
        >
          Xem lịch sử mượn trả
        </Link>
      </div>

      {/* Unpaid Warning Banner */}
      {totalUnpaidAmount > 0 && (
        <div className="mb-6 p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Bạn có khoản tiền phạt chưa thanh toán!</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Vui lòng nộp phạt sớm để duy trì quyền gia hạn sách và tránh bị ghi vào danh sách hạn chế mượn (Blacklist).
              </p>
            </div>
          </div>
          <div className="text-right sm:self-center">
            <span className="text-[11px] text-rose-600 block">Tổng số tiền phạt chưa nộp:</span>
            <span className="text-lg font-extrabold text-rose-700">
              {totalUnpaidAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}

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

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedStatus(tab.value);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === tab.value
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách khoản phạt...</p>
        </div>
      ) : fines.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Không có khoản tiền phạt nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Tuyệt vời! Tài khoản của bạn không có bất kỳ khoản nợ phạt nào đang ghi nhận.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fines.map((f) => {
              const isUnpaid = Number(f.status) === 0;

              return (
                <div
                  key={f.fineId}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-rose-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                        Mã phạt #{f.fineId}
                      </span>
                      {renderStatusBadge(f.status)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{getReasonLabel(f.reason)}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sách liên quan: <span className="font-semibold text-slate-700">{f.bookTitles || 'Không có tên cụ thể'}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Số tiền phạt:</span>
                        <span className="text-base font-extrabold text-rose-600">
                          {Number(f.amount || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Mã phiếu mượn:</span>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          #{f.borrowRecordId || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {f.note && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/60">
                        "Ghi chú: {f.note}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Lập biên bản ngày:</span>
                      <span>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDetail(f.fineId)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>

                    {isUnpaid && (
                      <button
                        onClick={() => {
                          setPayModal(f);
                          setPaymentMethod(2);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-rose-200 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Thanh toán ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* DETAIL MODAL */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Biên Lai Khoản Phạt #{activeDetail.fineId}
              </h3>
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lý do phạt:</span>
                <span className="font-bold text-slate-800">{getReasonLabel(activeDetail.reason)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  {Number(activeDetail.amount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <div>{renderStatusBadge(activeDetail.status)}</div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phiếu mượn liên quan:</span>
                <span className="font-mono font-bold text-slate-700">#{activeDetail.borrowRecordId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sách vi phạm:</span>
                <span className="font-semibold text-slate-700 text-right max-w-[200px] truncate">
                  {activeDetail.bookTitles || 'N/A'}
                </span>
              </div>
              {activeDetail.note && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Ghi chú từ thủ thư:</span>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 italic border border-slate-100">
                    "{activeDetail.note}"
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY FINE MODAL */}
      {payModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                Thanh Toán Tiền Phạt
              </h3>
              <button
                onClick={() => setPayModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã khoản phạt:</span>
                <span className="font-bold text-slate-800">#{payModal.fineId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lý do:</span>
                <span className="font-semibold text-slate-700">{getReasonLabel(payModal.reason)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-rose-100/60">
                <span className="text-slate-500">Số tiền cần thanh toán:</span>
                <span className="font-extrabold text-rose-700 text-base">
                  {Number(payModal.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Chọn kênh thanh toán:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(2)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 2
                      ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">VNPay Sandbox</span>
                  <span className="text-[11px] text-slate-500 mt-1">Quét QR / ATM / Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(1)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 1
                      ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">Tiền mặt (CASH)</span>
                  <span className="text-[11px] text-slate-500 mt-1">Nộp tại quầy thư viện</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitPay}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : paymentMethod === 2 ? 'Mở cổng VNPay' : 'Xác nhận nộp tiền mặt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFines;
