import React, { useRef } from 'react';
import { AppDataState } from '../types';
import { exportDataAsJSON, resetToSampleData } from '../utils/storage';
import { Database, Download, Upload, RotateCcw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppDataState;
  onImportState: (newState: AppDataState) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  appState,
  onImportState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJSON(appState);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppDataState;
        if (parsed && Array.isArray(parsed.patients)) {
          onImportState(parsed);
          alert('Đã khôi phục dữ liệu từ tệp sao lưu thành công!');
          onClose();
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp JSON. Vui lòng kiểm tra lại định dạng tệp.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu về mẫu bệnh nhân ban đầu? Mọi chỉnh sửa chưa sao lưu sẽ bị ghi đè.')) {
      const defaultState = resetToSampleData();
      onImportState(defaultState);
      alert('Đã khôi phục dữ liệu mẫu ban đầu!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Quản Lý & Lưu Trữ Dữ Liệu Ứng Dụng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 space-y-4">
          <p>
            Toàn bộ thông tin bệnh nhân, lịch sử đánh giá % phục hồi và nhật ký calo được tự động lưu trữ trên trình duyệt của bạn (LocalStorage). Bạn có thể sao lưu tệp để chuyển sang máy khác.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <span className="font-bold text-slate-800 block">Dữ liệu hiện tại:</span>
            <div className="grid grid-cols-3 gap-2 text-slate-600">
              <div>• {appState.patients.length} hồ sơ bệnh nhân</div>
              <div>• {appState.assessments.length} lần đánh giá %</div>
              <div>• {appState.calorieLogs.length} ngày nhật ký calo</div>
            </div>
          </div>

          {/* 3 Lựa chọn hành động */}
          <div className="space-y-3 pt-2">
            {/* 1. Xuất file */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-950 font-semibold transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <Download className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <span className="block font-bold text-teal-900 text-sm">
                    Tải Về Tệp Sao Lưu (Xuất JSON)
                  </span>
                  <span className="text-xs text-teal-700 font-normal">
                    Lưu toàn bộ bệnh án và nhật ký calo ra máy tính
                  </span>
                </div>
              </div>
              <span className="text-xs bg-teal-200/60 px-2.5 py-1 rounded-md font-bold">
                Tải file
              </span>
            </button>

            {/* 2. Nhập file */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <Upload className="w-5 h-5 text-slate-600 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-800 text-sm">
                      Khôi Phục Từ Tệp JSON Đã Lưu
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      Nạp dữ liệu bệnh nhân từ tệp sao lưu trước đó
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md font-bold text-slate-700">
                  Chọn tệp
                </span>
              </button>
            </div>

            {/* 3. Đặt lại mặc định */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-950 font-semibold transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <RotateCcw className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="block font-bold text-rose-900 text-sm">
                    Khôi Phục Dữ Liệu Mẫu Mặc Định
                  </span>
                  <span className="text-xs text-rose-700 font-normal">
                    Nạp lại 2 bệnh nhân mẫu (sau tai biến & sau mổ ACL)
                  </span>
                </div>
              </div>
              <span className="text-xs bg-rose-100 px-2.5 py-1 rounded-md font-bold text-rose-800">
                Đặt lại
              </span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
