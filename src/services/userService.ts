import apiClient from '../utils/axios'
import type { User, UserRole, UserStatus } from '../types/auth'

interface UserFilter { 
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

export const userService = {
  // Get users with filters
  getUsers: async (filter?: UserFilter): Promise<{ list: User[]; total: number }> => {
    try {
      const response = await apiClient.get('/users', { params: filter })
      // Convert response structure to match expected format
      return Promise.resolve({ 
        list: response.data.data.items, 
        total: response.data.data.pagination.total 
      })
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => { 
    try {
      const response = await apiClient.get(`/users/${id}`) 
      return Promise.resolve(response.data.data) 
    } catch (error) {
      return Promise.reject(error) 
    }
  },
  
  // Create user
  createUser: async (userData: User): Promise<User> => {
    try {
      const response = await apiClient.post('/users', userData) 
      return Promise.resolve(response.data.data) 
    } catch (error) {
      return Promise.reject(error) 
    }
  },
  
  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData) 
      return Promise.resolve(response.data.data) 
    } catch (error) {
      return Promise.reject(error) 
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Batch delete users
  batchDeleteUsers: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.delete('/users/batch', { data: { ids } })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Update user status
  updateUserStatus: async (id: string, status: UserStatus): Promise<User> => {
    try {
      const response = await apiClient.put(`/users/${id}/status`, { status })
      return Promise.resolve(response.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },
}