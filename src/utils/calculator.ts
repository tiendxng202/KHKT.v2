import {
  Gender,
  MRCMuscleTest,
  JointROMTest,
  FunctionalMobilityTest,
} from '../types';

/**
 * Tính tỉ lệ trao đổi chất cơ bản (BMR) theo công thức chuẩn y khoa Mifflin-St Jeor
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  if (!weightKg || !heightCm || !age) return 0;
  // Nam: 10 * W + 6.25 * H - 5 * A + 5
  // Nữ:  10 * W + 6.25 * H - 5 * A - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(Math.max(bmr, 500));
}

/**
 * Tính tổng năng lượng tiêu hao cả ngày (TDEE)
 */
export function calculateTDEE(bmr: number, activityFactor: number): number {
  return Math.round(bmr * (activityFactor || 1.2));
}

/**
 * Tính mục tiêu lượng calo cần đốt hàng ngày từ bài tập phục hồi chức năng
 * Dựa trên thể trạng an toàn không gây quá tải khớp/tim mạch
 */
export function calculateRecommendedBurnTarget(
  bmr: number,
  activityFactor: number,
  customTarget?: number
): number {
  if (customTarget && customTarget > 0) return customTarget;
  // Bệnh nhân PHCN: 18% - 25% BMR là mức tập tối ưu kích thích thần kinh cơ
  const factor = activityFactor >= 1.35 ? 0.22 : 0.18;
  return Math.round(Math.max(bmr * factor, 150));
}

/**
 * Tính lượng calo tiêu hao từ bài tập dựa trên chỉ số MET chuẩn y học thể thao
 * Calo (kcal) = MET * Cân nặng (kg) * (Thời gian (phút) / 60)
 */
export function calculateExerciseCalories(
  metValue: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (!metValue || !weightKg || !durationMinutes) return 0;
  const cal = metValue * weightKg * (durationMinutes / 60);
  return Math.round(cal);
}

/**
 * Tính chỉ số khối cơ thể BMI và phân loại theo tiêu chuẩn IDI & WPRO (Châu Á)
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  label: string;
  colorClass: string;
} {
  if (!weightKg || !heightCm) {
    return { bmi: 0, label: 'Chưa có dữ liệu', colorClass: 'text-slate-500' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, label: 'Thiếu cân (Nhẹ cân)', colorClass: 'text-amber-600' };
  } else if (bmi <= 22.9) {
    return { bmi, label: 'Bình thường (Lý tưởng)', colorClass: 'text-emerald-600' };
  } else if (bmi <= 24.9) {
    return { bmi, label: 'Tiền béo phì (Thừa cân)', colorClass: 'text-amber-600' };
  } else {
    return { bmi, label: 'Béo phì', colorClass: 'text-rose-600' };
  }
}

/**
 * 1. Tính tỉ lệ % Phục hồi Sức cơ MRC (Medical Research Council)
 */
export function calculateMRCPercent(mrcTests: MRCMuscleTest[]): number {
  if (!mrcTests || mrcTests.length === 0) return 0;
  const totalScore = mrcTests.reduce((acc, curr) => acc + curr.score, 0);
  const maxScore = mrcTests.reduce((acc, curr) => acc + curr.normalScore, 0);
  if (maxScore === 0) return 0;
  return Number(((totalScore / maxScore) * 100).toFixed(1));
}

/**
 * 2. Tính tỉ lệ % Biên độ vận động khớp ROM (Range of Motion)
 */
export function calculateROMPercent(romTests: JointROMTest[]): number {
  if (!romTests || romTests.length === 0) return 0;
  let totalPercent = 0;
  for (const test of romTests) {
    const ratio = Math.min(test.currentAngle / (test.normalAngle || 1), 1.0);
    totalPercent += ratio * 100;
  }
  return Number((totalPercent / romTests.length).toFixed(1));
}

/**
 * 3. Tính tỉ lệ % Độc lập vận động & di chuyển (Functional Mobility Index)
 */
