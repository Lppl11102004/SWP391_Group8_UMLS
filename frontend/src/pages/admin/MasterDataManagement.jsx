import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Database,
  Plus,
  Edit3,
  Trash2,
  Search,
  RotateCcw,
  BookOpen,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import adminApi from '../../api/admin';
import uploadApi from '../../api/upload';

export const MasterDataManagement = () => {
  const { showToast } = useOutletContext() || {};

  // Active Tab: 'categories' | 'authors' | 'publishers'
  const [activeTab, setActiveTab] = useState('categories');

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catModal, setCatModal] = useState({ open: false, editing: null });
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  // Authors State
  const [authors, setAuthors] = useState([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorKeyword, setAuthorKeyword] = useState('');
  const [authorPage, setAuthorPage] = useState(0);
  const [authorTotalPages, setAuthorTotalPages] = useState(1);
  const [authorModal, setAuthorModal] = useState({ open: false, editing: null });
  const [authorForm, setAuthorForm] = useState({ name: '', bio: '', avatarUrl: '' });
  const [uploadingAuthorAvatar, setUploadingAuthorAvatar] = useState(false);

  // Publishers State
  const [publishers, setPublishers] = useState([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [pubKeyword, setPubKeyword] = useState('');
  const [pubPage, setPubPage] = useState(0);
  const [pubTotalPages, setPubTotalPages] = useState(1);
  const [pubModal, setPubModal] = useState({ open: false, editing: null });
  const [pubForm, setPubForm] = useState({ name: '', address: '' });

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null, // 'category' | 'author' | 'publisher'
    id: null,
    name: '',
  });
  const [deleting, setDeleting] = useState(false);

  // ===================== CATEGORIES =====================
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await adminApi.getAllCategories();
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      if (showToast) showToast('Không thể tải danh sách thể loại', 'error');
    } finally {
      setCatLoading(false);
    }
  };

  const handleOpenCatModal = (cat = null) => {
    setCatModal({ open: true, editing: cat });
    setCatForm({
      name: cat?.name || '',
      description: cat?.description || '',
    });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (catModal.editing) {
        const res = await adminApi.updateCategory(catModal.editing.categoryId, catForm);
        if (showToast) showToast(res.data?.message || 'Cập nhật thể loại thành công!', 'success');
      } else {
        const res = await adminApi.createCategory(catForm);
        if (showToast) showToast(res.data?.message || 'Tạo thể loại mới thành công!', 'success');
      }
      setCatModal({ open: false, editing: null });
      fetchCategories();
    } catch (err) {
      console.error('Save category error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Lỗi lưu thể loại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ===================== AUTHORS =====================
  const fetchAuthors = async (pageIdx = authorPage) => {
    setAuthorLoading(true);
    try {
      const res = await adminApi.searchAuthors({
        keyword: authorKeyword.trim() || undefined,
        page: pageIdx,
        size: 10,
      });
      if (res.data?.success) {
        const d = res.data.data;
        setAuthors(d.content || []);
        setAuthorTotalPages(d.totalPages || 1);
        setAuthorPage(d.page || 0);
      }
    } catch (err) {
      console.error('Error fetching authors:', err);
      if (showToast) showToast('Không thể tải danh sách tác giả', 'error');
    } finally {
      setAuthorLoading(false);
    }
  };

  const handleOpenAuthorModal = (auth = null) => {
    setAuthorModal({ open: true, editing: auth });
    setAuthorForm({
      name: auth?.name || '',
      bio: auth?.bio || '',
      avatarUrl: auth?.avatarUrl || auth?.authorAvatarUrl || '',
    });
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authorModal.editing) {
        const res = await adminApi.updateAuthor(authorModal.editing.authorId, authorForm);
        if (showToast) showToast(res.data?.message || 'Cập nhật tác giả thành công!', 'success');
      } else {
        const res = await adminApi.createAuthor(authorForm);
        if (showToast) showToast(res.data?.message || 'Thêm tác giả mới thành công!', 'success');
      }
      setAuthorModal({ open: false, editing: null });
      fetchAuthors(authorPage);
    } catch (err) {
      console.error('Save author error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Lỗi lưu tác giả', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAuthorAvatar(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setAuthorForm((prev) => ({ ...prev, avatarUrl: url }));
      if (showToast) showToast('Upload ảnh tác giả lên Cloudinary thành công!', 'success');
    } catch (err) {
      console.error('Upload author avatar error:', err);
      if (showToast) showToast('Upload ảnh tác giả thất bại', 'error');
    } finally {
      setUploadingAuthorAvatar(false);
    }
  };

  // ===================== PUBLISHERS =====================
  const fetchPublishers = async (pageIdx = pubPage) => {
    setPubLoading(true);
    try {
      const res = await adminApi.searchPublishers({
        keyword: pubKeyword.trim() || undefined,
        page: pageIdx,
        size: 10,
      });
      if (res.data?.success) {
        const d = res.data.data;
        setPublishers(d.content || []);
        setPubTotalPages(d.totalPages || 1);
        setPubPage(d.page || 0);
      }
    } catch (err) {
      console.error('Error fetching publishers:', err);
      if (showToast) showToast('Không thể tải danh sách nhà xuất bản', 'error');
    } finally {
      setPubLoading(false);
    }
  };

  const handleOpenPubModal = (pub = null) => {
    setPubModal({ open: true, editing: pub });
    setPubForm({
      name: pub?.name || '',
      address: pub?.address || '',
    });
  };

  const handleSavePublisher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (pubModal.editing) {
        const res = await adminApi.updatePublisher(pubModal.editing.publisherId, pubForm);
        if (showToast) showToast(res.data?.message || 'Cập nhật nhà xuất bản thành công!', 'success');
      } else {
        const res = await adminApi.createPublisher(pubForm);
        if (showToast) showToast(res.data?.message || 'Thêm nhà xuất bản mới thành công!', 'success');
      }
      setPubModal({ open: false, editing: null });
      fetchPublishers(pubPage);
    } catch (err) {
      console.error('Save publisher error:', err);
      if (showToast) showToast(err.response?.data?.message || 'Lỗi lưu nhà xuất bản', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ===================== DELETE HANDLER =====================
  const handleExecuteDelete = async () => {
    setDeleting(true);
    try {
      if (deleteConfirm.type === 'category') {
        await adminApi.deleteCategory(deleteConfirm.id);
        if (showToast) showToast('Xóa thể loại thành công!', 'success');
        fetchCategories();
      } else if (deleteConfirm.type === 'author') {
        await adminApi.deleteAuthor(deleteConfirm.id);
        if (showToast) showToast('Xóa tác giả thành công!', 'success');
        fetchAuthors(authorPage);
      } else if (deleteConfirm.type === 'publisher') {
        await adminApi.deletePublisher(deleteConfirm.id);
        if (showToast) showToast('Xóa nhà xuất bản thành công!', 'success');
        fetchPublishers(pubPage);
      }
      setDeleteConfirm({ open: false, type: null, id: null, name: '' });
    } catch (err) {
      console.error('Delete error:', err);
      if (showToast) {
        showToast(
          err.response?.data?.message ||
            'Không thể xóa: Mục này đang có sách liên kết trong kho thư viện!',
          'error'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'authors') fetchAuthors(0);
    else if (activeTab === 'publishers') fetchPublishers(0);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <span>Quản Lý Danh Mục Sách (Master Data)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị dữ liệu nguồn danh mục Thể loại, Tác giả và Nhà xuất bản với kiểm soát toàn vẹn liên kết sách.
          </p>
        </div>

        {/* Dynamic Add Button depending on Tab */}
        <button
          onClick={() => {
            if (activeTab === 'categories') handleOpenCatModal();
            else if (activeTab === 'authors') handleOpenAuthorModal();
            else handleOpenPubModal();
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'categories'
              ? 'Thêm Thể Loại'
              : activeTab === 'authors'
              ? 'Thêm Tác Giả'
              : 'Thêm Nhà Xuất Bản'}
          </span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thể Loại ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'authors'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Tác Giả</span>
        </button>

        <button
          onClick={() => setActiveTab('publishers')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'publishers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Nhà Xuất Bản</span>
        </button>
      </div>

      {/* TAB 1: THỂ LOẠI */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã thể loại</th>
                  <th className="py-3 px-3">Tên thể loại</th>
                  <th className="py-3 px-3">Mô tả</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catLoading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                      Đang tải danh sách thể loại...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      Chưa có thể loại nào
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.categoryId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{c.categoryId}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-md truncate">
                        {c.description || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenCatModal(c)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Chỉnh sửa thể loại"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'category',
                                id: c.categoryId,
                                name: c.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Xóa thể loại"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TÁC GIẢ */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAuthors(0);
            }}
            className="flex gap-2 max-w-md"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm tên tác giả..."
                value={authorKeyword}
                onChange={(e) => setAuthorKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all"
            >
              Tìm
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tác giả</th>
                    <th className="py-3 px-3">Tiểu sử & Sự nghiệp</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorLoading ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400">
                        <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        Đang tải danh sách tác giả...
                      </td>
                    </tr>
                  ) : authors.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400">
                        Không tìm thấy tác giả nào
                      </td>
                    </tr>
                  ) : (
                    authors.map((a) => {
                      const avatar = (a.avatarUrl || a.authorAvatarUrl || '').trim();
                      return (
                      <tr key={a.authorId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-9 h-9 flex-shrink-0">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt=""
                                  className="w-full h-full rounded-2xl object-cover ring-1 ring-slate-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full rounded-2xl bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center ${avatar ? 'hidden' : ''}`}>
                                {a.name?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{a.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: #{a.authorId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-lg truncate">
                          {a.bio || 'Chưa cập nhật thông tin tiểu sử'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenAuthorModal(a)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Sửa thông tin tác giả"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  type: 'author',
                                  id: a.authorId,
                                  name: a.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Xóa tác giả"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Trang {authorPage + 1} / {authorTotalPages}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => fetchAuthors(authorPage - 1)}
                  disabled={authorPage === 0 || authorLoading}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchAuthors(authorPage + 1)}
                  disabled={authorPage >= authorTotalPages - 1 || authorLoading}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHÀ XUẤT BẢN */}
      {activeTab === 'publishers' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPublishers(0);
            }}
            className="flex gap-2 max-w-md"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm tên nhà xuất bản..."
                value={pubKeyword}
                onChange={(e) => setPubKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all"
            >
              Tìm
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã NXB</th>
                    <th className="py-3 px-3">Tên Nhà Xuất Bản</th>
                    <th className="py-3 px-3">Trụ sở / Địa chỉ</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pubLoading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        Đang tải danh sách nhà xuất bản...
                      </td>
                    </tr>
                  ) : publishers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        Không tìm thấy nhà xuất bản nào
                      </td>
                    </tr>
                  ) : (
                    publishers.map((p) => (
                      <tr key={p.publisherId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">
                          #{p.publisherId}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-md truncate">
                          {p.address || '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenPubModal(p)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Sửa thông tin NXB"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  type: 'publisher',
                                  id: p.publisherId,
                                  name: p.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Xóa NXB"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Trang {pubPage + 1} / {pubTotalPages}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => fetchPublishers(pubPage - 1)}
                  disabled={pubPage === 0 || pubLoading}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchPublishers(pubPage + 1)}
                  disabled={pubPage >= pubTotalPages - 1 || pubLoading}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THỂ LOẠI */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                {catModal.editing ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại Mới'}
              </h3>
              <button
                onClick={() => setCatModal({ open: false, editing: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên thể loại *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khoa Học & Trí Tuệ Nhân Tạo"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả thể loại</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả nhóm sách thuộc thể loại này..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModal({ open: false, editing: null })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu thể loại'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TÁC GIẢ */}
      {authorModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                {authorModal.editing ? 'Chỉnh Sửa Tác Giả' : 'Thêm Tác Giả Mới'}
              </h3>
              <button
                onClick={() => setAuthorModal({ open: false, editing: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên tác giả *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Nhật Ánh"
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh đại diện tác giả (Cloudinary)</label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-indigo-200 transition-all flex-shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingAuthorAvatar ? 'Đang tải lên...' : 'Chọn ảnh từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingAuthorAvatar}
                      onChange={handleAuthorAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Hoặc dán URL: https://..."
                    value={authorForm.avatarUrl}
                    onChange={(e) => setAuthorForm({ ...authorForm, avatarUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                  {authorForm.avatarUrl && (
                    <img
                      src={authorForm.avatarUrl}
                      alt="Preview"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiểu sử tác giả</label>
                <textarea
                  rows="3"
                  placeholder="Thông tin giới thiệu về tác giả..."
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthorModal({ open: false, editing: null })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu tác giả'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NHÀ XUẤT BẢN */}
      {pubModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                {pubModal.editing ? 'Chỉnh Sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản Mới'}
              </h3>
              <button
                onClick={() => setPubModal({ open: false, editing: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePublisher} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên nhà xuất bản *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhà Xuất Bản Trẻ"
                  value={pubForm.name}
                  onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 161B Lý Chính Thắng, Quận 3, TP.HCM"
                  value={pubForm.address}
                  onChange={(e) => setPubForm({ ...pubForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPubModal({ open: false, editing: null })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu nhà xuất bản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA (KÈM BẢO VỆ LIÊN KẾT) */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 text-center">
              Xác Nhận Xóa {deleteConfirm.type === 'category' ? 'Thể Loại' : deleteConfirm.type === 'author' ? 'Tác Giả' : 'Nhà Xuất Bản'}?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2">
              Bạn có chắc chắn muốn xóa <b>"{deleteConfirm.name}"</b>?
            </p>
            <div className="mt-3 p-3 bg-amber-50 rounded-2xl text-[11px] text-amber-800 text-center">
              ⚠️ Nếu danh mục này đang có sách liên kết trong kho thư viện, hệ thống sẽ tự động chặn và báo lỗi để bảo vệ tính toàn vẹn dữ liệu.
            </div>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirm({ open: false, type: null, id: null, name: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;
