import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Bidder } from '../types/auction';
import {
  Trophy,
  Crown,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidders: Bidder[];
  onExportCSV: () => void;
  onSyncGoogleSheets: () => void;
  spreadsheetId: string | null;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
  bidders,
  onExportCSV,
  onSyncGoogleSheets,
  spreadsheetId,
}) => {
  // Sorted bidders: highest price first
  const sorted = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  const top10 = sorted.slice(0, 10);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);

        return () => clearTimeout(timer);
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#151C2C] border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white p-2 rounded-xl bg-[#0B0F19] border border-[#232D42] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center text-4xl mx-auto border-2 border-amber-400 shadow-xl shadow-amber-500/20 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            ประกาศผลผู้ชนะประมูลหมวก 10 ใบ!
          </h2>
          <p className="text-xs sm:text-sm text-amber-400 font-medium">
            ขอแสดงความยินดีกับผู้ได้รับรางวัล 10 อันดับแรกที่มีราคาสูงสุดเกียรติยศ
          </p>
        </div>

        {/* List of 10 Winners */}
        <div className="space-y-2.5">
          {top10.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              ไม่มีข้อมูลผู้เสนอราคาในการประมูลนี้
            </div>
          ) : (
            top10.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-500/20 to-[#0B0F19] border-amber-500/70'
                    : 'bg-[#0B0F19] border-[#232D42]'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-sm shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx < 3
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#151C2C] text-gray-300'
                    }`}
                  >
                    {idx === 0 ? <Crown className="w-4 h-4" /> : `#${idx + 1}`}
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-white text-sm sm:text-base truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{item.phone}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-emerald-400 font-mono text-base sm:text-lg">
                    ฿{item.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    ผู้ชนะหมวกใบที่ {idx + 1}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {spreadsheetId && (
            <button
              onClick={() => {
                onSyncGoogleSheets();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ซิงก์ผลชนะไป Google Sheets</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV ผู้ชนะ</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 bg-[#0B0F19] hover:bg-[#232D42] text-gray-300 font-bold py-3 rounded-xl text-xs transition border border-[#232D42] cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
