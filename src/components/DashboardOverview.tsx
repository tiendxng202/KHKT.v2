import React from 'react';
import {
  PatientProfile,
  MotorAssessment,
  DailyCalorieLog,
} from '../types';
import {
  calculateBMR,
  calculateTDEE,
  calculateRecommendedBurnTarget,
  calculateBMI,
  getClinicalStageInfo,
} from '../utils/calculator';
import {
  Activity,
  Flame,
  TrendingUp,
  User,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Edit2,
} from 'lucide-react';

interface DashboardOverviewProps {
  patient: PatientProfile;
  assessments: MotorAssessment[];
  todayCalorieLog?: DailyCalorieLog;
  onNavigateToRecovery: () => void;
  onNavigateToCalories: () => void;
  onNavigateToHistory: () => void;
  onEditPatient: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  patient,
  assessments,
  todayCalorieLog,
  onNavigateToRecovery,
  onNavigateToCalories,
  onNavigateToHistory,
  onEditPatient,
}) => {
  // Lấy lần đánh giá mới nhất và lần trước đó để tính độ tăng trưởng
  const patientAssessments = [...assessments]
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestAssessment = patientAssessments[0];
  const previousAssessment = patientAssessments[1];

  const overallRecovery = latestAssessment ? latestAssessment.overallRecoveryPercent : 0;
  const stageInfo = getClinicalStageInfo(overallRecovery);

  const recoveryDelta = previousAssessment
    ? Number((overallRecovery - previousAssessment.overallRecoveryPercent).toFixed(1))
    : null;

  // Tính calo
  const bmr = calculateBMR(patient.weightKg, patient.heightCm, patient.age, patient.gender);
  const tdee = calculateTDEE(bmr, patient.activityLevelFactor);
  const targetBurn = calculateRecommendedBurnTarget(
    bmr,
    patient.activityLevelFactor,
    patient.customDailyBurnTarget
  );

  const totalBurnedToday = todayCalorieLog ? todayCalorieLog.totalBurnedCalories : 0;
  const burnProgressPercent = Math.min(Math.round((totalBurnedToday / (targetBurn || 1)) * 100), 100);
  const remainingBurn = Math.max(targetBurn - totalBurnedToday, 0);

  // BMI
  const bmiInfo = calculateBMI(patient.weightKg, patient.heightCm);

  // Tính số ngày kể từ khi bắt đầu
  const daysInRehab = Math.max(
    1,
    Math.floor((new Date().getTime() - new Date(patient.startDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-6">
      {/* 1. Thẻ hồ sơ thông tin bệnh nhân */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {patient.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {patient.gender === 'male' ? 'Nam' : 'Nữ'} · {patient.age} tuổi
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Bên tổn thương: {patient.affectedSide === 'left' ? 'Bên trái' : patient.affectedSide === 'right' ? 'Bên phải' : patient.affectedSide === 'both' ? 'Cả hai bên' : 'Toàn thân'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                <strong className="text-slate-800">Chẩn đoán:</strong> {patient.diagnosis}
              </p>
            </div>
          </div>

          <button
            onClick={onEditPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start md:self-auto shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* Các chỉ số thể chất căn bản */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Chiều cao & Cân nặng</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {patient.heightCm} cm · {patient.weightKg} kg
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Chỉ số BMI</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {bmiInfo.bmi} <span className={`text-xs font-normal ${bmiInfo.colorClass}`}>({bmiInfo.label})</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Thời gian điều trị</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {daysInRehab} ngày <span className="text-xs text-slate-500 font-normal">(từ {new Date(patient.startDate).toLocaleDateString('vi-VN')})</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Mức độ hoạt động</span>
            <span className="font-semibold text-slate-800">
              {patient.activityLevelFactor <= 1.25 ? 'Tại giường / Hạn chế' : patient.activityLevelFactor <= 1.4 ? 'Vận động nhẹ' : 'Vận động vừa'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hai Thẻ Trọng Tâm: % Phục hồi vận động & Calo đốt trong ngày */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: Tỉ Lệ % Phục Hồi Chức Năng Vận Động */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tỉ Lệ % Phục Hồi Vận Động
                  </h2>
                  <span className="text-xs text-slate-500">
                    Lần đánh giá gần nhất: {latestAssessment ? new Date(latestAssessment.date).toLocaleDateString('vi-VN') : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              {recoveryDelta !== null && (
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{recoveryDelta}% so với lần trước</span>
                </div>
              )}
            </div>

            {/* Điểm số phục hồi chính */}
            <div className="my-6 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 tabular-nums">
                    {overallRecovery}%
                  </span>
                  <span className="text-sm font-semibold text-teal-700">
                    mức độ phục hồi
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${stageInfo.badgeColor}`}>
                    {stageInfo.stageTitle}
                  </span>
                </div>
              </div>

              {/* Vòng tròn phần trăm trực quan */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-600 transition-all duration-500"
                    strokeDasharray={`${overallRecovery}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 tabular-nums">
                  {overallRecovery}%
                </div>
              </div>
            </div>

            {/* 3 Thành phần hợp thành chỉ số % phục hồi */}
            <div className="space-y-3 pt-2 pb-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>1. Sức cơ MRC (Trọng số 40%)</span>
                  <span className="tabular-nums font-semibold">{latestAssessment?.mrcRecoveryPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${latestAssessment?.mrcRecoveryPercent ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>2. Biên độ khớp ROM (Trọng số 30%)</span>
                  <span className="tabular-nums font-semibold">{latestAssessment?.romRecoveryPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${latestAssessment?.romRecoveryPercent ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>3. Độc lập di chuyển & ADL (Trọng số 30%)</span>
                  <span className="tabular-nums font-semibold">{latestAssessment?.mobilityRecoveryPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: `${latestAssessment?.mobilityRecoveryPercent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
              {stageInfo.clinicalAdvice}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <button
              onClick={onNavigateToRecovery}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 transition-colors"
            >
              <span>Thực hiện đánh giá lần mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToHistory}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Xem {patientAssessments.length} lần đánh giá
            </button>
          </div>
        </div>

        {/* CARD 2: Quản Lý Lượng Calo Đã Đốt / Cần Đốt Trong Ngày */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-orange-800 rounded-lg">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Calo Đã Đốt / Cần Đốt Trong Ngày
                  </h2>
                  <span className="text-xs text-slate-500">
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                burnProgressPercent >= 100
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {burnProgressPercent >= 100 ? 'Đã đạt mục tiêu' : `Đạt ${burnProgressPercent}%`}
              </span>
            </div>

            {/* Số calo lớn */}
            <div className="my-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">
                      {totalBurnedToday}
                    </span>
                    <span className="text-lg font-medium text-slate-400">/</span>
                    <span className="text-2xl font-bold text-slate-600 tabular-nums">
                      {targetBurn}
                    </span>
                    <span className="text-sm font-semibold text-orange-600">kcal</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {remainingBurn > 0 ? (
                      <>Cần đốt thêm <strong className="text-slate-800 tabular-nums">{remainingBurn} kcal</strong> qua bài tập hôm nay.</>
                    ) : (
                      <>Xuất sắc! Đã vượt mục tiêu vận động <strong className="text-emerald-700 tabular-nums">{totalBurnedToday - targetBurn} kcal</strong>.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      burnProgressPercent >= 100 ? 'bg-emerald-600' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(burnProgressPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chi tiết năng lượng trao đổi chất */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center text-xs">
              <div>
                <span className="text-slate-500 block">BMR (Cơ bản)</span>
                <span className="font-bold text-slate-800 tabular-nums">{bmr} kcal</span>
              </div>
              <div>
                <span className="text-slate-500 block">TDEE (Tổng ngày)</span>
                <span className="font-bold text-slate-800 tabular-nums">{tdee} kcal</span>
              </div>
              <div>
                <span className="text-slate-500 block">Bài tập hoàn thành</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {todayCalorieLog?.exercises.length ?? 0} bài
                </span>
              </div>
            </div>

            {/* Danh sách ngắn bài tập đã tập hôm nay */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Các bài tập đã hoàn thành hôm nay:
              </span>
              {todayCalorieLog && todayCalorieLog.exercises.length > 0 ? (
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {todayCalorieLog.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100"
                    >
                      <span className="text-slate-700 truncate max-w-[200px]">{ex.exerciseName}</span>
                      <span className="text-slate-500 tabular-nums shrink-0">
                        {ex.durationMinutes} phút · <strong className="text-orange-600">{ex.caloriesBurned} kcal</strong>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa có bài tập nào được ghi nhận hôm nay.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <button
              onClick={onNavigateToCalories}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              <span>+ Thêm bài tập / Nhật ký calo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-500">
              Mục tiêu PHCN an toàn
            </span>
          </div>
        </div>

      </div>

      {/* 3. Lời nhắc An toàn Phục hồi chức năng & Hướng dẫn y khoa */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-600 space-y-1">
            <h3 className="font-semibold text-slate-900">
              Quy Tắc An Toàn & Hiệu Quả Khi Phục Hồi Chức Năng Vận Động
            </h3>
            <p>
              • <strong>Kiểm soát cường độ:</strong> Không tập quá sức để đốt calo nhanh; duy trì bài tập ở ngưỡng mỏi cơ vừa phải, nhịp tim dưới 65-70% nhịp tim tối đa.
            </p>
            <p>
              • <strong>Thang điểm đau:</strong> Nếu cơn đau khớp vượt quá ngưỡng 4/10 hoặc xuất hiện sưng nóng đỏ, ngưng bài tập ngay và báo với Bác sĩ/Kỹ thuật viên điều trị.
            </p>
            <p>
              • <strong>Đánh giá định kỳ:</strong> Nên thực hiện kiểm tra Sức cơ MRC và Biên độ khớp ROM 1 đến 2 tuần một lần để cập nhật chính xác % hồi phục.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
