import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { LogIn, UserPlus, Shield, User, Code, X, Check, Key, Mail } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUserId: string;
  onLogin: (user: AppUser) => void;
  onRegister: (newUser: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form đăng ký
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('doctor');
  const [regTitle, setRegTitle] = useState<string>('Bác sĩ Điều trị');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser) {
      setErrorMessage('Không tìm thấy tài khoản với email này. Vui lòng thử lại hoặc đăng ký mới.');
      return;
    }

    if (foundUser.password && foundUser.password !== password) {
      setErrorMessage('Mật khẩu không chính xác! (Gợi ý mật khẩu mẫu: 123)');
      return;
    }

    onLogin(foundUser);
    onClose();
  };

  const handleQuickLogin = (user: AppUser) => {
    onLogin(user);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ họ tên và email.');
      return;
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setErrorMessage('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
      return;
    }

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword || '123',
      role: regRole,
      title: regTitle || (regRole === 'doctor' ? 'Bác sĩ PHCN' : regRole === 'developer' ? 'Kỹ sư Phát triển' : 'Bệnh nhân'),
      createdAt: new Date().toISOString(),
    };

    onRegister(newUser);
    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Đăng Nhập Quản Lý & Phân Quyền
              </h3>
              <p className="text-xs text-slate-500">
                Truy cập theo vai trò: Bác sĩ, Bệnh nhân hoặc Nhà phát triển
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* TAB ĐĂNG NHẬP */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email đăng nhập:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bs.letronghung@rehabcal.vn"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mật khẩu:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (mặc định: 123)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Quản Lý</span>
              </button>
            </form>

            {/* Tài khoản mẫu 1-click */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Đăng nhập nhanh 1-Click (Tài khoản mẫu):
              </span>
              <div className="space-y-2">
                {users.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors text-xs ${
                        isCurrent
                          ? 'border-teal-600 bg-teal-50/40 text-teal-900 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          u.role === 'doctor'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'developer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role === 'doctor' ? 'BS' : u.role === 'developer' ? 'DEV' : 'BN'}
                        </div>
                        <div className="truncate">
                          <strong className="block text-slate-900 truncate">{u.name}</strong>
                          <span className="text-[11px] text-slate-500 block truncate">{u.title} · {u.email}</span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded font-bold shrink-0 bg-slate-100 text-slate-700">
                        {isCurrent ? 'Đang chọn' : 'Đăng nhập'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB ĐĂNG KÝ */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="VD: BS. Phạm Minh Tuấn"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email đăng ký *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="bacsi@rehabcal.vn"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mặc định: 123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Vai trò quản lý
                </label>
                <select
                  value={regRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setRegRole(r);
                    if (r === 'doctor') setRegTitle('Bác sĩ Điều trị');
                    else if (r === 'developer') setRegTitle('Kỹ sư Phát triển Hệ thống');
                    else setRegTitle('Bệnh nhân / Người tập');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="doctor">Bác sĩ / KTV PHCN (Admin)</option>
                  <option value="patient">Bệnh nhân / Người tập</option>
                  <option value="developer">Nhà phát triển (Developer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Chức danh hiển thị:
              </label>
              <input
                type="text"
                value={regTitle}
                onChange={(e) => setRegTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký & Đăng Nhập Ngay</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
