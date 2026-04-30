export const APP_CONFIG = {
  NAME: 'FOLKS HUB',
  ORG_NAME: 'FOLKS',
  DESCRIPTION: 'Internal Management System',
};

export const DIVISIONS = [
  'Class',
  'Creative Media',
  'Entrepreneurship',
  'Executive Board',
] as const;

export type Division = typeof DIVISIONS[number];

export const ROLES = [
  { id: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  { id: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  { id: 'member', label: 'Member', color: 'bg-slate-100 text-slate-700' },
  { id: 'advisor', label: 'Advisor', color: 'bg-amber-100 text-amber-700' },
] as const;

export type RoleId = typeof ROLES[number]['id'];

export const BATCH_YEARS = ['2022', '2023', '2024', '2025'] as const;
