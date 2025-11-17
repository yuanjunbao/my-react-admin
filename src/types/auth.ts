// User role types
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User status types
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// User interface
export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  avatar?: string
  lastLoginAt?: string
  permissions?: string[]
}

// Login request interface
export interface LoginRequest {
  identifier: string
  password: string
  rememberMe?: boolean
}

// Registration request interface
export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
  code?: string
}

// Verification code request interface
export interface VerificationCodeRequest {
  email?: string
  phone?: string
  type: 'register' | 'reset-password' | 'login'
}

// Reset password request interface
export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

// Authentication response interface
export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// Refresh token response interface
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}