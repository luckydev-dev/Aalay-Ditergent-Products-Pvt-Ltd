// Comprehensive Indian Bank IFSC Code Directory & Live Preview Helper

export interface BankInfo {
  bankCode: string;
  bankName: string;
  shortName: string;
  themeColor: string;
  badgeBg: string;
  branch?: string;
  city?: string;
  district?: string;
  state?: string;
  isVerifiedLive?: boolean;
}

const INDIAN_BANKS_REGISTRY: Record<string, { bankName: string; shortName: string; themeColor: string; badgeBg: string }> = {
  SBIN: { bankName: 'State Bank of India (SBI)', shortName: 'SBI', themeColor: '#0054a6', badgeBg: '#e6f0fa' },
  HDFC: { bankName: 'HDFC Bank Ltd.', shortName: 'HDFC', themeColor: '#004c8f', badgeBg: '#e5f0fa' },
  ICIC: { bankName: 'ICICI Bank Ltd.', shortName: 'ICICI', themeColor: '#f37021', badgeBg: '#fef2e9' },
  PUNB: { bankName: 'Punjab National Bank (PNB)', shortName: 'PNB', themeColor: '#961427', badgeBg: '#fae8eb' },
  BARB: { bankName: 'Bank of Baroda', shortName: 'BOB', themeColor: '#f26522', badgeBg: '#fef1ea' },
  CNRB: { bankName: 'Canara Bank', shortName: 'Canara', themeColor: '#0090d0', badgeBg: '#e6f6fc' },
  UTIB: { bankName: 'Axis Bank Ltd.', shortName: 'Axis', themeColor: '#97144d', badgeBg: '#fae8f0' },
  UBIN: { bankName: 'Union Bank of India', shortName: 'Union Bank', themeColor: '#003e7e', badgeBg: '#e6eef7' },
  BKID: { bankName: 'Bank of India', shortName: 'BOI', themeColor: '#ef3829', badgeBg: '#fdebe9' },
  KKBK: { bankName: 'Kotak Mahindra Bank', shortName: 'Kotak', themeColor: '#ed1c24', badgeBg: '#fde9ea' },
  IDIB: { bankName: 'Indian Bank', shortName: 'Indian Bank', themeColor: '#003366', badgeBg: '#e6edf5' },
  CBIN: { bankName: 'Central Bank of India', shortName: 'Central Bank', themeColor: '#013a7c', badgeBg: '#e6ecf4' },
  IOBA: { bankName: 'Indian Overseas Bank (IOB)', shortName: 'IOB', themeColor: '#005596', badgeBg: '#e6f0f7' },
  UCBA: { bankName: 'UCO Bank', shortName: 'UCO', themeColor: '#005ba4', badgeBg: '#e6f1f8' },
  MAHB: { bankName: 'Bank of Maharashtra', shortName: 'BOM', themeColor: '#273b7a', badgeBg: '#e9ecf4' },
  PSIB: { bankName: 'Punjab & Sind Bank', shortName: 'P&S Bank', themeColor: '#ea592a', badgeBg: '#fdf0ea' },
  YESB: { bankName: 'Yes Bank Ltd.', shortName: 'Yes Bank', themeColor: '#003f7a', badgeBg: '#e6edf5' },
  IDFB: { bankName: 'IDFC FIRST Bank', shortName: 'IDFC FIRST', themeColor: '#9f1d24', badgeBg: '#f9e9ea' },
  INDB: { bankName: 'IndusInd Bank', shortName: 'IndusInd', themeColor: '#8a1538', badgeBg: '#f7e8ec' },
  FDRL: { bankName: 'Federal Bank Ltd.', shortName: 'Federal', themeColor: '#004785', badgeBg: '#e6edf5' },
  RBLN: { bankName: 'RBL Bank Ltd.', shortName: 'RBL', themeColor: '#1d3f84', badgeBg: '#e8edf6' },
  CSBK: { bankName: 'CSB Bank Ltd.', shortName: 'CSB', themeColor: '#d32f2f', badgeBg: '#faeaea' },
  KARB: { bankName: 'Karnataka Bank Ltd.', shortName: 'Karnataka', themeColor: '#a71930', badgeBg: '#f9e8eb' },
  KVBL: { bankName: 'Karur Vysya Bank', shortName: 'KVB', themeColor: '#00704a', badgeBg: '#e6f4ef' },
  SIBL: { bankName: 'South Indian Bank', shortName: 'SIB', themeColor: '#ca1f26', badgeBg: '#fae9ea' },
  TMBL: { bankName: 'Tamilnad Mercantile Bank', shortName: 'TMB', themeColor: '#003366', badgeBg: '#e6edf5' },
  BDBL: { bankName: 'Bandhan Bank Ltd.', shortName: 'Bandhan', themeColor: '#003d79', badgeBg: '#e6edf5' },
  AUBL: { bankName: 'AU Small Finance Bank', shortName: 'AU Bank', themeColor: '#6f2c91', badgeBg: '#f4edf7' },
  ESFB: { bankName: 'Equitas Small Finance Bank', shortName: 'Equitas', themeColor: '#00833e', badgeBg: '#e6f5ec' },
  UJVN: { bankName: 'Ujjivan Small Finance Bank', shortName: 'Ujjivan', themeColor: '#ed1c24', badgeBg: '#fde9ea' },
  PAYT: { bankName: 'Paytm Payments Bank', shortName: 'Paytm Bank', themeColor: '#002e6e', badgeBg: '#e6ecf4' },
  AIRP: { bankName: 'Airtel Payments Bank', shortName: 'Airtel Bank', themeColor: '#e40000', badgeBg: '#fce6e6' },
  IPOS: { bankName: 'India Post Payments Bank (IPPB)', shortName: 'IPPB', themeColor: '#c8102e', badgeBg: '#fae7eb' },
  JAKA: { bankName: 'Jammu & Kashmir Bank', shortName: 'J&K Bank', themeColor: '#003865', badgeBg: '#e6edf3' },
  SCBL: { bankName: 'Standard Chartered Bank', shortName: 'StanChart', themeColor: '#007a3d', badgeBg: '#e6f4ec' },
  CITI: { bankName: 'Citibank N.A.', shortName: 'Citibank', themeColor: '#003b70', badgeBg: '#e6edf4' },
  HSBC: { bankName: 'HSBC Bank Ltd.', shortName: 'HSBC', themeColor: '#db0011', badgeBg: '#fbe6e7' },
  DEUT: { bankName: 'Deutsche Bank AG', shortName: 'Deutsche', themeColor: '#0018a8', badgeBg: '#e6e8f8' },
};

