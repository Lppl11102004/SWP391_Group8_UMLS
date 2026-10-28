import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  UserCheck,
  RotateCcw,
  Coins,
  ShieldCheck,
  FileText,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';
import { formatVND } from '../../utils/format';

export const BorrowManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepositStatus, setSelectedDepositStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Detail Modal
  const [activeDetail, setActiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Handover Modal
  const [handoverModalId, setHandoverModalId] = useState(null);
  const [handoverNote, setHandoverNote] = useState('');

  // Return Modal
  const [returnModalRecord, setReturnModalRecord] = useState(null); // borrowRecord object with details
  const [returnItemsState, setReturnItemsState] = useState({}); // { [copyId]: { returnStatus: 1, fineAmount: 0, damageNote: '' } }
  const [returnGeneralNote, setReturnGeneralNote] = useState('');

  // Collect Deposit Modal
  const [payDepositModal, setPayDepositModal] = useState(null);
  const [payDepositMethod, setPayDepositMethod] = useState(1); // 1: Cash, 2: VNPay
  const [vnpayUrl, setVnpayUrl] = useState('');

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang mượn', value: '1' },
    { label: 'Chờ nhận sách tại quầy', value: '0' },
    { label: 'Quá hạn', value: '3' },
    { label: 'Đã hoàn tất trả', value: '2' },
    { label: 'Đã huỷ', value: '4' },
  ];

  const fetchBorrowRecords = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (selectedStatus !== '') params.status = selectedStatus;
      if (selectedDepositStatus !== '') params.depositStatus = selectedDepositStatus;
      if (keyword.trim()) params.keyword = keyword.trim();

      const res = await librarianApi.getBorrowRecords(params);
      const pageData = res.data?.data;
      if (pageData) {
        setBorrowRecords(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setBorrowRecords([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching borrow records:', err);
      setBorrowRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowRecords();
  }, [selectedStatus, selectedDepositStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBorrowRecords();
  };

  // Open Detail
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await librarianApi.getBorrowRecordDetail(id);
      setActiveDetail(res.data?.data || null);
    } catch (err) {
      console.error('Error fetching detail:', err);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết phiếu mượn' });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Handover
  const handleSubmitHandover = async () => {
    if (!handoverModalId) return;
    setActionLoading(true);
    try {
      const res = await librarianApi.handoverBooks(handoverModalId, { note: handoverNote.trim() });
      setMessage({ type: 'success', text: res.data?.message || 'Bàn giao sách cho độc giả thành công!' });
      setHandoverModalId(null);
      setHandoverNote('');
      setActiveDetail(null);
      await fetchBorrowRecords();
    } catch (err) {
      console.error('Error handover:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Bàn giao sách thất bại.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Return Modal
  const handleOpenReturnModal = async (borrowId) => {
    setActionLoading(true);
    try {
      const res = await librarianApi.getBorrowRecordDetail(borrowId);
      const detail = res.data?.data;
      setReturnModalRecord(detail);
      setReturnGeneralNote('Trả sách tại quầy');

      // Initialize return state for each book copy
      const initialItems = {};
      detail?.listBorrowDetail?.forEach((item) => {
        initialItems[item.copyId] = {
          copyId: item.copyId,
          returnStatus: 1, // 1: GOOD, 2: DAMAGED, 3: LOST
          fineAmount: '',
          damageNote: '',
        };
      });
      setReturnItemsState(initialItems);
    } catch (err) {
      console.error('Error fetching detail for return:', err);
      setMessage({ type: 'error', text: 'Không thể tải thông tin phiếu mượn' });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Return Books
  const handleSubmitReturn = async () => {
    if (!returnModalRecord) return;
    setActionLoading(true);
    try {
      const items = Object.values(returnItemsState).map((item) => ({
        copyId: item.copyId,
        returnStatus: Number(item.returnStatus),
        fineAmount: item.fineAmount ? Number(item.fineAmount) : null,
        damageNote: item.damageNote ? item.damageNote.trim() : null,
      }));

      const payload = {
        note: returnGeneralNote.trim() || 'Tiếp nhận trả sách',
        items,
      };

      const res = await librarianApi.returnBooks(returnModalRecord.borrowId, payload);
      setMessage({
        type: 'success',
        text: res.data?.message || 'Tiếp nhận trả sách và hoàn trả tiền cọc thành công!',
      });
      setReturnModalRecord(null);
      setActiveDetail(null);
      await fetchBorrowRecords();
    } catch (err) {
      console.error('Error returning books:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Tiếp nhận trả sách thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Collect deposit at counter
  const handleLibrarianPayDeposit = async () => {
    if (!payDepositModal) return;
    const bId = payDepositModal.borrowId || payDepositModal.borrowRecordId;
    setActionLoading(true);
    try {
      const res = await librarianApi.payDeposit(bId, payDepositMethod);
      if (payDepositMethod === 2 && res.data?.data) {
        setVnpayUrl(res.data.data);
        sessionStorage.setItem('vnpay_return_url', '/librarian/borrows');
        window.open(res.data.data, '_blank');
        setMessage({ type: 'success', text: 'Đã tạo liên kết VNPay và mở cổng thanh toán! Hướng dẫn độc giả quét mã để thanh toán.' });
      } else {
        setMessage({ type: 'success', text: res.data?.message || 'Ghi nhận thu tiền cọc tại quầy thành công!' });
        setPayDepositModal(null);
        setVnpayUrl('');
        await fetchBorrowRecords();
      }
    } catch (err) {
      console.error('Error paying deposit:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Xử lý nộp tiền cọc thất bại.' });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (Number(status)) {
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Chờ nhận sách
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Đang mượn
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã hoàn trả
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Quá hạn
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Đã huỷ
          </span>
        );
      default:
        return null;
    }
  };

  const renderDepositBadge = (dStatus) => {
    switch (Number(dStatus)) {
      case 1:
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đã nộp cọc</span>;
      case 2:
        return <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Đã hoàn cọc</span>;
      case 3:
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Chờ nộp cọc</span>;
      default:
        return <span className="text-[11px] text-slate-400">Không có cọc</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          Quản Lý Mượn Trả Tại Quầy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Thực hiện bàn giao sách vật lý, tiếp nhận trả sách, kiểm tra tình trạng hư hại và hoàn trả tiền cọc.
        </p>
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

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
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

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên, email độc giả..."
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
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách mượn trả...</p>
        </div>
      ) : borrowRecords.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3 text-center">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy phiếu mượn nào</h3>
          <p className="text-xs text-slate-500">Không có bản ghi phù hợp với tiêu chí lọc.</p>
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
                    <th className="py-3.5 px-4">Hạn trả (Due date)</th>
                    <th className="py-3.5 px-4 text-right">Tiền đặt cọc</th>
                    <th className="py-3.5 px-4 text-center">Gia hạn</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {borrowRecords.map((r) => {
                    const isPending = Number(r.status) === 0;
                    const isBorrowing = Number(r.status) === 1 || Number(r.status) === 3; // borrowing or overdue

                    return (
                      <tr key={r.borrowId || r.borrowRecordId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          #{r.borrowId || r.borrowRecordId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{r.userName || r.readerName || `User #${r.userId}`}</span>
                          <span className="text-[11px] text-slate-400 block">
                            Mượn: {r.borrowDate ? new Date(r.borrowDate).toLocaleDateString('vi-VN') : 'Chưa lấy'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {r.dueDate ? (
                            <span className="font-bold text-slate-800">
                              {new Date(r.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-slate-400">Chưa bắt đầu</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-slate-900 block">
                            {formatVND(r.depositAmount)}
                          </span>
                          <div className="mt-0.5">{renderDepositBadge(r.depositStatus)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {r.extensionCount || 0}/1
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">{renderStatusBadge(r.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(r.borrowId || r.borrowRecordId)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Xem
                            </button>

                            {isPending && Number(r.depositStatus) === 3 && Number(r.depositAmount || 0) > 0 && (
                              <button
                                onClick={() => {
                                  setPayDepositModal(r);
                                  setPayDepositMethod(1);
                                  setVnpayUrl('');
                                }}
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                                title="Thu tiền cọc trực tiếp tại quầy"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Thu cọc
                              </button>
                            )}

                            {isPending && (
                              <button
                                onClick={() => setHandoverModalId(r.borrowId || r.borrowRecordId)}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Bàn giao
                              </button>
                            )}

                            {isBorrowing && (
                              <button
                                onClick={() => handleOpenReturnModal(r.borrowId || r.borrowRecordId)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Trả sách & Hoàn cọc
                              </button>
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
                  <span>Phiếu mượn #{activeDetail.borrowId || activeDetail.borrowRecordId}</span>
                  {renderStatusBadge(activeDetail.status)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Độc giả: {activeDetail.userName} | Thủ thư phụ trách: {activeDetail.librarianName || 'Quầy 1'}
                </p>
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Hạn trả</span>
                <span className="font-bold text-slate-800 text-sm">
                  {activeDetail.dueDate ? new Date(activeDetail.dueDate).toLocaleDateString('vi-VN') : 'Chưa bàn giao'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tiền cọc</span>
                <span className="font-bold text-slate-800 text-sm">
                  {Number(activeDetail.depositAmount || 0).toLocaleString('vi-VN')} đ
                </span>
                <span className="ml-2">{renderDepositBadge(activeDetail.depositStatus)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách sách mượn ({activeDetail.listBorrowDetail?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {activeDetail.listBorrowDetail?.map((item) => (
                  <div
                    key={item.detailId || item.copyId}
                    className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={item.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                        alt={item.bookTitle}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.bookTitle}</h5>
                        <p className="text-[11px] text-slate-500">{item.authorName}</p>
                        <span className="inline-block mt-0.5 font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          Mã vạch: {item.barcode}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      {item.returnDate ? (
                        <span className="text-emerald-600 font-semibold block">
                          Đã trả: {new Date(item.returnDate).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-semibold block">Đang giữ</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER MODAL */}
      {handoverModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                Bàn Giao Sách Tại Quầy #{handoverModalId}
              </h3>
              <button
                onClick={() => setHandoverModalId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Xác nhận đã kiểm tra sách thực tế nguyên vẹn và độc giả đã có mặt tại quầy để nhận sách.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ghi chú bàn giao (Tùy chọn):
              </label>
              <textarea
                rows={2}
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="Ví dụ: Bàn giao nguyên vẹn tại quầy số 1..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setHandoverModalId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitHandover}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang bàn giao...' : 'Xác nhận bàn giao'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN BOOKS MODAL */}
      {returnModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                Tiếp Nhận Trả Sách & Hoàn Cọc #{returnModalRecord.borrowId || returnModalRecord.borrowRecordId}
              </h3>
              <button
                onClick={() => setReturnModalRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deposit notice */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Tiền cọc sẽ tự động được hoàn trả bằng tiền mặt:</span>
              </div>
              <span className="font-extrabold text-emerald-700 text-sm">
                {Number(returnModalRecord.depositAmount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Book items condition check */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Kiểm tra hiện trạng từng cuốn sách:
              </h4>

              {returnModalRecord.listBorrowDetail?.map((item) => {
                const currentItem = returnItemsState[item.copyId] || { returnStatus: 1 };
                const isDamagedOrLost = currentItem.returnStatus === 2 || currentItem.returnStatus === 3;

                return (
                  <div
                    key={item.copyId}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                        alt={item.bookTitle}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.bookTitle}</h5>
                        <p className="text-[11px] text-slate-500">Mã vạch: <b className="font-mono">{item.barcode}</b></p>
                      </div>
                    </div>

                    {/* Condition Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Tốt (Bình thường)', val: 1, color: 'text-emerald-700 border-emerald-300' },
                        { label: 'Hư hỏng / Rách', val: 2, color: 'text-amber-700 border-amber-300' },
                        { label: 'Làm mất sách', val: 3, color: 'text-rose-700 border-rose-300' },
                      ].map((cond) => (
                        <button
                          key={cond.val}
                          type="button"
                          onClick={() =>
                            setReturnItemsState((prev) => ({
                              ...prev,
                              [item.copyId]: { ...prev[item.copyId], returnStatus: cond.val },
                            }))
                          }
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            currentItem.returnStatus === cond.val
                              ? 'bg-white shadow-sm ring-2 ring-indigo-500/20 ' + cond.color
                              : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
                          }`}
                        >
                          {cond.label}
                        </button>
                      ))}
                    </div>

                    {/* Fine input if damaged or lost */}
                    {isDamagedOrLost && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Tiền phạt bồi hoàn (đ):
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Nhập số tiền..."
                            value={currentItem.fineAmount || ''}
                            onChange={(e) =>
                              setReturnItemsState((prev) => ({
                                ...prev,
                                [item.copyId]: { ...prev[item.copyId], fineAmount: e.target.value },
                              }))
                            }
                            className="w-full text-xs p-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Mô tả lỗi / thiệt hại:
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Rách trang 10-15..."
                            value={currentItem.damageNote || ''}
                            onChange={(e) =>
                              setReturnItemsState((prev) => ({
                                ...prev,
                                [item.copyId]: { ...prev[item.copyId], damageNote: e.target.value },
                              }))
                            }
                            className="w-full text-xs p-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* General Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ghi chú chung cho phiếu trả:
              </label>
              <input
                type="text"
                value={returnGeneralNote}
                onChange={(e) => setReturnGeneralNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="pt-2 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setReturnModalRecord(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang hoàn tất...' : 'Xác Nhận Trả Sách & Hoàn Cọc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARIAN COLLECT DEPOSIT MODAL */}
      {payDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Thu Tiền Cọc Tại Quầy
              </h3>
              <button
                onClick={() => {
                  setPayDepositModal(null);
                  setVnpayUrl('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã phiếu mượn:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{payDepositModal.borrowId || payDepositModal.borrowRecordId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Độc giả:</span>
                <span className="font-bold text-slate-800">
                  {payDepositModal.userName || `User #${payDepositModal.userId}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-amber-200/50 pt-2">
                <span className="text-slate-500">Tiền cọc cần thu:</span>
                <span className="font-extrabold text-amber-800 text-sm">
                  {formatVND(payDepositModal.depositAmount)}
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
                  onClick={() => setPayDepositMethod(1)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    payDepositMethod === 1
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">Tiền mặt (CASH)</span>
                  <span className="text-[11px] text-slate-500 mt-1">Thu tiền mặt trực tiếp tại quầy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayDepositMethod(2)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    payDepositMethod === 2
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">VNPay Online</span>
                  <span className="text-[11px] text-slate-500 mt-1">Tạo mã QR / Link cho độc giả</span>
                </button>
              </div>
            </div>

            {vnpayUrl && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <p className="text-xs font-semibold text-emerald-800">
                  Liên kết thanh toán VNPay đã sẵn sàng:
                </p>
                <a
                  href={vnpayUrl}
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
                  setPayDepositModal(null);
                  setVnpayUrl('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLibrarianPayDeposit}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : payDepositMethod === 1 ? 'Xác Nhận Đã Thu Tiền Mặt' : 'Tạo Link VNPay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowManagement;