export function calculateMobilityPercent(mobilityTests: FunctionalMobilityTest[]): number {
  if (!mobilityTests || mobilityTests.length === 0) return 0;
  const totalScore = mobilityTests.reduce((acc, curr) => acc + curr.score, 0);
  const maxScore = mobilityTests.reduce((acc, curr) => acc + curr.maxScore, 0);
  if (maxScore === 0) return 0;
  return Number(((totalScore / maxScore) * 100).toFixed(1));
}

/**
 * 4. Tính tỉ lệ % Phục hồi Chức năng Vận động Toàn diện (Overall Motor Recovery %)
 * Trọng số chuẩn y tế:
 * - Sức cơ MRC: 40% (Trụ cột co cơ)
 * - Biên độ khớp ROM: 30% (Độ trơn tru ổ khớp)
 * - Độc lập di chuyển: 30% (Chức năng sinh hoạt thực tế)
 */
export function calculateOverallRecoveryPercent(
  mrcPercent: number,
  romPercent: number,
  mobilityPercent: number,
  weights = { mrc: 0.4, rom: 0.3, mobility: 0.3 }
): number {
  const overall =
    mrcPercent * weights.mrc +
    romPercent * weights.rom +
    mobilityPercent * weights.mobility;
  return Number(Math.min(Math.max(overall, 0), 100).toFixed(1));
}

/**
 * Phân giai đoạn phục hồi lâm sàng và khuyến nghị can thiệp
 */
export function getClinicalStageInfo(recoveryPercent: number): {
  stageTitle: string;
  badgeColor: string;
  description: string;
  clinicalAdvice: string;
} {
  if (recoveryPercent < 25) {
    return {
      stageTitle: 'Giai đoạn Tổn thương Nặng / Phụ thuộc Hoàn toàn (0 - 24%)',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Cơ lực mức 0-2, chưa thắng được trọng lực, biên độ khớp hạn chế rõ rệt, cần người chăm sóc trợ giúp hoàn toàn.',
      clinicalAdvice: 'Tập trung chống loét tì đè, vận động thụ động các khớp nhẹ nhàng 2-3 lần/ngày, gồng cơ tĩnh bảo vệ ổ khớp.',
    };
  } else if (recoveryPercent < 50) {
    return {
      stageTitle: 'Giai đoạn Phục hồi Ban đầu / Cần Trợ giúp Nhiều (25 - 49%)',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Đã xuất hiện co cơ chủ động, thắng được trọng lực ở một số tư thế, cần hỗ trợ khi chuyển tư thế và đi lại.',
      clinicalAdvice: 'Tập chủ động có trợ giúp (AAROM), tập đứng có vịn hoặc khung tập đi, tập thăng bằng ngồi vững.',
    };
  } else if (recoveryPercent < 75) {
    return {
      stageTitle: 'Giai đoạn Phục hồi Khá / Tự chủ Một phần (50 - 74%)',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      description: 'Cơ lực đạt mức 3-4, di chuyển được với gậy/nạng hoặc độc lập cự ly ngắn, tự chăm sóc bản thân cơ bản.',
      clinicalAdvice: 'Gia tăng bài tập kháng lực với dây đàn hồi hoặc tạ nhẹ, tăng cường đạp xe tĩnh và tập dáng đi chuẩn xác.',
    };
  } else if (recoveryPercent < 90) {
    return {
      stageTitle: 'Giai đoạn Phục hồi Tốt / Độc lập Phần lớn (75 - 89%)',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Sức cơ và biên độ khớp gần như bình thường, di chuyển độc lập, sinh hoạt hàng ngày tự chủ.',
      clinicalAdvice: 'Rèn luyện thăng bằng động nâng cao, bước bậc thang, tăng lượng calo vận động để tái hòa nhập cộng đồng.',
    };
  } else {
    return {
      stageTitle: 'Giai đoạn Phục hồi Xuất sắc / Hoàn thiện (90 - 100%)',
      badgeColor: 'text-teal-700 bg-teal-50 border-teal-200',
      description: 'Chức năng vận động tương đương người bình thường, phản xạ và thăng bằng ổn định vững vàng.',
      clinicalAdvice: 'Duy trì chế độ tập luyện thể lực hàng ngày, phòng ngừa tái phát chấn thương.',
    };
  }
}
