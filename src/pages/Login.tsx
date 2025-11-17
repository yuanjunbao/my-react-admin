import { useState } from 'react'
import { Form, Input, Button, Card, Space, message } from 'antd'
import { LockOutlined, UserOutlined, MobileOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { LoginRequest } from '../types/auth'
import { authService } from '../services/authService'

const Login: React.FC = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const navigate = useNavigate()

  // Login mutation using @tanstack/react-query
  const loginMutation = useMutation({ 
    mutationFn: (values: LoginRequest) => authService.login(values),
    onSuccess: () => {
      message.success(t('common.success'))
      // Navigate to dashboard after successful login
      navigate('/dashboard')
    },
    onError: () => {
      message.error(t('common.error'))
    },
  })

  // Handle form submission
  const handleLogin = (values: LoginRequest) => {
    loginMutation.mutate(values)
  }

  // Handle registration
  const handleRegister = () => {
    // Implement registration logic here
    message.info('Registration functionality coming soon')
  }

  // Handle forgot password
  const handleForgotPassword = () => {
    // Implement forgot password logic here
    message.info('Forgot password functionality coming soon')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title={t('login.title')} style={{ width: 400 }}>
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
        >
          {/* Login type toggle */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type={loginType === 'email' ? 'primary' : 'default'}
              onClick={() => setLoginType('email')}
              style={{ marginRight: 16 }}
            >
              {t('login.email')}
            </Button>
            <Button
              type={loginType === 'phone' ? 'primary' : 'default'}
              onClick={() => setLoginType('phone')}
            >
              {t('login.phone')}
            </Button>
          </div>

          {/* Email login form */}
          {loginType === 'email' && (
            <Form.Item
              name="identifier"
              label={t('login.email')}
              rules={[{ required: true, message: t('login.emailPlaceholder') }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('login.emailPlaceholder')}
              />
            </Form.Item>
          )}

          {/* Phone login form */}
          {loginType === 'phone' && (
            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Form.Item
                name="identifier"
                rules={[{ required: true, message: t('login.phonePlaceholder') }]}
                noStyle
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder={t('login.phonePlaceholder')}
                />
              </Form.Item>
              <Button type="default">{t('login.getCode')}</Button>
            </Space.Compact>
          )}

          <Form.Item
            name="password"
            label={t('login.password')}
            rules={[{ required: true, message: t('login.passwordPlaceholder') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.passwordPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loginMutation.isPending}
              block
              size="large"
            >
              {t('login.loginButton')}
            </Button>
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="default"
                block
                onClick={handleRegister}
              >
                {t('login.registerButton')}
              </Button>
              <Button
                type="link"
                block
                onClick={handleForgotPassword}
              >
                {t('login.forgotPassword')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login