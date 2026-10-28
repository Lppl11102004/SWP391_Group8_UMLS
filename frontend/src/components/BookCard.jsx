import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Star, Plus, Check, Smartphone, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const BookCard = ({ book, onNotify }) => {
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  // Check if book is already in cart
  const isInCart = cartItems.some(
    (item) => item.bookId === book.bookId || item.bookTitle === book.title
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInCart) {
      if (onNotify) onNotify('Sách đã có trong giỏ mượn', 'info');
      return;
    }

    try {
      setAdding(true);
      await addToCart(book.bookId);
      if (onNotify) onNotify(`Đã thêm "${book.title}" vào giỏ mượn!`, 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Lỗi thêm vào giỏ mượn', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Format price
  const formattedPrice = book.price
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Book Cover Image */}
      <Link to={`/books/${book.bookId}`} className="relative block aspect-[3/4] overflow-hidden bg-slate-100">
        {(book.coverImageUrl || book.coverImgUrl || book.imageUrl) ? (
          <img
            src={book.coverImageUrl || book.coverImgUrl || book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.querySelector('.image-fallback')?.classList.remove('hidden');
            }}
          />
        ) : null}

        <div className={`image-fallback w-full h-full flex flex-col items-center justify-center text-slate-300 p-4 text-center ${(book.coverImageUrl || book.coverImgUrl || book.imageUrl) ? 'hidden' : ''}`}>
          <BookOpen className="w-12 h-12 mb-2 stroke-1" />
          <span className="text-xs text-slate-400 font-medium">Chưa có ảnh bìa</span>
        </div>

        {/* E-Book Badge */}
        {(book.hasEbook || book.hasEBook) && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-md">
            <Smartphone className="w-3 h-3" />
            <span>E-Book</span>
          </div>
        )}

        {/* Available Copies Badge */}
        <div className="absolute bottom-2.5 right-2.5">
          {book.availableCopies !== undefined ? (
            book.availableCopies > 0 ? (
              <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Còn {book.availableCopies} cuốn
              </span>
            ) : (
              <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Hết sách
              </span>
            )
          ) : book.isAvailable === false ? (
            <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Hết sách
            </span>
          ) : (
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Sẵn sàng
            </span>
          )}
        </div>
      </Link>

      {/* Book Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          {book.categoryName && (
            <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider block mb-1">
              {book.categoryName}
            </span>
          )}

          {/* Title */}
          <Link
            to={`/books/${book.bookId}`}
            className="font-semibold text-slate-800 text-sm hover:text-indigo-600 transition-colors line-clamp-2 block leading-snug"
            title={book.title}
          >
            {book.title}
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {book.authorName || 'Nhiều tác giả'}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {book.averageRating ? Number(book.averageRating).toFixed(1) : '5.0'}
            </span>
            {book.reviewCount > 0 && (
              <span className="text-[11px] text-slate-400">({book.reviewCount})</span>
            )}
          </div>
        </div>

        {/* Footer & Add to cart button */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Giá bìa</span>
            <span className="text-xs font-bold text-slate-800">
              {formattedPrice || 'Miễn phí'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || book.availableCopies === 0}
            className={`p-2 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
              isInCart
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : book.availableCopies === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 shadow-sm'
            }`}
            title={isInCart ? 'Đã có trong giỏ' : 'Thêm vào giỏ mượn'}
          >
            {isInCart ? (
              <Check className="w-4 h-4" />
            ) : adding ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isInCart ? 'Đã chọn' : 'Mượn'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
