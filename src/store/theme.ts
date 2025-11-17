import { create } from 'zustand' 
import { persist, createJSONStorage } from 'zustand/middleware' 

// Define theme types
interface ThemeConfig {
  // Whether dark mode is enabled
  isDarkMode: boolean
  // Theme color palette
  colorPrimary?: string
  // Theme algorithm type
  algorithm?: 'default' | 'dark' | 'compact'
}

// Define the theme state interface 
interface ThemeState {
  // Theme configuration
  theme: ThemeConfig
  // Toggle theme function
  toggleTheme: () => void
  // Set theme configuration
  setThemeConfig: (config: Partial<ThemeConfig>) => void
  // Reset theme to default
  resetTheme: () => void
}

// Default theme configuration
const defaultTheme: ThemeConfig = {
  isDarkMode: false,
  algorithm: 'default'
}

// Create the theme store with persistence middleware 
const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Initial state: light mode by default
      theme: defaultTheme, 

      // Toggle theme function
      toggleTheme: () => {
        set((state) => ({
          theme: {
            ...state.theme,
            isDarkMode: !state.theme.isDarkMode,
            algorithm: !state.theme.isDarkMode ? 'dark' : 'default'
          }
        }))
      },
      // Set theme configuration
      setThemeConfig: (config) => {
        set((state) => ({
          theme: {
            ...state.theme,
            ...config
          }
        }))
      },
      // Reset theme to default
      resetTheme: () => {
        set(() => ({
          theme: defaultTheme
        }))
      }
    }),
    {
      name: 'theme-storage', // Local storage key
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
      migrate: (persistedState) => {
        // Migrate old theme state to new format
        if (typeof persistedState === 'object' && persistedState !== null && 'isDarkMode' in persistedState) {
          const oldState = persistedState as unknown as { isDarkMode: boolean }
          return { theme: { ...defaultTheme, isDarkMode: oldState.isDarkMode } }
        }
        return persistedState as ThemeState
      }
    }
  )
)

export default useThemeStore