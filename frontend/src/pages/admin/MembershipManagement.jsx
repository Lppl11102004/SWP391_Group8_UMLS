import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  DollarSign,
  Calendar,
  Percent,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import adminApi from '../../api/admin';

export const MembershipManagement = () => {
  const { showToast } = useOutletContext() || {};

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    durationDays: 30,
    depositDiscountPct: 0,
    maxDepositAmount: '',
    freeDepositPriceLimit: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllPlans();
      if (res.data?.success) {
        setPlans(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching membership plans:', err);
      if (showToast) showToast('Không thể tải danh sách gói hội viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      price: '',
      durationDays: 30,
      depositDiscountPct: 0,
      maxDepositAmount: '',
      freeDepositPriceLimit: '',
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || '',
      price: plan.price || '',
      durationDays: plan.durationDays || 30,
      depositDiscountPct: plan.depositDiscountPct || 0,
      maxDepositAmount: plan.maxDepositAmount || '',
      freeDepositPriceLimit: plan.freeDepositPriceLimit || '',
      description: plan.description || '',
      isActive: plan.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        depositDiscountPct: Number(form.depositDiscountPct),
        maxDepositAmount: form.maxDepositAmount ? Number(form.maxDepositAmount) : null,
        freeDepositPriceLimit: form.freeDepositPriceLimit ? Number(form.freeDepositPriceLimit) : null,
        description: form.description.trim(),
        isActive: form.isActive,
      };

      if (editingPlan) {
        const res = await adminApi.updatePlan(editingPlan.planId, payload);
        if (showToast) showToast(res.data?.message || 'Cập nhật gói hội viên thành công!', 'success');
      } else {
        const res = await adminApi.createPlan(payload);
        if (showToast) showToast(res.data?.message || 'Tạo gói hội viên mới thành công!', 'success');
      }

      setModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (err) {
      console.error('Save membership plan error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể lưu gói hội viên', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (plan) => {
    setTogglingId(plan.planId);
    try {
      const res = await adminApi.toggleActivePlan(plan.planId);
      if (showToast) showToast(res.data?.message || 'Thay đổi trạng thái gói thành công!', 'success');
      fetchPlans();
    } catch (err) {
      console.error('Toggle active error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Không thể đổi trạng thái', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const formatVND = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return Number(amount).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Quản Lý Các Gói Hội Viên (Membership Plans)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập giá bán, thời hạn hiệu lực, đặc quyền miễn giảm cọc và kiểm soát ẩn/hiện trên trang Độc Giả.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Gói Hội Viên Mới</span>
        </button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Đang tải dữ liệu gói hội viên...
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Chưa có gói hội viên nào được khởi tạo
          </div>
        ) : (
          plans.map((p) => (
            <div
              key={p.planId}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden ${
                p.isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/70 opacity-80'
              }`}
            >
              {/* Status Ribbon */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    p.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.isActive ? 'Đang mở bán' : 'Tạm ẩn'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(p)}
                    disabled={togglingId === p.planId}
                    className={`p-1.5 rounded-xl transition-all ${
                      p.isActive
                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={p.isActive ? 'Tạm ẩn gói khỏi kệ bán' : 'Mở bán gói này'}
                  >
                    {togglingId === p.planId ? (
                      <RotateCcw className="w-4 h-4 animate-spin" />
                    ) : p.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Chỉnh sửa gói"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Price */}
              <div className="mt-4">
                <h3 className="font-black text-lg text-slate-900 tracking-tight">{p.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-indigo-700">{formatVND(p.price)}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {p.durationDays} ngày</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {p.description || 'Không có mô tả chi tiết'}
                </p>
              </div>

              {/* Benefit Badges */}
              <div className="mt-4 space-y-2 py-3 border-y border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Percent className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Giảm tiền cọc:</span>
                  </span>
                  <span className="font-black text-indigo-700">{p.depositDiscountPct}%</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Miễn cọc sách dưới:</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {p.freeDepositPriceLimit ? formatVND(p.freeDepositPriceLimit) : 'Không áp dụng'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cọc tối đa mỗi cuốn:</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {p.maxDepositAmount ? formatVND(p.maxDepositAmount) : 'Không giới hạn'}
                  </span>
                </div>
              </div>

              {/* Sales Statistics */}
              <div className="mt-4 pt-1 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Hội viên hiện tại</span>
                  <span className="font-black text-sm text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    {p.activeUserCount || 0}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Tổng thu về</span>
                  <span className="font-black text-sm text-emerald-700 block mt-0.5">
                    {formatVND(p.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: TẠO / SỬA GÓI HỘI VIÊN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{editingPlan ? 'Chỉnh Sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên gói hội viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gói Hội Viên VIP 6 Tháng"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="120000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời hạn (Ngày) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="90"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giảm cọc (%) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="50"
                    value={form.depositDiscountPct}
                    onChange={(e) => setForm({ ...form, depositDiscountPct: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Miễn cọc sách &lt; (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="200000"
                    value={form.freeDepositPriceLimit}
                    onChange={(e) => setForm({ ...form, freeDepositPriceLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cọc tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="100000"
                    value={form.maxDepositAmount}
                    onChange={(e) => setForm({ ...form, maxDepositAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả quyền lợi chi tiết</label>
                <textarea
                  rows="3"
                  placeholder="Gói tiêu chuẩn: Giảm 50% tiền cọc cho mọi loại sách..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActiveCheck" className="font-bold text-slate-700 cursor-pointer">
                  Mở bán công khai trên hệ thống (Hiển thị cho độc giả)
                </label>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
                💡 Thay đổi mức giá hoặc phần trăm cọc chỉ áp dụng cho người dùng mua mới kể từ thời điểm này. Các độc giả đã đăng ký trước đó vẫn được bảo lưu thời hạn theo đúng hợp đồng cũ.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : editingPlan ? 'Cập nhật gói' : 'Tạo gói mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;
