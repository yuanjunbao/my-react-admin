import { Suspense } from 'react' 
import { RouterProvider } from 'react-router-dom' 
import { ConfigProvider, theme } from 'antd' 
import useThemeStore from './store/theme' 
import { router } from './router/routerConfig' 
import { LoadingComponent } from './router' 
import './App.css' 

function App() {
  const { theme: appTheme } = useThemeStore()
  // Get the appropriate algorithm based on theme configuration
  const getAlgorithm = () => {
    switch(appTheme.algorithm) {
      case 'dark': return theme.darkAlgorithm
      case 'compact': return theme.compactAlgorithm
      default: return theme.defaultAlgorithm
    }
  }
  return (
    <ConfigProvider theme={{ 
      algorithm: getAlgorithm(),
      token: {
        colorPrimary: appTheme.colorPrimary || '#1890ff'
      }
    }}>
      <Suspense fallback={<LoadingComponent />}>
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  )
} 

export default App
