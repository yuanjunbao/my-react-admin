import { useState } from 'react'
import { Table, Button, Card, Form, Input, Space, Modal, Checkbox, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/services/roleService'

interface Role {
  id: string
  name: string
  permissions: string[]
  createdAt: string
  updatedAt: string
  description?: string
}

interface Permission {
  key: string
  label: string
  children?: Permission[]
}

const RoleManagement: React.FC = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Define form values interface
  interface FormValues {
    name: string;
    permissions: string[];
    description?: string;
  }
  const [form] = Form.useForm<FormValues>()
  const [searchForm] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  // Fetch permissions using react-query
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: () => roleService.getPermissions()
  })

  // Fetch roles using react-query
  const { data: roleData = { list: [], total: 0 }, isLoading } = useQuery<{ list: Role[]; total: number }>({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles()
  })

  // Mutation for creating role
  const createRoleMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalVisible(false)
      form.resetFields()
    },
    onError: () => {
      message.error(t('common.error'))
    }
  })

  // Mutation for updating role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: FormValues }) => roleService.updateRole(id, roleData),
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalVisible(false)
      form.resetFields()
    },
    onError: () => {
      message.error(t('common.error'))
    }
  })

  // Mutation for deleting role
  const deleteRoleMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: () => {
      message.error(t('common.error'))
    }
  })

  // Handle search form submission
  const handleSearch = (values: Record<string, unknown>) => {
    console.log('Search values:', values)
    message.info('Search functionality coming soon')
  }

  // Handle reset search form
  const handleReset = () => {
    searchForm.resetFields()
    message.info('Reset functionality coming soon')
  }

  // Handle add role button click
  const handleAddRole = () => {
    setIsEditMode(false)
    setCurrentRole(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // Handle edit role button click
  const handleEditRole = (role: Role) => {
    setIsEditMode(true)
    setCurrentRole(role)
    form.setFieldsValue(role)
    setIsModalVisible(true)
  }

  // Handle delete role button click
  const handleDeleteRole = (roleId: string) => {
    Modal.confirm({
      title: t('common.delete'),
      content: t('roles.deleteRoleConfirm'),
      onOk: () => {
        deleteRoleMutation.mutate(roleId)
      },
    })
  }

  // Handle form submission (add or edit role)
  const handleFormSubmit = (values: FormValues) => {
    const roleData = { ...values, permissions: Array.isArray(values.permissions) ? values.permissions : [] }
    
    if (isEditMode && currentRole) {
      updateRoleMutation.mutate({ id: currentRole.id, roleData })
    } else {
      createRoleMutation.mutate(roleData)
    }
  }

  // Render permission tree
  const renderPermissionTree = (permissions: Permission[], level: number = 0) => {
    return permissions.map(permission => (
      <div key={permission.key} style={{ paddingLeft: `${level * 24}px`, marginBottom: 16 }}>
        <Checkbox value={permission.key}>{permission.label}</Checkbox>
        {permission.children && permission.children.length > 0 && renderPermissionTree(permission.children, level + 1)}
      </div>
    ))
  }

  // Table columns configuration
  const columns = [
    { title: t('roles.roleName'), dataIndex: 'name', key: 'name', width: 200 },
    { title: t('roles.permissions'), dataIndex: 'permissions', key: 'permissions', width: 400, render: (permissions: string[]) => permissions.join(', ') },
    { title: t('common.description'), dataIndex: 'description', key: 'description', width: 200 },
    { title: t('roles.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    { 
      title: t('common.actions'), 
      key: 'actions', 
      width: 150,
      render: (_: unknown, record: Role) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditRole(record)}>{t('common.edit')}</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteRole(record.id)}>{t('common.delete')}</Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{t('roles.title')}</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
            {t('roles.addRole')}
          </Button>
        </div>

        {/* Search and filter form */}
        <Card>
          <Form form={searchForm} onFinish={handleSearch} layout="inline">
            <Form.Item name="name" label={t('roles.roleName')}>
              <Input placeholder={t('roles.roleName')} prefix={<SearchOutlined />} />
            </Form.Item>
            <Space size="middle">
              <Button type="primary" htmlType="submit">{t('common.search')}</Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form>
        </Card>

        {/* Role list table */}
        <Card>
          <Table
        columns={columns}
        dataSource={roleData.list}
        loading={isLoading || permissionsLoading || createRoleMutation.isPending || updateRoleMutation.isPending || deleteRoleMutation.isPending}
        rowKey="id"
        bordered={false}
        pagination={{ pageSize: 10 }}
      />
        </Card>
      </Space>

      {/* Role form modal */}
      <Modal
        title={isEditMode ? t('roles.editRole') : t('roles.addRole')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('roles.roleName')}
            rules={[{ required: true, message: t('roles.roleNameRequired') }, { pattern: /^[a-zA-Z0-9_-]+$/, message: t('roles.roleNamePattern') }]}
          >
            <Input placeholder={t('roles.roleName')} />
          </Form.Item>

          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea placeholder={t('common.description')} rows={3} />
          </Form.Item>

          <Form.Item
            name="permissions"
            label={t('roles.permissions')}
            rules={[{ required: true, message: t('roles.permissionsRequired') }]}
          >
            <Checkbox.Group style={{ maxHeight: 400, overflowY: 'auto', padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
              {renderPermissionTree(permissions)}
            </Checkbox.Group>
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
             <Button onClick={() => setIsModalVisible(false)}>{t('common.cancel')}</Button>
             <Button type="primary" htmlType="submit" loading={createRoleMutation.isPending || updateRoleMutation.isPending}>
               {t('common.save')}
             </Button>
           </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default RoleManagement