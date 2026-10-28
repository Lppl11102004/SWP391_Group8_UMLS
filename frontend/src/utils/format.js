/**
 * Định dạng số tiền VND theo chuẩn Việt Nam (làm tròn số nguyên, không có phần thập phân .00)
 * @param {number|string} amount
 * @returns {string} ví dụ: "50.000 ₫" hoặc "0 ₫"
 */
export function formatVND(amount) {
  if (amount === undefined || amount === null || amount === '') return '0 ₫';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0 ₫';
  return Math.round(num).toLocaleString('vi-VN') + ' ₫';
}

/**
 * Định dạng đơn vị cho quy định thư viện / cấu hình hệ thống
 * Thay vì hiển thị kiểu dữ liệu như (INTEGER), hiển thị giá trị kèm đơn vị đo trực quan (VNĐ/ngày, ngày, cuốn, %)
 * @param {string} key Tên key hoặc mô tả quy định
 * @param {string|number} value Giá trị thiết lập
 * @returns {string} Chuỗi hiển thị giá trị kèm đơn vị
 */
export function formatSystemConfigValue(key, value) {
  if (value === undefined || value === null) return '—';
  const upperKey = (key || '').toUpperCase();
  
  if (upperKey.includes('FINE') || upperKey.includes('FEE_PER_DAY') || upperKey.includes('PHAT')) {
    return `${formatVND(value)} / ngày`;
  }
  if (upperKey.includes('FEE') || upperKey.includes('PRICE') || upperKey.includes('COST') || upperKey.includes('AMOUNT') || upperKey.includes('TIEN') || upperKey.includes('COC')) {
    return formatVND(value);
  }
  if (upperKey.includes('DISCOUNT') || upperKey.includes('PCT') || upperKey.includes('PERCENT') || upperKey.includes('RATE') || upperKey.includes('PHAN_TRAM')) {
    return `${value}%`;
  }
  if (upperKey.includes('DAY') || upperKey.includes('PERIOD') || upperKey.includes('DURATION') || upperKey.includes('EXPIRE') || upperKey.includes('NGAY') || upperKey.includes('HAN')) {
    return `${value} ngày`;
  }
  if (upperKey.includes('EXTENSION') || upperKey.includes('RENEW') || upperKey.includes('LAN')) {
    return `${value} lần`;
  }
  if (upperKey.includes('MAX') || upperKey.includes('LIMIT') || upperKey.includes('COUNT') || upperKey.includes('QTY') || upperKey.includes('BOOK') || upperKey.includes('SACH')) {
    return `${value} cuốn`;
  }
  return String(value);
}

/**
 * Lấy đơn vị đo tương ứng từ key quy định
 * @param {string} key
 * @returns {string}
 */
export function getRuleUnit(key) {
  const upper = (key || '').toUpperCase();
  if (upper.includes('FINE') || upper.includes('PHAT')) return 'VNĐ/ngày';
  if (upper.includes('FEE') || upper.includes('PRICE') || upper.includes('TIEN')) return 'VNĐ';
  if (upper.includes('DISCOUNT') || upper.includes('PCT') || upper.includes('PERCENT')) return '%';
  if (upper.includes('DAY') || upper.includes('NGAY')) return 'ngày';
  if (upper.includes('EXTENSION') || upper.includes('LAN')) return 'lần';
  if (upper.includes('BOOK') || upper.includes('SACH') || upper.includes('LIMIT')) return 'cuốn';
  return '';
}
