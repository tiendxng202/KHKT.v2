import React, { useState } from 'react';
import { DeveloperSettings, AppDataState, PatientProfile, MotorAssessment } from '../types';
import { Code, Sliders, Play, Terminal, X, Check, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { STANDARD_MRC_MUSCLE_GROUPS, STANDARD_ROM_JOINTS, STANDARD_MOBILITY_ITEMS } from '../constants/rehabData';
import { calculateMRCPercent, calculateROMPercent, calculateMobilityPercent, calculateOverallRecoveryPercent } from '../utils/calculator';

interface DeveloperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  devSettings: DeveloperSettings;
  onUpdateDevSettings: (settings: DeveloperSettings) => void;
  appState: AppDataState;
  onSimulatePatient: (patient: PatientProfile, assessment: MotorAssessment) => void;
}

export const DeveloperConsoleModal: React.FC<DeveloperConsoleModalProps> = ({
  isOpen,
  onClose,
  devSettings,
  onUpdateDevSettings,
  appState,
  onSimulatePatient,
}) => {
  const [activeTab, setActiveTab] = useState<'weights' | 'simulation' | 'state_debug'>('weights');

  // Trọng số
  const [mrcWeight, setMrcWeight] = useState<number>(devSettings.weights.mrc * 100);
  const [romWeight, setRomWeight] = useState<number>(devSettings.weights.rom * 100);
  const [mobWeight, setMobWeight] = useState<number>(devSettings.weights.mobility * 100);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalWeight = mrcWeight + romWeight + mobWeight;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: DeveloperSettings = {
      ...devSettings,
      isDevModeEnabled: true,
      weights: {
        mrc: Number((mrcWeight / 100).toFixed(2)),
        rom: Number((romWeight / 100).toFixed(2)),
        mobility: Number((mobWeight / 100).toFixed(2)),
      },
    };
    onUpdateDevSettings(updatedSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetWeights = () => {
    setMrcWeight(40);
    setRomWeight(30);
    setMobWeight(30);
    const updatedSettings: DeveloperSettings = {
      ...devSettings,
      weights: { mrc: 0.4, rom: 0.3, mobility: 0.3 },
    };
    onUpdateDevSettings(updatedSettings);
  };

  // Giả lập ca bệnh
  const handleSimulateCase = (level: 'acute' | 'subacute' | 'excellent') => {
    const timestamp = Date.now();
    let name = '';
    let diag = '';
    let mrcScore = 1;
    let romRatio = 0.35;
    let mobScore = 0;

    if (level === 'acute') {
      name = `[TEST] Ca Cấp Tính #${timestamp.toString().slice(-4)}`;
      diag = 'Đột quỵ não cấp tính tuần 1 - Liệt nửa người mềm';
      mrcScore = 1;
      romRatio = 0.4;
      mobScore = 1;
    } else if (level === 'subacute') {
      name = `[TEST] Ca Bán Cấp #${timestamp.toString().slice(-4)}`;
      diag = 'Sau mổ gãy xương đùi tuần thứ 4 - Tập tì đè một phần';
      mrcScore = 3;
      romRatio = 0.65;
      mobScore = 2;
    } else {
      name = `[TEST] Ca Hồi Phục Xuất Sắc #${timestamp.toString().slice(-4)}`;
      diag = 'Phục hồi sau tổn thương dây chằng khớp gối tuần thứ 12';
      mrcScore = 5;
      romRatio = 0.95;
      mobScore = 3;
    }

    const testPatient: PatientProfile = {
      id: `sim_patient_${timestamp}`,
      name,
      age: 48,
      gender: 'male',
      heightCm: 170,
      weightKg: 68,
      diagnosis: diag,
      affectedSide: 'right',
      startDate: new Date().toISOString().slice(0, 10),
      notes: 'Hồ sơ thử nghiệm tự động từ Developer Console.',
      activityLevelFactor: level === 'acute' ? 1.2 : level === 'subacute' ? 1.3 : 1.45,
      customDailyBurnTarget: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mrcTests = STANDARD_MRC_MUSCLE_GROUPS.map((g) => ({
      ...g,
      score: mrcScore,
    }));

    const romTests = STANDARD_ROM_JOINTS.map((j) => ({
      ...j,
      currentAngle: Math.round(j.normalAngle * romRatio),
    }));

    const mobilityTests = STANDARD_MOBILITY_ITEMS.map((m) => ({
      ...m,
      score: Math.min(mobScore, m.maxScore),
    }));

    const mrcP = calculateMRCPercent(mrcTests);
    const romP = calculateROMPercent(romTests);
    const mobP = calculateMobilityPercent(mobilityTests);
    const overall = calculateOverallRecoveryPercent(mrcP, romP, mobP, devSettings.weights);

    const testAssessment: MotorAssessment = {
      id: `sim_assess_${timestamp}`,
      patientId: testPatient.id,
      date: new Date().toISOString().slice(0, 10),
      assessorName: 'Developer Test Engine',
      mrcTests,
      romTests,
      mobilityTests,
      mrcRecoveryPercent: mrcP,
      romRecoveryPercent: romP,
      mobilityRecoveryPercent: mobP,
      overallRecoveryPercent: overall,
      clinicalStage: `Giai đoạn thử nghiệm (${overall}%)`,
      clinicalNotes: 'Dữ liệu mô phỏng tự động cho kiểm thử lâm sàng.',
    };

    onSimulatePatient(testPatient, testAssessment);
    alert(`Đã tạo thành công ca thử nghiệm: ${name} với % phục hồi là ${overall}%!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bảng Điều Khiển Phát Triển (Developer Console)
              </h3>
              <p className="text-xs text-slate-500">
                Tuỳ biến công thức thuật toán, giả lập dữ liệu lâm sàng & debug hệ thống
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

        {/* Tab chuyển đổi */}
        <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('weights')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'weights' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Trọng Số Công Thức
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'simulation' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Giả Lập Ca Lâm Sàng
          </button>
          <button
            onClick={() => setActiveTab('state_debug')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'state_debug' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Debug Trạng Thái (JSON)
          </button>
        </div>

        {/* TAB 1: TUỲ CHỈNH TRỌNG SỐ THUẬT TOÁN % PHỤC HỒI */}
        {activeTab === 'weights' && (
          <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
              <span className="font-bold block mb-1">Tuỳ Biến Trọng Số Tính % Phục Hồi Toàn Diện:</span>
              <p className="leading-relaxed">
                Công thức: <code>% Phục hồi = (MRC × W_MRC) + (ROM × W_ROM) + (Mobility × W_Mob)</code>.
                Bạn có thể điều chỉnh để phù hợp với từng nghiên cứu hoặc phác đồ chuyên khoa.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Trọng số Sức cơ MRC (%):</span>
                  <span className="font-mono font-bold text-slate-900">{mrcWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={mrcWeight}
                  onChange={(e) => setMrcWeight(Number(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Trọng số Biên độ ROM (%):</span>
                  <span className="font-mono font-bold text-slate-900">{romWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={romWeight}
                  onChange={(e) => setRomWeight(Number(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Trọng số Độc lập Vận động (%):</span>
                  <span className="font-mono font-bold text-slate-900">{mobWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={mobWeight}
                  onChange={(e) => setMobWeight(Number(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-500">
                  Tổng 3 trọng số: <strong className={totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}>{totalWeight}%</strong>
                </span>
                <button
                  type="button"
                  onClick={handleResetWeights}
                  className="text-purple-700 underline hover:text-purple-900"
                >
                  Khôi phục chuẩn y tế (40% - 30% - 30%)
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sliders className="w-4 h-4" />}
                <span>{isSaved ? 'Đã Lưu Cấu Hình Mới!' : 'Áp Dụng Trọng Số Này'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: GIẢ LẬP CA LÂM SÀNG KIỂM THỬ */}
        {activeTab === 'simulation' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Tạo nhanh các ca bệnh giả lập để kiểm tra phản ứng của công thức tính toán và giao diện:
            </p>

            <button
              onClick={() => handleSimulateCase('acute')}
              className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="block text-rose-950 font-bold">1. Ca Cấp Tính / Nặng (~20-25% Phục hồi)</strong>
                <span className="text-rose-700 text-[11px]">Sức cơ bậc 1, ROM hạn chế nhiều, phụ thuộc lăn trở giường</span>
              </div>
              <Play className="w-4 h-4 text-rose-600 shrink-0" />
            </button>

            <button
              onClick={() => handleSimulateCase('subacute')}
              className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="block text-blue-950 font-bold">2. Ca Bán Cấp / Trung Bình (~55-60% Phục hồi)</strong>
                <span className="text-blue-700 text-[11px]">Sức cơ bậc 3, bắt đầu đi lại có dụng cụ hỗ trợ</span>
              </div>
              <Play className="w-4 h-4 text-blue-600 shrink-0" />
            </button>

            <button
              onClick={() => handleSimulateCase('excellent')}
              className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="block text-emerald-950 font-bold">3. Ca Hồi Phục Xuất Sắc (~90-95% Phục hồi)</strong>
                <span className="text-emerald-700 text-[11px]">Sức cơ bậc 5, khớp linh hoạt, đi lại và sinh hoạt độc lập</span>
              </div>
              <Play className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>
          </div>
        )}

        {/* TAB 3: DEBUG STATE */}
        {activeTab === 'state_debug' && (
          <div className="space-y-2 text-xs">
            <span className="text-slate-500 block">
              Trạng thái ứng dụng hiện tại ({appState.patients.length} bệnh nhân, {appState.assessments.length} đánh giá, {appState.calorieLogs.length} logs):
            </span>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono max-h-56">
              {JSON.stringify(
                {
                  activePatientId: appState.activePatientId,
                  patientsCount: appState.patients.length,
                  assessmentsCount: appState.assessments.length,
                  devSettings: appState.devSettings,
                  currentUserId: appState.currentUserId,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
