import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">ULMS Library</span>
            </Link>
            <p className="text-sm text-slate-400">
              Hệ thống Quản lý Thư viện Đại học thông minh - Kết nối tri thức, nâng tầm trải nghiệm đọc với hàng nghìn đầu sách giấy và E-Book chất lượng cao.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-indigo-400 transition-colors">
                  Tra cứu danh mục sách
                </Link>
              </li>
              <li>
                <Link to="/authors" className="hover:text-indigo-400 transition-colors">
                  Danh sách tác giả
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-indigo-400 transition-colors">
                  Gói hội viên & Đọc E-Book
                </Link>
              </li>
            </ul>
          </div>

          {/* Reader services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Dành cho độc giả</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/cart" className="hover:text-indigo-400 transition-colors">
                  Giỏ mượn sách
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-indigo-400 transition-colors">
                  Phiếu đặt mượn sách
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Hồ sơ cá nhân
                </Link>
              </li>
              <li>
                <Link to="/plans#rules" className="hover:text-indigo-400 transition-colors">
                  Quy định mượn trả & Tiền cọc
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Liên hệ thư viện</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Khuôn viên Đại học, Hải Châu, TP. Đà Nẵng</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span>(0236) 3888 999</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span>library@ulms.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 ULMS - University Library Management System. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1" /> for University Students & Faculty
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
