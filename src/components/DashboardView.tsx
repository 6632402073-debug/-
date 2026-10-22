import React, { useState } from 'react';
import { Bidder } from '../types/auction';
import {
  Trophy,
  Crown,
  Flame,
  Clock,
  Maximize2,
  Minimize2,
  Radio,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  bidders: Bidder[];
  timerSeconds: number;
  isAuctionActive: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bidders,
  timerSeconds,
  isAuctionActive,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sorted bidders: highest price first, then earliest timestamp
  const sorted = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  const top10 = sorted.slice(0, 10);
  const challengers = sorted.slice(10, 20);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timerSeconds > 0 && timerSeconds <= 60;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 3)}***${phone.slice(-3)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Big Stage Banner Header */}
      <div className="bg-gradient-to-r from-[#151C2C] via-gray-900 to-[#151C2C] border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient glow effect in background */}
        <div className="absolute -left-20 -top-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl sm:text-4xl text-amber-400 shadow-xl shadow-amber-500/20 shrink-0">
            <Trophy className="w-9 h-9 sm:w-11 sm:h-11 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                STAGE PROJECTOR DISPLAY
              </span>
              <button
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#0B0F19] border border-[#232D42] text-xs transition"
                title="เปิดเต็มหน้าจอ"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide mt-1">
              LIVE LEADERBOARD: ประมูลหมวก 10 ใบ
            </h2>
            <p className="text-sm text-amber-400/90 font-medium">
              10 อันดับแรกที่มีราคาสูงสุดจะชนะได้รับหมวกไปคนละ 1 ใบ! (อัปเดตแบบเรียลไทม์)
            </p>
          </div>
        </div>

        {/* Big Countdown Timer */}
        <div
          className={`border-2 rounded-3xl px-8 py-4 text-center z-10 shadow-2xl transition-all ${
            isUrgent
              ? 'bg-rose-950/80 border-rose-500 shadow-rose-500/30 animate-pulse'
              : 'bg-[#0B0F19]/90 border-amber-500/60 shadow-amber-500/10'
          }`}
        >
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>เวลาคงเหลือ</span>
          </div>
          <div
            className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-wider ${
              isUrgent ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {formattedTimer}
          </div>
        </div>
      </div>

      {/* Grid: Top 10 Winners Zone (8 Cols) & Challengers (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOP 10 WINNERS ZONE */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>TOP 10 WINNERS ZONE (อยู่ในเกณฑ์รับหมวก)</span>
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE UPDATING</span>
            </span>
          </div>

          <div className="bg-[#151C2C] border border-[#232D42] rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-2xl">
            {top10.length === 0 ? (
              <div className="text-center text-gray-500 py-16 text-base">
                รอผู้ร่วมเสนอราคาคนแรกขึ้นสู่ตารางเกียรติยศ...
              </div>
            ) : (
              top10.map((item, idx) => {
                const isRank1 = idx === 0;
                const isRank2 = idx === 1;
                const isRank3 = idx === 2;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isRank1
                        ? 'bg-gradient-to-r from-amber-500/25 via-yellow-600/15 to-[#0B0F19] border-amber-500/90 shadow-xl shadow-amber-500/10'
                        : isRank2
                        ? 'bg-gradient-to-r from-slate-400/15 via-[#151C2C] to-[#0B0F19] border-slate-400/60'
                        : isRank3
                        ? 'bg-gradient-to-r from-amber-700/15 via-[#151C2C] to-[#0B0F19] border-amber-700/60'
                        : 'bg-[#0B0F19]/90 border-[#232D42]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                      {/* Rank badge */}
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 ${
                          isRank1
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/40'
                            : isRank2
                            ? 'bg-slate-300 text-slate-950 shadow-md'
                            : isRank3
                            ? 'bg-amber-700 text-white shadow-md'
                            : 'bg-[#232D42] text-amber-400 border border-[#232D42]'
                        }`}
                      >
                        {isRank1 ? <Crown className="w-6 h-6" /> : `#${idx + 1}`}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2 truncate">
                          <span className="truncate">{item.name}</span>
                          <span className="text-xs text-gray-400 font-mono font-normal">
                            ({maskPhone(item.phone)})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>เคาะเมื่อ: {formatTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-wide">
                        ฿{item.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold inline-block">
                        WINNER HAT #{idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Empty slots placeholders if fewer than 10 */}
            {top10.length > 0 && top10.length < 10 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 text-center py-2 border-t border-[#232D42]">
                  ยังมีหมวกว่างอยู่อีก {10 - top10.length} ใบ! เคาะราคาเพื่อครองตำแหน่งทันที
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CHALLENGERS (RANKS 11-20) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="px-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-300 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>CHALLENGERS (อันดับ 11-20)</span>
            </h3>
          </div>

          <div className="bg-[#151C2C] border border-[#232D42] rounded-3xl p-4 sm:p-5 space-y-2 shadow-xl">
            {challengers.length === 0 ? (
              <div className="text-center text-gray-500 py-12 text-xs">
                ยังไม่มีผู้ท้าชิงอันดับ 11-20
                <p className="text-gray-600 mt-1">ผู้เข้าแข่งขันทุกคนอยู่ในเกณฑ์รับหมวกทั้งหมด!</p>
              </div>
            ) : (
              challengers.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#0B0F19]/70 border border-[#232D42] transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#232D42] text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 11}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-gray-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                      ฿{item.amount.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-rose-400">ห่าง Top 10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
