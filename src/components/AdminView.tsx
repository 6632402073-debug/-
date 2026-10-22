import React, { useState } from 'react';
import { Bidder } from '../types/auction';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Lock,
  Unlock,
  Users,
  Zap,
  Trash2,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';

interface AdminViewProps {
  bidders: Bidder[];
  timerSeconds: number;
  isAuctionActive: boolean;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onSetTimerMinutes: (minutes: number) => void;
  onAddMinutes: (minutes: number) => void;
  onToggleAuctionStatus: (active: boolean) => void;
  onSimulateBidders: (count: number) => void;
  onTriggerMassBidding: () => void;
  onRequestClearAll: () => void;
  onExportCSV: () => void;
  onOpenSheetsTab: () => void;
  spreadsheetId: string | null;
  onDeleteBidder: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  bidders,
  timerSeconds,
  isAuctionActive,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetTimerMinutes,
  onAddMinutes,
  onToggleAuctionStatus,
  onSimulateBidders,
  onTriggerMassBidding,
  onRequestClearAll,
  onExportCSV,
  onOpenSheetsTab,
  spreadsheetId,
  onDeleteBidder,
}) => {
  const [customMinutes, setCustomMinutes] = useState('10');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'top10' | 'others'>('all');

  // Sorted bidders
  const sorted = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  const filteredBidders = sorted.filter((b, idx) => {
    const isTop10 = idx < 10;
    if (filterType === 'top10' && !isTop10) return false;
    if (filterType === 'others' && isTop10) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.id.toLowerCase().includes(q);
  });

  const handleSetTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(customMinutes, 10);
    if (!isNaN(m) && m > 0) {
      onSetTimerMinutes(m);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Panel Card */}
      <div className="bg-[#151C2C] border border-[#232D42] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#232D42] pb-5 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-amber-400" />
              <span>แผงควบคุมระบบการประมูล (Admin Panel)</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              จัดการเวลานับถอยหลัง, ควบคุมสถานะ, จำลองผู้ประมูล 500+ คน และส่งออกข้อมูล
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenSheetsTab}
              className="flex-1 sm:flex-none bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{spreadsheetId ? 'เปิด Google Sheets' : 'ตั้งค่า Google Sheets'}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด CSV</span>
            </button>
          </div>
        </div>

        {/* Control Grid: Timer & Auction Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Timer Setup */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#232D42] space-y-3">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              กำหนดเวลา (นาที)
            </label>
            <form onSubmit={handleSetTimer} className="flex gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="w-full bg-[#151C2C] border border-[#232D42] rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="bg-[#232D42] hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                ตั้งค่า
              </button>
            </form>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onAddMinutes(1)}
                className="text-[11px] bg-[#151C2C] hover:bg-[#232D42] text-amber-300 px-2 py-1 rounded-lg border border-[#232D42] cursor-pointer"
              >
                +1 นาที
              </button>
              <button
                onClick={() => onAddMinutes(5)}
                className="text-[11px] bg-[#151C2C] hover:bg-[#232D42] text-amber-300 px-2 py-1 rounded-lg border border-[#232D42] cursor-pointer"
              >
                +5 นาที
              </button>
            </div>
          </div>

          {/* 2. Timer Play/Pause/Reset */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#232D42] space-y-2.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              ควบคุมการนับเวลา
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onStartTimer}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>เริ่ม</span>
              </button>
              <button
                onClick={onPauseTimer}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>พัก</span>
              </button>
              <button
                onClick={onResetTimer}
                className="bg-[#232D42] hover:bg-gray-700 text-gray-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            </div>
          </div>

          {/* 3. Open/Close Auction Lock */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#232D42] space-y-2.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              สถานะการรับราคา
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleAuctionStatus(true)}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isAuctionActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#151C2C] text-gray-400 hover:text-white border border-[#232D42]'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>เปิดประมูล</span>
              </button>
              <button
                onClick={() => onToggleAuctionStatus(false)}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  !isAuctionActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-[#151C2C] text-gray-400 hover:text-white border border-[#232D42]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ล็อคประมูล</span>
              </button>
            </div>
          </div>
        </div>

        {/* 500+ Simulator Section */}
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>ระบบจำลองผู้เข้าร่วมงาน 500+ คน (Stress & Demo Simulator)</span>
              </h3>
              <p className="text-xs text-gray-400">
                ใช้สำหรับทดสอบ Load, ตรวจสอบการตัดตัว Top 10 และจำลองบรรยากาศงานจริง
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
              ผู้ประมูลปัจจุบัน: {bidders.length} คน
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onSimulateBidders(50)}
              className="bg-[#0B0F19] hover:bg-[#232D42] border border-amber-500/40 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มจำลอง +50 คน</span>
            </button>

            <button
              onClick={() => onSimulateBidders(200)}
              className="bg-[#0B0F19] hover:bg-[#232D42] border border-amber-500/40 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มจำลอง +200 คน</span>
            </button>

            <button
              onClick={onTriggerMassBidding}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>สุ่มรวดเดียว 15 Bids!</span>
            </button>

            <button
              onClick={onRequestClearAll}
              className="bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold px-4 py-2.5 rounded-xl text-xs transition ml-auto flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างข้อมูลทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Live Bidders Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>รายชื่อและประวัติผู้ประมูลทั้งหมด ({sorted.length} คน)</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter */}
              <div className="flex bg-[#0B0F19] rounded-xl border border-[#232D42] p-0.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'all' ? 'bg-[#232D42] text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilterType('top10')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'top10' ? 'bg-[#232D42] text-amber-400 font-bold' : 'text-gray-400'
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setFilterType('others')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'others' ? 'bg-[#232D42] text-gray-300 font-bold' : 'text-gray-400'
                  }`}
                >
                  อื่น ๆ
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#232D42] rounded-2xl bg-[#0B0F19]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#151C2C] text-gray-400 font-semibold border-b border-[#232D42] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">ชื่อ-นามสกุล</th>
                  <th className="p-3">เบอร์โทรศัพท์</th>
                  <th className="p-3">ราคาเสนอ (บาท)</th>
                  <th className="p-3">เวลาเสนอราคาล่าสุด</th>
                  <th className="p-3 text-center">สถานะ</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D42]">
                {filteredBidders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      ไม่พบข้อมูลผู้ประมูล
                    </td>
                  </tr>
                ) : (
                  filteredBidders.slice(0, 50).map((b) => {
                    const originalRank = sorted.findIndex((s) => s.id === b.id) + 1;
                    const isWinner = originalRank <= 10;

                    return (
                      <tr key={b.id} className="hover:bg-[#151C2C]/50 transition">
                        <td className="p-3 font-bold font-mono">
                          <span
                            className={
                              isWinner
                                ? 'text-amber-400 font-black'
                                : 'text-gray-500'
                            }
                          >
                            #{originalRank}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-white">{b.name}</td>
                        <td className="p-3 font-mono text-gray-400">{b.phone}</td>
                        <td className="p-3 font-black text-emerald-400 font-mono text-sm">
                          ฿{b.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-400 font-mono">{formatTime(b.timestamp)}</td>
                        <td className="p-3 text-center">
                          {isWinner ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3" />
                              <span>ได้รับหมวก</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">
                              <XCircle className="w-3 h-3" />
                              <span>ตกรอบ</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onDeleteBidder(b.id)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredBidders.length > 50 && (
            <p className="text-xs text-gray-500 text-center">
              แสดง 50 รายการแรกจากทั้งหมด {filteredBidders.length} รายการ (ใช้ระบบค้นหาเพื่อดูเพิ่มเติม)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
