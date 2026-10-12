import React, { useState } from 'react';
import { PatientProfile, Gender, AffectedSide } from '../types';
import { calculateBMR, calculateRecommendedBurnTarget, calculateBMI } from '../utils/calculator';
import { User, X, Check, Activity } from 'lucide-react';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: PatientProfile) => void;
  existingPatient?: PatientProfile | null;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
  existingPatient,
}) => {
  const [name, setName] = useState<string>(existingPatient?.name || '');
  const [age, setAge] = useState<number>(existingPatient?.age || 45);
  const [gender, setGender] = useState<Gender>(existingPatient?.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(existingPatient?.heightCm || 165);
  const [weightKg, setWeightKg] = useState<number>(existingPatient?.weightKg || 60);
  const [diagnosis, setDiagnosis] = useState<string>(
    existingPatient?.diagnosis || 'Phục hồi chức năng sau chấn thương / tai biến'
  );
  const [affectedSide, setAffectedSide] = useState<AffectedSide>(
    existingPatient?.affectedSide || 'right'
  );
  const [startDate, setStartDate] = useState<string>(
    existingPatient?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [activityFactor, setActivityFactor] = useState<number>(
    existingPatient?.activityLevelFactor || 1.25
  );
  const [customBurnTarget, setCustomBurnTarget] = useState<number>(
    existingPatient?.customDailyBurnTarget || 300
  );
  const [notes, setNotes] = useState<string>(existingPatient?.notes || '');

  if (!isOpen) return null;

  // Tính toán chỉ số ước lượng
  const bmiInfo = calculateBMI(weightKg, heightCm);
  const estBmr = calculateBMR(weightKg, heightCm, age, gender);
  const recommendedBurn = calculateRecommendedBurnTarget(estBmr, activityFactor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientData: PatientProfile = {
      id: existingPatient ? existingPatient.id : `patient_${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      diagnosis: diagnosis.trim(),
      affectedSide,
      startDate,
      activityLevelFactor: Number(activityFactor),
      customDailyBurnTarget: Number(customBurnTarget) || recommendedBurn,
      notes: notes.trim(),
      createdAt: existingPatient ? existingPatient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSavePatient(patientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {existingPatient ? 'Chỉnh Sửa Hồ Sơ Bệnh Nhân' : 'Thêm Hồ Sơ Bệnh Nhân Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs sm:text-sm">
          {/* Tên & Tuổi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Họ và tên bệnh nhân *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trần Văn Bình..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tuổi *</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Giới tính & Bên tổn thương */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bên tổn thương</label>
              <select
                value={affectedSide}
                onChange={(e) => setAffectedSide(e.target.value as AffectedSide)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              >
                <option value="left">Bên trái</option>
                <option value="right">Bên phải</option>
                <option value="both">Cả hai bên</option>
                <option value="general">Toàn thân / Khác</option>
              </select>
            </div>
          </div>

          {/* Chiều cao & Cân nặng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Chiều cao (cm) *
              </label>
              <input
                type="number"
                required
                min="50"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Cân nặng (kg) *
              </label>
              <input
                type="number"
                required
                min="20"
                max="200"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Preview BMI & BMR */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">BMI tính toán:</span>
              <strong className="text-slate-800">{bmiInfo.bmi}</strong> ({bmiInfo.label})
            </div>
            <div>
              <span className="text-slate-500 block">BMR ước tính (Mifflin):</span>
              <strong className="text-slate-800">{estBmr} kcal/ngày</strong>
            </div>
          </div>

          {/* Chẩn đoán bệnh */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Chẩn đoán / Tình trạng vận động *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="VD: Sau mổ đứt dây chằng chéo trước ACL, Liệt nửa người do đột quỵ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
            />
          </div>

          {/* Ngày bắt đầu & Hệ số hoạt động */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ngày bắt đầu trị liệu
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Mức độ vận động (Hệ số PAL)
              </label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
              >
                <option value={1.2}>Tại giường / Ít vận động (1.20)</option>
                <option value={1.25}>Tập nhẹ / Bán cấp (1.25)</option>
                <option value={1.375}>Tập phục hồi vừa phải (1.375)</option>
                <option value={1.55}>Tập phục hồi tích cực (1.55)</option>
              </select>
            </div>
          </div>

          {/* Mục tiêu calo cần đốt hàng ngày */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mục tiêu lượng calo cần đốt từ bài tập (kcal/ngày)
            </label>
            <input
              type="number"
              min="50"
              max="1500"
              value={customBurnTarget}
              onChange={(e) => setCustomBurnTarget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Gợi ý y tế cho thể trạng này: ~{recommendedBurn} kcal/ngày
            </span>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Ghi chú bệnh án / Tiền sử bệnh
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tiền sử tăng huyết áp, tiểu đường, dị ứng thuốc, vị trí mổ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{existingPatient ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
