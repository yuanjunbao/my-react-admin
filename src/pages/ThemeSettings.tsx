import { useState, useEffect, useRef } from 'react'
import { Card, Switch, ColorPicker, Radio, Button, Space, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import useThemeStore from '../store/theme'
import i18n from '../i18n'
import type { Color } from 'antd/es/color-picker'
import type { RadioChangeEvent } from 'antd/es/radio'

const { Title, Text } = Typography

const ThemeSettings = () => {
  const { t } = useTranslation()
  const { theme, setThemeConfig, resetTheme } = useThemeStore()
  const [localTheme, setLocalTheme] = useState(theme)
  const [customColor, setCustomColor] = useState(localTheme.colorPrimary || '#1890ff')
  const prevThemeRef = useRef(theme)

  // Update local state when theme changes (only if truly changed)
  useEffect(() => {
    // Only update if theme has actually changed to avoid cascading renders
    if (JSON.stringify(prevThemeRef.current) !== JSON.stringify(theme)) {
      setLocalTheme(theme)
      setCustomColor(theme.colorPrimary || '#1890ff')
      prevThemeRef.current = theme // Update ref for next comparison
    }
  }, [theme])

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setLocalTheme(prev => ({
      ...prev,
      isDarkMode: checked,
      algorithm: checked ? 'dark' : 'default'
    }))
  }

  // Handle color change
  const handleColorChange = (color: Color) => {
    setCustomColor(color.toHexString())
    setLocalTheme(prev => ({
      ...prev,
      colorPrimary: color.toHexString()
    }))
  }

  // Handle algorithm change
  const handleAlgorithmChange = (e: RadioChangeEvent) => {
    const algorithm = e.target.value as 'default' | 'dark' | 'compact'
    setLocalTheme(prev => ({
      ...prev,
      algorithm,
      isDarkMode: algorithm === 'dark'
    }))
  }

  // Save theme settings
  const handleSaveTheme = () => {
    setThemeConfig(localTheme)
    message.success(t('theme.themeUpdated'))
  }

  // Reset theme to default
  const handleResetTheme = () => {
    resetTheme()
    message.success(t('theme.themeUpdated'))
  }

  // Handle language change
  const handleLanguageChange = (e: RadioChangeEvent) => {
    const language = e.target.value as 'zh' | 'en'
    i18n.changeLanguage(language)
    message.success(t('common.success'))
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>{t('common.settings')}</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Color Theme Card */}
        <Card title={t('theme.colorTheme')} variant="outlined">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>{t('theme.customColor')}: </Text>
              <ColorPicker
                value={customColor}
                onChange={handleColorChange}
                showText
                style={{ marginLeft: 16 }}
              />
            </div>
            <div style={{ height: 40 }} />
          </Space>
        </Card>

        {/* Dark Mode Card */}
        <Card title={t('theme.darkMode')} variant="outlined">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Switch
                checked={localTheme.isDarkMode}
                onChange={handleModeToggle}
                checkedChildren={<Text>{t('common.on')}</Text>}
                unCheckedChildren={<Text>{t('common.off')}</Text>}
                style={{ marginRight: 16 }}
              />
              <Text>{localTheme.isDarkMode ? t('theme.darkMode') : t('theme.lightMode')}</Text>
            </div>
            <div style={{ height: 40 }} />
          </Space>
        </Card>

        {/* Theme Algorithm Card */}
        <Card title={t('theme.algorithm')} variant="outlined">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Group
              value={localTheme.algorithm}
              onChange={handleAlgorithmChange}
              buttonStyle="solid"
              style={{ width: '100%' }}
            >
              <Radio.Button value="default" style={{ width: '33.33%', textAlign: 'center' }}>
                {t('theme.default')}
              </Radio.Button>
              <Radio.Button value="dark" style={{ width: '33.33%', textAlign: 'center' }}>
                {t('theme.darkMode')}
              </Radio.Button>
              <Radio.Button value="compact" style={{ width: '33.33%', textAlign: 'center' }}>
                {t('theme.compact')}
              </Radio.Button>
            </Radio.Group>
            <div style={{ height: 40 }} />
          </Space>
        </Card>

        {/* Language Settings Card */}
        <Card title={t('common.languageSettings')} variant="outlined">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Group
              value={i18n.language}
              onChange={handleLanguageChange}
              buttonStyle="solid"
              style={{ width: '100%' }}
            >
              <Radio.Button value="zh" style={{ width: '50%', textAlign: 'center' }}>
                {t('common.chinese')}
              </Radio.Button>
              <Radio.Button value="en" style={{ width: '50%', textAlign: 'center' }}>
                {t('common.english')}
              </Radio.Button>
            </Radio.Group>
            <div style={{ height: 40 }} />
          </Space>
        </Card>

        {/* Action Buttons */}
        <Space direction="horizontal" size="middle" style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={handleResetTheme}>{t('theme.resetToDefault')}</Button>
          <Button type="primary" onClick={handleSaveTheme}>{t('theme.saveTheme')}</Button>
        </Space>
      </Space>
    </div>
  )
}

export default ThemeSettings