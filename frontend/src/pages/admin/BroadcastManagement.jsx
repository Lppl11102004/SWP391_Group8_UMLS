import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Megaphone,
  Send,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  UserCheck,
  Globe,
  Bell,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import adminApi from '../../api/admin';

export const BroadcastManagement = () => {
  const { showToast } = useOutletContext() || {};

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter params
  const [keyword, setKeyword] = useState('');
  const [notifType, setNotifType] = useState('3'); // Default to 3: SYSTEM

  // Broadcast modal / form state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    targetGroup: 'ALL',
    title: '',
    type: 3,
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchHistory = async (pageIdx = page) => {
    setLoading(true);
    try {
      const params = {
        page: pageIdx,
        size: 12,
        type: notifType !== '' ? Number(notifType) : undefined,
        keyword: keyword.trim() || undefined,
      };
      const res = await adminApi.getNotificationHistory(params);
      if (res.data?.success) {
        const d = res.data.data;
        setHistory(d.content || []);
        setTotalPages(d.totalPages || 1);
        setTotalElements(d.totalElements || 0);
        setPage(d.page || 0);
      }
    } catch (err) {
      console.error('Fetch notification history error:', err);
      if (showToast) showToast('Không thể tải lịch sử thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, [notifType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory(0);
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim()) return;
    setBroadcasting(true);
    try {
      const res = await adminApi.broadcastNotification({
        targetGroup: broadcastForm.targetGroup,
        title: broadcastForm.title.trim(),
        type: 3,
      });

      if (showToast) {
        showToast(
          res.data?.message ||
            `Đã phát thông báo thành công đến ${res.data?.data?.sentCount || 0} người dùng!`,
          'success'
        );
      }
      setBroadcastOpen(false);
      setBroadcastForm({ targetGroup: 'ALL', title: '', type: 3 });
      fetchHistory(0);
    } catch (err) {
      console.error('Broadcast error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể phát thông báo', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" />
            <span>Phát Thông Báo Hàng Loạt (Push Broadcast)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gửi thông điệp hệ thống, lịch nghỉ lễ, sự kiện văn hóa đọc hoặc bảo trì đồng loạt đến hộp thư người dùng.
          </p>
        </div>

        <button
          onClick={() => setBroadcastOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Tạo Thông Báo Mới</span>
        </button>
      </div>

      {/* Target Audience Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => {
            setBroadcastForm({ ...broadcastForm, targetGroup: 'ALL' });
            setBroadcastOpen(true);
          }}
          className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex items-center space-x-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900">Toàn Bộ Hệ Thống</h4>
            <span className="text-[11px] text-slate-400">Gửi cho cả Bạn Đọc & Thủ Thư</span>
          </div>
        </div>

        <div
          onClick={() => {
            setBroadcastForm({ ...broadcastForm, targetGroup: 'READER' });
            setBroadcastOpen(true);
          }}
          className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex items-center space-x-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900">Nhóm Bạn Đọc (Readers)</h4>
            <span className="text-[11px] text-slate-400">Nhắc nhở nội quy, sách mới</span>
          </div>
        </div>

        <div
          onClick={() => {
            setBroadcastForm({ ...broadcastForm, targetGroup: 'LIBRARIAN' });
            setBroadcastOpen(true);
          }}
          className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex items-center space-x-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900">Đội Ngũ Thủ Thư (Librarians)</h4>
            <span className="text-[11px] text-slate-400">Chỉ thị nghiệp vụ, ca trực</span>
          </div>
        </div>
      </div>

      {/* History Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tiêu đề thông báo, tên hoặc email người nhận..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-2">
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              <option value="">Tất cả loại tin</option>
              <option value="3">3 - Tin hệ thống / Broadcast</option>
              <option value="1">1 - Nhắc nhở mượn trả</option>
              <option value="2">2 - Thông báo nợ phạt</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all"
            >
              Tìm
            </button>
          </div>
        </form>
      </div>

      {/* Notification History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã TB</th>
                <th className="py-3 px-3">Tiêu đề thông báo</th>
                <th className="py-3 px-3">Người nhận</th>
                <th className="py-3 px-3">Loại tin</th>
                <th className="py-3 px-3">Trạng thái đọc</th>
                <th className="py-3 px-3 text-right">Thời gian phát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải lịch sử thông báo...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Không tìm thấy lịch sử thông báo nào
                  </td>
                </tr>
              ) : (
                history.map((n) => (
                  <tr key={n.notificationId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{n.notificationId}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 line-clamp-1">{n.title}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{n.userFullName || '—'}</p>
                      <span className="text-[11px] text-slate-400">{n.userEmail}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          n.type === 3
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : n.type === 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {n.type === 3 ? 'SYSTEM' : n.type === 2 ? 'FINE' : 'REMINDER'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          n.isRead
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {n.isRead ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>Đã đọc</span>
                          </>
                        ) : (
                          <span>Chưa đọc</span>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị {history.length} / <b>{totalElements}</b> thông báo
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 px-2">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: SOẠN & PHÁT THÔNG BÁO HÀNG LOẠT */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span>Soạn Thông Báo Đẩy Hàng Loạt</span>
              </h3>
              <button
                onClick={() => setBroadcastOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đối tượng nhận thông báo *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, targetGroup: 'ALL' })}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      broadcastForm.targetGroup === 'ALL'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả (ALL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, targetGroup: 'READER' })}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      broadcastForm.targetGroup === 'READER'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Bạn Đọc (READER)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastForm({ ...broadcastForm, targetGroup: 'LIBRARIAN' })}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      broadcastForm.targetGroup === 'LIBRARIAN'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Thủ Thư (LIBRARIAN)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung thông điệp phát sóng *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Ví dụ: Thông báo: Thư viện bảo trì nâng cấp hệ thống vào Chủ Nhật tuần này. Mọi dịch vụ mượn sách trực tuyến tạm dừng từ 22:00..."
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                <Bell className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  Thông báo này sẽ lập tức xuất hiện trong <b>chuông thông báo (Bell notification)</b> của tất cả người dùng thuộc nhóm mục tiêu trên toàn hệ thống.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {broadcasting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{broadcasting ? 'Đang phát sóng...' : 'Xác nhận phát thông báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastManagement;
