import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  CheckCircle2,
  Users,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { aiApi } from '../api/ai';

export const AiBookSummaryModal = ({ isOpen, onClose, bookId, bookTitle, onOpenChat }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopySummary = () => {
    if (!data) return;
    const textToCopy = `TÓM TẮT SÁCH: ${data.title || bookTitle}\nTác giả: ${data.authorName}\n\n1. NỘI DUNG CHÍNH:\n${data.summary}\n\n2. ĐIỂM NỔI BẬT:\n${(data.keyPoints || []).map((p) => `• ${p}`).join('\n')}\n\n3. PHÙ HỢP VỚI:\n${data.targetAudience}\n\n4. LỜI KHUYÊN:\n${data.recommendation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Đã sao chép tóm tắt sách thành công!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isOpen || !bookId) return;

    let isMounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.getBookSummary(bookId);
        if (isMounted) {
          setData(res.data?.data);
        }
      } catch (err) {
        console.error('Failed to get book summary:', err);
        const errMsg = err.response?.data?.message || 'Không thể tải tóm tắt từ AI. Bạn vui lòng thử lại sau.';
        if (isMounted) {
          setError(errMsg);
          showToast(errMsg, 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Tóm tắt & Phân tích bằng AI
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-purple-100 line-clamp-1">
                {bookTitle ? `Cuốn sách: ${bookTitle}` : 'Đang phân tích sách...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Toast inside modal */}
        {toast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
            <div
              className={`px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 text-xs font-semibold ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-rose-600 text-white shadow-rose-200'
                  : 'bg-indigo-600 text-white shadow-indigo-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="py-14 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <Sparkles className="w-7 h-7 text-purple-600 absolute animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Thủ thư AI đang đọc và phân tích sách...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Trích xuất thông điệp cốt lõi, bài học và đối tượng phù hợp dựa trên nội dung tác phẩm.
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  aiApi.getBookSummary(bookId)
                    .then((res) => setData(res.data?.data))
                    .catch((err) => setError(err.response?.data?.message || 'Thử lại thất bại.'))
                    .finally(() => setLoading(false));
                }}
                className="text-xs px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 font-semibold rounded-xl transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-4">
              {/* Tóm tắt tổng quan */}
              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm mb-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Nội dung & Thông điệp cốt lõi</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {data.summary}
                </p>
              </div>

              {/* Điểm nổi bật & Bài học */}
              {data.keyPoints && data.keyPoints.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bài học & Điểm nhấn chính</span>
                  </div>
                  <ul className="space-y-2">
                    {data.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grid 2 cột: Đối tượng & Lời khuyên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Đối tượng */}
                <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl">
                  <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs sm:text-sm mb-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Phù hợp với ai?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {data.targetAudience}
                  </p>
                </div>

                {/* Đánh giá / Khuyên đọc */}
                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs sm:text-sm mb-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Tại sao nên mượn đọc?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {data.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 italic hidden sm:block">
            * Nhận định được tạo tự động bởi mô hình AI dựa trên siêu dữ liệu sách
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!loading && !error && data && (
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 border border-purple-200 transition cursor-pointer"
                title="Sao chép toàn bộ tóm tắt"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-purple-600" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            )}
            {onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(bookId, bookTitle);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hỏi thêm về sách này</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiBookSummaryModal;
