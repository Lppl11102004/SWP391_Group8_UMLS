import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { userApi } from '../api/user';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [blacklistInfo, setBlacklistInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Form validation errors
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Avatar Upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Alerts
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [res, blRes] = await Promise.allSettled([
          userApi.getProfile(),
          userApi.getMyBlacklist(),
        ]);

        if (res.status === 'fulfilled') {
          const data = res.value.data?.data || res.value.data;
          if (data) {
            setProfile(data);
            setProfileForm({
              fullName: data.fullName || '',
              phone: data.phone || '',
              address: data.address || '',
            });
          }
        }

        if (blRes.status === 'fulfilled') {
          const bData = blRes.value.data?.data;
          setBlacklistInfo(bData || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        showAlert('Không thể tải thông tin hồ sơ cá nhân', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle avatar select
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Upload avatar
  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const res = await userApi.uploadAvatar(avatarFile);
      const updatedProfile = res.data?.data || res.data;
      if (updatedProfile?.avatarUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: updatedProfile.avatarUrl }));
        updateUser({ avatarUrl: updatedProfile.avatarUrl });
      }
      setAvatarFile(null);
      showAlert('Cập nhật ảnh đại diện thành công!', 'success');
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Cập nhật avatar thất bại', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Form validation helpers
  const validateProfileForm = () => {
    const errors = {};
    const nameRegex = /^[a-zA-ZÀ-ỹĐđ\s'-]{2,100}$/;
    const trimmedName = profileForm.fullName.trim();
    if (!trimmedName) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (!nameRegex.test(trimmedName)) {
      errors.fullName = 'Họ và tên chỉ được chứa chữ cái, độ dài từ 2 đến 100 ký tự và không chứa số';
    }

    const trimmedPhone = profileForm.phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(trimmedPhone)) {
      errors.phone = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0';
    }

    const trimmedAddress = profileForm.address.trim();
    if (!trimmedAddress) {
      errors.address = 'Địa chỉ không được để trống';
    } else if (trimmedAddress.length < 5) {
      errors.address = 'Địa chỉ cần ít nhất 5 ký tự để đảm bảo thông tin liên lạc';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (!passRegex.test(passwordForm.newPassword)) {
      errors.newPassword = 'Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp với mật khẩu mới';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      showAlert('Vui lòng kiểm tra lại thông tin các trường bị lỗi', 'error');
      return;
    }
    setUpdatingProfile(true);
    try {
      const payload = {
        userId: profile?.userId || user?.userId,
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      };
      const res = await userApi.updateProfile(payload);
      const updated = res.data?.data || res.data;
      setProfile((prev) => ({ ...prev, ...updated }));
      updateUser(updated);
      setProfileErrors({});
      showAlert('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Cập nhật thông tin thất bại', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      showAlert('Vui lòng kiểm tra lại thông tin mật khẩu', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      const payload = {
        userId: profile?.userId || user?.userId,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      };
      await userApi.changePassword(payload);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      showAlert('Đổi mật khẩu thành công!', 'success');
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Hồ Sơ Độc Giả
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý thông tin cá nhân, ảnh đại diện và bảo mật mật khẩu
          </p>
        </div>
      </div>

      {alert && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 animate-in fade-in duration-200 ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with Upload Button */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-indigo-50 shadow-md bg-slate-100 flex items-center justify-center">
            {avatarPreview || profile?.avatarUrl ? (
              <img
                src={avatarPreview || profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-extrabold text-3xl text-indigo-600">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>

          <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-all">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* User Info Overview */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {profile?.fullName || 'Độc giả ULMS'}
              </h2>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 self-center sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tài khoản Độc Giả (READER)</span>
            </span>
          </div>

          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Ngày gia nhập:{' '}
                <b className="text-slate-700">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Đăng nhập gần nhất:{' '}
                <b className="text-slate-700">
                  {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString('vi-VN') : 'Vừa mới đây'}
                </b>
              </span>
            </div>
          </div>

          {avatarFile && (
            <div className="pt-3 flex items-center space-x-3">
              <button
                onClick={handleSaveAvatar}
                disabled={uploadingAvatar}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
              >
                {uploadingAvatar ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Ảnh Mới</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Huỷ bỏ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Blacklist Status Banner */}
      {blacklistInfo?.isBlacklisted || profile?.isBlacklisted ? (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-200/80 text-rose-800 mb-1">
                Tài Khoản Bị Hạn Chế (Blacklist)
              </div>
              <h3 className="text-base font-extrabold text-rose-950">
                Lý do: {blacklistInfo?.reason || profile?.blacklistReason || 'Vi phạm nội quy mượn trả'}
              </h3>
              <p className="text-xs text-rose-700 mt-1 max-w-xl">
                Tài khoản đang bị tạm ngưng quyền đặt sách và mượn sách. Vui lòng mang sách mượn quá hạn hoặc nộp các khoản tiền phạt tại quầy Thủ thư để được hỗ trợ gỡ hạn chế.
              </p>
              {blacklistInfo?.createdAt && (
                <span className="block text-[11px] text-rose-600 font-medium mt-1">
                  Thời gian ghi nhận: {new Date(blacklistInfo.createdAt).toLocaleString('vi-VN')}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/fines"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Kiểm tra nợ phạt
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Tư Cách Độc Giả Hợp Lệ (Bình thường)
              </h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Tài khoản của bạn không nằm trong danh sách hạn chế, đầy đủ quyền mượn sách và đọc E-Book.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Update Information Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Thông Tin Liên Hệ</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật họ tên, số điện thoại và địa chỉ nhận tài liệu
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, fullName: e.target.value });
                    if (profileErrors.fullName) setProfileErrors({ ...profileErrors, fullName: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${profileErrors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {profileErrors.fullName && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{profileErrors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số điện thoại <span className="text-slate-400 font-normal">(Chỉ nhập số, đúng 10 số bắt đầu bằng 0)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setProfileForm({ ...profileForm, phone: digits });
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${profileErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                  placeholder="0912345678"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {profileErrors.phone && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{profileErrors.phone}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa chỉ liên lạc
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, address: e.target.value });
                    if (profileErrors.address) setProfileErrors({ ...profileErrors, address: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${profileErrors.address ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                  placeholder="Địa chỉ nhận sách, khu phố, phường..."
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {profileErrors.address && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{profileErrors.address}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {updatingProfile ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi Thông Tin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Bảo Mật & Mật Khẩu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thay đổi mật khẩu đăng nhập định kỳ để bảo vệ tài khoản
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${passwordErrors.currentPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{passwordErrors.currentPassword}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu mới <span className="text-slate-400 font-normal">(Tối thiểu 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${passwordErrors.newPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {passwordErrors.newPassword && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{passwordErrors.newPassword}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border ${passwordErrors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'} rounded-xl focus:bg-white focus:outline-none`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{passwordErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {updatingPassword ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cập Nhật Mật Khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
