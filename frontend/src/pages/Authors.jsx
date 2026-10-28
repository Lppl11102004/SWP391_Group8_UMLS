import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BookOpen, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { authorApi } from '../api/authors';
import BookCard from '../components/BookCard';

export const Authors = () => {
  const { id } = useParams();

  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // If ID param exists, load author detail
  useEffect(() => {
    if (id) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await authorApi.getAuthorDetail(id);
          setSelectedAuthor(res.data?.data);
        } catch (err) {
          console.error('Error fetching author detail:', err);
          setSelectedAuthor(null);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedAuthor(null);
      // Fetch authors list
      const fetchList = async () => {
        setLoading(true);
        try {
          const res = await authorApi.getAuthors(page, 12);
          const list = res.data?.data || [];
          setAuthors(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error('Error fetching authors:', err);
          setAuthors([]);
        } finally {
          setLoading(false);
        }
      };
      fetchList();
    }
  }, [id, page]);

  // View Author Detail
  if (id) {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      );
    }

    if (!selectedAuthor) {
      return (
        <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy thông tin tác giả</h2>
          <Link
            to="/authors"
            className="mt-4 inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách tác giả</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <Link
          to="/authors"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách tác giả</span>
        </Link>

        {/* Author Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
            {(selectedAuthor.authorAvatarUrl || selectedAuthor.avatarUrl) ? (
              <img
                src={selectedAuthor.authorAvatarUrl || selectedAuthor.avatarUrl}
                alt={selectedAuthor.name}
                className="w-full h-full rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-full h-full rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-3xl shadow-sm ${
                (selectedAuthor.authorAvatarUrl || selectedAuthor.avatarUrl) ? 'hidden' : ''
              }`}
            >
              {selectedAuthor.name ? selectedAuthor.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{selectedAuthor.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {selectedAuthor.bio || 'Thông tin tiểu sử của tác giả đang được cập nhật thêm.'}
            </p>
          </div>
        </div>

        {/* Author's Books */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Các Tác Phẩm Của {selectedAuthor.name} ({selectedAuthor.listRelateBook?.length || 0})
            </h2>
          </div>

          {!selectedAuthor.listRelateBook || selectedAuthor.listRelateBook.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Hiện tại chưa có sách nào của tác giả này trong cơ sở dữ liệu.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {selectedAuthor.listRelateBook.map((b) => (
                <BookCard key={b.bookId} book={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View Authors Directory List
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Danh Sách Tác Giả & Học Giả
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Các tác giả có giáo trình, tài liệu chuyên ngành tại Thư viện Đại học ULMS
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-slate-200 h-48"></div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Chưa có dữ liệu tác giả</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {authors.map((author) => {
            const avatar = (author.authorAvatarUrl || author.avatarUrl || '').trim();
            return (
              <Link
                key={author.authorId}
                to={`/authors/${author.authorId}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 text-center flex flex-col items-center hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="relative w-20 h-20 flex-shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={author.name}
                      className="w-full h-full rounded-full object-cover ring-2 ring-indigo-50 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 group-hover:from-indigo-600 group-hover:to-indigo-700 text-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-xl transition-all ${
                      avatar ? 'hidden' : ''
                    }`}
                  >
                    {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
                <h3 className="mt-3 text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {author.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                  {author.bio || 'Tác giả sách'}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-700 px-3">Trang {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={authors.length < 12}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Authors;
