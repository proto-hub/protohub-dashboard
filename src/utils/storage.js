import { initialProjectsData } from '../data/initialData';

const STORAGE_KEY = 'protohub_projects_records_v1';
const AUTH_KEY_PREFIX = 'protohub_auth_';

export const getStoredProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjectsData));
      return initialProjectsData;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return initialProjectsData;
  }
};

export const saveStoredProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const resetStoredProjects = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjectsData));
    return initialProjectsData;
  } catch (err) {
    console.error('Failed to reset localStorage:', err);
    return initialProjectsData;
  }
};

export const getAuthStatus = (tab) => {
  try {
    return sessionStorage.getItem(`${AUTH_KEY_PREFIX}${tab}`) === 'true';
  } catch {
    return false;
  }
};

export const setAuthStatus = (tab, status) => {
  try {
    if (status) {
      sessionStorage.setItem(`${AUTH_KEY_PREFIX}${tab}`, 'true');
    } else {
      sessionStorage.removeItem(`${AUTH_KEY_PREFIX}${tab}`);
    }
  } catch (err) {
    console.error('Failed to update auth status:', err);
  }
};

export const clearAllAuth = () => {
  try {
    sessionStorage.removeItem(`${AUTH_KEY_PREFIX}dashboard`);
    sessionStorage.removeItem(`${AUTH_KEY_PREFIX}bill`);
  } catch (err) {
    console.error('Failed to clear auth:', err);
  }
};

// Numeric parser that safely handles "NA", "-", null, undefined, strings with commas
export const parseNum = (val) => {
  if (val === null || val === undefined || val === '' || val === 'NA' || val === '-') {
    return 0;
  }
  const clean = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

// Currency formatter for Indian Rupees
export const formatCurrency = (val) => {
  const num = parseNum(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Export to CSV helper
export const exportToCSV = (projects, filename = 'ProtoHub_Sales_Records.csv') => {
  const headers = [
    'Serial Number',
    'Customer ID',
    'Customer Name',
    'Customer Number',
    'College Name',
    'Summary',
    'Date',
    'Quantity',
    'Discount ( % )',
    'Income / Expenditure',
    'Mode Of Payment',
    'Actual Price ( Rs )',
    'Discounted Price ( Rs )',
    'Referral Discount ( Rs )',
    'Advance ( Rs )',
    'Remaining ( Rs )',
    'Total ( Rs )',
    'Project Status',
    'Payment Status',
    'Notes',
    'Year'
  ];

  const rows = projects.map(p => [
    p.serialNumber,
    p.customerId,
    `"${(p.customerName || '').replace(/"/g, '""')}"`,
    `"${p.customerNumber || ''}"`,
    `"${(p.collegeName || '').replace(/"/g, '""')}"`,
    `"${(p.summary || '').replace(/"/g, '""')}"`,
    p.date,
    p.quantity,
    p.discountPercent,
    p.type,
    p.modeOfPayment,
    p.actualPrice,
    p.discountedPrice,
    p.referralDiscount,
    p.advance,
    p.remaining,
    p.total,
    p.projectStatus,
    p.paymentStatus,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    p.year
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
