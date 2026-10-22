import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { BidderView } from './components/BidderView';
import { DashboardView } from './components/DashboardView';
import { AdminView } from './components/AdminView';
import { GoogleSheetsTab } from './components/GoogleSheetsTab';
import { WinnerModal } from './components/WinnerModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';
import { Bidder, BidLog, GoogleSheetsSyncConfig } from './types/auction';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import {
  createAuctionSpreadsheet,
  getSpreadsheetDetails,
  syncAuctionDataToSheet,
  loadBiddersFromSheet,
  extractSpreadsheetId,
} from './services/googleSheets';
import { sounds } from './utils/audio';

// Initial realistic starter bidders for demo
const INITIAL_DEMO_BIDDERS: Bidder[] = [
  { id: 'BID_1', name: 'กิตติศักดิ์ เจริญพร', phone: '081-839-2194', amount: 3500, timestamp: Date.now() - 480000 },
  { id: 'BID_2', name: 'พงศกร วรเวช', phone: '089-445-1289', amount: 3200, timestamp: Date.now() - 420000 },
  { id: 'BID_3', name: 'ณัฐชา รัตนวิมล', phone: '082-991-3829', amount: 2900, timestamp: Date.now() - 360000 },
  { id: 'BID_4', name: 'ชลธิชา มั่นคง', phone: '095-214-7711', amount: 2600, timestamp: Date.now() - 310000 },
  { id: 'BID_5', name: 'อนันต์ สายบุญ', phone: '086-778-9031', amount: 2400, timestamp: Date.now() - 280000 },
  { id: 'BID_6', name: 'วิภาดา ศรีสวัสดิ์', phone: '083-112-4589', amount: 2200, timestamp: Date.now() - 250000 },
  { id: 'BID_7', name: 'ธนกฤต มั่งมี', phone: '084-556-9123', amount: 2000, timestamp: Date.now() - 220000 },
  { id: 'BID_8', name: 'กมลชนก จิตดี', phone: '091-884-6302', amount: 1850, timestamp: Date.now() - 190000 },
  { id: 'BID_9', name: 'ภานุพงศ์ บุญทอง', phone: '088-341-9980', amount: 1700, timestamp: Date.now() - 160000 },
  { id: 'BID_10', name: 'ศิริพร สุขเกษม', phone: '085-702-8411', amount: 1500, timestamp: Date.now() - 120000 },
  { id: 'BID_11', name: 'ธีรภัทร ชนะพาล', phone: '093-612-4490', amount: 1400, timestamp: Date.now() - 90000 },
  { id: 'BID_12', name: 'ปรียาภรณ์ ทองดี', phone: '080-492-1188', amount: 1250, timestamp: Date.now() - 60000 },
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'bidder' | 'dashboard' | 'admin' | 'sheets'>('bidder');

  // User registration
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; phone: string } | null>(() => {
    try {
      const saved = localStorage.getItem('auction_user_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Bidders & Logs data
  const [bidders, setBidders] = useState<Bidder[]>(() => {
    try {
      const saved = localStorage.getItem('hat_auction_bidders');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_BIDDERS;
    } catch {
      return INITIAL_DEMO_BIDDERS;
    }
  });

  const [logs, setLogs] = useState<BidLog[]>(() => {
    try {
      const saved = localStorage.getItem('hat_auction_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auction State
  const [isAuctionActive, setIsAuctionActive] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Google Auth & Sheets Sync
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncConfig, setSyncConfig] = useState<GoogleSheetsSyncConfig>(() => {
    try {
      const saved = localStorage.getItem('hat_auction_sheet_config');
      return saved
        ? JSON.parse(saved)
        : {
            spreadsheetId: null,
            spreadsheetUrl: null,
            spreadsheetTitle: null,
            autoSync: true,
            lastSyncedAt: null,
            lastSyncStatus: 'idle',
            lastSyncMessage: null,
          };
    } catch {
      return {
        spreadsheetId: null,
        spreadsheetUrl: null,
        spreadsheetTitle: null,
        autoSync: true,
        lastSyncedAt: null,
        lastSyncStatus: 'idle',
        lastSyncMessage: null,
      };
    }
  });

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hat_auction_bidders', JSON.stringify(bidders));
    } catch (e) {
      console.error(e);
    }
  }, [bidders]);

  useEffect(() => {
    try {
      localStorage.setItem('hat_auction_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('hat_auction_sheet_config', JSON.stringify(syncConfig));
    } catch (e) {
      console.error(e);
    }
  }, [syncConfig]);

  // Sound settings
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    showToast(next ? 'เปิดเสียงเอฟเฟกต์แล้ว' : 'ปิดเสียงเรียบร้อย', 'info');
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Timer interval countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuctionActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsAuctionActive(false);
            setIsWinnerModalOpen(true);
            sounds.playFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuctionActive, timerSeconds]);

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showToast(`ลงชื่อเข้าใช้ด้วยบัญชี ${res.user.displayName || res.user.email} สำเร็จ`, 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      showToast(msg, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setGoogleUser(null);
    showToast('ออกจากระบบ Google เรียบร้อย', 'info');
  };

  // Google Sheets Auto-Sync execution
  const executeSyncToSheets = useCallback(
    async (
      spreadsheetId: string,
      currentBidders: Bidder[],
      currentLogs: BidLog[],
      isManual = false
    ) => {
      const token = await getAccessToken();
      if (!token) {
        if (isManual) {
          showToast('กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนซิงก์', 'error');
        }
        return;
      }

      setSyncConfig((prev) => ({ ...prev, lastSyncStatus: 'syncing' }));

      try {
        const result = await syncAuctionDataToSheet(spreadsheetId, currentBidders, currentLogs);
        setSyncConfig((prev) => ({
          ...prev,
          lastSyncedAt: Date.now(),
          lastSyncStatus: 'success',
          lastSyncMessage: `ซิงก์ ${result.rowsUpdated} แถวสำเร็จ`,
        }));

        if (isManual) {
          showToast(`ซิงก์ข้อมูลไปยัง Google Sheets สำเร็จ (${result.rowsUpdated} รายการ)`, 'success');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'ซิงก์ข้อมูลไป Google Sheets ไม่สำเร็จ';
        setSyncConfig((prev) => ({
          ...prev,
          lastSyncStatus: 'error',
          lastSyncMessage: msg,
        }));
        if (isManual) {
          showToast(msg, 'error');
        }
      }
    },
    [showToast]
  );

  // Debounced auto-sync when bidders change
  const autoSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSyncIfEnabled = useCallback(
    (newBidders: Bidder[], newLogs: BidLog[]) => {
      if (!syncConfig.autoSync || !syncConfig.spreadsheetId || !googleUser) return;

      if (autoSyncTimeoutRef.current) clearTimeout(autoSyncTimeoutRef.current);
      autoSyncTimeoutRef.current = setTimeout(() => {
        executeSyncToSheets(syncConfig.spreadsheetId!, newBidders, newLogs, false);
      }, 1500);
    },
    [syncConfig.autoSync, syncConfig.spreadsheetId, googleUser, executeSyncToSheets]
  );

  // User registration
  const handleRegisterUser = (name: string, phone: string) => {
    const user = {
      id: 'USER_' + Math.random().toString(36).substr(2, 9),
      name,
      phone,
    };
    setCurrentUser(user);
    localStorage.setItem('auction_user_data', JSON.stringify(user));
    showToast(`ยินดีต้อนรับคุณ ${name} เข้าสู่การประมูล!`, 'success');
  };

  const handleResetUser = () => {
    localStorage.removeItem('auction_user_data');
    setCurrentUser(null);
    showToast('รีเซ็ตข้อมูลผู้ใช้งานเรียบร้อย', 'info');
  };

  // Submit Bid Logic
  const handleSubmitBid = (amount: number) => {
    if (!isAuctionActive) {
      showToast('การประมูลถูกปิดล็อคอยู่ ไม่สามารถเสนอราคาได้', 'error');
      return;
    }

    if (!currentUser) {
      showToast('กรุณาลงทะเบียนก่อนเริ่มเสนอราคา', 'error');
      return;
    }

    // Check existing bid
    const existingIndex = bidders.findIndex((b) => b.id === currentUser.id);
    let previousRank = -1;

    // Calculate current rank before this bid
    const currentSorted = [...bidders].sort((a, b) => b.amount - a.amount);
    previousRank = currentSorted.findIndex((b) => b.id === currentUser.id) + 1;

    let updatedBidders: Bidder[];

    if (existingIndex !== -1) {
      const currentBid = bidders[existingIndex].amount;
      if (amount <= currentBid) {
        showToast(`ราคาเสนอต้องสูงกว่าราคาเดิมของคุณ (฿${currentBid.toLocaleString()})`, 'error');
        return;
      }

      updatedBidders = bidders.map((b, idx) =>
        idx === existingIndex
          ? { ...b, amount, timestamp: Date.now() }
          : b
      );
    } else {
      updatedBidders = [
        ...bidders,
        {
          id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          amount,
          timestamp: Date.now(),
        },
      ];
    }

    // Add to logs
    const newLog: BidLog = {
      id: 'LOG_' + Date.now(),
      bidderId: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      amount,
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...logs];

    setBidders(updatedBidders);
    setLogs(updatedLogs);

    // Audio cue
    sounds.playBidPlaced();

    // Check new rank
    const newSorted = [...updatedBidders].sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.timestamp - b.timestamp;
    });
    const newRank = newSorted.findIndex((b) => b.id === currentUser.id) + 1;

    if (newRank <= 10 && (previousRank > 10 || previousRank === 0)) {
      sounds.playRankUp();
      showToast(`ยินดีด้วย! คุณก้าวขึ้นสู่อันดับที่ #${newRank} อยู่ในเกณฑ์รับหมวก 🎉`, 'success');
    } else {
      showToast(`เสนอราคาสำเร็จ: ฿${amount.toLocaleString()} (อันดับ #${newRank})`, 'success');
    }

    // Trigger auto-sync to Google Sheets if connected
    triggerAutoSyncIfEnabled(updatedBidders, updatedLogs);
  };

  // Google Sheets Management
  const handleCreateNewSheet = async () => {
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (!res) return;
        setGoogleUser(res.user);
        token = res.accessToken;
      }

      showToast('กำลังสร้าง Google Sheet ใหม่ในบัญชีของคุณ...', 'info');
      const details = await createAuctionSpreadsheet();
      setSyncConfig((prev) => ({
        ...prev,
        spreadsheetId: details.id,
        spreadsheetUrl: details.url,
        spreadsheetTitle: details.title,
        lastSyncedAt: Date.now(),
        lastSyncStatus: 'success',
        lastSyncMessage: 'สร้างและตั้งค่าตารางสำเร็จ',
      }));

      // Immediately write current bidders data
      await syncAuctionDataToSheet(details.id, bidders, logs);
      showToast(`สร้าง Google Sheet สำเร็จ: ${details.title}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถสร้าง Google Sheet ได้';
      showToast(msg, 'error');
    }
  };

  const handleConnectExistingSheet = async (urlOrId: string) => {
    const cleanId = extractSpreadsheetId(urlOrId);
    if (!cleanId) {
      showToast('กรุณาระบุ URL หรือ Spreadsheet ID ให้ถูกต้อง', 'error');
      return;
    }

    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (!res) return;
        setGoogleUser(res.user);
        token = res.accessToken;
      }

      showToast('กำลังตรวจสอบการเชื่อมต่อกับ Google Sheet...', 'info');
      const details = await getSpreadsheetDetails(cleanId);
      setSyncConfig((prev) => ({
        ...prev,
        spreadsheetId: details.id,
        spreadsheetUrl: details.url,
        spreadsheetTitle: details.title,
        lastSyncedAt: Date.now(),
        lastSyncStatus: 'success',
        lastSyncMessage: 'เชื่อมต่อสำเร็จ',
      }));
      showToast(`เชื่อมต่อกับ "${details.title}" เรียบร้อยแล้ว`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ Google Sheet นี้ได้';
      showToast(msg, 'error');
    }
  };

  const handleManualSyncNow = () => {
    if (!syncConfig.spreadsheetId) {
      showToast('ยังไม่ได้เชื่อมต่อ Google Sheet', 'error');
      return;
    }
    executeSyncToSheets(syncConfig.spreadsheetId, bidders, logs, true);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setSyncConfig((prev) => ({ ...prev, autoSync: enabled }));
    showToast(enabled ? 'เปิดการซิงก์อัตโนมัติแล้ว' : 'ปิดการซิงก์อัตโนมัติแล้ว', 'info');
  };

  const handleDisconnectSheet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'ยกเลิกการเชื่อมต่อ Google Sheets?',
      message: 'การยกเลิกการเชื่อมต่อจะไม่ลบไฟล์ Spreadsheet ใน Google Drive ของคุณ แต่ระบบจะไม่ส่งข้อมูลไปบันทึกอีกต่อไป',
      confirmText: 'ยกเลิกการเชื่อมต่อ',
      isDestructive: false,
      onConfirm: () => {
        setSyncConfig((prev) => ({
          ...prev,
          spreadsheetId: null,
          spreadsheetUrl: null,
          spreadsheetTitle: null,
          lastSyncStatus: 'idle',
          lastSyncMessage: null,
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('ยกเลิกการเชื่อมต่อเรียบร้อย', 'info');
      },
    });
  };

  const handleRequestImportFromSheet = () => {
    if (!syncConfig.spreadsheetId) return;

    setConfirmModal({
      isOpen: true,
      title: 'นำเข้าข้อมูลจาก Google Sheets?',
      message: 'การนำเข้าข้อมูลจะนำรายชื่อผู้ประมูลจาก Google Sheet มาบันทึกทับในระบบปัจจุบัน คุณต้องการดำเนินการต่อหรือไม่?',
      details: [
        `Google Sheet: ${syncConfig.spreadsheetTitle || syncConfig.spreadsheetId}`,
        'ข้อมูลผู้ประมูลในระบบเดิมจะถูกแทนที่ด้วยข้อมูลจากตาราง',
      ],
      confirmText: 'ยืนยันนำเข้าข้อมูล',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          showToast('กำลังโหลดข้อมูลจาก Google Sheet...', 'info');
          const imported = await loadBiddersFromSheet(syncConfig.spreadsheetId!);
          if (imported.length === 0) {
            showToast('ไม่พบข้อมูลผู้ประมูลใน Google Sheet', 'error');
            return;
          }
          setBidders(imported);
          showToast(`นำเข้าผู้ประมูล ${imported.length} คน จาก Google Sheet สำเร็จ!`, 'success');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'นำเข้าข้อมูลล้มเหลว';
          showToast(msg, 'error');
        }
      },
    });
  };

  // Admin Controls
  const handleStartTimer = () => {
    setIsAuctionActive(true);
    showToast('เริ่มนับเวลาประมูลแล้ว', 'success');
  };

  const handlePauseTimer = () => {
    setIsAuctionActive(false);
    showToast('พักการนับเวลาเรียบร้อย', 'info');
  };

  const handleResetTimer = () => {
    setTimerSeconds(600);
    showToast('รีเซ็ตเวลาเป็น 10 นาทีเรียบร้อย', 'info');
  };

  const handleSetTimerMinutes = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    showToast(`ตั้งเวลาใหม่เป็น ${minutes} นาทีแล้ว`, 'success');
  };

  const handleAddMinutes = (minutes: number) => {
    setTimerSeconds((prev) => prev + minutes * 60);
    showToast(`เพิ่มเวลา +${minutes} นาทีแล้ว`, 'success');
  };

  const handleToggleAuctionStatus = (active: boolean) => {
    setIsAuctionActive(active);
    showToast(
      active ? 'เปิดรับราคาประมูลเรียบร้อย' : 'ล็อคการประมูลเรียบร้อย',
      active ? 'success' : 'error'
    );
  };

  // Simulator
  const mockFirstNames = [
    'กิตติ', 'สมชาย', 'วิภา', 'นพดล', 'ชลธิชา', 'ภานุพงศ์', 'ศิริพร', 'ธนกฤต',
    'อนันต์', 'ปรียา', 'ณัฐวุฒิ', 'อรพรรณ', 'พงศกร', 'กมลชนก', 'พีรพล', 'ดนัย',
    'วรัญญา', 'อภิเชษฐ์', 'มนัสวี', 'ชนัญชิดา', 'ภาณุเดช', 'รุ่งทิพย์', 'ธีรยุทธ',
  ];
  const mockLastNames = [
    'รักดี', 'มั่นคง', 'เจริญทรัพย์', 'วงศ์สวัสดิ์', 'สายทอง', 'จิตรดี',
    'แก้วมณี', 'สุขสวัสดิ์', 'บุญมี', 'รุ่งเรือง', 'รัตนโกสินทร์', 'ยอดเยี่ยม',
  ];

  const handleSimulateBidders = (count: number) => {
    const newSimulated: Bidder[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const fname = mockFirstNames[Math.floor(Math.random() * mockFirstNames.length)];
      const lname = mockLastNames[Math.floor(Math.random() * mockLastNames.length)];
      const phone = '08' + Math.floor(10000000 + Math.random() * 90000000);
      const id = 'SIM_' + Math.random().toString(36).substr(2, 9);
      const amount = Math.floor(Math.random() * 90 + 5) * 50; // 250 - 4750

      newSimulated.push({
        id,
        name: `${fname} ${lname}`,
        phone,
        amount,
        timestamp: now - Math.floor(Math.random() * 600000),
      });
    }

    const updated = [...bidders, ...newSimulated];
    setBidders(updated);
    sounds.playBidPlaced();
    showToast(`จำลองเพิ่มผู้ประมูลแล้ว +${count} คน (รวม ${updated.length} คน)`, 'success');

    triggerAutoSyncIfEnabled(updated, logs);
  };

  const handleTriggerMassBidding = () => {
    if (bidders.length === 0) {
      handleSimulateBidders(15);
      return;
    }

    const updated = [...bidders];
    const burstCount = Math.min(15, updated.length);

    for (let i = 0; i < burstCount; i++) {
      const randIdx = Math.floor(Math.random() * updated.length);
      const increment = Math.floor(Math.random() * 5 + 1) * 100;
      updated[randIdx] = {
        ...updated[randIdx],
        amount: updated[randIdx].amount + increment,
        timestamp: Date.now() + i * 10,
      };
    }

    setBidders(updated);
    sounds.playBidPlaced();
    showToast(`สุ่มเคาะราคาเพิ่ม 15 รายการพร้อมกันสำเร็จ!`, 'success');

    triggerAutoSyncIfEnabled(updated, logs);
  };

  const handleRequestClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'ต้องการล้างข้อมูลผู้ประมูลทั้งหมด?',
      message: 'การล้างข้อมูลจะลบรายชื่อผู้เสนอราคาทั้งหมดในระบบ และไม่สามารถย้อนกลับได้',
      confirmText: 'ล้างข้อมูลทั้งหมด',
      isDestructive: true,
      onConfirm: () => {
        setBidders([]);
        setLogs([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('ล้างข้อมูลเรียบร้อยแล้ว', 'info');
      },
    });
  };

  const handleDeleteBidder = (id: string) => {
    setBidders((prev) => prev.filter((b) => b.id !== id));
    showToast('ลบรายการผู้ประมูลเรียบร้อย', 'info');
  };

  // CSV Export
  const handleExportCSV = () => {
    const sorted = [...bidders].sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.timestamp - b.timestamp;
    });

    if (sorted.length === 0) {
      showToast('ไม่มีข้อมูลการประมูลให้ส่งออก', 'error');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'Rank,ID,ชื่อ-นามสกุล,เบอร์โทรศัพท์,ราคาที่เสนอ(บาท),เวลาที่เสนอราคา,สถานะของรางวัล\n';

    sorted.forEach((item, index) => {
      const isWinner = index < 10 ? `ชนะรับหมวกใบที่ ${index + 1}` : 'หลุดโควต้า';
      const timeStr = new Date(item.timestamp).toLocaleString('th-TH');
      csv += `"${index + 1}","${item.id}","${item.name}","${item.phone}","${item.amount}","${timeStr}","${isWinner}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hat_Auction_Top10_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('ส่งออกไฟล์ CSV สำเร็จ!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-['Kanit',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuctionActive={isAuctionActive}
        timerSeconds={timerSeconds}
        googleUser={googleUser}
        spreadsheetId={syncConfig.spreadsheetId}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'bidder' && (
          <BidderView
            currentUser={currentUser}
            onRegisterUser={handleRegisterUser}
            onResetUser={handleResetUser}
            bidders={bidders}
            isAuctionActive={isAuctionActive}
            onSubmitBid={handleSubmitBid}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            bidders={bidders}
            timerSeconds={timerSeconds}
            isAuctionActive={isAuctionActive}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            bidders={bidders}
            timerSeconds={timerSeconds}
            isAuctionActive={isAuctionActive}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
            onSetTimerMinutes={handleSetTimerMinutes}
            onAddMinutes={handleAddMinutes}
            onToggleAuctionStatus={handleToggleAuctionStatus}
            onSimulateBidders={handleSimulateBidders}
            onTriggerMassBidding={handleTriggerMassBidding}
            onRequestClearAll={handleRequestClearAll}
            onExportCSV={handleExportCSV}
            onOpenSheetsTab={() => setActiveTab('sheets')}
            spreadsheetId={syncConfig.spreadsheetId}
            onDeleteBidder={handleDeleteBidder}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsTab
            googleUser={googleUser}
            syncConfig={syncConfig}
            bidders={bidders}
            logs={logs}
            isLoggingIn={isLoggingIn}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onCreateNewSheet={handleCreateNewSheet}
            onConnectExistingSheet={handleConnectExistingSheet}
            onSyncNow={handleManualSyncNow}
            onToggleAutoSync={handleToggleAutoSync}
            onRequestImportFromSheet={handleRequestImportFromSheet}
            onDisconnectSheet={handleDisconnectSheet}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#232D42] py-4 px-6 text-center text-xs text-gray-500 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ระบบประมูลหมวก Top 10 Real-time • สิบลู่เกียรติยศ</span>
          <div className="flex items-center gap-4">
            {syncConfig.spreadsheetId && (
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Google Sheets เชื่อมต่อแล้ว
              </span>
            )}
            <span className="font-mono text-gray-600">v2.0 • Real-time Auction Engine</span>
          </div>
        </div>
      </footer>

      {/* Winner Celebration Modal */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        bidders={bidders}
        onExportCSV={handleExportCSV}
        onSyncGoogleSheets={handleManualSyncNow}
        spreadsheetId={syncConfig.spreadsheetId}
      />

      {/* Confirmation Dialog for Destructive Operations */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
