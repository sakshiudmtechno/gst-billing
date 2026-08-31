// 37 Indian States & Union Territories with official GST State Codes
export interface IndianState {
  code: string; // 2-digit code
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '25', name: 'Daman and Diu' },
  { code: '26', name: 'Dadra and Nagar Haveli' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' }
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const COMMON_HSN_SAC = [
  { code: '9983', description: 'IT, Software & Website Development Services', defaultGst: 18 },
  { code: '998313', description: 'IT Consulting & Support Services', defaultGst: 18 },
  { code: '998314', description: 'Web & Mobile Application Design & Development', defaultGst: 18 },
  { code: '998315', description: 'Hosting, Infrastructure & Cloud Services', defaultGst: 18 },
  { code: '998316', description: 'Network Management & Maintenance', defaultGst: 18 },
  { code: '9984', description: 'Telecommunications & Internet Services', defaultGst: 18 },
  { code: '9987', description: 'Maintenance, Repair & Installation Services', defaultGst: 18 },
  { code: '8471', description: 'Computers, Laptops & Hardware Peripherals', defaultGst: 18 },
  { code: '8517', description: 'Networking Equipment & Routers', defaultGst: 18 },
  { code: '9982', description: 'Legal, Accounting & Business Consultancy', defaultGst: 18 },
  { code: '9985', description: 'Support, Staffing & Office Administration', defaultGst: 18 },
];

/**
 * Validate standard 15-character Indian GSTIN
 * Format: 2 digits (state) + 10 chars (PAN) + 1 char (entity num) + 'Z' + 1 char (checksum)
 */
export function validateGSTIN(gstin: string): { isValid: boolean; message?: string; stateCode?: string; pan?: string } {
  if (!gstin) {
    return { isValid: false, message: 'GSTIN is required' };
  }
  const cleanGstin = gstin.trim().toUpperCase();
  if (cleanGstin.length !== 15) {
    return { isValid: false, message: 'GSTIN must be exactly 15 characters long' };
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return { isValid: false, message: 'Invalid GSTIN format (e.g. 23AHWPH3168H2Z2)' };
  }

  const stateCode = cleanGstin.substring(0, 2);
  const pan = cleanGstin.substring(2, 12);
  const matchedState = INDIAN_STATES.find(s => s.code === stateCode);

  return {
    isValid: true,
    stateCode,
    pan,
    message: matchedState ? `Valid GSTIN (${matchedState.name})` : 'Valid GSTIN'
  };
}

/**
 * Find State name by state code or search name
 */
export function getStateByCode(code: string): IndianState | undefined {
  return INDIAN_STATES.find(s => s.code === code);
}

export function getStateByName(name: string): IndianState | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  return INDIAN_STATES.find(s => s.name.toLowerCase() === clean || s.name.toLowerCase().includes(clean));
}

/**
 * Determine whether transaction is Intra-state (CGST + SGST) or Inter-state (IGST)
 */
export function isInterStateSupply(sellerStateCode: string, placeOfSupplyCode: string): boolean {
  if (!sellerStateCode || !placeOfSupplyCode) return false;
  return sellerStateCode.trim() !== placeOfSupplyCode.trim();
}

/**
 * Format currency in Indian numbering system (Lakhs, Crores)
 * e.g. 100000 -> ₹1,00,000.00
 */
export function formatINR(amount: number | undefined | null, includeSymbol: boolean = true, decimals: number = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '₹0.00' : '0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  let formattedInt = '';
  if (integerPart.length <= 3) {
    formattedInt = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const grouped = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedInt = `${grouped},${lastThree}`;
  }

  const result = decimals > 0 ? `${formattedInt}.${decimalPart}` : formattedInt;
  const prefix = isNegative ? '-' : '';
  return includeSymbol ? `${prefix}₹${result}` : `${prefix}${result}`;
}

/**
 * Convert number into Indian Currency Words (e.g. Five Thousand Nine Hundred Rupees Only)
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return `${tens[ten]}${unit > 0 ? ' ' + singleDigits[unit] : ''}`;
  }

  function convertThreeDigits(n: number): string {
    if (n === 0) return '';
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = '';
    if (hundred > 0) {
      str += `${singleDigits[hundred]} Hundred`;
      if (remainder > 0) str += ' ';
    }
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str;
  }

  const rounded = Math.round(num * 100) / 100;
  const integerPart = Math.floor(Math.abs(rounded));
  const paise = Math.round((Math.abs(rounded) - integerPart) * 100);

  let crores = Math.floor(integerPart / 10000000);
  let lakhs = Math.floor((integerPart % 10000000) / 100000);
  let thousands = Math.floor((integerPart % 100000) / 1000);
  let hundreds = integerPart % 1000;

  let words = '';

  if (crores > 0) {
    words += `${convertTwoDigits(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${convertTwoDigits(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${convertTwoDigits(thousands)} Thousand `;
  }
  if (hundreds > 0) {
    words += `${convertThreeDigits(hundreds)} `;
  }

  words = words.trim();
  if (words.length === 0) {
    words = 'Zero';
  }

  words += ' Rupees';

  if (paise > 0) {
    words += ` and ${convertTwoDigits(paise)} Paise`;
  }

  words += ' Only';
  return words;
}

/**
 * Generate standard Financial Year string for a given date
 * (In India, FY runs from April 1 to March 31)
 */
export function getFinancialYear(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const month = d.getMonth() + 1; // 1-indexed
  const year = d.getFullYear();

  if (month >= 4) {
    // April to Dec -> Current year to Next year
    const nextYear = (year + 1).toString().slice(-2);
    return `FY ${year}-${nextYear}`;
  } else {
    // Jan to March -> Prev year to Current year
    const prevYear = year - 1;
    const currentYearShort = year.toString().slice(-2);
    return `FY ${prevYear}-${currentYearShort}`;
  }
}

export const FINANCIAL_YEARS = [
  'FY 2024-25',
  'FY 2025-26',
  'FY 2026-27',
  'FY 2027-28',
  'FY 2028-29'
];
