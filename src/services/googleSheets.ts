import { getAccessToken } from './auth';
import { Bidder, BidLog } from '../types/auction';

export interface SpreadsheetDetails {
  id: string;
  title: string;
  url: string;
  sheets: string[];
}

/**
 * Format timestamp into Thai locale string
 */
const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Extract Spreadsheet ID from input string or URL
 */
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  // Check if it's a full Google Sheets URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID
  return trimmed;
};

/**
 * Fetch Spreadsheet details and verify read access
 */
export const getSpreadsheetDetails = async (spreadsheetId: string): Promise<SpreadsheetDetails> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วย Google เพื่อดำเนินการกับ Google Sheets');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `ไม่สามารถเข้าถึง Google Sheet (${response.status})`);
  }

  const data = await response.json();
  const sheets = (data.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);

  return {
    id: data.spreadsheetId,
    title: data.properties.title,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
};

/**
 * Create a brand new Google Spreadsheet for this Auction with 3 formatted sheets
 */
export const createAuctionSpreadsheet = async (
  titlePrefix = 'HAT AUCTION TOP 10'
): Promise<SpreadsheetDetails> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนสร้าง Google Sheet');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const title = `${titlePrefix} - ผลการประมูล (${dateStr})`;

  const newSpreadsheetBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Top 10 ผู้ชนะ (Winners)',
          gridProperties: { rowCount: 50, columnCount: 10, frozenRowCount: 1 },
          tabColor: { red: 0.96, green: 0.62, blue: 0.04 }, // Amber gold
        },
      },
      {
        properties: {
          title: 'รายชื่อผู้ประมูลทั้งหมด (All Bids)',
          gridProperties: { rowCount: 600, columnCount: 10, frozenRowCount: 1 },
          tabColor: { red: 0.23, green: 0.51, blue: 0.96 }, // Blue
        },
      },
      {
        properties: {
          title: 'ประวัติการเคาะราคา (Logs)',
          gridProperties: { rowCount: 1000, columnCount: 10, frozenRowCount: 1 },
          tabColor: { red: 0.06, green: 0.72, blue: 0.5 }, // Emerald
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newSpreadsheetBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `ไม่สามารถสร้าง Google Sheet ได้ (${response.status})`);
  }

  const created = await response.json();
  const spreadsheetId = created.spreadsheetId;

  // Now populate initial headers
  await setupInitialHeaders(spreadsheetId, accessToken);

  return {
    id: spreadsheetId,
    title,
    url: created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheets: ['Top 10 ผู้ชนะ (Winners)', 'รายชื่อผู้ประมูลทั้งหมด (All Bids)', 'ประวัติการเคาะราคา (Logs)'],
  };
};

/**
 * Setup formatted initial headers on the new spreadsheet
 */
const setupInitialHeaders = async (spreadsheetId: string, accessToken: string) => {
  const headerData = [
    {
      range: 'Top 10 ผู้ชนะ (Winners)!A1:G1',
      values: [
        [
          'อันดับ (Rank)',
          'ชื่อ-นามสกุล',
          'เบอร์โทรศัพท์',
          'ราคาประมูล (บาท)',
          'เวลาเคาะราคาล่าสุด',
          'ผลรางวัล',
          'สถานะติดต่อรับหมวก',
        ],
      ],
    },
    {
      range: 'รายชื่อผู้ประมูลทั้งหมด (All Bids)!A1:G1',
      values: [
        [
          'อันดับ (Rank)',
          'รหัสผู้ประมูล',
          'ชื่อ-นามสกุล',
          'เบอร์โทรศัพท์',
          'ราคาเสนอสูงสุด (บาท)',
          'เวลาเคาะราคาล่าสุด',
          'สถานะปัจจุบัน',
        ],
      ],
    },
    {
      range: 'ประวัติการเคาะราคา (Logs)!A1:F1',
      values: [
        [
          'ลำดับ',
          'วัน-เวลาเคาะราคา',
          'รหัสผู้ประมูล',
          'ชื่อ-นามสกุล',
          'เบอร์โทรศัพท์',
          'ราคาที่เคาะ (บาท)',
        ],
      ],
    },
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: headerData,
      }),
    }
  );
};

/**
 * Sync entire current auction data (Top 10, All Bidders, Logs) to Google Sheets
 */
