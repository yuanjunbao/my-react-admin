import apiClient from '../utils/axios'

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  key: string;
  label: string;
  children?: Permission[];
}

interface RoleFilter {
  name?: string;
  page?: number;
  pageSize?: number;
}

export const roleService = {
  // Get roles with filters
  getRoles: async (filter?: RoleFilter): Promise<{ list: Role[]; total: number }> => {
    try {
      const response = await apiClient.get('/roles', { params: filter })
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get role by ID
  getRoleById: async (id: string): Promise<Role> => {
    try {
      const response = await apiClient.get(`/roles/${id}`)
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Create role
  createRole: async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> => {
    try {
      const response = await apiClient.post('/roles', roleData)
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Update role
  updateRole: async (id: string, roleData: Partial<Role>): Promise<Role> => {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData)
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/roles/${id}`)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Batch delete roles
  batchDeleteRoles: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.delete('/roles/batch', { data: { ids } })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    try {
      const response = await apiClient.get('/permissions')
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Get permissions by role
  getPermissionsByRole: async (roleId: string): Promise<Permission[]> => {
    try {
      const response = await apiClient.get(`/roles/${roleId}/permissions`)
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Update role permissions
  updateRolePermissions: async (roleId: string, permissions: string[]): Promise<Role> => {
    try {
      const response = await apiClient.put(`/roles/${roleId}/permissions`, { permissions })
      return Promise.resolve(response.data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  },
}