/**
 * Instant local lookup from 4-character IFSC prefix
 */
export function getLocalBankInfo(ifsc: string): BankInfo | null {
  const clean = (ifsc || '').trim().toUpperCase();
  if (clean.length < 4) return null;
  const prefix = clean.slice(0, 4);
  const matched = INDIAN_BANKS_REGISTRY[prefix];
  if (matched) {
    return {
      bankCode: prefix,
      bankName: matched.bankName,
      shortName: matched.shortName,
      themeColor: matched.themeColor,
      badgeBg: matched.badgeBg,
      isVerifiedLive: false,
    };
  }
  // Generic fallback if unknown bank prefix
  return {
    bankCode: prefix,
    bankName: `${prefix} Bank`,
    shortName: prefix,
    themeColor: '#0047B3',
    badgeBg: '#e6edf7',
    isVerifiedLive: false,
  };
}

/**
 * Fetch full live branch details from public Razorpay IFSC API
 */
export async function lookupIFSCDetailsLive(ifsc: string): Promise<BankInfo | null> {
  const clean = (ifsc || '').trim().toUpperCase();
  if (clean.length !== 11) {
    return getLocalBankInfo(clean);
  }

  const local = getLocalBankInfo(clean);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://ifsc.razorpay.com/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        bankCode: clean.slice(0, 4),
        bankName: data.BANK || local?.bankName || 'Verified Bank',
        shortName: local?.shortName || clean.slice(0, 4),
        themeColor: local?.themeColor || '#0047B3',
        badgeBg: local?.badgeBg || '#e6edf7',
        branch: data.BRANCH || '',
        city: data.CITY || '',
        district: data.DISTRICT || '',
        state: data.STATE || '',
        isVerifiedLive: true,
      };
    }
  } catch (e) {
    // Return local cache on network error or timeout
  }

  return local;
}
