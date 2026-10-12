import React, { useState } from 'react';
import {
  PatientProfile,
  DailyCalorieLog,
  LoggedExercise,
  RehabExerciseItem,
} from '../types';
import { REHAB_EXERCISES_LIBRARY } from '../constants/rehabData';
import {
  calculateBMR,
  calculateTDEE,
  calculateRecommendedBurnTarget,
  calculateExerciseCalories,
} from '../utils/calculator';
import {
  Flame,
  Plus,
  Trash2,
  Clock,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Zap,
  Target,
  Dumbbell,
  Calendar,
} from 'lucide-react';

interface CalorieTrackerProps {
  patient: PatientProfile;
  calorieLogs: DailyCalorieLog[];
  onUpdateDailyLog: (log: DailyCalorieLog) => void;
  onUpdatePatientCustomTarget: (newTarget: number) => void;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  patient,
  calorieLogs,
  onUpdateDailyLog,
  onUpdatePatientCustomTarget,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Lọc bài tập
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form thêm bài tập tuỳ chỉnh
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customMet, setCustomMet] = useState<number>(3.0);
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [customNote, setCustomNote] = useState<string>('');

  // Form thêm nhanh từ thư viện
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(20);
  const [exerciseNote, setExerciseNote] = useState<string>('');

  // Chỉnh sửa mục tiêu calo
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<number>(
    patient.customDailyBurnTarget || 300
  );

  // Tính toán chỉ số calo nền tảng
  const bmr = calculateBMR(patient.weightKg, patient.heightCm, patient.age, patient.gender);
  const tdee = calculateTDEE(bmr, patient.activityLevelFactor);
  const targetBurn = calculateRecommendedBurnTarget(
    bmr,
    patient.activityLevelFactor,
    patient.customDailyBurnTarget
  );

  // Lấy nhật ký của ngày đang chọn hoặc tạo cấu trúc rỗng
  const currentLog = calorieLogs.find(
    (l) => l.patientId === patient.id && l.date === selectedDate
  ) || {
    id: `log_${patient.id}_${selectedDate}`,
    patientId: patient.id,
    date: selectedDate,
    bmr,
    tdee,
    targetActiveBurnCalories: targetBurn,
    totalBurnedCalories: 0,
    exercises: [],
    notes: '',
  };

  const totalBurned = currentLog.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const progressPercent = Math.min(Math.round((totalBurned / (targetBurn || 1)) * 100), 100);
  const remainingCalories = Math.max(targetBurn - totalBurned, 0);

  // Danh mục bài tập
  const categories = [
    { id: 'all', label: 'Tất cả bài tập' },
    { id: 'passive', label: 'Tại giường / Thụ động' },
    { id: 'bed_chair', label: 'Co cơ & Khớp' },
    { id: 'gait', label: 'Dáng đi & Đi bộ' },
    { id: 'aerobic', label: 'Thiết bị & Đạp xe' },
    { id: 'strength', label: 'Kháng lực & Tạ' },
    { id: 'balance', label: 'Thăng bằng' },
    { id: 'hydro', label: 'Thuỷ trị liệu' },
  ];

  // Lọc bài tập
  const filteredExercises = REHAB_EXERCISES_LIBRARY.filter((ex) => {
    const matchCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Thêm bài tập từ thư viện
  const handleAddExerciseFromLibrary = (exercise: RehabExerciseItem) => {
    const minutes = exerciseMinutes > 0 ? exerciseMinutes : exercise.recommendedMinutes;
    const calories = calculateExerciseCalories(exercise.metValue, patient.weightKg, minutes);
    const nowTime = new Date().toTimeString().slice(0, 5);

    const newLoggedExercise: LoggedExercise = {
      id: `ex_log_${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      categoryLabel: exercise.categoryLabel,
      durationMinutes: minutes,
      metValue: exercise.metValue,
      caloriesBurned: calories,
      completedAt: nowTime,
      notes: exerciseNote || undefined,
    };

    const updatedExercises = [...currentLog.exercises, newLoggedExercise];
    const newTotalBurned = updatedExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    const updatedLog: DailyCalorieLog = {
      ...currentLog,
      totalBurnedCalories: newTotalBurned,
      exercises: updatedExercises,
    };

    onUpdateDailyLog(updatedLog);
    setSelectedExerciseId(null);
    setExerciseNote('');
    setExerciseMinutes(20);
  };

  // Thêm bài tập tuỳ chỉnh
  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const calories = calculateExerciseCalories(customMet, patient.weightKg, customMinutes);
    const nowTime = new Date().toTimeString().slice(0, 5);

    const newLoggedExercise: LoggedExercise = {
      id: `ex_log_${Date.now()}`,
      exerciseId: `custom_${Date.now()}`,
      exerciseName: customName.trim(),
      categoryLabel: 'Bài tập tuỳ chỉnh',
      durationMinutes: customMinutes,
      metValue: customMet,
      caloriesBurned: calories,
      completedAt: nowTime,
      notes: customNote.trim() || undefined,
    };

    const updatedExercises = [...currentLog.exercises, newLoggedExercise];
    const newTotalBurned = updatedExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    const updatedLog: DailyCalorieLog = {
      ...currentLog,
      totalBurnedCalories: newTotalBurned,
      exercises: updatedExercises,
    };

    onUpdateDailyLog(updatedLog);
    setShowCustomModal(false);
    setCustomName('');
    setCustomMet(3.0);
    setCustomMinutes(20);
    setCustomNote('');
  };

  // Xoá bài tập khỏi nhật ký
  const handleDeleteExercise = (logId: string) => {
    const updatedExercises = currentLog.exercises.filter((e) => e.id !== logId);
    const newTotalBurned = updatedExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    const updatedLog: DailyCalorieLog = {
      ...currentLog,
      totalBurnedCalories: newTotalBurned,
      exercises: updatedExercises,
    };

    onUpdateDailyLog(updatedLog);
  };

  // Cập nhật mục tiêu calo tuỳ chỉnh
  const handleSaveTarget = () => {
    if (tempTarget > 0) {
      onUpdatePatientCustomTarget(tempTarget);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Thanh Tổng Hợp Tiến Độ Calo Đã Đốt / Cần Đốt trong ngày */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800">
                Theo Dõi Năng Lượng Phục Hồi Chức Năng
              </span>
              <span className="text-xs text-slate-500">
                Cân nặng áp dụng: <strong className="text-slate-800 tabular-nums">{patient.weightKg} kg</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Lượng Calo Đã Đốt / Cần Đốt Trong Ngày
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Tính toán tự động theo công thức y học thể thao MET (Metabolic Equivalent of Task)
            </p>
          </div>

          {/* Chọn ngày theo dõi */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600 font-medium">Ngày xem:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Khối hiển thị tiến độ calo lớn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* Cột 1 & 2: Tiến độ calo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tiến độ calo vận động trong ngày
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums">
                    {totalBurned}
                  </span>
                  <span className="text-2xl font-light text-slate-400">/</span>
                  <span className="text-3xl font-extrabold text-slate-700 tabular-nums">
                    {targetBurn}
                  </span>
                  <span className="text-base font-bold text-orange-600">kcal</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                  progressPercent >= 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {progressPercent >= 100 ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Đạt {progressPercent}% mục tiêu!</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5" />
                      <span>Đã hoàn thành {progressPercent}%</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  {remainingCalories > 0
                    ? `Còn thiếu ${remainingCalories} kcal để hoàn thành mục tiêu`
                    : `Đã vượt mục tiêu ${totalBurned - targetBurn} kcal`}
                </span>
              </div>
            </div>

            {/* Thanh tiến độ trực quan */}
            <div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    progressPercent >= 100 ? 'bg-emerald-600' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Thống kê BMR & TDEE */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">BMR (Trao đổi chất cơ bản)</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{bmr} kcal</span>
                <span className="text-[11px] text-slate-400 block">Tiêu thụ khi nghỉ ngơi</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">TDEE (Tổng năng lượng ngày)</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{tdee} kcal</span>
                <span className="text-[11px] text-slate-400 block">BMR × Hệ số {patient.activityLevelFactor}</span>
              </div>

              <div className="p-3 bg-orange-50/60 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center">
                  <span className="text-orange-900 block font-medium">Mục tiêu cần đốt</span>
                  <button
                    onClick={() => {
                      setTempTarget(targetBurn);
                      setIsEditingTarget(!isEditingTarget);
                    }}
                    className="text-[11px] text-orange-700 underline hover:text-orange-900"
                  >
                    {isEditingTarget ? 'Đóng' : 'Sửa'}
                  </button>
                </div>
                <span className="text-base font-bold text-orange-900 tabular-nums">{targetBurn} kcal</span>
                <span className="text-[11px] text-orange-700/80 block">Từ bài tập PHCN</span>
              </div>
            </div>

            {/* Form sửa mục tiêu calo nếu cần */}
            {isEditingTarget && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3 text-xs">
                <span className="text-slate-700 font-medium">Đặt mục tiêu mới (kcal/ngày):</span>
                <input
                  type="number"
                  min="50"
                  max="1500"
                  step="10"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-slate-800"
                />
                <button
                  onClick={handleSaveTarget}
                  className="px-3 py-1 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800"
                >
                  Lưu mục tiêu
                </button>
              </div>
            )}
          </div>

          {/* Cột 3: Công thức tính toán & Giải thích MET */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between text-xs space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Công thức tính Calo chuẩn y học</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Lượng calo tiêu hao của từng bài tập được tính chính xác dựa trên hệ số MET (Đương lượng chuyển hoá năng lượng):
              </p>
              <div className="p-2 bg-white rounded border border-slate-200 my-2 text-center font-mono text-[11px] font-bold text-slate-800">
                Calo = MET × Cân nặng (kg) × (Thời gian / 60)
              </div>
              <p className="text-slate-500 text-[11px]">
                Ví dụ: Bệnh nhân {patient.weightKg}kg đạp xe tập PHCN (MET 3.0) trong 20 phút sẽ đốt chính xác:
                <br />
                <span className="font-semibold text-slate-700">3.0 × {patient.weightKg} × (20/60) = {calculateExerciseCalories(3.0, patient.weightKg, 20)} kcal</span>.
              </p>
            </div>

            <button
              onClick={() => setShowCustomModal(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300 transition-colors text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm bài tập tuỳ biến</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Danh Sách Bài Tập Đã Tập Trong Ngày */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">
              Nhật Ký Bài Tập Trong Ngày ({currentLog.exercises.length} bài đã hoàn thành)
            </h3>
          </div>

          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            Tổng cộng: <strong className="text-orange-600 text-sm">{totalBurned} kcal</strong>
          </span>
        </div>

        {currentLog.exercises.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Chưa có bài tập nào được ghi nhận cho ngày này.</p>
            <p className="text-slate-400 mt-0.5">
              Hãy chọn bài tập từ thư viện phía dưới để thêm vào nhật ký calo của bệnh nhân.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {currentLog.exercises.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.completedAt}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.exerciseName}</h4>
                    <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                      <span>{item.categoryLabel}</span>
                      <span>·</span>
                      <span>Hệ số MET: <strong>{item.metValue}</strong></span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-600">"{item.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-10 sm:pl-0">
                  <div className="text-right">
                    <span className="text-base font-black text-orange-600 tabular-nums">
                      +{item.caloriesBurned} kcal
                    </span>
                    <span className="text-slate-500 text-xs block tabular-nums">
                      {item.durationMinutes} phút tập
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteExercise(item.id)}
                    title="Xoá bài tập này"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Thư Viện Bài Tập Phục Hồi Chức Năng (Tra Cứu & Thêm Nhanh) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-teal-700" />
              <span>Thư Viện Bài Tập Phục Hồi Chức Năng & Tra Cứu MET</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn bài tập để tự động tính calo tiêu hao dựa trên cân nặng {patient.weightKg}kg của bệnh nhân
            </p>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm bài tập, dụng cụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Bộ lọc danh mục bài tập */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lưới các bài tập */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExerciseId === exercise.id;
            const currentMins = isSelected ? exerciseMinutes : exercise.recommendedMinutes;
            const estimatedCal = calculateExerciseCalories(
              exercise.metValue,
              patient.weightKg,
              currentMins
            );

            return (
              <div
                key={exercise.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {exercise.categoryLabel}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      MET: {exercise.metValue}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {exercise.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">
                      Thời lượng: <strong>{currentMins} phút</strong>
                    </span>
                    <span className="font-extrabold text-orange-600 text-sm tabular-nums">
                      ~{estimatedCal} kcal
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="space-y-2 bg-white p-2.5 rounded-lg border border-teal-200 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="text-slate-600 font-medium">Thời gian tập:</label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={exerciseMinutes}
                          onChange={(e) => setExerciseMinutes(Math.max(1, Number(e.target.value)))}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded"
                        />
                        <span className="text-slate-500">phút</span>
                      </div>

                      <input
                        type="text"
                        placeholder="Ghi chú bài tập (tuỳ chọn)..."
                        value={exerciseNote}
                        onChange={(e) => setExerciseNote(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-700 text-xs"
                      />

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedExerciseId(null)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
                        >
                          Huỷ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddExerciseFromLibrary(exercise)}
                          className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Lưu vào ngày</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExerciseId(exercise.id);
                        setExerciseMinutes(exercise.recommendedMinutes);
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chọn bài này</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Thêm Bài Tập Tuỳ Chỉnh */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Bài Tập Tuỳ Chỉnh Mới
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomExercise} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên bài tập vận động:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tập bước cầu thang 3 bậc, Bóp bóng cao su..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Hệ số MET ước lượng:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="12.0"
                    required
                    value={customMet}
                    onChange={(e) => setCustomMet(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    (Nhẹ: 1.5 - 2.5 | Vừa: 3.0 - 4.5)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Thời gian tập (phút):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg text-orange-950 font-medium">
                Ước tính tiêu hao:{' '}
                <strong className="text-orange-700 tabular-nums">
                  {calculateExerciseCalories(customMet, patient.weightKg, customMinutes)} kcal
                </strong>{' '}
                (với cân nặng {patient.weightKg}kg)
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Ghi chú lâm sàng / cảm nhận của bệnh nhân:
                </label>
                <input
                  type="text"
                  placeholder="VD: Cảm giác mỏi cơ nhẹ, không đau khớp..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg"
                >
                  Thêm vào nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
