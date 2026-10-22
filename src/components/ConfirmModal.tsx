import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = 'ยืนยันการดำเนินการ',
  cancelText = 'ยกเลิก',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151C2C] border border-[#232D42] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-start space-x-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {details && details.length > 0 && (
          <div className="bg-[#0B0F19] rounded-xl p-3 border border-[#232D42] space-y-1">
            <span className="text-xs text-gray-400 block font-medium">รายการที่จะได้รับผลกระทบ:</span>
            <ul className="text-xs text-gray-300 space-y-0.5 list-disc list-inside">
              {details.map((detail, idx) => (
                <li key={idx} className="truncate">{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-[#0B0F19] hover:bg-[#232D42] transition border border-[#232D42]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
