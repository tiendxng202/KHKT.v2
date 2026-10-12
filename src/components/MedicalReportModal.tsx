import React from 'react';
import { PatientProfile, MotorAssessment, DailyCalorieLog } from '../types';
import { calculateBMI, calculateBMR, calculateTDEE, getClinicalStageInfo } from '../utils/calculator';
import { Printer, X, Activity, Flame, Shield, CheckCircle } from 'lucide-react';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  latestAssessment?: MotorAssessment;
  todayLog?: DailyCalorieLog;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  latestAssessment,
  todayLog,
}) => {
  if (!isOpen) return null;

  const bmiInfo = calculateBMI(patient.weightKg, patient.heightCm);
  const bmr = calculateBMR(patient.weightKg, patient.heightCm, patient.age, patient.gender);
  const tdee = calculateTDEE(bmr, patient.activityLevelFactor);
  const recoveryPercent = latestAssessment ? latestAssessment.overallRecoveryPercent : 0;
  const stageInfo = getClinicalStageInfo(recoveryPercent);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
        {/* Header điều khiển (Không in) */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Bản Tóm Tắt & Phiếu Báo Cáo Phục Hồi Chức Năng
            </h3>
            <span className="text-xs text-slate-500">
              Định dạng chuẩn in khổ giấy A4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu / Xuất PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PHẦN NỘI DUNG BÁO CÁO Y KHOA (SẼ IN RA) */}
        <div className="space-y-6 text-slate-900 text-xs sm:text-sm">
          {/* Tiêu ngữ & Đơn vị y tế */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex justify-between items-start text-[11px] text-slate-600 mb-2">
              <div className="text-left font-medium">
                KHOA PHỤC HỒI CHỨC NĂNG & VẬT LÝ TRỊ LIỆU<br />
                TRUNG TÂM Y KHOA VẬN ĐỘNG TRỊ LIỆU
              </div>
              <div className="text-right">
                MÃ HỒ SƠ: <span className="font-mono font-bold">{patient.id}</span><br />
                NGÀY XUẤT: {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide mt-2 text-slate-900">
              PHIẾU LƯỢNG GIÁ CHỨC NĂNG VẬN ĐỘNG & NĂNG LƯỢNG TIÊU HAO
            </h1>
            <span className="text-xs text-slate-600 italic">
              (Thước đo chuẩn hoá Sức cơ MRC, Biên độ khớp ROM & Hệ số tiêu hao năng lượng MET)
            </span>
          </div>

          {/* 1. Hành chính bệnh nhân */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded mb-2">
              I. THÔNG TIN HÀNH CHÍNH BỆNH NHÂN
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-relaxed">
              <div>
                <span className="text-slate-500">Họ và tên:</span>
                <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Tuổi / Giới tính:</span>
                <p className="font-semibold text-slate-800">
                  {patient.age} tuổi · {patient.gender === 'male' ? 'Nam' : 'Nữ'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Chiều cao / Cân nặng:</span>
                <p className="font-semibold text-slate-800 tabular-nums">
                  {patient.heightCm} cm · {patient.weightKg} kg (BMI: {bmiInfo.bmi} - {bmiInfo.label})
                </p>
              </div>
              <div>
                <span className="text-slate-500">Bên tổn thương:</span>
                <p className="font-semibold text-slate-800">
                  {patient.affectedSide === 'left' ? 'Bên trái' : patient.affectedSide === 'right' ? 'Bên phải' : patient.affectedSide === 'both' ? 'Cả hai bên' : 'Toàn thân'}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-500">Chẩn đoán lâm sàng:</span>
                <p className="font-bold text-slate-900">{patient.diagnosis}</p>
              </div>
              <div>
                <span className="text-slate-500">Ngày bắt đầu PHCN:</span>
                <p className="font-semibold text-slate-800">
                  {new Date(patient.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Kết quả % Phục hồi vận động */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded mb-2">
              II. KẾT QUẢ ĐÁNH GIÁ TỈ LỆ % PHỤC HỒI CHỨC NĂNG VẬN ĐỘNG
            </h2>

            {latestAssessment ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">TỈ LỆ PHỤC HỒI VẬN ĐỘNG TOÀN DIỆN</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-teal-800 tabular-nums">
                        {latestAssessment.overallRecoveryPercent}%
                      </span>
                      <span className="text-xs font-bold text-teal-700">
                        ({latestAssessment.clinicalStage})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Đánh giá ngày: {new Date(latestAssessment.date).toLocaleDateString('vi-VN')} · Người lượng giá: {latestAssessment.assessorName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs shrink-0 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">1. Sức cơ MRC</span>
                      <span className="font-extrabold text-slate-800 tabular-nums">
                        {latestAssessment.mrcRecoveryPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">2. Biên độ ROM</span>
                      <span className="font-extrabold text-slate-800 tabular-nums">
                        {latestAssessment.romRecoveryPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">3. Độc lập ADL</span>
                      <span className="font-extrabold text-slate-800 tabular-nums">
                        {latestAssessment.mobilityRecoveryPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <span className="font-bold text-slate-900 block mb-1">
                      Nhận xét sức cơ & biên độ khớp:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {latestAssessment.clinicalNotes || 'Tiến triển vận động đều đặn, không có biểu hiện teo cơ hoặc cứng khớp nghiêm trọng.'}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3">
                    <span className="font-bold text-slate-900 block mb-1">
                      Khuyến nghị can thiệp tiếp theo:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {stageInfo.clinicalAdvice}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs">Chưa có kết quả lượng giá phục hồi.</p>
            )}
          </div>

          {/* 3. Lượng calo đã đốt / Cần đốt */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded mb-2">
              III. THEO DÕI NĂNG LƯỢNG TIÊU HAO & CALO TẬP LUYỆN TRONG NGÀY
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-500 block">BMR (Chuyển hoá cơ bản):</span>
                <span className="font-bold text-slate-800 tabular-nums">{bmr} kcal/ngày</span>
              </div>
              <div>
                <span className="text-slate-500 block">TDEE (Tổng tiêu thụ):</span>
                <span className="font-bold text-slate-800 tabular-nums">{tdee} kcal/ngày</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mục tiêu Calo cần đốt:</span>
                <span className="font-bold text-orange-700 tabular-nums">
                  {patient.customDailyBurnTarget || 300} kcal/ngày
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Calo đã đốt hôm nay:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {todayLog?.totalBurnedCalories ?? 0} kcal
                </span>
              </div>
            </div>

            {todayLog && todayLog.exercises.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Các bài tập vận động đã hoàn thành:
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2">Tên bài tập</th>
                        <th className="p-2">Thời lượng</th>
                        <th className="p-2">Hệ số MET</th>
                        <th className="p-2 text-right">Calo đốt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayLog.exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="p-2 font-medium text-slate-800">{ex.exerciseName}</td>
                          <td className="p-2 text-slate-600">{ex.durationMinutes} phút</td>
                          <td className="p-2 text-slate-600">{ex.metValue}</td>
                          <td className="p-2 text-right font-bold text-orange-600">{ex.caloriesBurned} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Ký tên xác nhận */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800">NGƯỜI BỆNH / THÂN NHÂN</p>
              <p className="text-slate-400 italic text-[11px]">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>
            <div>
              <p className="font-bold text-slate-800">BÁC SĨ / KTV TRƯỞNG LƯỢNG GIÁ</p>
              <p className="text-slate-400 italic text-[11px]">(Ký, đóng dấu và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-800">
                {latestAssessment?.assessorName || 'BS. Chuyên Khoa Phục Hồi Chức Năng'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
