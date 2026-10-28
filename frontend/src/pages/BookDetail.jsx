import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Star, 
  Smartphone, 
  Building, 
  Calendar, 
  Hash, 
  Check, 
  Plus, 
  User, 
  ShieldCheck, 
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  BookCheck,
  Sparkles
} from 'lucide-react';
import { bookApi } from '../api/books';
import { ebookApi } from '../api/ebook';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import AiBookSummaryModal from '../components/AiBookSummaryModal';

export const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ebookInfo, setEbookInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAiChat = (bId, bTitle) => {
    window.dispatchEvent(
      new CustomEvent('openAiChat', {
        detail: {
          bookId: bId,
          bookTitle: bTitle,
          initialPrompt: `Tư vấn cho tôi xem cuốn sách "${bTitle}" có phù hợp với tôi không?`,
        },
      })
    );
  };

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const [detailRes, reviewsRes] = await Promise.allSettled([
          bookApi.getBookDetail(id),
          bookApi.getBookReviews(id),
        ]);

        if (detailRes.status === 'fulfilled') {
          const bData = detailRes.value.data?.data;
          setBook(bData);
          const defaultCover = bData?.coverImageUrl || bData?.coverImgUrl || bData?.imageUrl;
          setSelectedImage(defaultCover);

          // If book has ebook, check ebook info if authenticated
          if (bData?.hasEbook && isAuthenticated) {
            try {
              const ebRes = await ebookApi.getInfo(id);
              setEbookInfo(ebRes.data?.data);
            } catch (err) {
              console.warn('Membership not active or error checking ebook info:', err);
            }
          }
        }

        if (reviewsRes.status === 'fulfilled') {
          const rList = reviewsRes.value.data?.data || [];
          setReviews(Array.isArray(rList) ? rList : []);
        }
      } catch (err) {
        console.error('Error fetching book detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, isAuthenticated]);

  const isInCart = book && cartItems.some((item) => item.bookId === book.bookId);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInCart) {
      showToast('Sách đã có trong giỏ mượn', 'info');
      return;
    }
    try {
      setAddingCart(true);
      await addToCart(book.bookId);
      showToast(`Đã thêm "${book.title}" vào giỏ mượn!`, 'success');
    } catch (err) {
      showToast(err.message || 'Lỗi thêm vào giỏ mượn', 'error');
    } finally {
      setAddingCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin cuốn sách này</h2>
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 text-indigo-600 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại kho sách</span>
        </Link>
      </div>
    );
  }

  const formattedPrice = book.price
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)
    : 'Miễn phí';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white shadow-rose-200'
                : 'bg-indigo-600 text-white shadow-indigo-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/books"
        className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh mục</span>
      </Link>

      {/* Book Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Book Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="w-16 h-16 stroke-1 mb-2" />
                <span className="text-xs">Chưa có ảnh bìa</span>
              </div>
            )}

            {book.hasEbook && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Có E-Book</span>
              </div>
            )}
          </div>

          {/* Secondary images */}
          {((book.images && book.images.length > 0) || (book.imageUrls && book.imageUrls.length > 0)) && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(book.coverImageUrl)}
                className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImage === book.coverImageUrl ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-60'
                }`}
              >
                <img src={book.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              </button>
              {(book.images || book.imageUrls).map((img, idx) => {
                const url = typeof img === 'string' ? img : img?.imageUrl;
                if (!url) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === url ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={url} alt={`Page ${idx}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {book.categoryName && (
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block mb-3 border border-indigo-100">
                {book.categoryName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {book.title}
            </h1>

            {/* Author link */}
            <div className="flex items-center space-x-3 mt-3">
              <span className="text-sm text-slate-500">Tác giả:</span>
              <Link
                to={`/authors/${book.authorId}`}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                {book.authorName || 'Chưa cập nhật'}
              </Link>
            </div>

            {/* Ratings */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(book.averageRating || 5)) ? 'fill-current' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800">
                {book.averageRating ? Number(book.averageRating).toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-slate-400">
                ({book.totalReviews || reviews.length} lượt đánh giá)
              </span>
            </div>
          </div>

          {/* Pricing & Availability Box */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Giá trị niêm yết</span>
                <span className="text-2xl font-black text-slate-900">{formattedPrice}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block text-right">Tình trạng sách</span>
                {book.availableCopies > 0 ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Còn {book.availableCopies}/{book.totalCopies} cuốn</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Đã mượn hết</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={addingCart || book.availableCopies === 0}
                className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                  isInCart
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : book.availableCopies === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-lg'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Trong Giỏ Mượn</span>
                  </>
                ) : addingCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Thêm Vào Giỏ Mượn Sách</span>
                  </>
                )}
              </button>

              {/* Read E-Book Button if available */}
              {book.hasEbook && (
                <Link
                  to={`/books/${book.bookId}/read`}
                  className="py-3 px-5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-sky-200 hover:shadow-lg flex items-center justify-center space-x-2 transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Đọc E-Book Ngay</span>
                </Link>
              )}

              {/* AI Summary Button */}
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className="py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-purple-200 hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                title="Tóm tắt nội dung và bài học rút ra bằng AI"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Tóm tắt AI</span>
              </button>
            </div>
          </div>

          {/* Metadata attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-2.5">
              <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Nhà xuất bản</span>
                <span className="font-semibold text-slate-700 truncate block">
                  {book.publisherName || 'Chưa cập nhật'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Năm xuất bản</span>
                <span className="font-semibold text-slate-700">
                  {book.publishedYear || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Mã ISBN</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {book.isbn || 'Đang cập nhật'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Tóm tắt nội dung
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100">
              {book.description || 'Chưa có tóm tắt chi tiết cho cuốn sách này.'}
            </p>
          </div>

          {/* Author Card */}
          {book.authorName && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start space-x-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                {(book.authorAvatarUrl || book.avatarUrl) ? (
                  <img
                    src={book.authorAvatarUrl || book.avatarUrl}
                    alt={book.authorName}
                    className="w-full h-full rounded-full object-cover ring-2 ring-indigo-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-base ${
                    (book.authorAvatarUrl || book.avatarUrl) ? 'hidden' : ''
                  }`}
                >
                  {book.authorName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{book.authorName}</h4>
                  <Link
                    to={`/authors/${book.authorId}`}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Xem trang tác giả
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {book.authorBio || 'Tác giả có nhiều đóng góp chuyên môn cho giáo trình trường.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reader Reviews Section */}
      <section className="pt-8 border-t border-slate-200 space-y-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Đánh Giá Từ Độc Giả ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl text-center text-xs text-slate-400">
            Chưa có đánh giá nào cho cuốn sách này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.reviewId}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {r.reviewerName || 'Độc giả'}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (r.rating || 5) ? 'fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Books */}
      {book.listRelateBook && book.listRelateBook.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">
            Sách Cùng Tác Giả & Liên Quan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {book.listRelateBook.map((relBook) => (
              <BookCard key={relBook.bookId} book={relBook} onNotify={showToast} />
            ))}
          </div>
        </section>
      )}
      {/* AI Book Summary Modal */}
      <AiBookSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        bookId={book?.bookId}
        bookTitle={book?.title}
        onOpenChat={handleOpenAiChat}
      />
    </div>
  );
};

export default BookDetail;
