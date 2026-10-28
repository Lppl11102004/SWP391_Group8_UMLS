import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Ban
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';

export const ReservationManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Detail Modal
  const [activeDetail, setActiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reject Modal
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const statusTabs = [
    { label: 'Tất cả phiếu', value: '' },
    { label: 'Chờ duyệt', value: '0' },
    { label: 'Đã duyệt (Chờ nhận)', value: '1' },
    { label: 'Đã hoàn tất', value: '2' },
    { label: 'Đã hủy', value: '3' },
    { label: 'Từ chối', value: '4' },
    { label: 'Quá hạn', value: '5' },
  ];

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (selectedStatus !== '') params.status = selectedStatus;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await librarianApi.getReservations(params);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchReservations();
  };

  // Open Detail
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await librarianApi.getReservationDetail(id);
      setActiveDetail(res.data?.data || null);
    } catch (err) {
      console.error('Error fetching reservation detail:', err);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết phiếu đặt giữ' });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Approve Reservation
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await librarianApi.approveReservation(id);
      setMessage({ type: 'success', text: res.data?.message || 'Duyệt phiếu đặt giữ thành công!' });
      setActiveDetail(null);
      await fetchReservations();
    } catch (err) {
      console.error('Error approving:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Duyệt phiếu thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Reject
  const handleSubmitReject = async () => {
    if (!rejectModalId) return;
    setActionLoading(true);
    try {
      const res = await librarianApi.rejectReservation(rejectModalId, { note: rejectReason.trim() });
      setMessage({ type: 'success', text: res.data?.message || 'Từ chối phiếu thành công!' });
      setRejectModalId(null);
      setRejectReason('');
      setActiveDetail(null);
      await fetchReservations();
    } catch (err) {
      console.error('Error rejecting:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Từ chối phiếu thất bại' });
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
            Chờ duyệt
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Đã duyệt (Chờ lấy)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5 mr-1" />
            Đã bàn giao
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <X className="w-3.5 h-3.5 mr-1" />
            Độc giả huỷ
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5 mr-1" />
            Đã từ chối
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Quá hạn nhận
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-indigo-600" />
            Quản Lý Phiếu Đặt Giữ Sách
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Xem xét yêu cầu mượn trước từ độc giả, kiểm tra tình trạng kho sách thực tế và duyệt gán bản sao.
          </p>
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {statusTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setSelectedStatus(t.value);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === t.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên, email, SĐT độc giả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách phiếu đặt giữ...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3 text-center">
          <BookMarked className="w-12 h-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy phiếu đặt giữ nào</h3>
          <p className="text-xs text-slate-500">Không có yêu cầu phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã phiếu</th>
                    <th className="py-3.5 px-4">Độc giả</th>
                    <th className="py-3.5 px-4 text-center">Số sách</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-4">Thời gian tạo</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reservations.map((r) => {
                    const isPending = Number(r.status) === 0;

                    return (
                      <tr key={r.reservationId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          #{r.reservationId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{r.readerName}</span>
                          <span className="text-[11px] text-slate-500 block">{r.readerEmail} • {r.readerPhone}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-extrabold text-slate-800">{r.totalBooks}</span> cuốn
                          {r.availableBooks !== undefined && (
                            <span className="block text-[10px] text-emerald-600 font-semibold">
                              ({r.availableBooks} khả dụng)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                          {r.note || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">{renderStatusBadge(r.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(r.reservationId)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(r.reservationId)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => setRejectModalId(r.reservationId)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Từ chối
                                </button>
                              </>
                            )}
                          </div>
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
            <div className="flex items-center justify-center space-x-2 pt-4">
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Chi tiết phiếu đặt giữ #{activeDetail.reservationId}</span>
                  {renderStatusBadge(activeDetail.status)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tạo ngày: {activeDetail.createdAt ? new Date(activeDetail.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  {activeDetail.expiresAt && ` • Hạn đến nhận: ${new Date(activeDetail.expiresAt).toLocaleDateString('vi-VN')}`}
                </p>
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reader Profile Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Độc giả</span>
                <span className="font-bold text-slate-800 text-sm">{activeDetail.readerName}</span>
                <p className="text-slate-500">{activeDetail.readerEmail} • {activeDetail.readerPhone}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gói hội viên</span>
                <span className="font-bold text-indigo-700">
                  {activeDetail.membershipPlanName || 'Chưa đăng ký gói (Tiêu chuẩn)'}
                </span>
                <p className="text-emerald-600 font-medium">
                  Ưu đãi giảm cọc: {activeDetail.depositDiscountPct || 0}%
                </p>
              </div>
            </div>

            {/* Books in reservation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách sách yêu cầu ({activeDetail.books?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {activeDetail.books?.map((b) => (
                  <div
                    key={b.reservationDetailId || b.bookId}
                    className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={b.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{b.title}</h5>
                        <p className="text-[11px] text-slate-500">{b.authorName} • Giá bìa: {Number(b.price || 0).toLocaleString('vi-VN')} đ</p>
                        {b.assignedBarcode && (
                          <span className="inline-block mt-0.5 font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                            Mã vạch gán: {b.assignedBarcode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {b.isAvailable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Còn {b.availableCopies} bản trên kệ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Tạm hết bản sao
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions in detail modal */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setActiveDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>

              {Number(activeDetail.status) === 0 && (
                <>
                  <button
                    onClick={() => setRejectModalId(activeDetail.reservationId)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(activeDetail.reservationId)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? 'Đang duyệt...' : 'Duyệt Phiếu & Gán Bản Sao'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                Từ Chối Phiếu Đặt Giữ #{rejectModalId}
              </h3>
              <button
                onClick={() => setRejectModalId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Lý do từ chối (Gửi thông báo cho độc giả):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Sách yêu cầu hiện đã hết bản sao hoặc độc giả chưa thanh toán tiền phạt cũ..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setRejectModalId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
