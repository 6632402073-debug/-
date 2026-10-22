import React, { useState } from 'react';
import { Bidder } from '../types/auction';
import {
  Crown,
  Gavel,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Flame,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface BidderViewProps {
  currentUser: { id: string; name: string; phone: string } | null;
  onRegisterUser: (name: string, phone: string) => void;
  onResetUser: () => void;
  bidders: Bidder[];
  isAuctionActive: boolean;
  onSubmitBid: (amount: number) => void;
}

export const BidderView: React.FC<BidderViewProps> = ({
  currentUser,
  onRegisterUser,
  onResetUser,
  bidders,
  isAuctionActive,
  onSubmitBid,
}) => {
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [bidAmount, setBidAmount] = useState<string>('');

  // Sorted bidders: highest price first, then earliest timestamp
  const sortedBidders = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  const top1Price = sortedBidders.length > 0 ? sortedBidders[0].amount : 0;
  const top10Cutoff =
    sortedBidders.length >= 10
      ? sortedBidders[9].amount
      : sortedBidders.length > 0
      ? sortedBidders[sortedBidders.length - 1].amount
      : 0;

  // Current user's rank
  const userRankIndex = currentUser
    ? sortedBidders.findIndex((b) => b.id === currentUser.id)
    : -1;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
  const currentUserBid = userRankIndex !== -1 ? sortedBidders[userRankIndex].amount : 0;
  const isUserWinning = userRank !== null && userRank <= 10;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) return;
    onRegisterUser(regName.trim(), regPhone.trim());
  };

  const handleBidSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (!amount || isNaN(amount) || amount <= 0) return;
    onSubmitBid(amount);
    setBidAmount('');
  };

  const handleQuickAdd = (increment: number) => {
    const base = Math.max(currentUserBid, top10Cutoff);
    const target = base > 0 ? base + increment : increment;
    setBidAmount(String(target));
    onSubmitBid(target);
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
      {/* Registration Card if user is not yet registered */}
      {!currentUser ? (
        <div className="bg-[#151C2C] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-5 text-amber-500 pointer-events-none select-none text-9xl">
            🤠
          </div>
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/10">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              ลงทะเบียนเพื่อร่วมประมูลหมวก
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              กรอกชื่อและเบอร์โทรศัพท์ของคุณเพื่อเข้าร่วมเสนอราคาชิงหมวกลิมิเต็ด 10 ใบเกียรติยศ
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left pt-2">
              <div>
                <label className="text-xs text-gray-300 font-semibold mb-1.5 block">
                  ชื่อ-นามสกุล / ชื่อเล่น *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="เช่น สมชาย สายเปย์"
                  className="w-full bg-[#0B0F19] border border-[#232D42] focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold mb-1.5 block">
                  เบอร์โทรศัพท์ (สำหรับยืนยันรับหมวก) *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full bg-[#0B0F19] border border-[#232D42] focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-sm font-mono transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition text-sm cursor-pointer active:scale-[0.99]"
              >
                เข้าสู่ห้องประมูลทันที →
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* User Status Card & Bidding Area */
        <div className="space-y-6">
          {/* Status Banner for Registered User */}
          <div
            className={`border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              !userRank
                ? 'bg-[#151C2C] border-[#232D42]'
                : isUserWinning
                ? 'bg-gradient-to-r from-[#151C2C] via-emerald-950/20 to-[#151C2C] border-emerald-500/60 shadow-emerald-500/10'
                : 'bg-gradient-to-r from-[#151C2C] via-rose-950/20 to-[#151C2C] border-rose-500/50 shadow-rose-500/10'
            }`}
          >
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border shrink-0 ${
                  isUserWinning
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-[#0B0F19] text-amber-400 border-[#232D42]'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-white truncate">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={onResetUser}
                    className="text-xs text-gray-500 hover:text-gray-300 underline cursor-pointer"
                  >
                    (เปลี่ยนชื่อ)
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-mono">{currentUser.phone}</p>
                {currentUserBid > 0 && (
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    ราคาที่คุณเสนอ: ฿{currentUserBid.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Rank Indicator Badge */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#232D42]">
              <div className="text-right">
                <div className="text-xs text-gray-400">สถานะของคุณ</div>
                <div
                  className={`text-sm font-bold flex items-center gap-1 justify-end ${
                    !userRank
                      ? 'text-gray-400'
                      : isUserWinning
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {isUserWinning && <Award className="w-4 h-4 inline" />}
                  {!userRank
                    ? 'ยังไม่ได้เสนอราคา'
                    : isUserWinning
                    ? `อยู่อันดับ ${userRank} (อยู่ในเกณฑ์รับหมวก! 🎉)`
                    : `อยู่อันดับ ${userRank} (หลุด Top 10! เคาะเพิ่มด่วน)`}
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-mono ${
                  !userRank
                    ? 'bg-[#0B0F19] border-[#232D42] text-gray-500'
                    : isUserWinning
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider">RANK</span>
                <span className="text-xl font-extrabold">{userRank ? `#${userRank}` : '-'}</span>
              </div>
            </div>
          </div>

          {/* Product Showcase & Bid Control Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Product & Form (7 Cols) */}
            <div className="lg:col-span-7 bg-[#151C2C] border border-[#232D42] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>แจกหมวกทั้งหมด 10 ใบ</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    10 อันดับแรกที่มีราคาสูงสุดชนะรับหมวก
                  </span>
                </div>

                {/* Product Visual Banner */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-800/80 to-[#0B0F19] p-6 border border-[#232D42] text-center mb-6">
                  <div className="w-28 h-28 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center text-6xl text-amber-400 mb-3 shadow-inner">
                    🤠
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    หมวกพรีเมียมเอ็กซ์คลูซีฟ (Limited Edition)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    ดีไซน์พิเศษผลิตเฉพาะงานนี้ ผู้เสนอราคาสูงสุด 10 คนแรกเมื่อจบเวลาจะได้รับหมวกไปครอบครอง
                  </p>
                </div>

                {/* Price Benchmarks */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#232D42] text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>ราคาสูงสุดอันดับ 1</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      ฿{top1Price.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#0B0F19] p-3.5 rounded-2xl border border-[#232D42] text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>เกณฑ์ตัดตัว (อันดับ 10)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                      ฿{top10Cutoff.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Bidding Input & Action */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-200 block">
                    เสนอราคาประมูลของคุณ (บาท):
                  </label>

                  <form onSubmit={handleBidSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">
                        ฿
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="10"
                        disabled={!isAuctionActive}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="ระบุราคาที่ต้องการเคาะ..."
                        className="w-full bg-[#0B0F19] border border-[#232D42] focus:border-amber-500 rounded-xl pl-9 pr-4 py-3 text-white font-bold text-lg font-mono focus:outline-none transition disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!isAuctionActive || !bidAmount}
                      className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition text-base flex items-center justify-center gap-2 min-w-[130px] cursor-pointer"
                    >
                      <Gavel className="w-5 h-5" />
                      <span>ส่งราคา</span>
                    </button>
                  </form>

                  {/* Quick Increment Buttons */}
                  <div>
                    <span className="text-xs text-gray-400 block mb-2">
                      ปุ่มลัดเคาะราคาด่วน (คำนวณจากราคาตัดตัว Top 10):
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 200, 500].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          disabled={!isAuctionActive}
                          onClick={() => handleQuickAdd(inc)}
                          className="bg-[#0B0F19] hover:bg-[#232D42] border border-[#232D42] text-gray-300 font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition hover:text-amber-400 cursor-pointer disabled:opacity-50 font-mono active:scale-95"
                        >
                          +{inc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Footer */}
              <div className="text-xs text-gray-500 text-center border-t border-[#232D42] pt-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>
                  กรณีเสนอราคาเท่ากัน ระบบจะตัดสินให้ผู้ที่เคาะราคาก่อนได้อันดับสูงกว่า (First come, First served)
                </span>
              </div>
            </div>

            {/* Right: Live Top 10 Preview (5 Cols) */}
            <div className="lg:col-span-5 bg-[#151C2C] border border-[#232D42] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#232D42]">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>ตาราง Top 10 ล่าสุด</span>
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  ผู้ประมูล: {bidders.length} คน
                </span>
              </div>

              {/* Leaderboard List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
                {sortedBidders.length === 0 ? (
                  <div className="text-center text-gray-500 py-12 text-sm">
                    ยังไม่มีข้อมูลการเสนอราคา
                    <p className="text-xs text-gray-600 mt-1">มาร่วมเคาะราคาเป็นคนแรกกัน!</p>
                  </div>
                ) : (
                  sortedBidders.slice(0, 15).map((item, index) => {
                    const isTop10 = index < 10;
                    const isMe = item.id === currentUser.id;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-2xl transition border ${
                          isMe
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/5'
                            : isTop10
                            ? 'bg-[#0B0F19]/80 border-[#232D42]'
                            : 'bg-[#0B0F19]/40 border-[#232D42]/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              index === 0
                                ? 'bg-amber-500 text-slate-950 shadow'
                                : index < 3
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-[#151C2C] text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                              <span className={isMe ? 'text-amber-300' : ''}>{item.name}</span>
                              {isMe && (
                                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                                  คุณ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatTime(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-xs sm:text-sm font-black font-mono ${
                              isTop10 ? 'text-emerald-400' : 'text-gray-400'
                            }`}
                          >
                            ฿{item.amount.toLocaleString()}
                          </div>
                          <span
                            className={`text-[9px] font-semibold block ${
                              isTop10 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isTop10 ? '✓ ได้หมวก' : '✗ หลุดโควต้า'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
