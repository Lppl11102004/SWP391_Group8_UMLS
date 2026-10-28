import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Bookmark, 
  CheckCircle, 
  AlertCircle,
  Crown
} from 'lucide-react';
import { ebookApi } from '../api/ebook';
import { bookApi } from '../api/books';

export const EBookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookInfo, setBookInfo] = useState(null);
  const [ebookDetails, setEbookDetails] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [membershipRequired, setMembershipRequired] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const readerContainerRef = useRef(null);

  useEffect(() => {
    let blobUrl = null;

    const loadEbook = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get book info & metadata
        const [bookRes, infoRes, progressRes] = await Promise.allSettled([
          bookApi.getBookDetail(id),
          ebookApi.getInfo(id),
          ebookApi.getProgress(id),
        ]);

        if (bookRes.status === 'fulfilled') {
          setBookInfo(bookRes.value.data?.data);
        }

        if (infoRes.status === 'fulfilled') {
          const info = infoRes.value.data?.data;
          setEbookDetails(info);
          if (info?.totalPages) setTotalPages(info.totalPages);
          if (info?.lastPageRead) setCurrentPage(info.lastPageRead);
        } else {
          // If error 400 or 403 on info, membership is expired/required
          const errStatus = infoRes.reason?.response?.status;
          if (errStatus === 400 || errStatus === 403) {
            setMembershipRequired(true);
            setLoading(false);
            return;
          }
        }

        if (progressRes.status === 'fulfilled') {
          const prog = progressRes.value.data?.data;
          if (prog?.progressPercent !== undefined) {
            setProgressPercent(prog.progressPercent);
          }
        }

        // 2. Stream binary PDF content
        const pdfBlobRes = await ebookApi.readContent(id);
        const blob = new Blob([pdfBlobRes.data], { type: 'application/pdf' });
        blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);

      } catch (err) {
        console.error('Error loading ebook:', err);
        const errStatus = err.response?.status;
        if (errStatus === 400 || errStatus === 403) {
          setMembershipRequired(true);
        } else {
          setError(err.response?.data?.message || 'Không thể tải nội dung E-Book');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEbook();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [id]);

  // Sync progress update to backend
  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const newPercent = Math.round((newPage / totalPages) * 100);
    setProgressPercent(newPercent);

    try {
      setSavingProgress(true);
      await ebookApi.updateProgress(id, newPage);
    } catch (err) {
      console.warn('Failed to update progress to backend:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-600">Đang chuẩn bị luồng sách E-Book an toàn...</p>
      </div>
    );
  }

  // Membership required alert
  if (membershipRequired) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Crown className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Yêu Cầu Gói Hội Viên Đang Hoạt Động</h2>
          <p className="text-sm text-slate-600">
            Tính năng đọc E-Book trực tuyến chỉ dành riêng cho độc giả sở hữu gói hội viên còn hạn. Hãy kích hoạt hoặc gia hạn gói hội viên ngay để bắt đầu đọc sách!
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/plans"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Nâng cấp / Mua Gói Hội Viên
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            Quay lại trang sách
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-lg text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Không thể tải sách</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div
      ref={readerContainerRef}
      className={`flex flex-col bg-slate-900 text-white ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Top Bar Reader Controls */}
      <div className="h-14 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/books/${id}`)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Quay lại chi tiết sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-md">
              {bookInfo?.title || 'Đang đọc E-Book'}
            </h1>
            <p className="text-[10px] text-slate-400">
              {bookInfo?.authorName || 'ULMS E-Book Reader'}
            </p>
          </div>
        </div>

        {/* Page progress & controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Tiến độ:</span>
            <span className="font-bold text-sky-400">{progressPercent}%</span>
            {savingProgress && (
              <span className="text-[10px] text-slate-500 animate-pulse">(Lưu...)</span>
            )}
          </div>

          {/* Slider / Quick jump */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400">Trang:</span>
            <input
              type="range"
              min="1"
              max={Math.max(totalPages, 1)}
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-medium px-1">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PDF Viewer Body */}
      <div 
        className="flex-1 bg-slate-900 relative overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {pdfUrl ? (
          <iframe
            key={`page-${currentPage}`}
            src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&statusbar=0&messages=0`}
            title="E-Book Reader"
            className="w-full h-full border-0 pointer-events-auto"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <BookOpen className="w-12 h-12 stroke-1 mb-2" />
            <span className="text-xs">Không có luồng tài liệu PDF</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EBookReader;
