export default {
  plugins: [],
  base: process.env.NODE_ENV === 'production' ? '/formbuilder/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true
  }
}
