import React from 'react';
import { User } from 'firebase/auth';
import {
  Clock,
  User as UserIcon,
  Tv,
  Sliders,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'bidder' | 'dashboard' | 'admin' | 'sheets';
  setActiveTab: (tab: 'bidder' | 'dashboard' | 'admin' | 'sheets') => void;
  isAuctionActive: boolean;
  timerSeconds: number;
  googleUser: User | null;
  spreadsheetId: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAuctionActive,
  timerSeconds,
  googleUser,
  spreadsheetId,
  soundEnabled,
  onToggleSound,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timerSeconds > 0 && timerSeconds <= 60;

  return (
    <header className="border-b border-[#232D42] bg-[#151C2C]/90 backdrop-blur sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('bidder')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 font-black text-xl shrink-0">
            <span role="img" aria-label="hat">🤠</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-wide">
                HAT AUCTION TOP 10
              </h1>
              <span className="hidden md:inline-flex text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                10 รางวัล
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              ประมูลหมวกสิบลู่เกียรติยศ Real-time & Google Sheets
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Status Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
              isAuctionActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAuctionActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isAuctionActive ? 'กำลังประมูล' : 'ปิดประมูล'}
            </span>
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center px-2.5 sm:px-3 py-1 rounded-lg border font-mono text-xs sm:text-sm font-bold transition ${
              isUrgent
                ? 'bg-rose-950/60 border-rose-500/80 text-rose-400 animate-pulse'
                : 'bg-[#0B0F19] border-[#232D42] text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span>{formattedTimer}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            className="p-1.5 rounded-lg bg-[#0B0F19] border border-[#232D42] text-gray-400 hover:text-white transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Google Sheets Status / User */}
          {googleUser ? (
            <div className="hidden lg:flex items-center gap-2 bg-[#0B0F19] border border-emerald-500/30 rounded-xl px-2.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300 truncate max-w-[110px]" title={googleUser.email || ''}>
                {googleUser.displayName || googleUser.email}
              </span>
              <button
                onClick={onGoogleSignOut}
                title="ออกจากระบบ Google"
                className="text-gray-500 hover:text-rose-400 p-0.5 ml-1"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              title="เชื่อมต่อ Google Sheets"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#0B0F19] hover:bg-[#232D42] border border-[#232D42] text-gray-300 px-2.5 py-1 rounded-xl text-xs font-medium transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>ต่อ Sheets</span>
            </button>
          )}

          {/* Tab Navigation Switcher */}
          <div className="bg-[#0B0F19] p-1 rounded-xl border border-[#232D42] flex text-xs">
            <button
              onClick={() => setActiveTab('bidder')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'bidder'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ผู้ประมูล</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">จอใหญ่</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ควบคุม</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'sheets'
                  ? 'bg-emerald-600 text-white shadow'
                  : spreadsheetId
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets</span>
              {spreadsheetId && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
