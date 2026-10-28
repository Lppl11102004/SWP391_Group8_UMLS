import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import adminApi from '../../api/admin';

export const UserManagement = () => {
  const { showToast } = useOutletContext() || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createLibrarianOpen, setCreateLibrarianOpen] = useState(false);
  const [librarianForm, setLibrarianForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [creating, setCreating] = useState(false);

  const [statusModal, setStatusModal] = useState({
    open: false,
    user: null,
    targetStatus: 2,
    reason: '',
  });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [roleModal, setRoleModal] = useState({
    open: false,
    user: null,
    targetRoleId: 2,
  });
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const [resetModal, setResetModal] = useState({
    open: false,
    user: null,
    temporaryPassword: null,
  });
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async (pageIndex = page) => {
    setLoading(true);
    try {
      const params = {
        page: pageIndex,
        size: 10,
        keyword: keyword.trim() || undefined,
        roleId: roleId !== '' ? Number(roleId) : undefined,
        status: status !== '' ? Number(status) : undefined,
      };
      const res = await adminApi.searchUsers(params);
      if (res.data?.success) {
        const pageData = res.data.data;
        setUsers(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 1);
        setPage(pageData.page || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (showToast) showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, [roleId, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(0);
  };

  // Open Full Detail
  const handleOpenDetail = async (userId) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await adminApi.getUserDetail(userId);
      if (res.data?.success) {
        setDetailUser(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      if (showToast) showToast('Không thể tải chi tiết người dùng', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // Create Librarian
  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await adminApi.createLibrarian(librarianForm);
      if (showToast) showToast(res.data?.message || 'Tạo tài khoản thủ thư thành công!', 'success');
      setCreateLibrarianOpen(false);
      setLibrarianForm({ fullName: '', email: '', password: '', phone: '', address: '' });
      fetchUsers(0);
    } catch (err) {
      console.error('Create librarian error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể tạo tài khoản thủ thư', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Lock / Unlock User
  const handleConfirmStatus = async () => {
    if (!statusModal.user) return;
    setStatusSubmitting(true);
    try {
      const res = await adminApi.updateUserStatus(statusModal.user.userId, {
        status: statusModal.targetStatus,
        reason: statusModal.reason.trim() || undefined,
      });
      if (showToast) showToast(res.data?.message || 'Cập nhật trạng thái người dùng thành công!', 'success');
      setStatusModal({ open: false, user: null, targetStatus: 2, reason: '' });
      fetchUsers(page);
    } catch (err) {
      console.error('Update status error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Lỗi cập nhật trạng thái', 'error');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Change Role (READER <-> LIBRARIAN)
  const handleConfirmRole = async () => {
    if (!roleModal.user) return;
    setRoleSubmitting(true);
    try {
      const res = await adminApi.updateUserRole(roleModal.user.userId, {
        roleId: roleModal.targetRoleId,
      });
      if (showToast) showToast(res.data?.message || 'Cập nhật vai trò thành công!', 'success');
      setRoleModal({ open: false, user: null, targetRoleId: 2 });
      fetchUsers(page);
    } catch (err) {
      console.error('Update role error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể thay đổi vai trò', 'error');
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (user) => {
    setResetting(true);
    setCopied(false);
    try {
      const res = await adminApi.resetUserPassword(user.userId);
      if (res.data?.success) {
        setResetModal({
          open: true,
          user,
          temporaryPassword: res.data.data.temporaryPassword,
        });
        if (showToast) showToast('Đặt lại mật khẩu tạm thành công!', 'success');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể reset mật khẩu', 'error');
    } finally {
      setResetting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatVND = (amt) => {
    if (amt === undefined || amt === null) return '0 ₫';
    return Number(amt).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Quản Lý Người Dùng & Phân Quyền</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu thông tin, cấp tài khoản thủ thư, kiểm soát khóa tài khoản và đặt lại mật khẩu người dùng.
          </p>
        </div>

        <button
          onClick={() => setCreateLibrarianOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Thủ Thư</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả vai trò</option>
              <option value="1">READER (Bạn đọc)</option>
              <option value="2">LIBRARIAN (Thủ thư)</option>
              <option value="3">ADMIN (Quản trị viên)</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Chờ kích hoạt (OTP)</option>
              <option value="1">Hoạt động bình thường</option>
              <option value="2">Bị khóa (Locked)</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-3">Liên hệ</th>
                <th className="py-3 px-3">Vai trò</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Ngày tạo</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-2xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                            {u.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleOpenDetail(u.userId)}>
                            {u.fullName}
                          </p>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ID: #{u.userId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-slate-700">{u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.phone || 'Chưa cập nhật'}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.roleName === 'ADMIN'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : u.roleName === 'LIBRARIAN'
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.roleName || (u.roleId === 3 ? 'ADMIN' : u.roleId === 2 ? 'LIBRARIAN' : 'READER')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.status === 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {u.status === 1
                          ? 'Hoạt động'
                          : u.status === 2
                          ? 'Đã bị khóa'
                          : 'Chờ kích hoạt'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(u.userId)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Reset password button */}
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={resetting}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Đặt lại mật khẩu tạm"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Change role button (only for non-admin) */}
                        {u.roleName !== 'ADMIN' && (
                          <button
                            onClick={() =>
                              setRoleModal({
                                open: true,
                                user: u,
                                targetRoleId: u.roleId === 1 ? 2 : 1,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                            title="Thay đổi vai trò (Độc giả <-> Thủ thư)"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}

                        {/* Lock / Unlock button (cannot lock Admin) */}
                        {u.roleName !== 'ADMIN' && (
                          <button
                            onClick={() =>
                              setStatusModal({
                                open: true,
                                user: u,
                                targetStatus: u.status === 2 ? 1 : 2,
                                reason: '',
                              })
                            }
                            className={`p-1.5 rounded-xl transition-all ${
                              u.status === 2
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title={u.status === 2 ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {u.status === 2 ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị {users.length} trên tổng số <b>{totalElements}</b> người dùng
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchUsers(page - 1)}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchUsers(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: CẤP TÀI KHOẢN THỦ THƯ */}
      {createLibrarianOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Cấp Tài Khoản Thủ Thư Mới
                </h3>
              </div>
              <button
                onClick={() => setCreateLibrarianOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLibrarian} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên thủ thư *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Thị Mai"
                  value={librarianForm.fullName}
                  onChange={(e) => setLibrarianForm({ ...librarianForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  placeholder="librarian@library.vn"
                  value={librarianForm.email}
                  onChange={(e) => setLibrarianForm({ ...librarianForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu tối thiểu 6 ký tự"
                    value={librarianForm.password}
                    onChange={(e) => setLibrarianForm({ ...librarianForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    placeholder="0987654321"
                    value={librarianForm.phone}
                    onChange={(e) => setLibrarianForm({ ...librarianForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng ban / Địa chỉ công tác</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng Nghiệp Vụ Quầy 1, Tầng 2"
                  value={librarianForm.address}
                  onChange={(e) => setLibrarianForm({ ...librarianForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl text-[11px] text-indigo-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Tài khoản thủ thư được tạo bởi Admin sẽ ở trạng thái <b>ACTIVE ngay lập tức</b>, không cần bước xác thực OTP qua email.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateLibrarianOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Đang tạo...' : 'Xác nhận tạo thủ thư'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM HỒ SƠ CHI TIẾT NGƯỜI DÙNG */}
      {(detailLoading || detailUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Hồ Sơ Toàn Cảnh Người Dùng
              </h3>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Đang tải thông tin chi tiết...
              </div>
            ) : detailUser && (
              <div className="space-y-4 mt-4 text-xs">
                {/* User Header */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                  {detailUser.avatarUrl ? (
                    <img
                      src={detailUser.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                      {detailUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{detailUser.fullName}</h4>
                    <p className="text-slate-500 text-[11px]">{detailUser.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                      Vai trò: {detailUser.roleName || (detailUser.roleId === 2 ? 'LIBRARIAN' : 'READER')}
                    </span>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Điện thoại</span>
                    <span className="font-bold text-slate-800">{detailUser.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Trạng thái</span>
                    <span className="font-bold text-slate-800">
                      {detailUser.status === 1 ? 'Hoạt động' : detailUser.status === 2 ? 'Đã bị khóa' : 'Chưa kích hoạt'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Địa chỉ</span>
                  <span className="text-slate-700">{detailUser.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>

                {/* Membership Status Box */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-indigo-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gói Hội Viên: {detailUser.membershipPlanName || 'Chưa đăng ký'}</span>
                  </div>
                  {detailUser.isMembershipActive ? (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Hiệu lực đến: {new Date(detailUser.membershipEndDate).toLocaleDateString('vi-VN')}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">Hiện không có gói hội viên nào có hiệu lực</p>
                  )}
                </div>

                {/* Operational Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-sky-50 rounded-2xl">
                    <span className="text-lg font-black text-sky-700 block">{detailUser.activeBorrowCount || 0}</span>
                    <span className="text-[10px] text-sky-600 font-bold">Đang Mượn</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl">
                    <span className="text-lg font-black text-rose-700 block">{formatVND(detailUser.unpaidFineAmount)}</span>
                    <span className="text-[10px] text-rose-600 font-bold">Nợ Phạt</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <span className="text-lg font-black text-amber-700 block">
                      {detailUser.isBlacklisted ? 'CÓ' : 'KHÔNG'}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold">Blacklist</span>
                  </div>
                </div>

                {detailUser.isBlacklisted && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
                    <b>Lý do Blacklist:</b> {detailUser.blacklistReason || 'Không ghi nhận lý do'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: KHÓA / MỞ KHÓA TÀI KHOẢN */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  statusModal.targetStatus === 2 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {statusModal.targetStatus === 2 ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {statusModal.targetStatus === 2 ? 'Khóa Tài Khoản Người Dùng' : 'Mở Khóa Tài Khoản'}
                </h3>
                <p className="text-xs text-slate-500">{statusModal.user?.fullName} ({statusModal.user?.email})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mt-4">
              {statusModal.targetStatus === 2 ? (
                <>
                  <p className="text-slate-600">
                    Khi khóa tài khoản, người dùng sẽ không thể đăng nhập hoặc mượn sách. Hệ thống sẽ gửi thông báo giải thích đến người dùng.
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lý do khóa tài khoản *</label>
                    <textarea
                      rows="3"
                      placeholder="Nhập lý do khóa vi phạm..."
                      value={statusModal.reason}
                      onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-600">
                  Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ được khôi phục quyền đăng nhập và sử dụng dịch vụ thư viện bình thường.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setStatusModal({ open: false, user: null, targetStatus: 2, reason: '' })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmStatus}
                  disabled={statusSubmitting}
                  className={`px-4 py-2 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 ${
                    statusModal.targetStatus === 2
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {statusSubmitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{statusModal.targetStatus === 2 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: THAY ĐỔI VAI TRÒ */}
      {roleModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Thay Đổi Vai Trò Người Dùng</h3>
                <p className="text-xs text-slate-500">{roleModal.user?.fullName}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mt-4">
              <p className="text-slate-600">
                Chuyển đổi vai trò tài khoản giữa <b>Bạn Đọc (READER)</b> và <b>Thủ Thư (LIBRARIAN)</b>:
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn vai trò mới:</label>
                <select
                  value={roleModal.targetRoleId}
                  onChange={(e) => setRoleModal({ ...roleModal, targetRoleId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value={1}>READER (Bạn đọc thường)</option>
                  <option value={2}>LIBRARIAN (Thủ thư quản trị quầy)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl text-[11px] text-amber-800">
                ⚠️ Chỉ cho phép hoán đổi quyền giữa Độc giả và Thủ thư. Quyền Admin không thể được cấp qua giao diện này.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRoleModal({ open: false, user: null, targetRoleId: 2 })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmRole}
                  disabled={roleSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {roleSubmitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Cập nhật vai trò</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: MẬT KHẨU TẠM SAU KHI RESET */}
      {resetModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Đặt Lại Mật Khẩu Thành Công</h3>
                <p className="text-xs text-slate-500">{resetModal.user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mt-4">
              <p className="text-slate-600">
                Hệ thống đã tạo mật khẩu tạm thời ngẫu nhiên cho người dùng này. Vui lòng gửi mật khẩu dưới đây cho người dùng:
              </p>

              <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-mono text-base font-black text-indigo-700 select-all tracking-wider">
                  {resetModal.temporaryPassword}
                </span>
                <button
                  onClick={() => copyToClipboard(resetModal.temporaryPassword)}
                  className="p-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1 text-[11px] font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setResetModal({ open: false, user: null, temporaryPassword: null })}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
