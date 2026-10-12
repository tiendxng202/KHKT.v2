import React, { useState } from 'react';
import {
  PatientProfile,
  MotorAssessment,
  DailyCalorieLog,
} from '../types';
import {
  Activity,
  Flame,
  Calendar,
  TrendingUp,
  Clock,
  Trash2,
  ChevronRight,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface HistoryTrendProps {
  patient: PatientProfile;
  assessments: MotorAssessment[];
  calorieLogs: DailyCalorieLog[];
  onDeleteAssessment: (id: string) => void;
  onNavigateToRecovery: () => void;
}

export const HistoryTrend: React.FC<HistoryTrendProps> = ({
  patient,
  assessments,
  calorieLogs,
  onDeleteAssessment,
  onNavigateToRecovery,
}) => {
  const [activeSubView, setActiveSubView] = useState<'recovery_trend' | 'calorie_trend'>('recovery_trend');

  // Lọc các lần đánh giá của bệnh nhân này và sắp xếp theo ngày tăng dần cho biểu đồ
  const patientAssessments = [...assessments]
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Đảo ngược danh sách cho bảng hiển thị (mới nhất lên đầu)
  const sortedAssessmentsDescending = [...patientAssessments].reverse();

  // Lọc nhật ký calo của bệnh nhân này
  const patientCalorieLogs = [...calorieLogs]
    .filter((l) => l.patientId === patient.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sortedCalorieLogsDescending = [...patientCalorieLogs].reverse();

  // Tính tổng tiến bộ phục hồi từ lần đầu tới lần mới nhất
  const firstAssessment = patientAssessments[0];
  const latestAssessment = patientAssessments[patientAssessments.length - 1];
  const overallImprovement =
    firstAssessment && latestAssessment && patientAssessments.length > 1
      ? Number((latestAssessment.overallRecoveryPercent - firstAssessment.overallRecoveryPercent).toFixed(1))
      : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Bộ chuyển đổi góc nhìn */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Lịch Sử Đánh Giá & Xu Hướng Tiến Triển
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi quá trình hồi phục chức năng vận động và lượng năng lượng đốt theo thời gian
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveSubView('recovery_trend')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubView === 'recovery_trend'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tiến trình % Phục hồi ({patientAssessments.length})
            </button>
            <button
              onClick={() => setActiveSubView('calorie_trend')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubView === 'calorie_trend'
                  ? 'bg-white text-orange-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch sử Calo Đốt ({patientCalorieLogs.length})
            </button>
          </div>
        </div>

        {/* Thẻ thành tựu tiến bộ tổng thể */}
        {overallImprovement !== null && overallImprovement > 0 && (
          <div className="mt-4 p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-teal-950 block">
                  Tiến Bộ Vận Động Đáng Kể: +{overallImprovement}% Phục Hồi
                </span>
                <span className="text-teal-800 text-xs">
                  Từ mức {firstAssessment.overallRecoveryPercent}% (ngày {new Date(firstAssessment.date).toLocaleDateString('vi-VN')}) lên đến {latestAssessment.overallRecoveryPercent}% (ngày {new Date(latestAssessment.date).toLocaleDateString('vi-VN')}).
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToRecovery}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs shrink-0 whitespace-nowrap"
            >
              Đánh giá lần mới
            </button>
          </div>
        )}
      </div>

      {/* 2. GIAO DIỆN XU HƯỚNG % PHỤC HỒI */}
      {activeSubView === 'recovery_trend' && (
        <div className="space-y-6">
          {/* Biểu đồ dòng thời gian trực quan các lần đánh giá */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-700" />
              <span>Biểu Đồ Tiến Triển % Phục Hồi Vận Động</span>
            </h3>

            {patientAssessments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có dữ liệu đánh giá phục hồi nào cho bệnh nhân này.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Dãy cột phần trăm trực quan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {patientAssessments.map((a, idx) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                          <span>Đợt {idx + 1}</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(a.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-3xl font-black text-teal-800 tabular-nums">
                            {a.overallRecoveryPercent}%
                          </span>
                          <span className="text-xs text-teal-600 font-bold">hồi phục</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${a.overallRecoveryPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Sức cơ MRC:</span>
                          <strong className="tabular-nums">{a.mrcRecoveryPercent}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Biên độ ROM:</span>
                          <strong className="tabular-nums">{a.romRecoveryPercent}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Độc lập ADL:</span>
                          <strong className="tabular-nums">{a.mobilityRecoveryPercent}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bảng chi tiết các lần đánh giá */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Bảng Lưu Trữ Nhật Ký Đánh Giá Lâm Sàng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3">Ngày đánh giá</th>
                    <th className="py-3 px-3">Người lượng giá</th>
                    <th className="py-3 px-3 text-center">% Sức Cơ</th>
                    <th className="py-3 px-3 text-center">% ROM</th>
                    <th className="py-3 px-3 text-center">% Độc Lập</th>
                    <th className="py-3 px-3 text-center">% Tổng Hợp</th>
                    <th className="py-3 px-3">Phân loại lâm sàng</th>
                    <th className="py-3 px-3">Ghi chú</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAssessmentsDescending.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.assessorName}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                        {item.mrcRecoveryPercent}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                        {item.romRecoveryPercent}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                        {item.mobilityRecoveryPercent}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded tabular-nums">
                          {item.overallRecoveryPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-[200px] truncate">
                        {item.clinicalStage}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-[220px] truncate">
                        {item.clinicalNotes || '—'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteAssessment(item.id)}
                          title="Xoá lần đánh giá này"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. GIAO DIỆN LỊCH SỬ CALO ĐỐT */}
      {activeSubView === 'calorie_trend' && (
        <div className="space-y-6">
          {/* Biểu đồ các ngày gần nhất */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-600" />
              <span>Theo Dõi Năng Lượng Đốt Hàng Ngày (Kcal)</span>
            </h3>

            {patientCalorieLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có dữ liệu nhật ký calo nào.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {patientCalorieLogs.map((log) => {
                    const ratio = Math.round((log.totalBurnedCalories / (log.targetActiveBurnCalories || 1)) * 100);
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-slate-800">
                            {new Date(log.date).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            ratio >= 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {ratio}%
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-3xl font-black text-slate-900 tabular-nums">
                            {log.totalBurnedCalories}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            / {log.targetActiveBurnCalories} kcal
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-2 my-2">
                          <div
                            className={`h-2 rounded-full ${ratio >= 100 ? 'bg-emerald-600' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>

                        <span className="text-[11px] text-slate-500 block">
                          Đã thực hiện {log.exercises.length} bài tập PHCN
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bảng chi tiết nhật ký calo */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Lịch Sử Nhật Ký Tiêu Hao Năng Lượng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3">Ngày</th>
                    <th className="py-3 px-3 text-center">BMR (kcal)</th>
                    <th className="py-3 px-3 text-center">TDEE (kcal)</th>
                    <th className="py-3 px-3 text-center">Mục tiêu đốt</th>
                    <th className="py-3 px-3 text-center">Thực tế đã đốt</th>
                    <th className="py-3 px-3 text-center">Tỉ lệ đạt</th>
                    <th className="py-3 px-3">Số bài tập</th>
                    <th className="py-3 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCalorieLogsDescending.map((log) => {
                    const ratio = Math.round((log.totalBurnedCalories / (log.targetActiveBurnCalories || 1)) * 100);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 tabular-nums">
                          {log.bmr}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 tabular-nums">
                          {log.tdee}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                          {log.targetActiveBurnCalories}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-extrabold text-orange-600 tabular-nums">
                            {log.totalBurnedCalories} kcal
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                            ratio >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {ratio}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {log.exercises.length} bài
                        </td>
                        <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
