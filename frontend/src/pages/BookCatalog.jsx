import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { bookApi } from '../api/books';
import { authorApi } from '../api/authors';
import BookCard from '../components/BookCard';

export const BookCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [publisherId, setPublisherId] = useState(searchParams.get('publisherId') || '');
  const [authorId, setAuthorId] = useState(searchParams.get('authorId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [fromYear, setFromYear] = useState(searchParams.get('fromYear') || '');
  const [toYear, setToYear] = useState(searchParams.get('toYear') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 0);

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Results state
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch filter metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, pubRes, authRes] = await Promise.allSettled([
          bookApi.getCategories(),
          bookApi.getPublishers(),
          authorApi.getAuthors(0, 100),
        ]);

        if (catRes.status === 'fulfilled') {
          const list = catRes.value.data?.data || catRes.value.data || [];
          setCategories(Array.isArray(list) ? list : []);
        }
        if (pubRes.status === 'fulfilled') {
          const list = pubRes.value.data?.data || pubRes.value.data || [];
          setPublishers(Array.isArray(list) ? list : []);
        }
        if (authRes.status === 'fulfilled') {
          const list = authRes.value.data?.data || authRes.value.data || [];
          setAuthors(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Sync keyword from URL query param if changed
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword');
    if (urlKeyword !== null && urlKeyword !== keyword) {
      setKeyword(urlKeyword);
    }
    const urlCat = searchParams.get('categoryId');
    if (urlCat !== null && urlCat !== categoryId) {
      setCategoryId(urlCat);
    }
  }, [searchParams]);

  // Fetch books with filters
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 12,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (categoryId) params.categoryId = categoryId;
      if (publisherId) params.publisherId = publisherId;
      if (authorId) params.authorId = authorId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (fromYear) params.fromYear = fromYear;
      if (toYear) params.toYear = toYear;

      const res = await bookApi.searchBooks(params);
      const pageData = res.data?.data;
      if (pageData) {
        setBooks(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        setBooks([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error searching books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, categoryId, publisherId, authorId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategoryId('');
    setPublisherId('');
    setAuthorId('');
    setMinPrice('');
    setMaxPrice('');
    setFromYear('');
    setToYear('');
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Kho Sách & Giáo Trình
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tìm kiếm và lọc trong tổng số <span className="font-semibold text-indigo-600">{totalElements}</span> cuốn sách khả dụng
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="md:hidden flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Bộ Lọc Nâng Cao</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </h3>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Từ khoá tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tên sách, ISBN..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thể loại / Chuyên ngành
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
              >
                <option value="">Tất cả thể loại</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhà xuất bản
              </label>
              <select
                value={publisherId}
                onChange={(e) => {
                  setPublisherId(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
              >
                <option value="">Tất cả nhà xuất bản</option>
                {publishers.map((p) => (
                  <option key={p.publisherId} value={p.publisherId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tác giả
              </label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
              >
                <option value="">Tất cả tác giả</option>
                {authors.map((a) => (
                  <option key={a.authorId} value={a.authorId}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Year Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Năm xuất bản
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ năm"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  placeholder="Đến năm"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Khoảng giá sách (VNĐ)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ giá"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  placeholder="Đến giá"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Áp Dụng Bộ Lọc</span>
            </button>
          </div>
        </div>

        {/* Book Cards Grid & Pagination */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-slate-200 h-80"></div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Không tìm thấy sách phù hợp
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hãy thử xoá bớt các điều kiện lọc hoặc nhập từ khoá khác để tìm kiếm lại.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.bookId} book={book} onNotify={showToast} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-3">
                Trang {page + 1} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCatalog;
