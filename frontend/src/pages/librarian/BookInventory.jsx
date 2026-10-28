import React, { useState, useEffect } from 'react';
import {
  Library,
  Search,
  Plus,
  Edit,
  Eye,
  Barcode,
  BookOpen,
  FileUp,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Smartphone,
  UploadCloud,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { librarianApi } from '../../api/librarian';
import { bookApi } from '../../api/books';
import { uploadApi } from '../../api/upload';
import { formatVND } from '../../utils/format';

export const BookInventory = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Upload States
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingExtraImages, setUploadingExtraImages] = useState(false);

  // Book Create / Edit Modal
  const [bookModalMode, setBookModalMode] = useState(null); // 'create' | 'edit' | null
  const [activeBookId, setActiveBookId] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    isbn: '',
    authorId: '',
    publisherId: '',
    categoryId: '',
    publishedYear: new Date().getFullYear(),
    description: '',
    coverImageUrl: '',
    imageUrls: [],
    initialCopies: 0,
    price: '',
    status: true,
  });

  // Copies Modal
  const [copiesBook, setCopiesBook] = useState(null); // book object
  const [copiesList, setCopiesList] = useState([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [copyMode, setCopyMode] = useState('single'); // 'single' | 'bulk'
  const [newBarcode, setNewBarcode] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState(5);

  // E-Book Modal
  const [ebookModalBook, setEbookModalBook] = useState(null); // book object
  const [ebookForm, setEbookForm] = useState({
    fileUrl: '',
    totalPages: '',
    fileSizeKb: '',
  });

  // Fetch categories, authors, publishers for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, authRes, pubRes] = await Promise.allSettled([
          bookApi.getCategories(),
          librarianApi.getAuthors(0, 100),
          librarianApi.getPublishers(),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data || catRes.value.data || []);
        if (authRes.status === 'fulfilled') setAuthors(authRes.value.data?.data?.content || authRes.value.data?.data || []);
        if (pubRes.status === 'fulfilled') setPublishers(pubRes.value.data?.data || []);
      } catch (err) {
        console.error('Error fetching metadata dropdowns:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await librarianApi.getBooks(params);
      const pageData = res.data?.data;
      if (pageData) {
        setBooks(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setBooks([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching librarian books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  // Open Create Book
  const handleOpenCreateBook = () => {
    setBookModalMode('create');
    setActiveBookId(null);
    setBookForm({
      title: '',
      isbn: '',
      authorId: authors[0]?.authorId || '1',
      publisherId: publishers[0]?.publisherId || '1',
      categoryId: categories[0]?.categoryId || '1',
      publishedYear: new Date().getFullYear(),
      description: '',
      coverImageUrl: '',
      imageUrls: [],
      initialCopies: 0,
      price: '',
      status: true,
    });
  };

  // Open Edit Book
  const handleOpenEditBook = async (bookId) => {
    setActionLoading(true);
    try {
      const res = await librarianApi.getBookDetail(bookId);
      const b = res.data?.data;
      if (b) {
        setBookModalMode('edit');
        setActiveBookId(bookId);
        const loadedImages = b.imageUrls || b.images?.map(img => img.imageUrl || img) || [];
        setBookForm({
          title: b.title || '',
          isbn: b.isbn || '',
          authorId: b.authorId || authors[0]?.authorId || '1',
          publisherId: b.publisherId || publishers[0]?.publisherId || '1',
          categoryId: b.categoryId || categories[0]?.categoryId || '1',
          publishedYear: b.publishedYear || new Date().getFullYear(),
          description: b.description || '',
          coverImageUrl: b.coverImageUrl || '',
          imageUrls: Array.isArray(loadedImages) ? loadedImages : [],
          initialCopies: 0,
          price: b.price || '',
          status: b.status !== false,
        });
      }
    } catch (err) {
      console.error('Error fetching book detail:', err);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết sách' });
    } finally {
      setActionLoading(false);
    }
  };

  // Direct image upload to Cloudinary (Cover)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setBookForm((prev) => ({ ...prev, coverImageUrl: url }));
      setMessage({ type: 'success', text: 'Đã upload ảnh bìa trực tiếp lên Cloudinary!' });
    } catch (err) {
      console.error('Upload image error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload ảnh bìa thất bại.' });
    } finally {
      setUploadingCover(false);
    }
  };

  // Multi-image upload to Cloudinary (Book Images)
  const handleExtraImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingExtraImages(true);
    try {
      const uploadPromises = files.map((file) => uploadApi.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      setBookForm((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
      setMessage({ type: 'success', text: `Đã upload thành công ${urls.length} ảnh sách lên Cloudinary!` });
    } catch (err) {
      console.error('Error uploading extra images:', err);
      setMessage({ type: 'error', text: 'Upload một số ảnh thất bại, vui lòng thử lại.' });
    } finally {
      setUploadingExtraImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveExtraImage = (indexToRemove) => {
    setBookForm((prev) => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Direct PDF upload to Cloudinary
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const url = await uploadApi.uploadPdf(file);
      const sizeKb = Math.round(file.size / 1024);
      setEbookForm((prev) => ({
        ...prev,
        fileUrl: url,
        fileSizeKb: sizeKb,
      }));
      setMessage({ type: 'success', text: 'Đã upload file PDF E-Book trực tiếp lên Cloudinary!' });
    } catch (err) {
      console.error('Upload PDF error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload PDF thất bại.' });
    } finally {
      setUploadingPdf(false);
    }
  };

  // Submit Book (Create or Edit)
  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        title: bookForm.title.trim(),
        authorId: Number(bookForm.authorId) || 1,
        publisherId: Number(bookForm.publisherId) || 1,
        categoryId: Number(bookForm.categoryId) || 1,
        publishedYear: Number(bookForm.publishedYear),
        description: bookForm.description.trim(),
        coverImageUrl: bookForm.coverImageUrl.trim(),
        price: Number(bookForm.price),
        status: Boolean(bookForm.status),
        imageUrls: bookForm.imageUrls || [],
      };

      if (bookModalMode === 'create') {
        payload.isbn = bookForm.isbn.trim();
        if (Number(bookForm.initialCopies) > 0) {
          payload.initialCopies = Number(bookForm.initialCopies);
        }
        await librarianApi.createBook(payload);
        setMessage({ type: 'success', text: 'Thêm đầu sách mới thành công!' });
      } else {
        await librarianApi.updateBook(activeBookId, payload);
        setMessage({ type: 'success', text: 'Cập nhật thông tin sách thành công!' });
      }

      setBookModalMode(null);
      await fetchBooks();
    } catch (err) {
      console.error('Submit book error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lưu thông tin sách thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Copies Management
  const handleOpenCopies = async (book) => {
    setCopiesBook(book);
    setNewBarcode('');
    setLoadingCopies(true);
    try {
      const res = await librarianApi.getBookCopies(book.bookId);
      setCopiesList(res.data?.data || []);
    } catch (err) {
      console.error('Error loading copies:', err);
      setMessage({ type: 'error', text: 'Không thể tải danh sách bản sao' });
    } finally {
      setLoadingCopies(false);
    }
  };

  // Add Copy
  const handleAddCopy = async (e) => {
    e.preventDefault();
    if (!copiesBook) return;
    setActionLoading(true);
    try {
      const data = newBarcode.trim() ? { barcode: newBarcode.trim() } : {};
      await librarianApi.createBookCopy(copiesBook.bookId, data);
      setNewBarcode('');
      // Reload copies
      const res = await librarianApi.getBookCopies(copiesBook.bookId);
      setCopiesList(res.data?.data || []);
      setMessage({ type: 'success', text: 'Thêm bản sao sách thành công!' });
      fetchBooks(); // refresh counts
    } catch (err) {
      console.error('Add copy error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thêm bản sao thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Bulk Copies
  const handleBulkAddCopies = async (e) => {
    e.preventDefault();
    if (!copiesBook) return;
    const qty = Number(bulkQuantity);
    if (!qty || qty < 1) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số lượng bản sao hợp lệ (>= 1)' });
      return;
    }
    setActionLoading(true);
    try {
      await librarianApi.createBookCopy(copiesBook.bookId, { quantity: qty });
      // Reload copies
      const res = await librarianApi.getBookCopies(copiesBook.bookId);
      setCopiesList(res.data?.data || []);
      setMessage({ type: 'success', text: `Tạo hàng loạt ${qty} bản sao sách thành công!` });
      fetchBooks();
    } catch (err) {
      console.error('Bulk add copies error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Thêm hàng loạt bản sao thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Copy Status
  const handleUpdateCopyStatus = async (copyId, newStatus) => {
    setActionLoading(true);
    try {
      await librarianApi.updateCopyStatus(copyId, { status: Number(newStatus) });
      // Reload copies
      const res = await librarianApi.getBookCopies(copiesBook.bookId);
      setCopiesList(res.data?.data || []);
      fetchBooks();
    } catch (err) {
      console.error('Update copy status error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật trạng thái bản sao thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open E-Book Modal
  const handleOpenEBookModal = (book) => {
    setEbookModalBook(book);
    setEbookForm({
      fileUrl: '',
      totalPages: '',
      fileSizeKb: '',
    });
  };

  // Submit E-Book
  const handleSubmitEBook = async (e) => {
    e.preventDefault();
    if (!ebookModalBook) return;
    setActionLoading(true);
    try {
      const payload = {
        fileUrl: ebookForm.fileUrl.trim(),
        totalPages: Number(ebookForm.totalPages) || 1,
        fileSizeKb: Number(ebookForm.fileSizeKb) || 1024,
      };
      await librarianApi.manageEBook(ebookModalBook.bookId, payload);
      setMessage({ type: 'success', text: 'Cập nhật tài liệu E-Book PDF thành công!' });
      setEbookModalBook(null);
      await fetchBooks();
    } catch (err) {
      console.error('E-Book error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật E-Book thất bại' });
    } finally {
      setActionLoading(false);
    }
  };

  const renderCopyStatusBadge = (status) => {
    switch (Number(status)) {
      case 1:
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Khả dụng trên kệ</span>;
      case 2:
        return <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Đang giữ / Mượn</span>;
      case 3:
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Hư hại</span>;
      case 4:
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Mất sách</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Library className="w-7 h-7 text-indigo-600" />
            Quản Lý Kho Sách & Bản Sao
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý danh mục đầu sách, in mã vạch bản sao vật lý trên kệ và đính kèm E-Book trực tuyến.
          </p>
        </div>

        <button
          onClick={handleOpenCreateBook}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm đầu sách mới</span>
        </button>
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm tên sách, ISBN, tác giả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải kho sách...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center space-y-3 text-center">
          <Library className="w-12 h-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy sách nào</h3>
          <p className="text-xs text-slate-500">Thử tìm kiếm với từ khoá khác hoặc thêm sách mới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tác phẩm</th>
                    <th className="py-3.5 px-4">ISBN</th>
                    <th className="py-3.5 px-4">Thể loại</th>
                    <th className="py-3.5 px-4 text-right">Giá bìa</th>
                    <th className="py-3.5 px-4 text-center">Bản sao (Kệ / Tổng)</th>
                    <th className="py-3.5 px-4 text-center">E-Book</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {books.map((b) => (
                    <tr key={b.bookId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={b.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                            alt={b.title}
                            className="w-9 h-12 object-cover rounded-lg flex-shrink-0 shadow-xs"
                          />
                          <div className="truncate max-w-[200px]">
                            <h4 className="font-bold text-slate-900 truncate" title={b.title}>
                              {b.title}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              {(b.authorAvatarUrl || b.avatarUrl) ? (
                                <img
                                  src={b.authorAvatarUrl || b.avatarUrl}
                                  alt=""
                                  className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200 inline-block flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className="truncate">{b.authorName} ({b.publishedYear})</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{b.isbn || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{b.categoryName}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatVND(b.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          {b.availableCopies || 0}
                        </span>
                        <span className="text-slate-400 text-xs"> / {b.totalCopies || 0}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {b.hasEBook ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Có PDF
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCopies(b)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Quản lý bản sao vật lý & Mã vạch"
                          >
                            <Barcode className="w-3.5 h-3.5" /> Bản sao
                          </button>

                          <button
                            onClick={() => handleOpenEBookModal(b)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Upload / Cập nhật E-Book"
                          >
                            <Smartphone className="w-3.5 h-3.5" /> E-Book
                          </button>

                          <button
                            onClick={() => handleOpenEditBook(b.bookId)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* CREATE / EDIT BOOK MODAL */}
      {bookModalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitBook}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Library className="w-5 h-5 text-indigo-600" />
                {bookModalMode === 'create' ? 'Thêm Đầu Sách Mới' : 'Cập Nhật Thông Tin Sách'}
              </h3>
              <button
                type="button"
                onClick={() => setBookModalMode(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tên sách *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sách..."
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã ISBN *</label>
                  <input
                    type="text"
                    required
                    disabled={bookModalMode === 'edit'}
                    placeholder="VD: 978-0132350884"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className={`w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      bookModalMode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Giá bìa (đ) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="VD: 150000"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Thể loại sách</label>
                  <select
                    value={bookForm.categoryId}
                    onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Năm xuất bản</label>
                  <input
                    type="number"
                    value={bookForm.publishedYear}
                    onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tác giả *</label>
                  <select
                    required
                    value={bookForm.authorId}
                    onChange={(e) => setBookForm({ ...bookForm, authorId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {authors.length === 0 && <option value="1">Tác giả mặc định</option>}
                    {authors.map((a) => (
                      <option key={a.authorId} value={a.authorId}>
                        {a.name || a.authorName || `Tác giả #${a.authorId}`}
                      </option>
                    ))}
                  </select>

                  {/* Selected Author Preview */}
                  {(() => {
                    const selAuth = authors.find((a) => String(a.authorId) === String(bookForm.authorId));
                    if (!selAuth) return null;
                    const authAvatar = (selAuth.avatarUrl || selAuth.authorAvatarUrl || '').trim();
                    return (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100">
                        <div className="relative w-7 h-7 flex-shrink-0">
                          {authAvatar ? (
                            <img
                              src={authAvatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover ring-1 ring-indigo-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full rounded-full bg-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center ${
                              authAvatar ? 'hidden' : ''
                            }`}
                          >
                            {selAuth.name ? selAuth.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                        </div>
                        <div className="truncate text-[11px] leading-tight">
                          <span className="font-semibold text-slate-800 block truncate">{selAuth.name}</span>
                          <span className="text-slate-400 text-[10px] block truncate">
                            {selAuth.bio ? selAuth.bio.slice(0, 35) + '...' : 'Tác giả sách'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nhà xuất bản *</label>
                  <select
                    required
                    value={bookForm.publisherId}
                    onChange={(e) => setBookForm({ ...bookForm, publisherId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {publishers.length === 0 && <option value="1">Nhà xuất bản mặc định</option>}
                    {publishers.map((p) => (
                      <option key={p.publisherId} value={p.publisherId}>
                        {p.name || p.publisherName || `Nhà xuất bản #${p.publisherId}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ảnh bìa chính (Upload Cloudinary)</label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-indigo-200 transition-all flex-shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingCover ? 'Đang tải lên...' : 'Chọn ảnh bìa từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCover}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="URL ảnh bìa Cloudinary..."
                    value={bookForm.coverImageUrl}
                    onChange={(e) => setBookForm({ ...bookForm, coverImageUrl: e.target.value })}
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {bookForm.coverImageUrl && (
                    <img
                      src={bookForm.coverImageUrl}
                      alt="Preview"
                      className="w-10 h-12 object-cover rounded-lg border border-slate-200 shadow-sm flex-shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Danh sách hình ảnh phụ của sách (book_images) */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Thư viện hình ảnh phụ của sách (Lưu vào book_images)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Chọn tải lên nhiều ảnh minh họa, trang mẫu, mục lục từ máy tính
                    </p>
                  </div>
                  <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 border border-indigo-200 shadow-sm transition-all">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploadingExtraImages ? 'Đang upload...' : '+ Chọn nhiều ảnh'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingExtraImages}
                      onChange={handleExtraImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {bookForm.imageUrls && bookForm.imageUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {bookForm.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                        <img src={url} alt={`Ảnh phụ ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa có hình ảnh phụ nào được thêm.</p>
                )}
              </div>

              {/* Khởi tạo sẵn bản sao vật lý (book_copies) nếu là tạo mới */}
              {bookModalMode === 'create' && (
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Số lượng bản sao vật lý khởi tạo ban đầu (Lưu vào book_copies)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bookForm.initialCopies}
                      onChange={(e) => setBookForm({ ...bookForm, initialCopies: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-20 text-xs p-1.5 bg-white border border-indigo-200 rounded-lg text-center font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Nếu nhập số lượng &gt; 0, hệ thống sẽ tự động sinh các mã vạch (Barcode) duy nhất và lưu vào bảng <code>book_copies</code> với trạng thái sẵn sàng phục vụ mượn sách.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả / Tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  placeholder="Giới thiệu nội dung cuốn sách..."
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setBookModalMode(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang lưu...' : 'Lưu Sách'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COPIES MODAL */}
      {copiesBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-indigo-600" />
                  Bản Sao Vật Lý: {copiesBook.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý từng mã vạch bản sao in dán trên gáy sách
                </p>
              </div>
              <button
                onClick={() => setCopiesBook(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode switch */}
            <div className="flex border-b border-slate-100 pb-2 gap-4 text-xs">
              <button
                type="button"
                onClick={() => setCopyMode('single')}
                className={`font-bold pb-1 cursor-pointer transition-colors ${
                  copyMode === 'single'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                + Thêm Lẻ 1 Bản Sao
              </button>
              <button
                type="button"
                onClick={() => setCopyMode('bulk')}
                className={`font-bold pb-1 cursor-pointer transition-colors flex items-center gap-1 ${
                  copyMode === 'bulk'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Thêm Hàng Loạt Bản Sao
              </button>
            </div>

            {/* Form Add Copy Single or Bulk */}
            {copyMode === 'single' ? (
              <form onSubmit={handleAddCopy} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã vạch (để trống hệ thống tự sinh mã)..."
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm bản sao
                </button>
              </form>
            ) : (
              <form onSubmit={handleBulkAddCopies} className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Số lượng bản sao:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="VD: 5"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  className="w-24 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 text-center"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Tạo Hàng Loạt
                </button>
              </form>
            )}

            {/* Copies list */}
            {loadingCopies ? (
              <div className="py-8 text-center text-xs text-slate-500">Đang tải bản sao...</div>
            ) : copiesList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Chưa có bản sao nào trong kho.</div>
            ) : (
              <div className="space-y-2">
                {copiesList.map((copy) => (
                  <div
                    key={copy.copyId}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">{copy.barcode}</span>
                      <span className="text-[10px] text-slate-400">ID: #{copy.copyId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={copy.status}
                        onChange={(e) => handleUpdateCopyStatus(copy.copyId, e.target.value)}
                        className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="1">1: Khả dụng (Trên kệ)</option>
                        <option value="2">2: Đang mượn / Giữ chỗ</option>
                        <option value="3">3: Hư hỏng / Rách</option>
                        <option value="4">4: Mất sách</option>
                      </select>
                      <div>{renderCopyStatusBadge(copy.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCopiesBook(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-BOOK MODAL */}
      {ebookModalBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitEBook}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                Upload / Cập Nhật E-Book PDF
              </h3>
              <button
                type="button"
                onClick={() => setEbookModalBook(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sách: <b className="text-slate-800">{ebookModalBook.title}</b>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tài liệu E-Book PDF (Tải trực tiếp lên Cloudinary) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-indigo-200 transition-all">
                      <UploadCloud className="w-4 h-4" />
                      <span>{uploadingPdf ? 'Đang tải PDF lên...' : 'Chọn file PDF từ máy tính'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingPdf}
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    {ebookForm.fileUrl && (
                      <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Đã sẵn sàng
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="URL file PDF Cloudinary..."
                    value={ebookForm.fileUrl}
                    onChange={(e) => setEbookForm({ ...ebookForm, fileUrl: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tổng số trang *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="VD: 320"
                    value={ebookForm.totalPages}
                    onChange={(e) => setEbookForm({ ...ebookForm, totalPages: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dung lượng (KB)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 15360"
                    value={ebookForm.fileSizeKb}
                    onChange={(e) => setEbookForm({ ...ebookForm, fileSizeKb: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setEbookModalBook(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Đang lưu...' : 'Lưu E-Book'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookInventory;
