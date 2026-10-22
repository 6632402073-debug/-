export interface Bidder {
  id: string;
  name: string;
  phone: string;
  amount: number;
  timestamp: number;
  notes?: string;
}

export interface BidLog {
  id: string;
  bidderId: string;
  name: string;
  phone: string;
  amount: number;
  timestamp: number;
}

export interface AuctionConfig {
  itemName: string;
  itemDescription: string;
  totalPrizes: number; // default: 10
  startingPrice: number;
  minIncrement: number;
  timerDurationSeconds: number;
  isBiddingActive: boolean;
}

export interface GoogleSheetsSyncConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string | null;
  autoSync: boolean;
  lastSyncedAt: number | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage: string | null;
}
