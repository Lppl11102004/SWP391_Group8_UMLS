import React, { useState, useEffect } from 'react';
import {
  ShieldBan,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';

export const BlacklistManagement = () => {
  const [selectedActive, setSelectedActive] = useState(''); // '' means all, 'true', 'false'
  const [keyword, setKeyword] = useState('');
  const [blacklists, setBlacklists] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Add Blacklist Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addReason, setAddReason] = useState('');

  // Unlock Modal
  const [unlockModalId, setUnlockModalId] = useState(null);
  const [unlockNote, setUnlockNote] = useState('');

  const filterTabs = [
    { label: 'Tất cả hồ sơ', value: '' },
    { label: 'Đang bị khóa (Active)', value: 'true' },
    { label: 'Đã mở khóa (Unlocked)', value: 'false' },
  ];

  const fetchBlacklists = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (selectedActive !== '') params.isActive = selectedActive === 'true';
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await librarianApi.getBlacklists(params);
      const pageData = res.data?.data;
      if (pageData) {
        setBlacklists(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setBlacklists([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching blacklists:', err);
      setBlacklists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklists();
  }, [selectedActive, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBlacklists();
  };

  // Add to Blacklist
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!addUserId || !addReason.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Mã độc giả và Lý do vi phạm' });
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        userId: Number(addUserId),
        reason: addReason.trim(),
      };
      const res = await librarianApi.addBlacklist(payload);
      setMessage({ type: 'success', text: res.data?.message || 'Đã thêm độc giả vào danh sách hạn chế!' });
      setShowAddModal(false);
      setAddUserId('');
      setAddReason('');
      await fetchBlacklists();
    } catch (err) {
      console.error('Error adding to blacklist:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thêm vào danh sách hạn chế thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Unlock Reader
  const handleSubmitUnlock = async () => {
    if (!unlockModalId) return;
    setActionLoading(true);
    try {
      const res = await librarianApi.unlockBlacklist(unlockModalId, { note: unlockNote.trim() });
      setMessage({ type: 'success', text: res.data?.message || 'Mở khóa độc giả thành công!' });
      setUnlockModalId(null);
      setUnlockNote('');
      await fetchBlacklists();
    } catch (err) {
      console.error('Error unlocking reader:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Mở khóa độc giả thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldBan className="w-7 h-7 text-slate-700" />
            Danh Sách Độc Giả Bị Hạn Chế (Blacklist)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý độc giả vi phạm nhiều lần, chặn đặt mượn sách và mở khóa sau khi hoàn tất bồi hoàn.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm độc giả vào Blacklist</span>
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
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setSelectedActive(t.value);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedActive === t.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên, email, SĐT độc giả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách hạn chế...</p>
        </div>
      ) : blacklists.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800">Không có độc giả nào bị hạn chế</h3>
          <p className="text-xs text-slate-500">Toàn bộ độc giả hiện tại đều có tư cách bình thường.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã</th>
                    <th className="py-3.5 px-4">Độc giả</th>
                    <th className="py-3.5 px-4">Lý do bị hạn chế</th>
                    <th className="py-3.5 px-4">Người lập</th>
                    <th className="py-3.5 px-4">Ngày ghi nhận</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {blacklists.map((b) => (
                    <tr key={b.blacklistId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #{b.blacklistId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{b.userName}</span>
                        <span className="text-[11px] text-slate-400 block">{b.userEmail} • {b.userPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[220px]">
                        <span className="line-clamp-2">{b.reason}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.createdByUserName || 'Hệ thống'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {b.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3 mr-1" /> Đang khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Unlock className="w-3 h-3 mr-1" /> Đã mở
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.isActive && (
                          <button
                            onClick={() => setUnlockModalId(b.blacklistId)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto cursor-pointer transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Mở khóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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

      {/* ADD BLACKLIST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAdd}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldBan className="w-5 h-5 text-rose-600" />
                Thêm Độc Giả Vào Blacklist
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mã độc giả (User ID) *
              </label>
              <input
                type="number"
                required
                placeholder="VD: 5"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lý do đưa vào danh sách hạn chế *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Làm mất sách nhiều lần và không hợp tác nộp phạt tại quầy..."
                value={addReason}
                onChange={(e) => setAddReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang thêm...' : 'Khóa Độc Giả'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UNLOCK MODAL */}
      {unlockModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                Mở Khóa Độc Giả #{unlockModalId}
              </h3>
              <button
                onClick={() => setUnlockModalId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Xác nhận mở khóa tư cách mượn sách cho độc giả này sau khi đã giải quyết xong các vi phạm.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ghi chú mở khóa (Lưu vết):
              </label>
              <textarea
                rows={2}
                value={unlockNote}
                onChange={(e) => setUnlockNote(e.target.value)}
                placeholder="Ví dụ: Độc giả đã hoàn tất nộp phạt và bồi hoàn sách..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setUnlockModalId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitUnlock}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang mở...' : 'Xác Nhận Mở Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlacklistManagement;
