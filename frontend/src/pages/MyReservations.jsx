import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookMarked, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  X, 
  Ban, 
  BookOpen, 
  Calendar, 
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Barcode,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { cartAndReservationApi } from '../api/cartAndReservation';

export const MyReservations = () => {
  const [selectedStatus, setSelectedStatus] = useState(''); // '' means all
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [activeDetail, setActiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [message, setMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: '0' },
    { label: 'Đã duyệt (Giữ chỗ)', value: '1' },
    { label: 'Đã nhận sách', value: '2' },
    { label: 'Đã huỷ', value: '3' },
    { label: 'Bị từ chối', value: '4' },
    { label: 'Hết hạn giữ chỗ', value: '5' },
  ];

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await cartAndReservationApi.getReservations(selectedStatus, page, 8);
      const pageData = res.data?.data;
      if (pageData) {
        setReservations(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setReservations([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedStatus, page]);

  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await cartAndReservationApi.getReservationDetail(id);
      setActiveDetail(res.data?.data);
    } catch (err) {
      console.error('Error fetching detail:', err);
      showToast('Không thể tải chi tiết phiếu mượn', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirmCancelReservation = async () => {
    if (!cancelModalId) return;
    setCancelling(true);
    try {
      const res = await cartAndReservationApi.cancelReservation(cancelModalId);
      showToast(res.data?.message || 'Huỷ phiếu thành công!', 'success');
      setActiveDetail(null);
      setCancelModalId(null);
      await fetchReservations();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      showToast(err.response?.data?.message || 'Huỷ phiếu thất bại', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Helper status badge
  const renderStatusBadge = (status) => {
    switch (Number(status)) {
      case 0:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Đã duyệt (Đang giữ)</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            <span>Đã nhận sách</span>
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Bị từ chối</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>Đã huỷ</span>
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Quá hạn</span>
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Trạng thái #{status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản Lý Phiếu Đặt Mượn Sách
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi tiến độ duyệt phiếu, thời gian giữ sách và chi tiết các đầu sách yêu cầu
          </p>
        </div>
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
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 ml-3 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedStatus(tab.value);
              setPage(0);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedStatus === tab.value
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Không có phiếu mượn nào</h3>
          <p className="text-xs text-slate-500">
            Bạn chưa có phiếu đặt mượn nào ở trạng thái này.
          </p>
          <Link
            to="/cart"
            className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Đến Giỏ mượn sách
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((item) => (
            <div
              key={item.reservationId}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    #Ticket {item.reservationId}
                  </span>
                  {renderStatusBadge(item.status)}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Tạo lúc:{' '}
                      <b className="text-slate-700">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </b>
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 pt-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 line-clamp-2 italic">
                      "{item.note || 'Không có ghi chú'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(item.reservationId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Chi Tiết</span>
                </button>

                {(Number(item.status) === 0 || Number(item.status) === 1) && (
                  <button
                    onClick={() => setCancelModalId(item.reservationId)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Huỷ Phiếu</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-3">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal View Detail */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Chi Tiết Phiếu #{activeDetail.reservationId}
                </h3>
                {renderStatusBadge(activeDetail.status)}
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timestamps & Note */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span>Thời gian tạo:</span>
                  <span className="font-semibold text-slate-800">
                    {activeDetail.createdAt
                      ? new Date(activeDetail.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                {activeDetail.approvedAt && (
                  <div className="flex justify-between">
                    <span>Thời gian duyệt:</span>
                    <span className="font-semibold text-emerald-700">
                      {new Date(activeDetail.approvedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {activeDetail.expiresAt && (
                  <div className="flex justify-between">
                    <span>Hạn cuối đến nhận:</span>
                    <span className="font-semibold text-rose-700">
                      {new Date(activeDetail.expiresAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block mb-1">Ghi chú yêu cầu:</span>
                <p className="text-slate-800 font-medium italic">
                  "{activeDetail.note || 'Không có ghi chú'}"
                </p>
              </div>
            </div>

            {/* Thông tin Phiếu Mượn & Bản Sao Vật Lý (BorrowRecord & BorrowDetail) */}
            {(activeDetail.borrowRecordId || activeDetail.borrowRecord || (activeDetail.listBorrowDetail && activeDetail.listBorrowDetail.length > 0)) ? (
              <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Phiếu Mượn Liên Kết #{activeDetail.borrowRecordId || activeDetail.borrowRecord?.borrowId}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Đã được thủ thư xét duyệt và phân bổ bản sao vật lý
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/borrow-records"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-sm"
                  >
                    <span>Lịch sử mượn trả</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Tóm tắt cọc & Hạn trả */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                    <span className="text-slate-400 block text-[10px]">Trạng thái mượn</span>
                    <span className="font-bold text-slate-800">
                      {Number(activeDetail.borrowStatus ?? activeDetail.borrowRecord?.status) === 0 ? 'Chờ nhận sách' :
                       Number(activeDetail.borrowStatus ?? activeDetail.borrowRecord?.status) === 1 ? 'Đang mượn' :
                       Number(activeDetail.borrowStatus ?? activeDetail.borrowRecord?.status) === 2 ? 'Đã trả đủ' :
                       Number(activeDetail.borrowStatus ?? activeDetail.borrowRecord?.status) === 3 ? 'Quá hạn' :
                       Number(activeDetail.borrowStatus ?? activeDetail.borrowRecord?.status) === 4 ? 'Đã hủy' : 'Đang xử lý'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                    <span className="text-slate-400 block text-[10px]">Tiền cọc</span>
                    <span className="font-bold text-indigo-700">
                      {Number(activeDetail.depositAmount ?? activeDetail.borrowRecord?.depositAmount ?? 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                    <span className="text-slate-400 block text-[10px]">Trạng thái cọc</span>
                    <span className="font-bold text-slate-800">
                      {Number(activeDetail.depositStatus ?? activeDetail.borrowRecord?.depositStatus) === 1 ? 'Đã nộp cọc' :
                       Number(activeDetail.depositStatus ?? activeDetail.borrowRecord?.depositStatus) === 2 ? 'Đã hoàn cọc' :
                       Number(activeDetail.depositStatus ?? activeDetail.borrowRecord?.depositStatus) === 3 ? 'Đã trừ phạt' : 'Chưa nộp'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                    <span className="text-slate-400 block text-[10px]">Hạn trả dự kiến</span>
                    <span className="font-bold text-rose-600">
                      {(activeDetail.dueDate || activeDetail.borrowRecord?.dueDate)
                        ? new Date(activeDetail.dueDate || activeDetail.borrowRecord?.dueDate).toLocaleDateString('vi-VN')
                        : 'Theo quy định'}
                    </span>
                  </div>
                </div>

                {/* Danh sách bản sao chi tiết (BorrowDetail) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bản Sao Vật Lý Được Gán ({activeDetail.listBorrowDetail?.length || activeDetail.borrowRecord?.listBorrowDetail?.length || 0})
                    </h5>
                    <span className="text-[11px] text-slate-500">Mã vạch dán trên gáy sách</span>
                  </div>

                  <div className="divide-y divide-indigo-100/70 border border-indigo-100 rounded-xl overflow-hidden bg-white">
                    {(activeDetail.listBorrowDetail || activeDetail.borrowRecord?.listBorrowDetail)?.map((bd) => (
                      <div key={bd.detailId} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            {bd.coverImageUrl ? (
                              <img src={bd.coverImageUrl} alt={bd.bookTitle} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BookOpen className="w-4 h-4 stroke-1" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-slate-800 truncate">{bd.bookTitle || 'Sách'}</h6>
                            <p className="text-[11px] text-slate-400">{bd.authorName || 'Nhiều tác giả'}</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 font-mono text-[11px] font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                                <Barcode className="w-3 h-3" />
                                <span>{bd.barcode || 'Chưa có barcode'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            bd.status
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {bd.status ? 'Đã duyệt bàn giao' : 'Chờ lấy tại quầy'}
                          </span>
                          {bd.returnDate && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Trả: {new Date(bd.returnDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-start space-x-3 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Phiếu mượn chưa được tạo</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Phiếu đặt mượn đang trong quá trình xét duyệt. Thủ thư sẽ phân bổ bản sao vật lý cụ thể (Barcode) ngay khi duyệt phiếu.
                  </p>
                </div>
              </div>
            )}

            {/* List of books originally requested in reservation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Đầu Sách Yêu Cầu ({activeDetail.listBook?.length || 0} cuốn)
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {activeDetail.listBook?.map((b) => (
                  <div key={b.reservationDetailId} className="p-3 flex items-center space-x-3 bg-white">
                    <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      {(b.coverImageUrl || b.coverImgUrl || b.imageUrl) ? (
                        <img
                          src={b.coverImageUrl || b.coverImgUrl || b.imageUrl}
                          alt={b.bookTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <BookOpen className="w-5 h-5 stroke-1" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/books/${b.bookId}`}
                        onClick={() => setActiveDetail(null)}
                        className="text-xs font-bold text-slate-800 hover:text-indigo-600 truncate block"
                      >
                        {b.bookTitle}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {b.authorName || 'Nhiều tác giả'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              {(Number(activeDetail.status) === 0 || Number(activeDetail.status) === 1) && (
                <button
                  onClick={() => setCancelModalId(activeDetail.reservationId)}
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Huỷ phiếu yêu cầu này
                </button>
              )}
              <button
                onClick={() => setActiveDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xác Nhận Huỷ Phiếu Mượn?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn huỷ phiếu đặt mượn sách <b>#{cancelModalId}</b> không? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalId(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelReservation}
                disabled={cancelling}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Xác nhận huỷ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
