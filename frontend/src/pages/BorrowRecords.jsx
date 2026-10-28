import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  CreditCard,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { borrowRecordApi } from '../api/borrowRecords';
import { formatVND } from '../utils/format';

export const BorrowRecords = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Detail Modal
  const [activeDetail, setActiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Extend Modal
  const [extendModal, setExtendModal] = useState(null); // record to extend

  // Pay Deposit Modal
  const [payDepositModal, setPayDepositModal] = useState(null); // record object
  const [paymentMethod, setPaymentMethod] = useState(2); // 2: VNPay, 1: Cash

  // Review Modal
  const [reviewModal, setReviewModal] = useState(null); // recordId
  const [booksToReview, setBooksToReview] = useState([]);
  const [reviewsData, setReviewsData] = useState({}); // { [bookId]: { rating: 5, comment: '' } }
  const [loadingReviewBooks, setLoadingReviewBooks] = useState(false);

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang mượn', value: '1' },
    { label: 'Chờ lấy sách', value: '0' },
    { label: 'Đã hoàn trả', value: '2' },
    { label: 'Quá hạn', value: '3' },
    { label: 'Đã huỷ', value: '4' },
  ];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await borrowRecordApi.getBorrowRecords(selectedStatus, page, 8);
      const pageData = res.data?.data;
      if (pageData) {
        setRecords(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setRecords([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching borrow records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedStatus, page]);

  // Show toast notification
  const showToast = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Open detail
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await borrowRecordApi.getBorrowRecordDetail(id);
      setActiveDetail(res.data?.data);
    } catch (err) {
      console.error('Error fetching detail:', err);
      showToast('Không thể tải chi tiết phiếu mượn', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Extend Modal
  const handleOpenExtend = (record) => {
    setExtendModal(record);
  };

  // Confirm Extend Borrow Record
  const handleConfirmExtend = async () => {
    if (!extendModal) return;
    const id = extendModal.borrowId || extendModal.borrowRecordId;
    if (!id) {
      showToast('Không xác định được mã phiếu mượn', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await borrowRecordApi.extendBorrowRecord(id);
      showToast(res.data?.message || 'Gia hạn sách thành công thêm 7 ngày!', 'success');
      setExtendModal(null);
      await fetchRecords();
      if (activeDetail && (activeDetail.borrowId === id || activeDetail.borrowRecordId === id)) {
        handleOpenDetail(id);
      }
    } catch (err) {
      console.error('Error extending:', err);
      showToast(err.response?.data?.message || 'Gia hạn thất bại. Vui lòng kiểm tra quy định.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Deposit Modal
  const handleOpenPayDeposit = (record) => {
    setPayDepositModal(record);
    setPaymentMethod(2);
  };

  // Submit Pay Deposit
  const handleSubmitDeposit = async () => {
    if (!payDepositModal) return;
    const targetId = payDepositModal.borrowId || payDepositModal.borrowRecordId;
    if (!targetId) {
      setMessage({ type: 'error', text: 'Không xác định được mã phiếu mượn' });
      return;
    }
    setActionLoading(true);
    try {
      const res = await borrowRecordApi.payDeposit(targetId, paymentMethod);
      if (paymentMethod === 2 && res.data?.data) {
        // Redirect to VNPay Sandbox
        window.location.href = res.data.data;
        return;
      }
      setMessage({ type: 'success', text: res.data?.message || 'Ghi nhận thanh toán tiền cọc thành công!' });
      setPayDepositModal(null);
      await fetchRecords();
    } catch (err) {
      console.error('Deposit payment error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thanh toán tiền cọc thất bại.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Review Modal
  const handleOpenReview = async (recordId) => {
    setReviewModal(recordId);
    setLoadingReviewBooks(true);
    try {
      const res = await borrowRecordApi.getBooksToReview(recordId);
      const books = res.data?.data || [];
      setBooksToReview(books);
      const initial = {};
      books.forEach((b) => {
        initial[b.bookId] = { rating: 5, comment: '' };
      });
      setReviewsData(initial);
    } catch (err) {
      console.error('Error getting review books:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể tải danh sách sách cần đánh giá' });
      setReviewModal(null);
    } finally {
      setLoadingReviewBooks(false);
    }
  };

  // Submit Review
  const handleSubmitReviews = async () => {
    const list = Object.keys(reviewsData).map((bookId) => ({
      bookId: Number(bookId),
      rating: reviewsData[bookId].rating || 5,
      comment: reviewsData[bookId].comment || 'Sách rất hay!',
    }));

    if (list.length === 0) {
      setMessage({ type: 'error', text: 'Không có sách nào để đánh giá' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await borrowRecordApi.submitReview(reviewModal, list);
      setMessage({ type: 'success', text: res.data?.message || 'Gửi đánh giá sách thành công!' });
      setReviewModal(null);
    } catch (err) {
      console.error('Submit review error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Đánh giá thất bại. Vui lòng kiểm tra lại nội dung.' });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (Number(status)) {
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Chờ lấy sách
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Đang mượn
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Đã hoàn trả
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Quá hạn mượn
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Đã huỷ
          </span>
        );
      default:
        return null;
    }
  };

  const renderDepositBadge = (depositStatus) => {
    switch (Number(depositStatus)) {
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã nộp cọc
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Đã hoàn cọc
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Chưa nộp cọc
          </span>
        );
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Chờ hoàn cọc
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
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Lịch Sử Mượn Trả Sách
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi thời hạn mượn sách, tự gia hạn trực tuyến và đánh giá sau khi hoàn tất trả sách.
          </p>
        </div>

        <Link
          to="/reservations"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all self-start sm:self-auto"
        >
          Xem phiếu đặt trước (Reservation)
        </Link>
      </div>

      {/* Floating Toast Notification (Thông báo nổi) */}
      {message && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-full shadow-2xl px-4 pointer-events-auto">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 ml-3 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Records Content */}
      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải lịch sử mượn trả...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy phiếu mượn nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Bạn chưa có phiếu mượn nào theo trạng thái này hoặc chưa thực hiện mượn sách.
            </p>
          </div>
          <Link
            to="/books"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Khám phá kho sách
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((r) => {
              const bId = r.borrowId || r.borrowRecordId;
              const isBorrowing = Number(r.status) === 1;
              const isReturned = Number(r.status) === 2;
              const canExtend = isBorrowing && Number(r.extensionCount || 0) === 0;
              const needPayDeposit = Number(r.status) === 0 && Number(r.depositStatus) === 3 && Number(r.depositAmount || 0) > 0;

              return (
                <div
                  key={bId}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        #{bId}
                      </span>
                      {renderStatusBadge(r.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngày mượn</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {r.borrowDate ? new Date(r.borrowDate).toLocaleDateString('vi-VN') : 'Chưa nhận sách'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Hạn trả (Due date)</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {r.dueDate ? new Date(r.dueDate).toLocaleDateString('vi-VN') : 'Theo quy định'}
                        </span>
                      </div>
                    </div>

                    {/* Deposit Info */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Tiền đặt cọc</span>
                        <span className="font-bold text-slate-800">
                          {r.depositAmount ? formatVND(r.depositAmount) : 'Miễn cọc (0 ₫)'}
                        </span>
                      </div>
                      <div>{renderDepositBadge(r.depositStatus)}</div>
                    </div>

                    {/* Extension Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Đã gia hạn:</span>
                      <span className="font-semibold text-slate-700">
                        {r.extensionCount || 0} / 1 lần
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-end">
                    <button
                      onClick={() => handleOpenDetail(bId)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>

                    {needPayDeposit && (
                      <button
                        onClick={() => handleOpenPayDeposit(r)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-emerald-200 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Nộp tiền cọc
                      </button>
                    )}

                    {canExtend && (
                      <button
                        onClick={() => handleOpenExtend(r)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-indigo-200 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Gia hạn +7 ngày
                      </button>
                    )}

                    {isReturned && (
                      <button
                        onClick={() => handleOpenReview(bId)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-amber-200 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Đánh giá sách
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Chi tiết phiếu mượn #{activeDetail.borrowId || activeDetail.borrowRecordId}</span>
                  {renderStatusBadge(activeDetail.status)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày mượn: {activeDetail.borrowDate ? new Date(activeDetail.borrowDate).toLocaleDateString('vi-VN') : 'Chưa nhận'} |
                  Hạn trả: {activeDetail.dueDate ? new Date(activeDetail.dueDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </p>
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deposit Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Tiền cọc</span>
                <span className="font-bold text-slate-800 text-sm">
                  {activeDetail.depositAmount ? formatVND(activeDetail.depositAmount) : '0 ₫'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Trạng thái cọc</span>
                <div className="mt-1">{renderDepositBadge(activeDetail.depositStatus)}</div>
              </div>
            </div>

            {/* List of Books */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách sách trong phiếu mượn ({activeDetail.listBorrowDetail?.length || 0})
              </h4>
              <div className="space-y-3">
                {activeDetail.listBorrowDetail?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <img
                      src={item.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                      alt={item.bookTitle}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{item.bookTitle}</h5>
                      <p className="text-[11px] text-slate-500">{item.authorName || 'Tác giả thư viện'}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Mã bản sao: {item.copyBarcode || 'N/A'}
                        </span>
                        {item.returnDate && (
                          <span className="text-emerald-600 font-medium">
                            Đã trả: {new Date(item.returnDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* PAY DEPOSIT MODAL */}
      {payDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Nộp Tiền Cọc Mượn Sách
              </h3>
              <button
                onClick={() => setPayDepositModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã phiếu:</span>
                <span className="font-bold text-slate-800">#{payDepositModal.borrowId || payDepositModal.borrowRecordId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền cọc cần nộp:</span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {formatVND(payDepositModal.depositAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Phương thức thanh toán:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(2)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 2
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">VNPay Online</span>
                  <span className="text-[11px] text-slate-500 mt-1">Quét mã QR / Thẻ ATM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(1)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 1
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
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
                onClick={() => setPayDepositModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitDeposit}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : paymentMethod === 2 ? 'Chuyển sang VNPay' : 'Xác nhận nộp tiền mặt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Đánh Giá Sách Đã Hoàn Trả
              </h3>
              <button
                onClick={() => setReviewModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingReviewBooks ? (
              <div className="py-8 text-center text-xs text-slate-500">Đang tải danh sách sách...</div>
            ) : booksToReview.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Bạn đã đánh giá tất cả các cuốn sách trong phiếu này rồi!
              </div>
            ) : (
              <div className="space-y-4">
                {booksToReview.map((b) => (
                  <div key={b.bookId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={b.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{b.title}</h4>
                        <p className="text-[11px] text-slate-500">{b.categoryName} • {b.publisherName}</p>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewsData((prev) => ({
                              ...prev,
                              [b.bookId]: { ...prev[b.bookId], rating: star },
                            }))
                          }
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= (reviewsData[b.bookId]?.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-slate-600 ml-2">
                        {reviewsData[b.bookId]?.rating || 5} sao
                      </span>
                    </div>

                    {/* Comment */}
                    <textarea
                      rows={2}
                      value={reviewsData[b.bookId]?.comment || ''}
                      onChange={(e) =>
                        setReviewsData((prev) => ({
                          ...prev,
                          [b.bookId]: { ...prev[b.bookId], comment: e.target.value },
                        }))
                      }
                      placeholder="Viết cảm nghĩ của bạn về cuốn sách (tối thiểu 5 ký tự)..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
              {booksToReview.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitReviews}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXTEND CONFIRMATION MODAL (Hộp thoại nổi xác nhận gia hạn) */}
      {extendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Xác Nhận Gia Hạn Mượn Sách
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phiếu mượn #{extendModal.borrowId || extendModal.borrowRecordId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtendModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extension details card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Hạn trả hiện tại:</span>
                <span className="font-bold text-slate-700">
                  {extendModal.dueDate ? new Date(extendModal.dueDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-indigo-600 font-semibold">Thời gian gia hạn thêm:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  +7 ngày
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 font-medium">Hạn trả mới dự kiến:</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {extendModal.dueDate
                    ? new Date(new Date(extendModal.dueDate).getTime() + 7 * 86400000).toLocaleDateString('vi-VN')
                    : 'Thêm 7 ngày'}
                </span>
              </div>
            </div>

            {/* Policy notice */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Theo quy định thư viện, mỗi phiếu mượn chỉ được tự gia hạn trực tuyến tối đa <b>1 lần</b> nếu sách chưa có độc giả khác đặt giữ chỗ trước.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setExtendModal(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmExtend}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Xác nhận gia hạn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowRecords;
