import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  BookOpen,
  AlertTriangle,
  Coins,
  ShieldBan,
  Library,
  Layers,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';

export const LibrarianDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await librarianApi.getDashboard();
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thống Kê Nghiệp Vụ Thời Gian Thực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bảng Điều Khiển Thủ Thư
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng quan lưu thông mượn trả, duyệt đơn đặt chỗ, phạt quá hạn và tình trạng kho sách.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-6 h-36 border border-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Pending Reservations */}
          <Link
            to="/librarian/reservations?status=0"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Phiếu Chờ Duyệt
              </span>
              <div className="p-2.5 bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white rounded-2xl transition-colors">
                <BookMarked className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-amber-600">
                {stats?.pendingReservations || 0}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Độc giả đặt trước chờ duyệt</span>
                <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Xử lý ngay <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>

          {/* 2. Active Borrows */}
          <Link
            to="/librarian/borrows?status=1"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Đang Cho Mượn
              </span>
              <div className="p-2.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-2xl transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-indigo-700">
                {stats?.activeBorrows || 0}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Phiếu mượn đang lưu thông</span>
                <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Xem chi tiết <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>

          {/* 3. Overdue Borrows */}
          <Link
            to="/librarian/borrows?status=3"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mượn Quá Hạn
              </span>
              <div className="p-2.5 bg-rose-50 group-hover:bg-rose-600 text-rose-600 group-hover:text-white rounded-2xl transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-rose-600">
                {stats?.overdueBorrows || 0}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Cần nhắc nhở / Phạt trễ hạn</span>
                <span className="font-bold text-rose-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Kiểm tra <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>

          {/* 4. Unpaid Fines */}
          <Link
            to="/librarian/fines?status=0"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tiền Phạt Chưa Thu
              </span>
              <div className="p-2.5 bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white rounded-2xl transition-colors">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-600">
                  {Number(stats?.unpaidFineAmount || 0).toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ({stats?.unpaidFinesCount || 0} khoản)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Thu tiền mặt hoặc kiểm tra VNPay</span>
                <span className="font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Thu phạt <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>

          {/* 5. Blacklisted Readers */}
          <Link
            to="/librarian/blacklists"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-slate-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Độc Giả Bị Hạn Chế
              </span>
              <div className="p-2.5 bg-slate-100 group-hover:bg-slate-800 text-slate-700 group-hover:text-white rounded-2xl transition-colors">
                <ShieldBan className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">
                {stats?.activeBlacklists || 0}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Đang bị khóa mượn sách</span>
                <span className="font-bold text-slate-700 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Quản lý <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>

          {/* 6. Inventory Status */}
          <Link
            to="/librarian/books"
            className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tình Trạng Kho Sách
              </span>
              <div className="p-2.5 bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white rounded-2xl transition-colors">
                <Library className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-sky-700">
                  {stats?.availableCopies || 0}
                </span>
                <span className="text-xs text-slate-500">
                  / {stats?.totalCopies || 0} bản khả dụng ({stats?.totalBooks || 0} đầu sách)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Quản lý kho sách và barcode</span>
                <span className="font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Kho sách <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Operation Guidance Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <h3 className="text-lg font-bold mb-3">Quy Trình Nghiệp Vụ Tại Quầy Thư Viện</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-indigo-100">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
            <span className="font-extrabold text-sky-400 text-sm block">1. Tiếp nhận & Duyệt</span>
            <p className="leading-relaxed">
              Kiểm tra phiếu đặt giữ của độc giả, xác nhận số lượng sách khả dụng trên kệ và bấm Duyệt để hệ thống gán mã bản sao và tính tiền cọc.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
            <span className="font-extrabold text-amber-400 text-sm block">2. Bàn giao sách</span>
            <p className="leading-relaxed">
              Khi độc giả đến quầy, kiểm tra trạng thái cọc (nếu chưa đóng thì thu tiền mặt hoặc hướng dẫn quét VNPay), sau đó bấm "Bàn giao sách".
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
            <span className="font-extrabold text-emerald-400 text-sm block">3. Trả sách & Hoàn cọc</span>
            <p className="leading-relaxed">
              Quét mã vạch khi độc giả hoàn trả, đánh giá tình trạng sách (Tốt / Hỏng / Mất). Hệ thống tự động hoàn tiền cọc và lập biên bản phạt nếu hư hại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
