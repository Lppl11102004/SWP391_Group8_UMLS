import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cartAndReservationApi } from '../api/cartAndReservation';

export const BorrowCart = () => {
  const { cartItems, removeFromCart, fetchCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected book IDs for reservation (default to all available books)
  const [selectedBookIds, setSelectedBookIds] = useState(() =>
    cartItems.filter((item) => item.available !== false).map((item) => item.bookId)
  );
  const [note, setNote] = useState('Tôi sẽ đến nhận sách tại quầy thư viện');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle toggle selection
  const handleToggleSelect = (bookId) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    const availableIds = cartItems
      .filter((item) => item.available !== false)
      .map((item) => item.bookId);

    if (selectedBookIds.length === availableIds.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(availableIds);
    }
  };

  const handleDelete = async (cartId) => {
    try {
      await removeFromCart(cartId);
      setSelectedBookIds((prev) => prev.filter((id) => id !== cartId));
    } catch (err) {
      setError('Lỗi khi xoá sách khỏi giỏ');
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedBookIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 cuốn sách khả dụng để tạo phiếu mượn');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user?.userId,
        bookId: selectedBookIds,
        note: note.trim() || 'Tôi sẽ đến nhận sách tại quầy thư viện',
      };

      const res = await cartAndReservationApi.createReservation(payload);
      if (res.data?.success) {
        setSuccess('Tạo phiếu yêu cầu đặt mượn sách thành công!');
        await fetchCart();
        setTimeout(() => {
          navigate('/reservations');
        }, 1500);
      } else {
        setError(res.data?.message || 'Không thể tạo phiếu mượn sách');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Tạo phiếu mượn thất bại. Lưu ý: Mỗi độc giả chỉ được tạo tối đa 2 phiếu mượn/ngày.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate estimated deposit

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Giỏ Mượn Sách Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Xem lại các sách đã chọn và gửi phiếu đặt giữ chỗ trước khi đến thư viện
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Giỏ mượn sách đang trống</h2>
          <p className="text-xs text-slate-500">
            Bạn chưa chọn cuốn sách nào vào giỏ. Hãy ghé qua kho sách để khám phá nhé!
          </p>
          <Link
            to="/books"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <span>Khám phá kho sách ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Table / List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedBookIds.length > 0 &&
                      selectedBookIds.length ===
                        cartItems.filter((i) => i.available !== false).length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Chọn tất cả ({cartItems.length} cuốn)
                  </span>
                </label>
                <span className="text-xs text-slate-500">
                  Đã chọn: <b className="text-indigo-600">{selectedBookIds.length}</b> cuốn
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      item.available === false ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        disabled={item.available === false}
                        checked={selectedBookIds.includes(item.bookId)}
                        onChange={() => handleToggleSelect(item.bookId)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-40"
                      />

                      <div className="w-14 h-18 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                        {(item.coverImageUrl || item.coverImgUrl || item.imageUrl) ? (
                          <img
                            src={item.coverImageUrl || item.coverImgUrl || item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BookOpen className="w-6 h-6 stroke-1" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={`/books/${item.bookId}`}
                          className="text-xs sm:text-sm font-bold text-slate-800 hover:text-indigo-600 truncate block"
                        >
                          {item.title}
                        </Link>

                        {item.available === false && (
                          <span className="inline-block mt-1 text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Tạm thời hết sách tại thư viện
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.cartId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Xoá khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout & Note Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Thông Tin Phiếu Đặt Chỗ</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Số sách yêu cầu mượn:</span>
                  <span className="font-bold text-slate-800">{selectedBookIds.length} cuốn</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                  <p className="font-semibold mb-0.5">ℹ️ Lưu ý về tiền đặt cọc:</p>
                  Tiền cọc thực tế (đã áp dụng % giảm giá theo gói thành viên của bạn nếu có) sẽ được hệ thống tính toán chính xác và hiển thị ở mục <b>Lịch sử mượn trả</b> ngay sau khi thủ thư duyệt phiếu mượn.
                </div>
              </div>

              {/* Note input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú cho thủ thư
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Tôi sẽ đến thư viện nhận sách vào sáng mai..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleCreateReservation}
                disabled={submitting || selectedBookIds.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Tạo Phiếu Đặt Mượn Sách</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Notice Alert */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Quy định giữ sách:</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Sau khi thủ thư duyệt phiếu, sách sẽ được giữ cho bạn tại quầy trong vòng 48 giờ. Quá thời hạn trên, phiếu mượn sẽ tự động bị huỷ.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowCart;
