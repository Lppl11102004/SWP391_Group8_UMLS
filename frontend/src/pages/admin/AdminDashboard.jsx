import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Users,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldBan,
  Clock,
  Layers,
  Award,
  ArrowRight,
  RefreshCw,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import adminApi from '../../api/admin';

export const AdminDashboard = () => {
  const { showToast } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [membershipReport, setMembershipReport] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, topRes, memberRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getTopBorrowedBooks({ limit: 6 }),
        adminApi.getMembershipReport(),
      ]);

      if (dashRes.data?.success) setDashboard(dashRes.data.data);
      if (topRes.data?.success) setTopBooks(topRes.data.data || []);
      if (memberRes.data?.success) setMembershipReport(memberRes.data.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      if (showToast) showToast('Không thể tải dữ liệu bảng điều khiển quản trị', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatVND = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return Number(amount).toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Đang tổng hợp dữ liệu toàn hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-[11px] font-bold tracking-wider uppercase">
            Hệ Thống Quản Trị Trung Tâm • ULMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Bảng Điều Khiển Quản Trị Cấp Cao
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Bức tranh toàn cảnh về thành viên, doanh thu, luân chuyển kho sách và các cảnh báo vận hành thư viện.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
          <Link
            to="/admin/broadcast"
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Phát thông báo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI 1: Doanh Thu Tháng Này */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Thu Tháng Này
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {formatVND(dashboard?.totalRevenueThisMonth)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gồm doanh thu Hội viên + Thu phạt quá hạn</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Gói Hội Viên
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {formatVND(dashboard?.membershipRevenueThisMonth)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {dashboard?.activeMembers || 0} hội viên đang hoạt động
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Thu Phạt & Bồi Thường
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {formatVND(dashboard?.fineRevenueThisMonth)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Thu từ quá hạn và sách hư hỏng/mất
            </p>
          </div>
        </div>
      </div>

      {/* KPI 2: Các Chỉ Số Vận Hành Hệ Thống */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-900">{dashboard?.totalUsers || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Tổng Tài Khoản</div>
          <span className="inline-block mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            +{dashboard?.newUsersThisMonth || 0} mới
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-900">{dashboard?.activeLibrarians || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Thủ Thư Hoạt Động</div>
          <span className="inline-block mt-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
            Đang trực quầy
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-900">{dashboard?.totalBooks || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Đầu Sách</div>
          <span className="inline-block mt-1 text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-full">
            {dashboard?.totalBookCopies || 0} bản sao
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-slate-900">{dashboard?.activeBorrows || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Sách Đang Mượn</div>
          <span className="inline-block mt-1 text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full">
            Lưu hành
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-rose-600">{dashboard?.overdueCount || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Sách Quá Hạn</div>
          <span className="inline-block mt-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
            Cần thu hồi
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <ShieldBan className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-amber-600">{dashboard?.blacklistedUsers || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Tài Khoản Khóa/Cấm</div>
          <span className="inline-block mt-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
            Cần xem xét
          </span>
        </div>
      </div>

      {/* Grid: Top Sách Mượn Nhiều & Thống Kê Hội Viên */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 6 Sách Mượn Nhiều Nhất */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Top Sách Được Mượn Nhiều Nhất
              </h3>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
            >
              <span>Xem báo cáo đầy đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {topBooks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu mượn sách</p>
            ) : (
              topBooks.map((b, idx) => (
                <div key={b.bookId || idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 truncate">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-700'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{b.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {b.authorName} • <span className="text-indigo-600 font-medium">{b.categoryName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {b.borrowCount} lượt mượn
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Phân Bổ Gói Hội Viên */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Tình Hình Gói Hội Viên
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
                <div className="text-xs text-indigo-800 font-bold">Tổng Hội Viên Đang Hiệu Lực</div>
                <div className="text-3xl font-black text-indigo-950 mt-1">
                  {membershipReport?.totalActiveMemberships || 0}
                </div>
                <div className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+{membershipReport?.newMembershipsThisMonth || 0} hội viên mới tháng này</span>
                </div>
              </div>

              {membershipReport?.expiringSoon > 0 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <span>Hội viên sắp hết hạn (30 ngày tới):</span>
                  <span className="font-extrabold bg-amber-200/60 px-2 py-0.5 rounded-full">
                    {membershipReport.expiringSoon}
                  </span>
                </div>
              )}

              <div className="space-y-2 mt-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Doanh số theo gói:
                </p>
                {membershipReport?.revenueByPlan?.map((plan) => (
                  <div
                    key={plan.planId}
                    className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{plan.planName}</span>
                      <span className="block text-[10px] text-slate-400">
                        {plan.activeUserCount} người dùng ({plan.soldCount || 0} lượt mua)
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {formatVND(plan.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/admin/memberships"
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Quản lý các gói hội viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Jump Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Quản Lý Người Dùng</h4>
          <p className="text-xs text-slate-500 mt-1">Cấp tài khoản thủ thư, khóa/mở khóa hoặc reset mật khẩu</p>
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Cấu Hình Toàn Hệ Thống</h4>
          <p className="text-xs text-slate-500 mt-1">Điều chỉnh phí phạt trễ hạn, hạn mức mượn và tỷ lệ cọc</p>
        </Link>

        <Link
          to="/admin/master-data"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Danh Mục Master Data</h4>
          <p className="text-xs text-slate-500 mt-1">Quản lý hệ thống Thể loại, Tác giả và Nhà xuất bản</p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Sổ Cái Thanh Toán</h4>
          <p className="text-xs text-slate-500 mt-1">Tra cứu sao kê giao dịch tiền mặt và VNPay trực tuyến</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
