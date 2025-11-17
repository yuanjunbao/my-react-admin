import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserRole } from '../types/auth'

// Define the authentication state interface
interface AuthState {
  // User information
  user: User | null
  // Authentication status
  isAuthenticated: boolean
  // Access token
  token: string | null
  // Refresh token
  refreshToken: string | null
  // Login function
  login: (token: string, refreshToken: string, user: User) => void
  // Logout function
  logout: () => void
  // Update user information
  updateUser: (user: Partial<User>) => void
  // Check if the user has a specific role
  hasRole: (role: UserRole | UserRole[]) => boolean
  // Check if the user has a specific permission
  hasPermission: (permission: string) => boolean
  // Get the current user's role
  getCurrentRole: () => UserRole | null
}

// Create the authentication store with persistence middleware
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,

      // Login function
      login: (token, refreshToken, user) => {
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
        })
      },

      // Logout function
      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      // Update user information
      updateUser: (userUpdates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        }))
      },

      // Check if the user has a specific role
      hasRole: (role) => {
        const user = get().user
        if (!user) return false
        
        if (Array.isArray(role)) {
          return role.includes(user.role)
        }
        
        return user.role === role
      },

      // Check if the user has a specific permission
      hasPermission: (permission) => {
        const user = get().user
        if (!user) return false
        
        // If the user is an admin, they have all permissions
        if (user.role === 'admin') return true
        
        // Check if the user has the specific permission
        return user.permissions?.includes(permission) || false
      },

      // Get the current user's role
      getCurrentRole: () => {
        return get().user?.role || null
      },
    }),
    {
      // Configure persistence
      name: 'auth-storage', // Local storage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
)

export default useAuthStore