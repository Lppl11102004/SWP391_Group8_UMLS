import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Edit3,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { myReviewsApi } from '../api/myReviews';

export const MyReviews = () => {
  const [selectedStatus, setSelectedStatus] = useState(''); // '' means all
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Edit Modal
  const [editModal, setEditModal] = useState(null); // review object
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const statusTabs = [
    { label: 'Tất cả đánh giá', value: '' },
    { label: 'Đang hiển thị công khai', value: '1' },
    { label: 'Đã ẩn / Đã xoá mềm', value: '0' },
  ];

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await myReviewsApi.getMyReviews(selectedStatus, page, 8);
      const pageData = res.data?.data;
      if (pageData) {
        setReviews(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setReviews([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching my reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedStatus, page]);

  // Open Edit Modal
  const handleOpenEdit = (review) => {
    setEditModal(review);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || '');
  };

  // Submit Edit
  const handleSubmitEdit = async () => {
    if (!editModal) return;
    if (!editComment.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá' });
      return;
    }

    setActionLoading(true);
    try {
      const data = {
        bookId: editModal.bookId,
        rating: editRating,
        comment: editComment.trim(),
      };
      const res = await myReviewsApi.updateMyReview(editModal.reviewId, data);
      setMessage({ type: 'success', text: res.data?.message || 'Cập nhật đánh giá thành công!' });
      setEditModal(null);
      await fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể cập nhật đánh giá (có thể đã quá hạn 3 ngày hoặc chứa từ vi phạm)',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete review (Soft delete)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đánh giá này? (Bài viết sẽ bị ẩn khỏi trang chi tiết sách)')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await myReviewsApi.deleteMyReview(reviewId);
      setMessage({ type: 'success', text: res.data?.message || 'Đã xoá bài đánh giá thành công!' });
      await fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Xóa đánh giá thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Check if review was created within 3 days
  const isWithin3Days = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - created) / (1000 * 3600 * 24);
    return diffDays <= 3;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Quản Lý Đánh Giá Của Tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem lại nhận xét bạn đã đóng góp, chỉnh sửa trong vòng 3 ngày hoặc gỡ bỏ đánh giá.
          </p>
        </div>

        <Link
          to="/borrow-records"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all self-start sm:self-auto"
        >
          Đánh giá thêm từ sách đã trả
        </Link>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedStatus(tab.value);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === tab.value
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Chưa có bài đánh giá nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Sau khi mượn và hoàn tất trả sách, bạn có thể gửi đánh giá cảm nhận về tác phẩm để chia sẻ với cộng đồng.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => {
              const canEdit = isWithin3Days(r.createdAt) && Number(r.status) === 1;
              const isVisible = Number(r.status) === 1;

              return (
                <div
                  key={r.reviewId}
                  className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                    isVisible ? 'border-slate-200/80 hover:border-amber-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/books/${r.bookId}`}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="truncate max-w-[220px]">{r.bookTitle || `Sách #${r.bookId}`}</span>
                      </Link>

                      {isVisible ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Eye className="w-3 h-3 mr-1" /> Công khai
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <EyeOff className="w-3 h-3 mr-1" /> Đã ẩn
                        </span>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Number(r.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">
                        {r.rating}/5
                      </span>
                    </div>

                    {/* Comment text */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                      "{r.comment || 'Không có bình luận'}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Ngày đăng: {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      {canEdit ? (
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Trong hạn 3 ngày sửa
                        </span>
                      ) : (
                        <span className="text-slate-400">Đã khóa sửa (&gt; 3 ngày)</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isVisible && (
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        disabled={!canEdit}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                          canEdit
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title={canEdit ? 'Chỉnh sửa đánh giá' : 'Đã quá 3 ngày kể từ lúc tạo, không thể sửa'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>

                      <button
                        onClick={() => handleDeleteReview(r.reviewId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Xóa mềm bài đánh giá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
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

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Chỉnh Sửa Đánh Giá
              </h3>
              <button
                onClick={() => setEditModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tác phẩm:</label>
                <span className="text-xs font-semibold text-slate-800">{editModal.bookTitle}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Số sao đánh giá:</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{editRating} sao</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Lời bình luận:</label>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  placeholder="Nhập cảm nhận của bạn về cuốn sách..."
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitEdit}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
