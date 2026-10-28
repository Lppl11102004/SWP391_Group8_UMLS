import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  Search,
  Filter,
  CreditCard,
  Banknote,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import adminApi from '../../api/admin';

export const ReportManagement = () => {
  const { showToast } = useOutletContext() || {};

  // Active view: 'ledger' | 'top-books' | 'memberships'
  const [activeTab, setActiveTab] = useState('ledger');

  // Ledger state
  const [payments, setPayments] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Top books state
  const [topBooks, setTopBooks] = useState([]);
  const [topBooksLoading, setTopBooksLoading] = useState(false);
  const [topLimit, setTopLimit] = useState(15);

  // Membership Report state
  const [membershipData, setMembershipData] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Fetch Payment Ledger
  const fetchLedger = async (pageIdx = page) => {
    setLedgerLoading(true);
    try {
      const params = {
        page: pageIdx,
        size: 12,
        keyword: keyword.trim() || undefined,
        paymentType: paymentType !== '' ? Number(paymentType) : undefined,
        paymentMethod: paymentMethod !== '' ? Number(paymentMethod) : undefined,
        status: status !== '' ? Number(status) : undefined,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(toDate).toISOString() : undefined,
      };

      const res = await adminApi.getPaymentReport(params);
      if (res.data?.success) {
        const d = res.data.data;
        setPayments(d.content || []);
        setTotalPages(d.totalPages || 1);
        setTotalElements(d.totalElements || 0);
        setPage(d.page || 0);
      }
    } catch (err) {
      console.error('Fetch ledger error:', err);
      if (showToast) showToast('Không thể tải sổ cái thanh toán', 'error');
    } finally {
      setLedgerLoading(false);
    }
  };

  // Fetch Top Books
  const fetchTopBooks = async () => {
    setTopBooksLoading(true);
    try {
      const res = await adminApi.getTopBorrowedBooks({ limit: topLimit });
      if (res.data?.success) {
        setTopBooks(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch top books error:', err);
      if (showToast) showToast('Không thể tải báo cáo top sách', 'error');
    } finally {
      setTopBooksLoading(false);
    }
  };

  // Fetch Membership Report
  const fetchMembershipReport = async () => {
    setMemberLoading(true);
    try {
      const res = await adminApi.getMembershipReport();
      if (res.data?.success) {
        setMembershipData(res.data.data);
      }
    } catch (err) {
      console.error('Fetch membership report error:', err);
      if (showToast) showToast('Không thể tải báo cáo hội viên', 'error');
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchLedger(0);
    } else if (activeTab === 'top-books') {
      fetchTopBooks();
    } else if (activeTab === 'memberships') {
      fetchMembershipReport();
    }
  }, [activeTab, paymentType, paymentMethod, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLedger(0);
  };

  const formatVND = (amt) => {
    if (amt === undefined || amt === null) return '0 ₫';
    return Number(amt).toLocaleString('vi-VN') + ' ₫';
  };

  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case 1:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Phạt vi phạm</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Gói hội viên</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Tiền cọc mượn</span>;
      case 4:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn tiền cọc</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Khác</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Sổ Cái Giao Dịch & Báo Cáo Tài Chính</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu toàn bộ dòng tiền thu/chi, phân tích gói hội viên và các đầu sách có tần suất mượn cao nhất.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sổ Cái Giao Dịch Toàn Hệ Thống</span>
        </button>

        <button
          onClick={() => setActiveTab('top-books')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'top-books'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Top Sách Mượn Nhiều Nhất</span>
        </button>

        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'memberships'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Phân Tích Doanh Thu Hội Viên</span>
        </button>
      </div>

      {/* TAB 1: SỔ CÁI THANH TOÁN (LEDGER) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Mã giao dịch (TxnRef), Gateway ID, email hoặc tên bạn đọc..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
                  >
                    <option value="">Tất cả loại giao dịch</option>
                    <option value="1">Tiền phạt (Fine)</option>
                    <option value="2">Gói hội viên (Membership)</option>
                    <option value="3">Đặt cọc sách (Deposit)</option>
                    <option value="4">Hoàn cọc (Deposit Refund)</option>
                  </select>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
                  >
                    <option value="">Tất cả phương thức</option>
                    <option value="1">Tiền mặt tại quầy (CASH)</option>
                    <option value="2">Cổng trực tuyến (VNPAY)</option>
                  </select>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="1">Thành công (Success)</option>
                    <option value="0">Chờ xử lý (Pending)</option>
                    <option value="2">Thất bại (Failed)</option>
                  </select>
                </div>
              </div>

              {/* Date Filters & Submit */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">Từ ngày:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-slate-400 font-bold">Đến ngày:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword('');
                      setPaymentType('');
                      setPaymentMethod('');
                      setStatus('');
                      setFromDate('');
                      setToDate('');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                  >
                    Đặt lại bộ lọc
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Lọc dữ liệu
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã Giao Dịch</th>
                    <th className="py-3 px-3">Người Nộp / Bạn Đọc</th>
                    <th className="py-3 px-3">Loại Thu/Chi</th>
                    <th className="py-3 px-3">Số Tiền</th>
                    <th className="py-3 px-3">Phương Thức</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        Đang truy xuất dữ liệu sổ cái...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        Không tìm thấy giao dịch nào thỏa điều kiện
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-slate-800">
                            {p.txnRef || `#PAY-${p.paymentId}`}
                          </p>
                          {p.gatewayTxnNo && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              GW: {p.gatewayTxnNo}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800">{p.userFullName || '—'}</p>
                          <span className="text-[11px] text-slate-400">{p.userEmail}</span>
                        </td>

                        <td className="py-3 px-3">
                          {getPaymentTypeBadge(p.paymentType)}
                          {p.membershipPlanName && (
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {p.membershipPlanName}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`font-black text-xs ${
                              p.paymentType === 4
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {p.paymentType === 4 ? '-' : '+'}{formatVND(p.amount)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            {p.paymentMethod === 2 ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                <span>VNPay</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tiền mặt</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 1
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 2
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.status === 1 ? 'Thành công' : p.status === 2 ? 'Thất bại' : 'Chờ xử lý'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleString('vi-VN')
                            : p.createdAt
                            ? new Date(p.createdAt).toLocaleString('vi-VN')
                            : '—'}
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
                Hiển thị {payments.length} / <b>{totalElements}</b> bản ghi giao dịch
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => fetchLedger(page - 1)}
                  disabled={page === 0 || ledgerLoading}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 px-2">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => fetchLedger(page + 1)}
                  disabled={page >= totalPages - 1 || ledgerLoading}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOP SÁCH MƯỢN NHIỀU */}
      {activeTab === 'top-books' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Danh Sách Tựa Sách Có Tần Suất Mượn Cao Nhất
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Căn cứ trên số lượng chi tiết mượn thực tế tại quầy và phiếu đặt giữ hoàn tất.
              </p>
            </div>
            <select
              value={topLimit}
              onChange={(e) => {
                setTopLimit(Number(e.target.value));
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="10">Top 10 cuốn</option>
              <option value="15">Top 15 cuốn</option>
              <option value="30">Top 30 cuốn</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100">
            {topBooksLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Đang thống kê số liệu mượn sách...
              </div>
            ) : topBooks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có dữ liệu ghi nhận lượt mượn
              </div>
            ) : (
              topBooks.map((b, idx) => (
                <div key={b.bookId || idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5 truncate">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">{b.title}</h4>
                      <p className="text-xs text-slate-500 truncate">
                        Tác giả: <b>{b.authorName}</b> • Thể loại: <span className="text-indigo-600">{b.categoryName}</span> • ISBN: <span className="font-mono text-[11px]">{b.isbn}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-2xl">
                      {b.borrowCount} lượt mượn
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PHÂN TÍCH HỘI VIÊN */}
      {activeTab === 'memberships' && (
        <div className="space-y-4">
          {memberLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Đang tổng hợp báo cáo hội viên...
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tổng Hội Viên Đang Hiệu Lực
                  </span>
                  <div className="text-3xl font-black text-indigo-900 mt-1">
                    {membershipData?.totalActiveMemberships || 0}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
                    Đang được hưởng đặc quyền miễn giảm cọc
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Đăng Ký Mới Trong Tháng
                  </span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">
                    +{membershipData?.newMembershipsThisMonth || 0}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
                    Tăng trưởng hội viên tháng hiện tại
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sắp Hết Hạn (30 Ngày Tới)
                  </span>
                  <div className="text-3xl font-black text-amber-600 mt-1">
                    {membershipData?.expiringSoon || 0}
                  </div>
                  <span className="text-xs text-amber-700 font-semibold mt-1 inline-block">
                    Cần gửi thông báo nhắc gia hạn
                  </span>
                </div>
              </div>

              {/* Revenue by Plan Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
                <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
                  Bảng Chi Tiết Doanh Thu Từng Gói Hội Viên
                </h3>

                <div className="divide-y divide-slate-100 mt-2">
                  {membershipData?.revenueByPlan?.map((plan) => (
                    <div key={plan.planId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{plan.planName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {plan.activeUserCount} hội viên đang kích hoạt • {plan.soldCount || 0} lượt giao dịch đã bán
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-bold block">Tổng tích lũy</span>
                        <span className="text-lg font-black text-emerald-700">
                          {formatVND(plan.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
