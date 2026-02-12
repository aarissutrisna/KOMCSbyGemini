
export enum UserRole {
  ADMIN = 'ADMIN',
  HRD = 'HRD',
  CS = 'CS'
}

export enum CommissionStatus {
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
  LOCKED = 'LOCKED'
}

export interface Branch {
  id: string | number;
  name: string;
  targetMin: number;
  targetMax: number;
  n8nEndpoint: string;
}

export interface BranchTargetOverride {
  id: string | number;
  branchId: string | number;
  month: number;
  year: number;
  targetMin: number;
  targetMax: number;
}

export interface User {
  id: string | number;
  username: string;
  name: string;
  role: UserRole;
  branchId?: string | number;
  faktorPengali?: number;
  createdAt?: string;
}

export interface Attendance {
  id: string | number;
  userId: string | number;
  date: string;
  status: number;
}

export interface DashboardFilters {
  month: number | 'all';
  year: number | 'all';
  branchId: string | number | 'global';
  userId: string | number | 'all';
}
