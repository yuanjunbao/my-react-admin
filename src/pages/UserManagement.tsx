import { useState, useEffect } from 'react'
import { Table, Button, Card, Form, Input, Space, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { User, UserRole, UserStatus } from '../types/auth'

const UserManagement: React.FC = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  // Define form values interface
  interface FormValues {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  }

  const [form] = Form.useForm<FormValues>()
  const [searchForm] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Pagination state
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  
  // Fetch users with pagination
  const { data: userData, isLoading: loading } = useQuery({ 
    queryKey: ['users', pagination.current, pagination.pageSize], 
    queryFn: () => userService.getUsers({ page: pagination.current, pageSize: pagination.pageSize }),
  })
  
  // Update pagination total when user data changes
  useEffect(() => {
    if (userData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPagination(prev => ({ ...prev, total: userData.total }))
    }
  }, [userData])

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: FormValues) => userService.createUser({
      ...userData,
      role: userData.role as UserRole,
      status: userData.status as UserStatus,
      id: '',
      password: '',
      createdAt: '',
      updatedAt: ''
    }),
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalVisible(false)
      form.resetFields()
    },
    onError: () => {
      message.error(t('common.error'))
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: FormValues }) => userService.updateUser(id, {
      ...userData,
      role: userData.role as UserRole,
      status: userData.status as UserStatus,
    }),
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalVisible(false)
      form.resetFields()
      setCurrentUser(null)
    },
    onError: () => {
      message.error(t('common.error'))
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      message.success(t('common.success'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      message.error(t('common.error'))
    },
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

  // Handle add user button click
  const handleAddUser = () => {
    setIsEditMode(false)
    setCurrentUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // Handle edit user button click
  const handleEditUser = (user: User) => {
    setIsEditMode(true)
    setCurrentUser(user)
    form.setFieldsValue(user)
    setIsModalVisible(true)
  }

  // Handle delete user button click
  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: t('common.delete'),
      content: t('users.deleteUserConfirm'),
      onOk: () => {
        deleteUserMutation.mutate(userId)
      },
    })
  }

  // Handle form submission (add or edit user)
  const handleFormSubmit = (values: FormValues) => {
    if (isEditMode && currentUser) {
      updateUserMutation.mutate({ id: currentUser.id, userData: values })
    } else {
      createUserMutation.mutate(values)
    }
  }

  // Table columns configuration
  const columns = [
    { title: t('users.name'), dataIndex: 'name', key: 'name', width: 150 },
    { title: t('users.email'), dataIndex: 'email', key: 'email', width: 200 },
    { title: t('users.phone'), dataIndex: 'phone', key: 'phone', width: 150 },
    { title: t('users.role'), dataIndex: 'role', key: 'role', width: 120 },
    { title: t('users.status'), dataIndex: 'status', key: 'status', width: 120 },
    { title: t('users.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    { 
      title: t('common.actions'), 
      key: 'actions', 
      width: 150,
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)}>{t('common.edit')}</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)}>{t('common.delete')}</Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{t('users.title')}</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            {t('users.addUser')}
          </Button>
        </div>

        {/* Search and filter form */}
        <Card>
          <Form form={searchForm} onFinish={handleSearch} layout="inline">
            <Form.Item name="name" label={t('users.name')}>
              <Input placeholder={t('users.name')} prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="email" label={t('users.email')}>
              <Input placeholder={t('users.email')} prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="role" label={t('users.role')}>
              <Input placeholder={t('users.role')} prefix={<FilterOutlined />} />
            </Form.Item>
            <Space size="middle">
              <Button type="primary" htmlType="submit">{t('common.search')}</Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form>
        </Card>

        {/* User list table */}
        <Card>
          <Table
        columns={columns}
        dataSource={userData?.list}
        loading={loading}
        rowKey="id"
        bordered={false}
        pagination={{ 
          ...pagination, 
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })) 
        }}
      />
        </Card>
      </Space>

      {/* User form modal */}
      <Modal
        title={isEditMode ? t('users.editUser') : t('users.addUser')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('users.name')}
            rules={[{ required: true, message: t('users.nameRequired') }]}
          >
            <Input placeholder={t('users.name')} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[{ required: true, message: t('users.emailRequired') }, { type: 'email', message: t('users.emailInvalid') }]}
          >
            <Input placeholder={t('users.email')} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('users.phone')}
            rules={[{ required: true, message: t('users.phoneRequired') }, { pattern: /^[0-9]+$/, message: t('users.phoneInvalid') }]}
          >
            <Input placeholder={t('users.phone')} />
          </Form.Item>

          <Form.Item
            name="role"
            label={t('users.role')}
            rules={[{ required: true, message: t('users.roleRequired') }]}
          >
            <Input placeholder={t('users.role')} />
          </Form.Item>

          <Form.Item
            name="status"
            label={t('users.status')}
            rules={[{ required: true, message: t('users.statusRequired') }]}
          >
            <Input placeholder={t('users.status')} />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => setIsModalVisible(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading || createUserMutation.isPending || updateUserMutation.isPending}>
              {t('common.save')}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement