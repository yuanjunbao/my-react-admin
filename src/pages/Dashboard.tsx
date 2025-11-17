import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/auth'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  // Example statistics data
  interface StatisticItem {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    trend: string
  }
  const statistics: StatisticItem[] = [
    { title: 'dashboard.totalUsers', value: 12345, icon: <UserOutlined />, color: '#1890ff', trend: '+12%' },
    { title: 'dashboard.activeUsers', value: 8921, icon: <UserOutlined />, color: '#52c41a', trend: '+5%' },
    { title: 'dashboard.totalOrders', value: 45678, icon: <FileTextOutlined />, color: '#faad14', trend: '+8%' },
    { title: 'dashboard.revenue', value: '¥1,234,567', icon: <DollarOutlined />, color: '#f5222d', trend: '-2%' },
  ]

  // Chart data state
  const [barChartOption, setBarChartOption] = useState<echarts.EChartsOption>({})
  const [pieChartOption, setPieChartOption] = useState<echarts.EChartsOption>({})

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Set bar chart option (user growth)
        const barOption: echarts.EChartsOption = {
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'User Growth',
              type: 'bar',
              data: [120, 200, 150, 80, 70, 110],
              itemStyle: {
                color: '#1890ff'
              }
            }
          ]
        }
        setBarChartOption(barOption)
        
        // Set pie chart option (order status)
        const pieOption: echarts.EChartsOption = {
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 10
          },
          series: [
            {
              name: 'Order Status',
              type: 'pie',
              radius: '50%',
              data: [
                { value: 1048, name: 'Completed' },
                { value: 735, name: 'Pending' },
                { value: 580, name: 'Canceled' },
                { value: 484, name: 'Refunded' }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        setPieChartOption(pieOption)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome section */}
      <div style={{ marginBottom: 24 }}>
        <h1>{t('dashboard.welcome', { name: user?.name || 'Guest' })}</h1>
        <p>{t('dashboard.overview')}</p>
      </div>

      {/* Statistics cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card bordered={false}>
              <Statistic
                title={t(stat.title)}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
                suffix={
                  <span style={{ color: stat.trend.includes('+') ? '#52c41a' : '#f5222d' }}>
                    {stat.trend}
                    {stat.trend.includes('+') ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts and data visualization section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.recentActivities')} loading={loading}>
            {/* Recent activities bar chart */}
            <ReactECharts option={barChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.statistics')} loading={loading}>
            {/* Statistics pie chart */}
            <ReactECharts option={pieChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard