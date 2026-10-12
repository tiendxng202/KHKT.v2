import { AppDataState, PatientProfile, MotorAssessment, DailyCalorieLog } from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_CALORIE_LOGS,
  INITIAL_USERS,
  DEFAULT_DEV_SETTINGS,
} from '../constants/rehabData';

const STORAGE_KEY = 'rehabcal_app_data_v2';

export function loadAppData(): AppDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('rehabcal_app_data_v1');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppDataState>;
      if (parsed && Array.isArray(parsed.patients) && parsed.patients.length > 0) {
        return {
          patients: parsed.patients,
          activePatientId: parsed.activePatientId || parsed.patients[0].id,
          assessments: parsed.assessments || INITIAL_ASSESSMENTS,
          calorieLogs: parsed.calorieLogs || INITIAL_CALORIE_LOGS,
          users: parsed.users && parsed.users.length > 0 ? parsed.users : INITIAL_USERS,
          currentUserId: parsed.currentUserId || INITIAL_USERS[0].id,
          devSettings: parsed.devSettings || DEFAULT_DEV_SETTINGS,
        };
      }
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu từ LocalStorage:', error);
  }

  // Khởi tạo mặc định nếu chưa có
  const defaultState: AppDataState = {
    patients: INITIAL_PATIENTS,
    activePatientId: INITIAL_PATIENTS[0].id,
    assessments: INITIAL_ASSESSMENTS,
    calorieLogs: INITIAL_CALORIE_LOGS,
    users: INITIAL_USERS,
    currentUserId: INITIAL_USERS[0].id,
    devSettings: DEFAULT_DEV_SETTINGS,
  };
  saveAppData(defaultState);
  return defaultState;
}

export function saveAppData(state: AppDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu vào LocalStorage:', error);
  }
}

export function exportDataAsJSON(state: AppDataState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `rehabcal_backup_${timestamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetToSampleData(): AppDataState {
  const defaultState: AppDataState = {
    patients: INITIAL_PATIENTS,
    activePatientId: INITIAL_PATIENTS[0].id,
    assessments: INITIAL_ASSESSMENTS,
    calorieLogs: INITIAL_CALORIE_LOGS,
    users: INITIAL_USERS,
    currentUserId: INITIAL_USERS[0].id,
    devSettings: DEFAULT_DEV_SETTINGS,
  };
  saveAppData(defaultState);
  return defaultState;
}

