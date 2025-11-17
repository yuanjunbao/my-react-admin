import { Layout, Menu, Button, Drawer } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/auth'
import useThemeStore from '../store/theme'
import { menuConfig } from './menuConfig'
import ThemeSettings from '../pages/ThemeSettings'

// Main layout component with sidebar and header
export const MainLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerVisible, setDrawerVisible] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { theme: { isDarkMode } } = useThemeStore()
  const { t } = useTranslation()
  
  const menuItems = menuConfig.map(item => ({
    ...item,
    label: t(item.label)
  }))
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme={isDarkMode ? 'dark' : 'light'}>
        <div className="logo" style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 20, textAlign: 'center', padding: 20 }}>
          Admin Panel
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={({ key }) => {
            const item = menuItems.find(item => item.key === key)
            if (item) {
              navigate(item.path)
            }
          }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ padding: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' ,backgroundColor: isDarkMode ? '#1f1f1f' : '#fff'}}>
            <Button type="text" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Button type="text" onClick={() => setDrawerVisible(true)}
              icon={<SettingOutlined />}
              style={{ marginLeft: 16 }}
            >
              {t('common.settings')}
            </Button>
            <Button type="text" onClick={() => { logout(); navigate('/login') }}
              icon={<LogoutOutlined />}
              style={{ marginLeft: 16 }}
            >
              {t('common.logout')}
            </Button>
          </Layout.Header>
        <Layout.Content style={{ margin: '16px', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Layout.Content>

        {/* 悬浮设置按钮 */}
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <Button
            type="primary"
            shape="circle"
            icon={<SettingOutlined />}
            size="large"
            onClick={() => setDrawerVisible(true)}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
          />
        </div>

        {/* 右侧抽屉 */}
        <Drawer
          title={t('common.settings')}
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={400}
        >
          <ThemeSettings />
        </Drawer>
      </Layout>
    </Layout>
  )
}