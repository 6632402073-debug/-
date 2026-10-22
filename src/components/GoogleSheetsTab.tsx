import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Bidder, BidLog, GoogleSheetsSyncConfig } from '../types/auction';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  Download,
  Upload,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface GoogleSheetsTabProps {
  googleUser: User | null;
  syncConfig: GoogleSheetsSyncConfig;
  bidders: Bidder[];
  logs: BidLog[];
  isLoggingIn: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onCreateNewSheet: () => void;
  onConnectExistingSheet: (urlOrId: string) => void;
  onSyncNow: () => void;
  onToggleAutoSync: (enabled: boolean) => void;
  onRequestImportFromSheet: () => void;
  onDisconnectSheet: () => void;
}

export const GoogleSheetsTab: React.FC<GoogleSheetsTabProps> = ({
  googleUser,
  syncConfig,
  bidders,
  logs,
  isLoggingIn,
  onGoogleSignIn,
  onGoogleSignOut,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncNow,
  onToggleAutoSync,
  onRequestImportFromSheet,
  onDisconnectSheet,
}) => {
  const [inputUrl, setInputUrl] = useState('');

  // Sorted bidders
  const sorted = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  const top10 = sorted.slice(0, 10);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onConnectExistingSheet(inputUrl.trim());
    setInputUrl('');
  };

  const formatDateTime = (ts: number | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Container */}
      <div className="bg-[#151C2C] border border-[#232D42] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#232D42] pb-5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>เชื่อมต่อ Google Sheets</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Official Integration
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                บันทึกรายชื่อผู้ประมูล, ประวัติเคาะราคา และรายชื่อผู้ชนะ Top 10 ลงสู่ Google Sheets แบบอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Google User status if logged in */}
          {googleUser && (
            <div className="flex items-center gap-3 bg-[#0B0F19] border border-emerald-500/30 rounded-2xl p-2 pr-3">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt="avatar"
                  className="w-9 h-9 rounded-xl border border-emerald-500/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {googleUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left text-xs min-w-0">
                <div className="font-bold text-white truncate max-w-[150px]">
                  {googleUser.displayName || 'Google User'}
                </div>
                <div className="text-gray-400 font-mono text-[11px] truncate max-w-[150px]">
                  {googleUser.email}
                </div>
              </div>
              <button
                onClick={onGoogleSignOut}
                className="text-xs text-gray-400 hover:text-rose-400 ml-2 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                ออก
              </button>
            </div>
          )}
        </div>

        {/* Connected Sheet Info or Setup Options */}
        {syncConfig.spreadsheetId ? (
          <div className="space-y-6">
            {/* Active Spreadsheet Status Card */}
            <div className="bg-gradient-to-r from-emerald-950/30 via-[#0B0F19] to-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      กำลังเชื่อมต่ออยู่ (CONNECTED)
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {syncConfig.spreadsheetTitle || 'HAT AUCTION TOP 10 - Live Spreadsheet'}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {syncConfig.spreadsheetId}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {syncConfig.spreadsheetUrl && (
                    <a
                      href={syncConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดใน Google Sheets ↗</span>
                    </a>
                  )}

                  <button
                    onClick={onDisconnectSheet}
                    className="bg-[#0B0F19] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-[#232D42] hover:border-rose-500/40 px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    ยกเลิกการเชื่อมต่อ
                  </button>
                </div>
              </div>

              {/* Sync Controls & Auto-sync */}
              <div className="border-t border-[#232D42] pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Auto-Sync Toggle */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => onToggleAutoSync(!syncConfig.autoSync)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      syncConfig.autoSync ? 'bg-emerald-500' : 'bg-[#232D42]'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        syncConfig.autoSync ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white">
                      ซิงก์อัตโนมัติ (Live Auto-Sync)
                    </div>
                    <div className="text-[11px] text-gray-400">
                      ส่งข้อมูลขึ้น Google Sheets ทันทีที่มีการเคาะราคาใหม่
                    </div>
                  </div>
                </div>

                {/* Manual Sync Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onSyncNow}
                    disabled={syncConfig.lastSyncStatus === 'syncing'}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        syncConfig.lastSyncStatus === 'syncing' ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {syncConfig.lastSyncStatus === 'syncing'
                        ? 'กำลังซิงก์...'
                        : 'ซิงก์ข้อมูลไป Sheet ตอนนี้'}
                    </span>
                  </button>

                  <button
                    onClick={onRequestImportFromSheet}
                    className="bg-[#0B0F19] hover:bg-[#232D42] text-gray-300 border border-[#232D42] px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="นำเข้ารายชื่อผู้ประมูลจาก Google Sheets มายังระบบ"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>ดึงข้อมูลจาก Sheet</span>
                  </button>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono bg-[#0B0F19] p-2.5 rounded-xl border border-[#232D42]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>
                    ซิงก์ล่าสุดเมื่อ: {formatDateTime(syncConfig.lastSyncedAt)}
                  </span>
                </div>
                {syncConfig.lastSyncMessage && (
                  <span className="text-emerald-400">{syncConfig.lastSyncMessage}</span>
                )}
              </div>
            </div>

            {/* Sheets Structure Explainer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🏆 แผ่นงาน 1: Top 10 ผู้ชนะ (Winners)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  บันทึก 10 อันดับแรกที่มีราคาสูงสุด พร้อมชื่อ, เบอร์โทร, ราคาสุดท้าย และช่องสถานะรับของรางวัล
                </p>
                <div className="text-xs font-mono text-amber-300 pt-1">
                  พร้อมซิงก์: {top10.length} รายการ
                </div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-blue-500/30 space-y-2">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <span>👥 แผ่นงาน 2: ผู้ประมูลทั้งหมด (All Bids)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  เก็บรายชื่อผู้เข้าร่วมประมูลทุกคน เรียงตามลำดับราคาและเวลาเสนอ เพื่อการตรวจสอบย้อนหลัง
                </p>
                <div className="text-xs font-mono text-blue-300 pt-1">
                  พร้อมซิงก์: {bidders.length} คน
                </div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>📜 แผ่นงาน 3: ประวัติการเคาะราคา (Logs)</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  บันทึกประวัติการเคาะราคาทุกครั้งแบบละเอียด ระบุเวลาเป็นวินาทีและผู้เคาะ
                </p>
                <div className="text-xs font-mono text-emerald-300 pt-1">
                  พร้อมซิงก์: {logs.length} ครั้ง
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When no Sheet is connected yet, show clear setup options */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Create New Sheet */}
            <div className="bg-[#0B0F19] border-2 border-emerald-500/40 rounded-3xl p-6 space-y-4 hover:border-emerald-500/70 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  สร้าง Google Sheet ใหม่ทันที
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  ระบบจะสร้าง Google Spreadsheet ใหม่ใน Google Drive ของคุณโดยอัตโนมัติ พร้อมตั้งค่า 3 แผ่นงาน
                  (Top 10 ผู้ชนะ, รายชื่อผู้ประมูลทั้งหมด, บันทึกประวัติเคาะราคา) และกำหนดหัวตารางให้อย่างสวยงาม
                </p>
              </div>

              <button
                type="button"
                onClick={onCreateNewSheet}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>สร้างและเชื่อมต่อ Google Sheet ใหม่</span>
              </button>
            </div>

            {/* Option 2: Connect Existing Sheet */}
            <div className="bg-[#0B0F19] border border-[#232D42] rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  เชื่อมต่อ Google Sheet ที่มีอยู่แล้ว
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  วาง URL ของ Google Spreadsheet หรือ Spreadsheet ID ที่คุณต้องการให้ระบบเขียนข้อมูลลงไป
                </p>

                <form onSubmit={handleConnect} className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-[#151C2C] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!inputUrl.trim()}
                    className="w-full bg-[#232D42] hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>เชื่อมต่อกับ Sheet นี้</span>
                  </button>
                </form>
              </div>

              <p className="text-[11px] text-gray-500 mt-2">
                * สามารถเชื่อมต่อตารางของคุณได้ทันที หรือใช้ปุ่ม &quot;สร้าง Google Sheet ใหม่&quot; เพื่อความสะดวก
              </p>
            </div>
          </div>
        )}

        {/* Live Preview Table of what Google Sheet gets */}
        <div className="space-y-3 border-t border-[#232D42] pt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ตัวอย่างข้อมูล Top 10 ที่จะบันทึกเข้าสู่ Google Sheets</span>
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              ข้อมูลปัจจุบัน: {top10.length} คน
            </span>
          </div>

          <div className="overflow-x-auto border border-[#232D42] rounded-2xl bg-[#0B0F19]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#151C2C] text-gray-400 font-semibold border-b border-[#232D42]">
                <tr>
                  <th className="p-3">อันดับ</th>
                  <th className="p-3">ชื่อ-นามสกุล</th>
                  <th className="p-3">เบอร์โทรศัพท์</th>
                  <th className="p-3">ราคาประมูล (บาท)</th>
                  <th className="p-3">ผลรางวัล</th>
                  <th className="p-3">สถานะรับมอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D42]">
                {top10.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      ยังไม่มีข้อมูลผู้ชนะ Top 10 ในขณะนี้
                    </td>
                  </tr>
                ) : (
                  top10.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-[#151C2C]/50">
                      <td className="p-3 font-bold font-mono text-amber-400">#{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">{w.name}</td>
                      <td className="p-3 font-mono text-gray-400">{w.phone}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        ฿{w.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          หมวกใบที่ {idx + 1}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">รอดำเนินการ</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
