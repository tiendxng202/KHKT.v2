export type Gender = 'male' | 'female';
export type AffectedSide = 'left' | 'right' | 'both' | 'general';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  diagnosis: string;
  affectedSide: AffectedSide;
  startDate: string;
  notes: string;
  activityLevelFactor: number; // 1.2 (nằm liệt/nghỉ ngơi), 1.375 (nhẹ), 1.55 (vừa)
  customDailyBurnTarget?: number; // Calo vận động cần đốt mong muốn nếu tuỳ chỉnh
  createdAt: string;
  updatedAt: string;
}

// 1. Sức cơ MRC (Medical Research Council Scale 0-5)
export interface MRCMuscleTest {
  id: string;
  name: string;
  region: 'upper' | 'lower'; // Chi trên / Chi dưới
  normalScore: 5;
  score: number; // 0 to 5
  notes?: string;
}

// 2. Biên độ khớp ROM (Range of Motion)
export interface JointROMTest {
  id: string;
  jointName: string;
  movement: string; // Gập, Duỗi, Dạng, Áp...
  normalAngle: number; // Độ chuẩn sinh lý bình thường
  currentAngle: number; // Góc hiện tại đạt được (độ)
  unit: string;
}

// 3. Độc lập vận động & Chức năng sinh hoạt (Mobility & Functional Independence)
export interface FunctionalMobilityTest {
  id: string;
  taskName: string;
  category: 'bed' | 'transfer' | 'balance' | 'gait' | 'adl';
  maxScore: number;
  score: number; // 0 to maxScore
  description: string;
}

// Lần đánh giá phục hồi chức năng
export interface MotorAssessment {
  id: string;
  patientId: string;
  date: string;
  assessorName: string;
  mrcTests: MRCMuscleTest[];
  romTests: JointROMTest[];
  mobilityTests: FunctionalMobilityTest[];
  mrcRecoveryPercent: number;
  romRecoveryPercent: number;
  mobilityRecoveryPercent: number;
  overallRecoveryPercent: number;
  clinicalStage: string;
  clinicalNotes: string;
}

// Bài tập phục hồi chức năng & Calo
export interface RehabExerciseItem {
  id: string;
  name: string;
  category: 'passive' | 'bed_chair' | 'strength' | 'gait' | 'aerobic' | 'balance' | 'hydro';
  categoryLabel: string;
  metValue: number; // Hệ số chuyển hoá năng lượng MET
  description: string;
  intensityLabel: 'Rất nhẹ' | 'Nhẹ' | 'Vừa phải' | 'Tích cực';
  recommendedMinutes: number;
}

// Nhật ký bài tập đã thực hiện
export interface LoggedExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  categoryLabel: string;
  durationMinutes: number;
  metValue: number;
  caloriesBurned: number;
  completedAt: string; // HH:mm
  notes?: string;
}

// Nhật ký calo từng ngày
export interface DailyCalorieLog {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  bmr: number;
  tdee: number;
  targetActiveBurnCalories: number; // Lượng calo cần đốt từ tập PHCN
  totalBurnedCalories: number; // Lượng calo thực tế đã đốt
  exercises: LoggedExercise[];
  notes?: string;
}

// Tài khoản người dùng & Phân quyền quản lý
export type UserRole = 'doctor' | 'patient' | 'developer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title: string;
  associatedPatientId?: string;
  createdAt: string;
}

// Cấu hình phát triển (Developer Settings)
export interface DeveloperSettings {
  isDevModeEnabled: boolean;
  weights: {
    mrc: number;
    rom: number;
    mobility: number;
  };
  enableSimulationTools: boolean;
  debugLogs: boolean;
}

// Cấu trúc dữ liệu lưu trữ toàn bộ ứng dụng
export interface AppDataState {
  patients: PatientProfile[];
  activePatientId: string;
  assessments: MotorAssessment[];
  calorieLogs: DailyCalorieLog[];
  users: AppUser[];
  currentUserId: string;
  devSettings: DeveloperSettings;
}

