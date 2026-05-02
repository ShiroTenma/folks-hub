export const APP_CONFIG = {
  NAME: 'FOLKS HUB',
  ORG_NAME: 'FOLKS',
  DESCRIPTION: 'Internal Management System',
};

export const DIVISIONS = [
  'Executive Board',
  'Class',
  'Creative Media',
  'Entrepreneurship',
] as const;

export type Division = typeof DIVISIONS[number];

export const ROLES = [
  { id: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  { id: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  { id: 'lead', label: 'Division Lead', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'co_lead', label: 'Co-Lead', color: 'bg-teal-100 text-teal-700' },
  { id: 'member', label: 'Member', color: 'bg-[#eae6e0] text-[#535366]' },
  { id: 'advisor', label: 'Advisor', color: 'bg-amber-100 text-amber-700' },
] as const;

export type RoleId = typeof ROLES[number]['id'];

export const BATCH_YEARS = ['2022', '2023', '2024', '2025',  '2026'] as const;

export const LEDGER_EVENTS = [
  'Opening Balance', 'WP', 'Equipment', 'Misc', 'Cash', 
  'Operational Expense', 'WP Staff', 'Merchandise', 
  'Sertijab', 'PnC', 'Open House', 'Commission', 'SPIN Etam',
];

export const PAYMENT_TYPES = ['DANA', 'BNI', 'Cash'];
