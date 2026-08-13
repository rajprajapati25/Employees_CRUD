export interface Employee {
  id: string;
  fullName: string;
  jobTitle: string;
  salary: number;
  email: string;
  dateOfHire: string;
  department: string;
  icon: string;
}

export interface EmployeeFormData {
  fullName: string;
  jobTitle: string;
  salary: string;
  email: string;
  dateOfHire: string;
  department: string;
  icon: string;
}

export type SortField = 'fullName' | 'salary' | 'dateOfHire' | 'jobTitle' | 'department';
export type SortOrder = 'asc' | 'desc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Human Resources',
  'Finance',
  'Sales',
  'Operations',
  'General'
] as const;

export const DEFAULT_AVATARS = [
  '/emp_icons/emp_01.svg',
  '/emp_icons/emp_02.svg',
  '/emp_icons/emp_03.svg',
  '/emp_icons/emp_04.svg',
  '/emp_icons/emp_05.svg',
  '/emp_icons/emp_06.svg',
  '/emp_icons/default_avatar.svg'
];
