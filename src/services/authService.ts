import apiClient from '../utils/axios'
import type { LoginRequest, RegisterRequest, VerificationCodeRequest, ResetPasswordRequest, AuthResponse } from '../types/auth'
import useAuthStore from '../store/auth'

export const authService = {
  // User login
  login: async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials)
      const { token, refreshToken, user } = response.data.data
      
      // Update the Zustand store
      useAuthStore.getState().login(token, refreshToken, user)
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<void> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', userData)
      const { token, refreshToken, user } = response.data.data
      
      // Update the Zustand store
      useAuthStore.getState().login(token, refreshToken, user)
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Request verification code
  requestVerificationCode: async (data: VerificationCodeRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/send-code', data)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', data)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // User logout
  logout: async (): Promise<void> => {
    try {
      // Call the logout API endpoint
      await apiClient.post('/auth/logout')
      
      // Update the Zustand store
      useAuthStore.getState().logout()
      
      // Clear all tokens from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      
      return Promise.resolve()
    } catch (error) {
      // Even if the API call fails, we should still clear the local state
      useAuthStore.getState().logout()
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      
      return Promise.reject(error)
    }
  },

  // Get current user information
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      const response = await apiClient.get('/auth/me')
      return Promise.resolve(response.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Update user information
  updateUserInfo: async (userData: Partial<RegisterRequest>): Promise<void> => {
    try {
      const response = await apiClient.put('/users/me', userData)
      
      // Update the Zustand store
      useAuthStore.getState().updateUser(response.data)
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Change user password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.put('/auth/change-password', { oldPassword, newPassword })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
}