import React, { useState } from 'react';
import {
  PatientProfile,
  MotorAssessment,
  MRCMuscleTest,
  JointROMTest,
  FunctionalMobilityTest,
} from '../types';
import {
  STANDARD_MRC_MUSCLE_GROUPS,
  STANDARD_ROM_JOINTS,
  STANDARD_MOBILITY_ITEMS,
} from '../constants/rehabData';
import {
  calculateMRCPercent,
  calculateROMPercent,
  calculateMobilityPercent,
  calculateOverallRecoveryPercent,
  getClinicalStageInfo,
} from '../utils/calculator';
import {
  Activity,
  Save,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ClipboardCheck,
  Zap,
  Info,
} from 'lucide-react';

interface RecoveryEvaluatorProps {
  patient: PatientProfile;
  latestAssessment?: MotorAssessment;
  customWeights?: { mrc: number; rom: number; mobility: number };
  onSaveAssessment: (assessment: MotorAssessment) => void;
}

export const RecoveryEvaluator: React.FC<RecoveryEvaluatorProps> = ({
  patient,
  latestAssessment,
  customWeights,
  onSaveAssessment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mrc' | 'rom' | 'mobility'>('mrc');
  const [assessorName, setAssessorName] = useState<string>(
    latestAssessment?.assessorName || 'KTV Điều Trị / Bác Sĩ PHCN'
  );
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Bệnh nhân phối hợp tốt, sức cơ và biên độ khớp có chiều hướng cải thiện tích cực.'
  );

  // Khởi tạo state các nhóm bài test
  const [mrcTests, setMrcTests] = useState<MRCMuscleTest[]>(() => {
    if (latestAssessment?.mrcTests && latestAssessment.mrcTests.length > 0) {
      return latestAssessment.mrcTests;
    }
    return STANDARD_MRC_MUSCLE_GROUPS.map((g) => ({
      ...g,
      score: 3,
    }));
  });

  const [romTests, setRomTests] = useState<JointROMTest[]>(() => {
    if (latestAssessment?.romTests && latestAssessment.romTests.length > 0) {
      return latestAssessment.romTests;
    }
    return STANDARD_ROM_JOINTS.map((j) => ({
      ...j,
      currentAngle: Math.round(j.normalAngle * 0.7),
    }));
  });

  const [mobilityTests, setMobilityTests] = useState<FunctionalMobilityTest[]>(() => {
    if (latestAssessment?.mobilityTests && latestAssessment.mobilityTests.length > 0) {
      return latestAssessment.mobilityTests;
    }
    return STANDARD_MOBILITY_ITEMS.map((m) => ({
      ...m,
      score: Math.max(1, Math.round(m.maxScore * 0.6)),
    }));
  });

  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Trọng số tuỳ biến theo cấu hình phát triển nếu có
  const weights = customWeights
    ? {
        mrc: Math.round(customWeights.mrc * 100),
        rom: Math.round(customWeights.rom * 100),
        mobility: Math.round(customWeights.mobility * 100),
      }
    : { mrc: 40, rom: 30, mobility: 30 };

  // Tính toán thời gian thực
  const mrcPercent = calculateMRCPercent(mrcTests);
  const romPercent = calculateROMPercent(romTests);
  const mobilityPercent = calculateMobilityPercent(mobilityTests);
  const overallPercent = calculateOverallRecoveryPercent(
    mrcPercent,
    romPercent,
    mobilityPercent,
    customWeights
  );
  const stageInfo = getClinicalStageInfo(overallPercent);

  // Handlers
  const handleMrcScoreChange = (id: string, newScore: number) => {
    setMrcTests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, score: newScore } : item))
    );
  };

  const handleRomAngleChange = (id: string, newAngle: number) => {
    setRomTests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentAngle: newAngle } : item))
    );
  };

  const handleMobilityScoreChange = (id: string, newScore: number) => {
    setMobilityTests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, score: newScore } : item))
    );
  };

  const handleSave = () => {
    const newAssessment: MotorAssessment = {
      id: `assess_${Date.now()}`,
      patientId: patient.id,
      date: assessmentDate,
      assessorName,
      mrcTests,
      romTests,
      mobilityTests,
      mrcRecoveryPercent: mrcPercent,
      romRecoveryPercent: romPercent,
      mobilityRecoveryPercent: mobilityPercent,
      overallRecoveryPercent: overallPercent,
      clinicalStage: stageInfo.stageTitle,
      clinicalNotes,
    };

    onSaveAssessment(newAssessment);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 3000);
  };

  const handleResetToBaseline = () => {
    if (confirm('Khôi phục lại các giá trị mặc định ban đầu cho lần đánh giá này?')) {
      setMrcTests(STANDARD_MRC_MUSCLE_GROUPS.map((g) => ({ ...g, score: 2 })));
      setRomTests(STANDARD_ROM_JOINTS.map((j) => ({ ...j, currentAngle: Math.round(j.normalAngle * 0.5) })));
      setMobilityTests(STANDARD_MOBILITY_ITEMS.map((m) => ({ ...m, score: 1 })));
    }
  };

  // MRC Descriptions
  const mrcScoreDescriptions = [
    '0 - Liệt hoàn toàn (Không có sự co cơ nào)',
    '1 - Co cơ rất nhẹ, nhìn/sờ thấy nhưng không phát sinh cử động',
    '2 - Cử động được nhưng phải loại bỏ hoàn toàn trọng lực',
    '3 - Thắng được trọng lực (nhấc chi lên được), nhưng không chịu được sức cản',
    '4 - Thắng được sức cản nhẹ đến trung bình của người khám',
    '5 - Sức cơ bình thường (thắng được sức cản tối đa)',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Tóm tắt Kết Quả Tính Toán Phần Trăm Phục Hồi */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800">
                Thước đo Lượng giá Chuẩn Y Khoa
              </span>
              <span className="text-xs text-slate-500">
                Bệnh nhân: <strong className="text-slate-800">{patient.name}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Tính Toán Tỉ Lệ % Phục Hồi Chức Năng Vận Động
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tổng hợp từ 3 trụ cột lâm sàng: <strong>Sức cơ MRC ({weights.mrc}%)</strong> + <strong>Biên độ khớp ROM ({weights.rom}%)</strong> + <strong>Độc lập vận động ({weights.mobility}%)</strong>
            </p>
          </div>

          {/* Khối Điểm Phần Trăm Tổng Thể Lớn */}
          <div className="flex items-center gap-4 bg-teal-50/60 border border-teal-200/80 p-4 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-xs font-medium text-teal-800 block">
                Tỉ lệ Phục hồi Tổng hợp:
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-4xl sm:text-5xl font-black text-teal-800 tabular-nums">
                  {overallPercent}%
                </span>
              </div>
              <span className="text-xs font-semibold text-teal-700 block truncate max-w-[220px]">
                {stageInfo.stageTitle.split('(')[0]}
              </span>
            </div>

            <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* 3 Cột thành phần % */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div
            onClick={() => setActiveSubTab('mrc')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              activeSubTab === 'mrc'
                ? 'bg-teal-50/40 border-teal-500 ring-1 ring-teal-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>1. Sức Cơ MRC ({weights.mrc}%)</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-white border border-slate-200">
                8 nhóm cơ
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {mrcPercent}%
              </span>
              <span className="text-xs text-slate-500">
                {mrcTests.reduce((a, b) => a + b.score, 0)}/40 điểm
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${mrcPercent}%` }} />
            </div>
          </div>

          <div
            onClick={() => setActiveSubTab('rom')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              activeSubTab === 'rom'
                ? 'bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>2. Biên Độ Khớp ROM ({weights.rom}%)</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-white border border-slate-200">
                6 góc cử động
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {romPercent}%
              </span>
              <span className="text-xs text-slate-500">so với góc chuẩn</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${romPercent}%` }} />
            </div>
          </div>

          <div
            onClick={() => setActiveSubTab('mobility')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
              activeSubTab === 'mobility'
                ? 'bg-amber-50/40 border-amber-500 ring-1 ring-amber-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>3. Độc Lập Di Chuyển ({weights.mobility}%)</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-white border border-slate-200">
                6 kỹ năng ADL
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {mobilityPercent}%
              </span>
              <span className="text-xs text-slate-500">
                {mobilityTests.reduce((a, b) => a + b.score, 0)}/19 điểm
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${mobilityPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Thông tin buổi lượng giá */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-5 mt-5 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Ngày lượng giá</label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Người lượng giá / Bác sĩ</label>
            <input
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
              placeholder="VD: BS. Nguyễn Văn A..."
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-slate-600 font-medium mb-1">Ghi chú diễn tiến lâm sàng</label>
            <input
              type="text"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
              placeholder="Nhận xét phản xạ, đau, dáng đi..."
            />
          </div>
        </div>
      </div>

      {/* 2. Bộ Chuyển Đổi Tab Lượng Giá Chi Tiết */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveSubTab('mrc')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSubTab === 'mrc'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Phần 1: Sức Cơ MRC (0 - 5 điểm)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold tabular-nums">
              {mrcPercent}%
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('rom')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSubTab === 'rom'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Phần 2: Biên Độ Khớp ROM</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold tabular-nums">
              {romPercent}%
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('mobility')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSubTab === 'mobility'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Phần 3: Độc Lập Di Chuyển</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold tabular-nums">
              {mobilityPercent}%
            </span>
          </button>
        </div>

        {/* Nội dung chi tiết từng tab */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: SỨC CƠ MRC */}
          {activeSubTab === 'mrc' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">
                  Quy chuẩn Thang điểm Sức Cơ MRC (Medical Research Council - 0 đến 5 điểm):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-slate-600">
                  {mrcScoreDescriptions.map((desc, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200">
                      {desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh sách 8 nhóm cơ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mrcTests.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-semibold text-teal-700 block">
                          {item.region === 'upper' ? 'Chi trên' : 'Chi dưới'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                        {item.notes && (
                          <span className="text-xs text-slate-500">{item.notes}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-teal-700 tabular-nums">
                          {item.score}/5
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {Math.round((item.score / 5) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Nút bấm chọn nhanh điểm 0 - 5 */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleMrcScoreChange(item.id, val)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            item.score === val
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BIÊN ĐỘ VẬN ĐỘNG KHỚP ROM */}
          {activeSubTab === 'rom' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-3.5 text-xs text-indigo-900">
                <span className="font-bold block mb-1">
                  Đánh giá Biên độ Khớp (ROM - Range of Motion):
                </span>
                So sánh góc cử động chủ động thực tế đo bằng thước đo góc goniometer so với góc sinh lý bình thường của người khoẻ mạnh. Đạt 100% nghĩa là khớp cử động trơn tru không bị co rút.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {romTests.map((item) => {
                  const percent = Math.min(Math.round((item.currentAngle / item.normalAngle) * 100), 100);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold text-indigo-700 block">
                            {item.jointName}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{item.movement}</h4>
                          <span className="text-xs text-slate-500">
                            Chuẩn bình thường: <strong>{item.normalAngle} {item.unit}</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-indigo-700 tabular-nums">
                            {percent}%
                          </span>
                          <span className="text-xs text-slate-500 block tabular-nums">
                            {item.currentAngle} / {item.normalAngle}
                          </span>
                        </div>
                      </div>

                      {/* Slider & Input điều chỉnh */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={item.normalAngle}
                            value={item.currentAngle}
                            onChange={(e) => handleRomAngleChange(item.id, Number(e.target.value))}
                            className="flex-1 accent-indigo-600 cursor-pointer"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min="0"
                              max={item.normalAngle}
                              value={item.currentAngle}
                              onChange={(e) => handleRomAngleChange(item.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                            <span className="text-xs text-slate-500">{item.unit.includes('độ') ? '°' : '%'}</span>
                          </div>
                        </div>

                        {/* Thanh visual */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ĐỘC LẬP VẬN ĐỘNG & ADL */}
          {activeSubTab === 'mobility' && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900">
                <span className="font-bold block mb-1">
                  Đánh giá Độc Lập Vận Động & Sinh Hoạt (Functional Independence):
                </span>
                Đo lường mức độ tự chủ khi sinh hoạt thực tế, khả năng tự chuyển tư thế và di chuyển, phản ánh chất lượng cuộc sống của bệnh nhân sau phục hồi.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mobilityTests.map((item) => {
                  const percent = Math.round((item.score / item.maxScore) * 100);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold text-amber-700 block">
                            Chức năng vận động
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{item.taskName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-lg font-black text-amber-700 tabular-nums">
                            {item.score}/{item.maxScore}
                          </span>
                          <span className="text-xs text-slate-500 block">({percent}%)</span>
                        </div>
                      </div>

                      {/* Các nút chọn điểm */}
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        {Array.from({ length: item.maxScore + 1 }, (_, i) => i).map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleMobilityScoreChange(item.id, val)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              item.score === val
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {val} điểm
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Thanh tác vụ chân trang: Lưu & Reset */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Kết quả tính toán: <strong>{overallPercent}%</strong> ({stageInfo.stageTitle})
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleResetToBaseline}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
            >
              {isSavedFeedback ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Đã Lưu Kết Quả Thành Công!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Kết Quả Đánh Giá Này</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
