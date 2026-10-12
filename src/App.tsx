/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppDataState,
  PatientProfile,
  MotorAssessment,
  DailyCalorieLog,
  AppUser,
  DeveloperSettings,
} from './types';
import { loadAppData, saveAppData } from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { RecoveryEvaluator } from './components/RecoveryEvaluator';
import { CalorieTracker } from './components/CalorieTracker';
import { HistoryTrend } from './components/HistoryTrend';
import { PatientProfileModal } from './components/PatientProfileModal';
import { MedicalReportModal } from './components/MedicalReportModal';
import { DataManagementModal } from './components/DataManagementModal';
import { LoginModal } from './components/LoginModal';
import { DeveloperConsoleModal } from './components/DeveloperConsoleModal';
import { Code, ShieldCheck, UserCheck } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppDataState>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<'overview' | 'recovery' | 'calories' | 'history'>('overview');

  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);

  // Lưu tự động vào localStorage khi state thay đổi
  useEffect(() => {
    saveAppData(appState);
  }, [appState]);

  // Lấy người dùng đăng nhập hiện tại
  const currentUser =
    appState.users.find((u) => u.id === appState.currentUserId) ||
    appState.users[0];

  // Lấy thông tin bệnh nhân hiện tại
  const currentPatient =
    appState.patients.find((p) => p.id === appState.activePatientId) ||
    appState.patients[0];

  // Lấy danh sách đánh giá của bệnh nhân hiện tại
  const currentAssessments = appState.assessments.filter(
    (a) => a.patientId === currentPatient?.id
  );

  // Lấy lần đánh giá mới nhất
  const latestAssessment = [...currentAssessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  // Lấy nhật ký calo hôm nay
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCalorieLog = appState.calorieLogs.find(
    (l) => l.patientId === currentPatient?.id && l.date === todayStr
  );

  // Handler đổi bệnh nhân
  const handleSelectPatient = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      activePatientId: id,
    }));
  };

  // Handler đăng nhập
  const handleLogin = (user: AppUser) => {
    setAppState((prev) => {
      let targetPatientId = prev.activePatientId;
      // Nếu là bệnh nhân và có hồ sơ liên kết, tự chuyển sang hồ sơ đó
      if (user.role === 'patient' && user.associatedPatientId) {
        targetPatientId = user.associatedPatientId;
      }
      return {
        ...prev,
        currentUserId: user.id,
        activePatientId: targetPatientId,
      };
    });
  };

  // Handler đăng ký tài khoản mới
  const handleRegister = (newUser: AppUser) => {
    setAppState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUserId: newUser.id,
    }));
  };

  // Handler cập nhật cài đặt phát triển
  const handleUpdateDevSettings = (settings: DeveloperSettings) => {
    setAppState((prev) => ({
      ...prev,
      devSettings: settings,
    }));
  };

  // Handler giả lập ca bệnh từ Dev Console
  const handleSimulatePatient = (patient: PatientProfile, assessment: MotorAssessment) => {
    setAppState((prev) => ({
      ...prev,
      patients: [patient, ...prev.patients],
      activePatientId: patient.id,
      assessments: [assessment, ...prev.assessments],
    }));
    setActiveTab('overview');
  };

  // Handler lưu hoặc cập nhật bệnh nhân
  const handleSavePatient = (savedPatient: PatientProfile) => {
    setAppState((prev) => {
      const exists = prev.patients.some((p) => p.id === savedPatient.id);
      let updatedPatients: PatientProfile[];
      if (exists) {
        updatedPatients = prev.patients.map((p) =>
          p.id === savedPatient.id ? savedPatient : p
        );
      } else {
        updatedPatients = [savedPatient, ...prev.patients];
      }
      return {
        ...prev,
        patients: updatedPatients,
        activePatientId: savedPatient.id,
      };
    });
    setEditingPatient(null);
  };

  // Handler lưu lần đánh giá phục hồi chức năng mới
  const handleSaveAssessment = (assessment: MotorAssessment) => {
    setAppState((prev) => ({
      ...prev,
      assessments: [assessment, ...prev.assessments],
    }));
  };

  // Handler xoá lần đánh giá
  const handleDeleteAssessment = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá lần đánh giá phục hồi này?')) {
      setAppState((prev) => ({
        ...prev,
        assessments: prev.assessments.filter((a) => a.id !== id),
      }));
    }
  };

  // Handler cập nhật nhật ký calo
  const handleUpdateDailyLog = (log: DailyCalorieLog) => {
    setAppState((prev) => {
      const existsIndex = prev.calorieLogs.findIndex(
        (l) => l.patientId === log.patientId && l.date === log.date
      );
      let updatedLogs: DailyCalorieLog[];
      if (existsIndex >= 0) {
        updatedLogs = [...prev.calorieLogs];
        updatedLogs[existsIndex] = log;
      } else {
        updatedLogs = [log, ...prev.calorieLogs];
      }
      return {
        ...prev,
        calorieLogs: updatedLogs,
      };
    });
  };

  // Handler cập nhật mục tiêu calo tuỳ chỉnh cho bệnh nhân
  const handleUpdatePatientCustomTarget = (newTarget: number) => {
    if (!currentPatient) return;
    const updatedPatient: PatientProfile = {
      ...currentPatient,
      customDailyBurnTarget: newTarget,
      updatedAt: new Date().toISOString(),
    };
    handleSavePatient(updatedPatient);
  };

  // Handler nhập lại trạng thái từ tệp sao lưu JSON
  const handleImportState = (newState: AppDataState) => {
    setAppState(newState);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Thanh điều hướng Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patients={appState.patients}
        activePatientId={appState.activePatientId}
        currentUser={currentUser}
        onSelectPatient={handleSelectPatient}
        onOpenNewPatientModal={() => {
          setEditingPatient(null);
          setIsPatientModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenDevModal={() => setIsDevModalOpen(true)}
      />

      {/* Dải thông báo trạng thái tài khoản & quyền hạn */}
      <div className="bg-slate-100/80 border-b border-slate-200 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              currentUser?.role === 'developer'
                ? 'bg-purple-600'
                : currentUser?.role === 'doctor'
                ? 'bg-teal-600'
                : 'bg-emerald-500'
            }`} />
            <span>
              Đang đăng nhập: <strong className="text-slate-900">{currentUser?.name}</strong> ({currentUser?.title})
            </span>
            <span className="text-slate-400">·</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-teal-700 hover:text-teal-900 underline font-medium"
            >
              Đổi vai trò / Đăng xuất
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'developer' && (
              <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                CHẾ ĐỘ PHÁT TRIỂN (W_MRC: {appState.devSettings.weights.mrc * 100}%, ROM: {appState.devSettings.weights.rom * 100}%, MOB: {appState.devSettings.weights.mobility * 100}%)
              </span>
            )}
            <button
              onClick={() => setIsDevModalOpen(true)}
              className="text-purple-700 hover:text-purple-900 font-semibold underline flex items-center gap-1"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Tuỳ biến thuật toán & giả lập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thân ứng dụng chính */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPatient ? (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview
                patient={currentPatient}
                assessments={appState.assessments}
                todayCalorieLog={todayCalorieLog}
                onNavigateToRecovery={() => setActiveTab('recovery')}
                onNavigateToCalories={() => setActiveTab('calories')}
                onNavigateToHistory={() => setActiveTab('history')}
                onEditPatient={() => {
                  setEditingPatient(currentPatient);
                  setIsPatientModalOpen(true);
                }}
              />
            )}

            {activeTab === 'recovery' && (
              <RecoveryEvaluator
                patient={currentPatient}
                latestAssessment={latestAssessment}
                customWeights={appState.devSettings.weights}
                onSaveAssessment={handleSaveAssessment}
              />
            )}

            {activeTab === 'calories' && (
              <CalorieTracker
                patient={currentPatient}
                calorieLogs={appState.calorieLogs}
                onUpdateDailyLog={handleUpdateDailyLog}
                onUpdatePatientCustomTarget={handleUpdatePatientCustomTarget}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTrend
                patient={currentPatient}
                assessments={appState.assessments}
                calorieLogs={appState.calorieLogs}
                onDeleteAssessment={handleDeleteAssessment}
                onNavigateToRecovery={() => setActiveTab('recovery')}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-600">
            <p className="font-semibold text-lg text-slate-800">Chưa có hồ sơ bệnh nhân nào</p>
            <p className="text-sm mt-1 text-slate-500">
              Vui lòng tạo hồ sơ bệnh nhân mới để bắt đầu theo dõi phục hồi chức năng và calo.
            </p>
            <button
              onClick={() => {
                setEditingPatient(null);
                setIsPatientModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-teal-700 text-white font-bold rounded-lg text-sm"
            >
              + Tạo Hồ Sơ Bệnh Nhân
            </button>
          </div>
        )}
      </main>

      {/* Chân trang yên tĩnh */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong>RehabCal</strong> · Hệ thống Quản lý Phục Hồi Chức Năng Vận Động & Năng Lượng Tiêu Hao
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            Lượng giá theo thang điểm MRC, ROM & Hệ số tiêu hao năng lượng MET y khoa.
          </div>
        </div>
      </footer>

      {/* Modal Chỉnh Sửa / Thêm Bệnh Nhân */}
      <PatientProfileModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSavePatient={handleSavePatient}
        existingPatient={editingPatient}
      />

      {/* Modal Báo Cáo Y Khoa Chuẩn In A4 */}
      {currentPatient && (
        <MedicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          patient={currentPatient}
          latestAssessment={latestAssessment}
          todayLog={todayCalorieLog}
        />
      )}

      {/* Modal Quản Lý Dữ Liệu (Xuất JSON / Nhập JSON / Đặt lại) */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        appState={appState}
        onImportState={handleImportState}
      />

      {/* Modal Đăng Nhập & Phân Quyền Quản Lý */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={appState.users}
        currentUserId={appState.currentUserId}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Modal Bảng Điều Khiển Phát Triển (Developer Console) */}
      <DeveloperConsoleModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        devSettings={appState.devSettings}
        onUpdateDevSettings={handleUpdateDevSettings}
        appState={appState}
        onSimulatePatient={handleSimulatePatient}
      />
    </div>
  );
}

