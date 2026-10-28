import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Coins,
  Plus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Check,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';
import { formatVND } from '../../utils/format';

export const FineManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [keyword, setKeyword] = useState('');
  const [fines, setFines] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Waive Modal
  const [waiveModalId, setWaiveModalId] = useState(null);
  const [waiveNote, setWaiveNote] = useState('');

  // Collect Fine Modal
  const [payFineModal, setPayFineModal] = useState(null);
  const [payFineMethod, setPayFineMethod] = useState(1); // 1: Cash, 2: VNPay
  const [fineVnpayUrl, setFineVnpayUrl] = useState('');

  // Create Manual Fine Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    borrowId: '',
    userId: '',
    copyId: '',
    amount: '',
    reason: 1, // 1: OVERDUE, 2: DAMAGED, 3: LOST
    note: '',
  });

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chưa thu tiền (Nợ)', value: '0' },
    { label: 'Đã thanh toán', value: '1' },
    { label: 'Đã miễn giảm', value: '2' },
  ];

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (selectedStatus !== '') params.status = selectedStatus;
      if (selectedReason !== '') params.reason = selectedReason;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await librarianApi.getFines(params);
      const pageData = res.data?.data;
      if (pageData) {
        setFines(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setFines([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching librarian fines:', err);
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [selectedStatus, selectedReason, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchFines();
  };

  // Pay Cash
  const handlePayCash = async (id) => {
    if (!window.confirm(`Xác nhận đã thu tiền mặt tại quầy cho khoản phạt #${id}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await librarianApi.payCashFine(id);
      setMessage({ type: 'success', text: res.data?.message || 'Thu tiền phạt thành công!' });
      await fetchFines();
    } catch (err) {
      console.error('Error paying cash fine:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể ghi nhận thu tiền mặt' });
    } finally {
      setActionLoading(false);
    }
  };

  // Collect Fine (Cash or VNPay)
  const handleLibrarianPayFine = async () => {
    if (!payFineModal) return;
    setActionLoading(true);
    try {
      const res = await librarianApi.payFine(payFineModal.fineId, payFineMethod);
      if (payFineMethod === 2 && res.data?.data) {
        setFineVnpayUrl(res.data.data);
        sessionStorage.setItem('vnpay_return_url', '/librarian/fines');
        window.open(res.data.data, '_blank');
        setMessage({ type: 'success', text: 'Đã tạo liên kết VNPay và mở cổng thanh toán! Hướng dẫn độc giả quét mã để thanh toán tiền phạt.' });
      } else {
        setMessage({ type: 'success', text: res.data?.message || 'Ghi nhận thu tiền phạt thành công!' });
        setPayFineModal(null);
        setFineVnpayUrl('');
        await fetchFines();
      }
    } catch (err) {
      console.error('Error paying fine:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Xử lý thu tiền phạt thất bại.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Waive
  const handleSubmitWaive = async () => {
    if (!waiveModalId) return;
    setActionLoading(true);
    try {
      const res = await librarianApi.waiveFine(waiveModalId, { note: waiveNote.trim() });
      setMessage({ type: 'success', text: res.data?.message || 'Miễn giảm khoản phạt thành công!' });
      setWaiveModalId(null);
      setWaiveNote('');
      await fetchFines();
    } catch (err) {
      console.error('Error waiving fine:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Miễn giảm khoản phạt thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Create manual fine
  const handleSubmitCreateFine = async (e) => {
    e.preventDefault();
    if (!createForm.userId || !createForm.amount) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Mã độc giả (User ID) và Số tiền phạt' });
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        borrowId: createForm.borrowId ? Number(createForm.borrowId) : null,
        userId: Number(createForm.userId),
        copyId: createForm.copyId ? Number(createForm.copyId) : null,
        amount: Number(createForm.amount),
        reason: Number(createForm.reason),
        note: createForm.note.trim() || 'Lập biên bản phạt thủ công',
      };
      const res = await librarianApi.createFine(payload);
      setMessage({ type: 'success', text: res.data?.message || 'Tạo khoản phạt thành công!' });
      setShowCreateModal(false);
      setCreateForm({
        borrowId: '',
        userId: '',
        copyId: '',
        amount: '',
        reason: 1,
        note: '',
      });
      await fetchFines();
    } catch (err) {
      console.error('Error creating fine:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Tạo khoản phạt thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  const getReasonLabel = (reason) => {
    switch (Number(reason)) {
      case 1:
        return 'Quá hạn trả sách';
      case 2:
        return 'Hỏng sách / Rách';
      case 3:
        return 'Làm mất sách';
      default:
        return 'Khác';
    }
  };

  const renderStatusBadge = (status) => {
    switch (Number(status)) {
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Chưa thu tiền
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã thu tiền
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Đã miễn giảm
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
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            Quản Lý Thu Tiền Phạt
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi danh sách các khoản bồi hoàn, thu tiền mặt tại quầy hoặc áp dụng miễn giảm theo quy định.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo khoản phạt thủ công</span>
        </button>
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {statusTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setSelectedStatus(t.value);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === t.value
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}

          <select
            value={selectedReason}
            onChange={(e) => {
              setSelectedReason(e.target.value);
              setPage(0);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">Tất cả lý do vi phạm</option>
            <option value="1">Quá hạn trả sách</option>
            <option value="2">Hỏng sách / Rách</option>
            <option value="3">Làm mất sách</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên, email độc giả, tên sách..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách khoản phạt...</p>
        </div>
      ) : fines.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-800">Không có khoản tiền phạt nào</h3>
          <p className="text-xs text-slate-500">Hiện tại không có khoản nợ phạt nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã phạt</th>
                    <th className="py-3.5 px-4">Độc giả</th>
                    <th className="py-3.5 px-4">Lý do</th>
                    <th className="py-3.5 px-4">Sách vi phạm</th>
                    <th className="py-3.5 px-4 text-right">Số tiền</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {fines.map((f) => {
                    const isUnpaid = Number(f.status) === 0;

                    return (
                      <tr key={f.fineId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                          #{f.fineId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{f.userName}</span>
                          <span className="text-[11px] text-slate-400 block">{f.userEmail} • {f.userPhone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {getReasonLabel(f.reason)}
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600">
                          {f.bookTitle || 'Phiếu mượn'}
                          {f.barcode && (
                            <span className="block font-mono text-[10px] text-slate-400">
                              Mã vạch: {f.barcode}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 text-sm">
                          {formatVND(f.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">{renderStatusBadge(f.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isUnpaid && (
                              <>
                                <button
                                  onClick={() => {
                                    setPayFineModal(f);
                                    setPayFineMethod(1);
                                    setFineVnpayUrl('');
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                  title="Thu tiền phạt bằng Tiền mặt (CASH) hoặc VNPay"
                                >
                                  <CreditCard className="w-3.5 h-3.5" /> Thu tiền phạt
                                </button>
                                <button
                                  onClick={() => setWaiveModalId(f.fineId)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                                  title="Miễn giảm khoản phạt"
                                >
                                  Miễn giảm
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

      {/* WAIVE MODAL */}
      {waiveModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Miễn Giảm Khoản Phạt #{waiveModalId}
              </h3>
              <button
                onClick={() => setWaiveModalId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lý do miễn giảm (Lưu vết thủ thư):
              </label>
              <textarea
                rows={3}
                value={waiveNote}
                onChange={(e) => setWaiveNote(e.target.value)}
                placeholder="Ví dụ: Miễn giảm theo quyết định phê duyệt của Ban Giám đốc thư viện..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setWaiveModalId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitWaive}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang duyệt...' : 'Xác nhận miễn giảm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL FINE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitCreateFine}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Tạo Khoản Phạt Thủ Công
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã độc giả (User ID) *</label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 5"
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã phiếu mượn</label>
                  <input
                    type="number"
                    placeholder="VD: 25 (Tùy chọn)"
                    value={createForm.borrowId}
                    onChange={(e) => setCreateForm({ ...createForm, borrowId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số tiền phạt (đ) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="VD: 50000"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lý do vi phạm</label>
                  <select
                    value={createForm.reason}
                    onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">Quá hạn trả sách</option>
                    <option value="2">Hư hỏng / Rách sách</option>
                    <option value="3">Làm mất sách</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mã bản sao sách (Copy ID)</label>
                <input
                  type="number"
                  placeholder="VD: 102 (Tùy chọn)"
                  value={createForm.copyId}
                  onChange={(e) => setCreateForm({ ...createForm, copyId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nguyên nhân lập biên bản phạt..."
                  value={createForm.note}
                  onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang tạo...' : 'Tạo Khoản Phạt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIBRARIAN COLLECT FINE MODAL (CASH & VNPAY) */}
      {payFineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Thu Tiền Phạt Tại Quầy
              </h3>
              <button
                onClick={() => {
                  setPayFineModal(null);
                  setFineVnpayUrl('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã khoản phạt:</span>
                <span className="font-mono font-bold text-slate-800">#{payFineModal.fineId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Độc giả:</span>
                <span className="font-bold text-slate-800">{payFineModal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lý do:</span>
                <span className="font-semibold text-slate-700">{getReasonLabel(payFineModal.reason)}</span>
              </div>
              <div className="flex justify-between border-t border-rose-200/50 pt-2">
                <span className="text-slate-500">Số tiền cần thu:</span>
                <span className="font-extrabold text-rose-700 text-sm">
                  {formatVND(payFineModal.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Phương thức thu tiền:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayFineMethod(1)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    payFineMethod === 1
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">Tiền mặt (CASH)</span>
                  <span className="text-[11px] text-slate-500 mt-1">Thu tiền mặt trực tiếp tại quầy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayFineMethod(2)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    payFineMethod === 2
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">VNPay Online</span>
                  <span className="text-[11px] text-slate-500 mt-1">Tạo mã QR / Link cho độc giả</span>
                </button>
              </div>
            </div>

            {fineVnpayUrl && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <p className="text-xs font-semibold text-emerald-800">
                  Liên kết thanh toán tiền phạt VNPay:
                </p>
                <a
                  href={fineVnpayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Mở Trang Thanh Toán VNPay</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPayFineModal(null);
                  setFineVnpayUrl('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLibrarianPayFine}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : payFineMethod === 1 ? 'Xác Nhận Đã Thu Tiền Mặt' : 'Tạo Link VNPay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;
