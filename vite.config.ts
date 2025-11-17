import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // 依赖预构建优化
  optimizeDeps: {
    // 预构建的依赖列表
    include: ['react', 'react-dom', 'antd', 'zustand', 'react-router-dom', 'axios'],
    // 忽略某些依赖的预构建
    exclude: [],
    // 强制预构建所有依赖
    force: true,
  },
  // 构建优化配置
  build: {
    // 代码分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包到一个 chunk
          react: ['react', 'react-dom', 'react-router-dom'],
          // 将 Ant Design 相关组件打包到一个 chunk
          antd: ['antd'],
          // 将状态管理和数据请求库打包到一个 chunk
          store: ['zustand', '@tanstack/react-query'],
          // 将工具库打包到一个 chunk
          utils: ['axios', 'i18next'],
        },
      },
    },
    // 启用 terser 压缩
    minify: 'terser',
    // 压缩选项
    terserOptions: {},
    // 生成 sourcemap
    sourcemap: process.env.NODE_ENV === 'development',
    // 构建输出目录
    outDir: 'dist',
    // 静态资源输出目录
    assetsDir: 'assets',
    // 静态资源哈希
    assetsInlineLimit: 4096,
  },
  // 服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 在开发环境下不设置代理，确保MSW能够正常工作
      ...(process.env.NODE_ENV !== 'development' && {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }),
    },
  },
  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        // Ant Design 主题配置
        modifyVars: {
          '@primary-color': '#1890ff',
          '@border-radius-base': '4px',
        },
        javascriptEnabled: true,
      },
    },
    // 启用 CSS Modules
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // 
  },
})
