export interface User {
  id: number;
  username: string;
  mobileNumber?: string;
  role: string;
  active: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  username: string;
  mobileNumber?: string;
  role: string;
  active: boolean;
  tenantCode: string;
}

export interface SchoolAdminCreateRequest {
  name: string;
  username: string;
  mobileNumber: string;
  email?: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export type SchoolType = 'PRIVATE' | 'GOVERNMENT' | 'GOVERNMENT_AIDED';

export type Board = 'CBSE' | 'ICSE' | 'BSE_ODISHA' | 'CHSE_ODISHA' | 'OTHER';

export interface Tenant {
  id: number;
  code: string;
  name: string;
  type: SchoolType;
  board: Board;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreateRequest {
  code: string;
  name: string;
  type: SchoolType;
  board: Board;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface TenantUpdateRequest extends TenantCreateRequest {
  logoUrl?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export interface StudentResponse {
  id: number;
  admissionNumber: string;
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  fatherName?: string;
  motherName?: string;
  mobileNumber?: string;
  address?: string;
  admissionDate?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCreateRequest {
  admissionNumber: string;
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  fatherName?: string;
  motherName?: string;
  mobileNumber?: string;
  address?: string;
  admissionDate?: string;
}

export interface StudentUpdateRequest {
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  fatherName?: string;
  motherName?: string;
  mobileNumber?: string;
  address?: string;
  admissionDate?: string;
}
