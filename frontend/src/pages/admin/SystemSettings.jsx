import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  Plus,
  Edit3,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  Sliders,
  Clock
} from 'lucide-react';
import adminApi from '../../api/admin';

export const SystemSettings = () => {
  const { showToast } = useOutletContext() || {};

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    settingKey: '',
    settingValue: '',
    dataType: 'INTEGER',
    description: '',
  });
  const [creating, setCreating] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [editForm, setEditForm] = useState({
    settingValue: '',
    description: '',
  });
  const [updating, setUpdating] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllSettings();
      if (res.data?.success) {
        setSettings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      if (showToast) showToast('Không thể tải danh sách cấu hình hệ thống', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await adminApi.createSetting(createForm);
      if (showToast) showToast(res.data?.message || 'Tạo cấu hình mới thành công!', 'success');
      setCreateModalOpen(false);
      setCreateForm({ settingKey: '', settingValue: '', dataType: 'INTEGER', description: '' });
      fetchSettings();
    } catch (err) {
      console.error('Create setting error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể tạo cấu hình', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (s) => {
    setSelectedSetting(s);
    setEditForm({
      settingValue: s.settingValue || '',
      description: s.description || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSetting) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateSetting(selectedSetting.settingId, editForm);
      if (showToast) showToast(res.data?.message || 'Cập nhật cấu hình thành công!', 'success');
      setEditModalOpen(false);
      setSelectedSetting(null);
      fetchSettings();
    } catch (err) {
      console.error('Update setting error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể cập nhật cấu hình', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredSettings = settings.filter(
    (s) =>
      s.settingKey?.toLowerCase().includes(keyword.toLowerCase()) ||
      s.description?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>Cấu Hình Tham Số Hệ Thống (System Settings)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Điều chỉnh hạn mức mượn sách, phí phạt trễ hạn, ngày gia hạn và tỷ lệ ký quỹ áp dụng toàn hệ thống.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tham Số Cấu Hình</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-3xl text-xs text-amber-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Lưu ý về hiệu lực của các tham số cấu hình:</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Thay đổi giá trị như <code>FINE_PER_DAY</code> hoặc <code>MAX_BORROW_DAYS</code> sẽ áp dụng ngay tức thì cho các lượt mượn hoặc đợt quét phạt tự động tiếp theo. Các giao dịch và biên bản phạt đã hoàn thành trước đó vẫn được giữ nguyên tính toàn vẹn.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm theo khóa hoặc mô tả cấu hình..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Tổng cộng: <b>{filteredSettings.length}</b> tham số
        </div>
      </div>

      {/* Settings Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Đang tải dữ liệu cấu hình...
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">
            Không tìm thấy tham số cấu hình nào
          </div>
        ) : (
          filteredSettings.map((s) => (
            <div
              key={s.settingId}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                      {s.settingKey}
                    </span>
                    <span className="ml-2 text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {s.dataType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEditClick(s)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Chỉnh sửa tham số này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] text-slate-400 block font-semibold">Giá trị hiện tại:</span>
                  <div className="font-mono text-2xl font-black text-slate-900 mt-0.5">
                    {s.settingValue}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {s.description || 'Chưa có mô tả chi tiết cho tham số này.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Cập nhật: {s.updatedAt ? new Date(s.updatedAt).toLocaleString('vi-VN') : 'Mặc định'}
                </span>
                <span className="font-bold text-slate-500">ID: #{s.settingId}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: TẠO MỚI CẤU HÌNH */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Thêm Tham Số Cấu Hình Mới</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã khóa cấu hình (Setting Key) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: MAX_RENEWAL_DAYS"
                  value={createForm.settingKey}
                  onChange={(e) => setCreateForm({ ...createForm, settingKey: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá trị cấu hình *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 7"
                    value={createForm.settingValue}
                    onChange={(e) => setCreateForm({ ...createForm, settingValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kiểu dữ liệu *</label>
                  <select
                    value={createForm.dataType}
                    onChange={(e) => setCreateForm({ ...createForm, dataType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="INTEGER">INTEGER (Số nguyên)</option>
                    <option value="DECIMAL">DECIMAL (Số thập phân)</option>
                    <option value="STRING">STRING (Chuỗi ký tự)</option>
                    <option value="BOOLEAN">BOOLEAN (Đúng/Sai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ý nghĩa nghiệp vụ</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả mục đích áp dụng của tham số này..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Đang tạo...' : 'Lưu cấu hình'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA CẤU HÌNH */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Chỉnh Sửa Tham Số: {selectedSetting?.settingKey}</span>
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giá trị tham số mới *</label>
                <input
                  type="text"
                  required
                  value={editForm.settingValue}
                  onChange={(e) => setEditForm({ ...editForm, settingValue: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cập nhật mô tả</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updating && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{updating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