export const syncAuctionDataToSheet = async (
  spreadsheetId: string,
  bidders: Bidder[],
  logs: BidLog[]
): Promise<{ rowsUpdated: number }> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('ไม่มี Access Token กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนซิงก์');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);

  // Sort bidders: Highest amount first, then earliest timestamp
  const sorted = [...bidders].sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.timestamp - b.timestamp;
  });

  // Top 10 data
  const top10 = sorted.slice(0, 10);
  const top10Rows = top10.map((b, idx) => [
    `#${idx + 1}`,
    b.name,
    b.phone,
    b.amount,
    formatDateTime(b.timestamp),
    `ได้รับหมวกใบที่ ${idx + 1} (Winner)`,
    'รอดำเนินการ',
  ]);

  // If fewer than 10, pad empty rows so old extra rows get cleared
  const totalTop10Slots = 10;
  for (let i = top10Rows.length; i < totalTop10Slots; i++) {
    top10Rows.push([`#${i + 1}`, '-', '-', 0, '-', 'ยังไม่มีผู้เสนอราคา', '-']);
  }

  // All Bidders data
  const allBiddersRows = sorted.map((b, idx) => {
    const isWinner = idx < 10;
    return [
      `#${idx + 1}`,
      b.id,
      b.name,
      b.phone,
      b.amount,
      formatDateTime(b.timestamp),
      isWinner ? 'อยู่ในเกณฑ์รับหมวก (Top 10)' : 'หลุดโควต้า',
    ];
  });

  // Logs data
  const logsRows = logs.map((log, idx) => [
    idx + 1,
    formatDateTime(log.timestamp),
    log.bidderId,
    log.name,
    log.phone,
    log.amount,
  ]);

  // First, ensure headers exist
  await setupInitialHeaders(cleanId, accessToken).catch(() => {});

  // Clear previous body ranges if necessary, then write new values
  const updates = [
    {
      range: 'Top 10 ผู้ชนะ (Winners)!A2:G20',
      values: top10Rows,
    },
  ];

  if (allBiddersRows.length > 0) {
    // Clear old range before updating all bids
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/รายชื่อผู้ประมูลทั้งหมด (All Bids)!A2:G1000:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    ).catch(() => {});

    updates.push({
      range: `รายชื่อผู้ประมูลทั้งหมด (All Bids)!A2:G${allBiddersRows.length + 1}`,
      values: allBiddersRows,
    });
  }

  if (logsRows.length > 0) {
    updates.push({
      range: `ประวัติการเคาะราคา (Logs)!A2:F${logsRows.length + 1}`,
      values: logsRows,
    });
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: updates,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `ไม่สามารถเขียนข้อมูลลงใน Google Sheet ได้ (${response.status})`);
  }

  return { rowsUpdated: top10.length + allBiddersRows.length };
};

/**
 * Load bidders from Google Sheets (Import/Restore)
 */
export const loadBiddersFromSheet = async (spreadsheetId: string): Promise<Bidder[]> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('ไม่มี Access Token กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนดึงข้อมูล');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);

  // Try reading from 'รายชื่อผู้ประมูลทั้งหมด (All Bids)' first, or fallback to first sheet
  let range = "'รายชื่อผู้ประมูลทั้งหมด (All Bids)'!A2:G500";
  let response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    // Fallback to reading Sheet1!A2:E
    range = 'Sheet1!A2:G500';
    response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'ไม่พบข้อมูลผู้ประมูลใน Google Sheet ที่ระบุ');
  }

  const data = await response.json();
  const rows: (string | number)[][] = data.values || [];

  const bidders: Bidder[] = [];
  rows.forEach((row, idx) => {
    // Columns might be: [Rank, ID, Name, Phone, Amount, ...] or [Rank, Name, Phone, Amount, ...]
    let name = '';
    let phone = '';
    let amount = 0;
    let id = '';

    if (row.length >= 5) {
      id = String(row[1] || `IMPORT_${idx + 1}`);
      name = String(row[2] || '');
      phone = String(row[3] || '');
      const parsedAmount = parseFloat(String(row[4]).replace(/[^0-9.]/g, ''));
      amount = isNaN(parsedAmount) ? 0 : parsedAmount;
    } else if (row.length >= 4) {
      name = String(row[1] || '');
      phone = String(row[2] || '');
      const parsedAmount = parseFloat(String(row[3]).replace(/[^0-9.]/g, ''));
      amount = isNaN(parsedAmount) ? 0 : parsedAmount;
      id = `IMPORT_${idx + 1}`;
    }

    if (name.trim() && amount > 0) {
      bidders.push({
        id: id || `IMPORT_${Date.now()}_${idx}`,
        name: name.trim(),
        phone: phone.trim() || '08X-XXX-XXXX',
        amount,
        timestamp: Date.now() - idx * 1000,
      });
    }
  });

  return bidders;
};
