import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders } from 'axios'
import { message } from 'antd'

// Define the type for the refresh token response
interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token')
    // Add the token to the Authorization header if it exists
    if (token) {
        // Ensure headers is not undefined and is a plain object
        if (!config.headers) {
          config.headers = {} as AxiosRequestHeaders;
        }
        // Set the Authorization header using object notation
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    return config
  },
  (error: AxiosError) => {
    // Handle request errors
    return Promise.reject(error)
  }
)

// Response interceptor with token refresh logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get the refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call the refresh token endpoint
        const response = await axios.post<RefreshTokenResponse>(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        // Update the tokens in localStorage
        const { token, refreshToken: newRefreshToken } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Retry the original request with the new token
        if (!originalRequest.headers) {
          originalRequest.headers = {} as AxiosRequestHeaders;
        }
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Handle refresh token errors
        message.error('Session expired. Please login again.')
        // Clear tokens from localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        // Redirect to login page
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default apiClient