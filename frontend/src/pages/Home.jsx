import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Smartphone, 
  Layers, 
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { bookApi } from '../api/books';
import { membershipApi } from '../api/membership';
import { ebookApi } from '../api/ebook';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [readingShelf, setReadingShelf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const promises = [
          bookApi.getHomeBooks(),
          bookApi.getCategories(),
          membershipApi.getPlans(),
        ];

        if (isAuthenticated) {
          promises.push(ebookApi.getReadingShelf());
        }

        const [booksRes, catRes, plansRes, shelfRes] = await Promise.allSettled(promises);

        if (booksRes.status === 'fulfilled') {
          const bList = booksRes.value.data?.data || booksRes.value.data || [];
          setBooks(Array.isArray(bList) ? bList : []);
        }

        if (catRes.status === 'fulfilled') {
          const cList = catRes.value.data?.data || catRes.value.data || [];
          setCategories(Array.isArray(cList) ? cList : []);
        }

        if (plansRes.status === 'fulfilled') {
          const pList = plansRes.value.data?.data || plansRes.value.data || [];
          setPlans(Array.isArray(pList) ? pList : []);
        }

        if (shelfRes && shelfRes.status === 'fulfilled') {
          const sList = shelfRes.value.data?.data || [];
          setReadingShelf(Array.isArray(sList) ? sList : []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/books?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="space-y-16 pb-16">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Thư viện Số & Mượn Sách Thông Minh ULMS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Mở Cánh Cửa Tri Thức <br />
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Đại Học Trực Tuyến
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Khám phá kho tàng sách giấy, giáo trình chuyên ngành và trải nghiệm đọc E-Book trực tuyến mọi lúc mọi nơi dành riêng cho giảng viên và sinh viên.
              </p>

              {/* Search in Hero */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0">
                <div className="relative flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl focus-within:border-indigo-400 focus-within:bg-white/15 transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sách, tác giả, chuyên ngành..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5 flex-shrink-0"
                  >
                    <span>Tìm sách</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Stats badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-indigo-900/50 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-bold text-sky-400">10,000+</p>
                  <p className="text-xs text-slate-400">Đầu sách đa dạng</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-xs text-slate-400">Đặt giữ online</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">24/7</p>
                  <p className="text-xs text-slate-400">Đọc E-Book tiện lợi</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-30 blur-2xl"></div>
                <div className="relative bg-slate-900/90 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">ULMS Catalog 2026</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/60 rounded-xl flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">E-Book Reader Tích Hợp</h4>
                        <p className="text-[11px] text-slate-400">Đọc PDF mượt mà, lưu tiến độ tự động</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Đặt Giữ Chỗ Nhanh Chóng</h4>
                        <p className="text-[11px] text-slate-400">Tạo phiếu mượn trước khi đến thư viện</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl flex items-center space-x-3">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Gói Hội Viên Ưu Đãi</h4>
                        <p className="text-[11px] text-slate-400">Miễn giảm tiền cọc lên tới 100%</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      to="/books"
                      className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 space-x-1"
                    >
                      <span>Khám phá toàn bộ kho sách ngay</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Reading Shelf (E-Book) */}
      {isAuthenticated && readingShelf.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-400/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Tiếp Tục Đọc E-Book
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Tủ sách điện tử đang đọc dở của bạn
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readingShelf.map((item) => (
                <div
                  key={item.ebookId || item.bookId}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center space-x-4 hover:bg-white/15 transition-all"
                >
                  <img
                    src={item.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                    alt={item.bookTitle}
                    className="w-16 h-24 object-cover rounded-xl shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-white truncate" title={item.bookTitle}>
                        {item.bookTitle}
                      </h4>
                      <p className="text-xs text-indigo-300 truncate">
                        {item.authorName || 'Tác giả thư viện'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-indigo-200">
                        <span>Trang {item.currentPage} / {item.totalPages}</span>
                        <span className="font-bold">{item.progressPercent ? item.progressPercent.toFixed(1) : 0}%</span>
                      </div>
                      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, item.progressPercent || 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/books/${item.bookId}/read`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Quick Browse */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Danh Mục Sách Chuyên Ngành
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lọc theo các ngành học mũi nhọn tại trường
              </p>
            </div>
            <Link
              to="/books"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/books?categoryId=${cat.categoryId}`}
                className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Sách Mới & Nổi Bật Nhất
              </h2>
              <p className="text-xs text-slate-500">
                Các đầu sách được sinh viên mượn và đánh giá cao nhất
              </p>
            </div>
          </div>
          <Link
            to="/books"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Xem thêm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-slate-200 h-72"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Chưa có sách nào</h3>
            <p className="text-xs text-slate-400 mt-1">Dữ liệu sách đang được thư viện cập nhật.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {books.slice(0, 10).map((book) => (
              <BookCard key={book.bookId} book={book} onNotify={showToast} />
            ))}
          </div>
        )}
      </section>

      {/* Membership Plans Banner */}
      {plans.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-amber-500/10 via-indigo-50 to-sky-50 rounded-3xl border border-amber-200/60 p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full">
                Quyền lợi độc quyền
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                Nâng Tầm Trải Nghiệm Cùng Gói Hội Viên ULMS
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Đăng ký gói hội viên để đọc không giới hạn E-Book bản quyền, giảm đến 100% tiền đặt cọc mượn sách vật lý và ưu tiên xử lý phiếu mượn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.planId}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between hover:shadow-xl hover:border-amber-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {plan.durationDays} ngày
                      </span>
                    </div>

                    <p className="text-2xl font-extrabold text-indigo-700 mt-3">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                    </p>

                    {plan.description && (
                      <p className="mt-3 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 leading-relaxed font-medium">
                        {plan.description}
                      </p>
                    )}

                    <ul className="mt-4 space-y-2 text-xs text-slate-600">
                      {plan.depositDiscountPct > 0 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Giảm tiền đặt cọc: <b>{plan.depositDiscountPct}%</b></span>
                        </li>
                      )}
                      {plan.freeDepositPriceLimit && Number(plan.freeDepositPriceLimit) > 0 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>
                            Miễn cọc sách dưới:{' '}
                            <b>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(plan.freeDepositPriceLimit)}
                            </b>
                          </span>
                        </li>
                      )}
                      {plan.maxDepositAmount && Number(plan.maxDepositAmount) > 0 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>
                            Tiền cọc tối đa:{' '}
                            <b>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(plan.maxDepositAmount)}
                            </b>
                          </span>
                        </li>
                      )}
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Đọc toàn bộ kho E-Book online không giới hạn</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Ưu tiên giữ sách & duyệt phiếu mượn tại quầy</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    to="/plans"
                    className="mt-6 w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-slate-900 hover:bg-indigo-600 text-white transition-colors"
                  >
                    Xem chi tiết & Đăng ký
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
