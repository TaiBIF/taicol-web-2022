const { resolve } = require('path');
import react from '@vitejs/plugin-react'

module.exports = {
  plugins: [react()],
  root: resolve('./assets'),
  base: '/static/',
  server: {
    host: 'localhost',
    port: 3000,
    open: false,
    watch: {
      usePolling: true,
      disableGlobbing: false,
    },
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  build: {
    outDir: resolve('./static/react_component'),
    assetsDir: '',
    manifest: true,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve('./react_src/index.jsx'),
      }
    },
  },
};