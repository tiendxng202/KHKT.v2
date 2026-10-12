import React from 'react';
import { Activity, Printer, Database, UserCheck, Plus, User, Code, LogIn, ChevronDown } from 'lucide-react';
import { PatientProfile, AppUser } from '../types';

interface NavbarProps {
  activeTab: 'overview' | 'recovery' | 'calories' | 'history';
  setActiveTab: (tab: 'overview' | 'recovery' | 'calories' | 'history') => void;
  patients: PatientProfile[];
  activePatientId: string;
  currentUser?: AppUser;
  onSelectPatient: (id: string) => void;
  onOpenNewPatientModal: () => void;
  onOpenReportModal: () => void;
  onOpenDataModal: () => void;
  onOpenLoginModal: () => void;
  onOpenDevModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  patients,
  activePatientId,
  currentUser,
  onSelectPatient,
  onOpenNewPatientModal,
  onOpenReportModal,
  onOpenDataModal,
  onOpenLoginModal,
  onOpenDevModal,
}) => {
  const currentPatient = patients.find((p) => p.id === activePatientId) || patients[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                RehabCal
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline whitespace-nowrap">
                Phục Hồi Vận Động & Quản Lý Calo
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'recovery'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lượng giá % Phục hồi
            </button>
            <button
              onClick={() => setActiveTab('calories')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'calories'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Quản lý Calo Đốt
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'history'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lịch sử & Xu hướng
            </button>
          </nav>

          {/* Zone 3: Actions & Patient Selector & User Login */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Bộ chọn hồ sơ bệnh nhân */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={activePatientId}
                onChange={(e) => onSelectPatient(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none cursor-pointer max-w-[120px] lg:max-w-[150px] truncate"
                aria-label="Chọn hồ sơ bệnh nhân"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenNewPatientModal}
                title="Thêm hồ sơ bệnh nhân mới"
                className="p-1 text-slate-600 hover:text-teal-700 hover:bg-white rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* In / Xuất báo cáo */}
            <button
              onClick={onOpenReportModal}
              title="In phiếu lượng giá & dinh dưỡng"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline">Báo Cáo</span>
            </button>

            {/* Nút Console Nhà Phát Triển */}
            <button
              onClick={onOpenDevModal}
              title="Bảng điều khiển phát triển (Developer Console)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Code className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden sm:inline">Phát Triển</span>
            </button>

            {/* Nút Tài khoản / Đăng nhập Quản lý */}
            <button
              onClick={onOpenLoginModal}
              title="Đăng nhập & Quản lý tài khoản"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors text-xs font-medium text-slate-800 max-w-[160px] truncate"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                currentUser?.role === 'developer'
                  ? 'bg-purple-700'
                  : currentUser?.role === 'doctor'
                  ? 'bg-teal-700'
                  : 'bg-emerald-600'
              }`}>
                {currentUser ? currentUser.name.charAt(0) : <User className="w-3 h-3" />}
              </div>
              <span className="truncate">
                {currentUser ? currentUser.name.split(' ').slice(-1)[0] : 'Đăng nhập'}
              </span>
            </button>

            {/* Quản lý dữ liệu sao lưu */}
            <button
              onClick={onOpenDataModal}
              title="Sao lưu & Quản lý dữ liệu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1 px-2 rounded ${activeTab === 'overview' ? 'text-teal-700 font-bold bg-teal-50' : ''}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-1 px-2 rounded ${activeTab === 'recovery' ? 'text-teal-700 font-bold bg-teal-50' : ''}`}
          >
            % Phục hồi
          </button>
          <button
            onClick={() => setActiveTab('calories')}
            className={`py-1 px-2 rounded ${activeTab === 'calories' ? 'text-teal-700 font-bold bg-teal-50' : ''}`}
          >
            Calo Đốt
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 px-2 rounded ${activeTab === 'history' ? 'text-teal-700 font-bold bg-teal-50' : ''}`}
          >
            Lịch sử
          </button>
        </div>
      </div>
    </header>
  );
};

