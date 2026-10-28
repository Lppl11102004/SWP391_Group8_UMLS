import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  X,
  Send,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronDown,
  BookCheck,
  MessageSquare,
  ExternalLink,
  Flame,
  CheckCircle,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { aiApi } from '../api/ai';

export const AiChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState(null); // { id, title }
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initialWelcomeMessage = {
    role: 'model',
    text: `Xin chào bạn! 👋 Mình là **Thủ thư ảo của ULMS**.\n\nMình có thể giúp bạn:\n* 🔍 **Tìm sách phù hợp:** Bạn chỉ cần nói sở thích, tâm trạng hoặc chủ đề bạn cần tìm.\n* 📖 **Tóm tắt nội dung:** Hỏi thông điệp cốt lõi, bài học của bất kỳ cuốn sách nào.\n* 💡 **Tư vấn mượn sách:** Gợi ý các tác phẩm hay nhất hiện có tại thư viện.\n\nHôm nay bạn muốn đọc gì nào?`,
    recommendedBooks: [],
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ulms_ai_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read chat history from sessionStorage', e);
    }
    return [initialWelcomeMessage];
  });

  // Save messages to session
  useEffect(() => {
    try {
      sessionStorage.setItem('ulms_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history', e);
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Listen for global custom event 'openAiChat'
  useEffect(() => {
    const handleOpenAiChat = (e) => {
      const { bookId, bookTitle, initialPrompt } = e.detail || {};
      setIsOpen(true);
      if (bookId && bookTitle) {
        setCurrentBook({ id: bookId, title: bookTitle });
      }
      if (initialPrompt) {
        handleSendMessage(initialPrompt, bookId);
      }
    };

    window.addEventListener('openAiChat', handleOpenAiChat);
    return () => window.removeEventListener('openAiChat', handleOpenAiChat);
  }, []);

  const handleSendMessage = async (textToSend = inputMessage, bookIdContext = currentBook?.id) => {
    const prompt = (textToSend || '').trim();
    if (!prompt || loading) return;

    const userMsg = { role: 'user', text: prompt };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Build lightweight conversation history for past turns (exclude initial greeting and current prompt)
      const historyPayload = messages
        .filter((m, idx) => !(idx === 0 && m.role === 'model'))
        .slice(-6)
        .map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          text: m.text,
        }));

      const res = await aiApi.chat({
        message: prompt,
        currentBookId: bookIdContext || null,
        history: historyPayload,
      });

      const responseData = res.data?.data;
      const modelReply = {
        role: 'model',
        text: responseData?.reply || 'Mình đã ghi nhận câu hỏi, nhưng chưa có phản hồi phù hợp.',
        recommendedBooks: responseData?.recommendedBooks || [],
      };

      setMessages((prev) => [...prev, modelReply]);
    } catch (error) {
      console.error('Chat AI error:', error);
      showToast('Lỗi kết nối tới dịch vụ AI. Bạn vui lòng thử lại!', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Xin lỗi bạn, kết nối tới dịch vụ AI đang bị gián đoạn. Bạn vui lòng thử lại sau giây lát nhé!',
          recommendedBooks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setShowConfirmClear((prev) => !prev);
  };

  const handleConfirmClear = () => {
    setMessages([initialWelcomeMessage]);
    setCurrentBook(null);
    sessionStorage.removeItem('ulms_ai_chat_history');
    setShowConfirmClear(false);
    showToast('Đã làm mới cuộc trò chuyện thành công', 'success');
  };

  const handleCopyText = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast('Đã sao chép phản hồi vào bộ nhớ tạm', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    '💡 Gợi ý sách phát triển bản thân',
    '💻 Sách lập trình hay cho người mới',
    '📖 Tiểu thuyết lôi cuốn nên đọc',
    '✨ Sách nào được mượn nhiều nhất?',
  ];

  // Helper function to format basic markdown-like text
  const renderFormattedText = (text) => {
    if (!text) return '';
    // Format bold **text** and line breaks
    const parts = text.split('\n');
    return parts.map((line, lIdx) => {
      // Handle bullet points
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Bold text replacement
      const segments = cleanLine.split(/(\*\*.*?\*\*)/g);

      const content = segments.map((seg, sIdx) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return (
            <strong key={sIdx} className="font-semibold text-slate-900">
              {seg.slice(2, -2)}
            </strong>
          );
        }
        return seg;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start space-x-2 my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
            <div className="flex-1 leading-relaxed">{content}</div>
          </div>
        );
      }

      return (
        <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'my-1 leading-relaxed'}>
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Mở chatbox AI"
            className="relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-extrabold tracking-wide flex items-center gap-1">
                Hỏi Thủ thư AI
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-[10px] text-purple-100 font-medium">Tư vấn & Tóm tắt sách</div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-white/15 rounded-2xl backdrop-blur-md">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-purple-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                  Thủ thư AI - ULMS
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[11px] text-purple-100 flex items-center gap-1">
                  <span>Trực tuyến</span>
                  <span>•</span>
                  <span>Sẵn sàng tư vấn</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title="Làm mới cuộc trò chuyện"
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Floating Toast Notification */}
          {toast && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[90%] pointer-events-none">
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
                <span className="truncate">{toast.message}</span>
              </div>
            </div>
          )}

          {/* Inline Confirm Clear Banner */}
          {showConfirmClear && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
              <span className="font-medium">Làm mới toàn bộ hội thoại?</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleConfirmClear}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-[11px] border border-slate-200 transition cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Current Book Context Banner (if viewing a specific book) */}
          {currentBook && (
            <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center space-x-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="font-medium text-slate-500">Ngữ cảnh:</span>
                <span className="font-bold truncate text-purple-700">{currentBook.title}</span>
              </div>
              <button
                onClick={() => setCurrentBook(null)}
                className="text-purple-500 hover:text-purple-800 p-0.5 rounded cursor-pointer"
                title="Bỏ ngữ cảnh sách này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div>
                        <div className="text-slate-800 leading-relaxed font-normal">
                          {renderFormattedText(msg.text)}
                        </div>
                        {msg.text && (
                          <div className="flex justify-end pt-1 -mb-1">
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.text, index)}
                              title="Sao chép phản hồi"
                              className="p-1 text-slate-400 hover:text-purple-600 rounded transition cursor-pointer"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommended Books Cards if provided */}
                  {!isUser && msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                    <div className="w-full mt-2 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 px-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sách gợi ý từ thư viện ({msg.recommendedBooks.length}):</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {msg.recommendedBooks.map((book) => (
                          <div
                            key={book.bookId}
                            className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition flex items-center gap-3 group"
                          >
                            <img
                              src={book.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-600 transition">
                                {book.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {book.authorName} • {book.categoryName}
                              </p>
                              {book.shortDescription && (
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {book.shortDescription}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/books/${book.bookId}`);
                                  }}
                                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Xem chi tiết</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  onClick={() =>
                                    handleSendMessage(
                                      `Tóm tắt nội dung cuốn sách "${book.title}" cho tôi`,
                                      book.bookId
                                    )
                                  }
                                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                  <span>Tóm tắt</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs px-2 py-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[11px] font-medium text-purple-600">Thủ thư AI đang tra cứu & suy nghĩ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (visible if conversation is young) */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  currentBook
                    ? `Hỏi AI về cuốn "${currentBook.title}"...`
                    : 'Hỏi về sách, gợi ý theo sở thích...'
                }
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-800 placeholder-slate-400 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition cursor-pointer flex-shrink-0"
                aria-label="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              AI tư vấn trực tiếp từ dữ liệu sách của Thư viện ULMS
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
