# Deployment Guide

## 🚀 Setup & Deployment Instructions

This guide covers everything needed to set up, develop, and deploy the Form Builder application.

## 📋 Prerequisites

### **Required Software**
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### **Development Tools (Recommended)**
- **VS Code**: With React and TypeScript extensions
- **React Developer Tools**: Browser extension
- **Redux DevTools**: For state debugging (if using Redux)

### **System Requirements**
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: 1GB free space for dependencies
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 🛠️ Local Development Setup

### **1. Clone Repository**
```bash
git clone <repository-url>
cd formbuilder
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start Development Server**
```bash
npm run dev
```
- Application runs on `http://localhost:5173`
- Hot reload enabled for development
- TypeScript compilation in watch mode

### **4. Available Scripts**

#### **Development**
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build production version
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript compiler check
```

#### **Testing**
```bash
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode  
npm run test:ui     # Run tests with UI interface
npm run coverage    # Generate test coverage report
```

#### **Code Quality**
```bash
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format code with Prettier
npm run type-check  # TypeScript type checking
```

## 🏗️ Build Configuration

### **Vite Configuration (`vite.config.ts`)**
```typescript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          dnd: ['react-dnd', 'react-dnd-html5-backend']
        }
      }
    }
  }
});
```

### **TypeScript Configuration (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 📦 Production Build

### **1. Create Production Build**
```bash
npm run build
```

This creates:
- `dist/` folder with optimized assets
- Minified JavaScript and CSS
- Asset hashing for cache busting
- Service worker for PWA functionality

### **2. Build Output Structure**
```
dist/
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── index-[hash].css    # Compiled styles
│   └── vendor-[hash].js    # Third-party dependencies
├── index.html              # Main HTML file
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
└── registerSW.js           # SW registration
```

### **3. Build Optimization Features**
- **Code Splitting**: Separate vendor and app bundles
- **Tree Shaking**: Remove unused code
- **Minification**: Compressed JavaScript and CSS
- **Asset Optimization**: Compressed images and fonts
- **PWA Support**: Service worker for offline functionality

## 🌐 Deployment Options

### **Option 1: Static Site Hosting (Recommended)**

#### **Netlify Deployment**
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: None required
4. **Deploy Settings**:
   ```toml
   [build]
   publish = "dist"
   command = "npm run build"
   
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

#### **Vercel Deployment**
1. Connect GitHub repository
2. **Framework**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Auto-deploy on git push

#### **GitHub Pages**
```bash
npm run build
npm run deploy  # If deploy script configured
```

### **Option 2: Traditional Web Server**

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/formbuilder/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;
}
```

#### **Apache Configuration**
```apache
<VirtualHost *:80>
    DocumentRoot /var/www/formbuilder/dist
    ServerName your-domain.com
    
    # Handle client-side routing
    <Directory /var/www/formbuilder/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Fallback to index.html for SPA
        FallbackResource /index.html
    </Directory>
    
    # Cache static assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

### **Option 3: Docker Deployment**

#### **Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage  
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  formbuilder:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

## 🔧 Environment Configuration

### **Development Environment**
```bash
# .env.development
VITE_APP_TITLE="Form Builder - Development"
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_ENABLE_ANALYTICS=false
```

### **Production Environment**  
```bash
# .env.production
VITE_APP_TITLE="Form Builder"
VITE_API_BASE_URL="https://api.yourdomain.com"
VITE_ENABLE_ANALYTICS=true
```

### **Environment Variables**
- **VITE_**: Prefix required for Vite to expose to client
- **NODE_ENV**: Automatically set by build tools
- **Custom Variables**: Add to `.env` files as needed

## 📊 Performance Optimization

### **Build Performance**
- **Parallel Processing**: Multi-core CPU utilization
- **Incremental Builds**: Only rebuild changed files
- **Cache Optimization**: Dependency caching
- **Bundle Splitting**: Separate vendor chunks

### **Runtime Performance**
- **Code Splitting**: Load components on demand  
- **Lazy Loading**: Route-based splitting
- **Memoization**: React.memo, useMemo, useCallback
- **Service Worker**: Asset caching and offline support

### **Network Optimization**
- **Compression**: Gzip/Brotli compression
- **CDN**: Serve static assets from CDN
- **HTTP/2**: Server push for critical resources
- **Prefetching**: Preload critical routes

## 🐛 Debugging & Monitoring

### **Development Debugging**
- **React DevTools**: Component inspection
- **Browser DevTools**: Network, Performance tabs
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality warnings

### **Production Monitoring**
```typescript
// Error boundary for production
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Application error:', error, errorInfo);
    
    // Send to error tracking (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo);
    }
  }
}
```

### **Performance Monitoring**
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

if (process.env.NODE_ENV === 'production') {
  getCLS(console.log);
  getFID(console.log);  
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

## 🔒 Security Considerations

### **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: blob:;">
```

### **Data Protection**
- **Client-Side Storage**: localStorage data stays local
- **No Server Communication**: No sensitive data transmitted
- **XSS Protection**: Sanitize any user-generated content
- **CSRF Protection**: Not applicable (no server state)

## 📝 Maintenance

### **Regular Tasks**
```bash
# Update dependencies
npm audit                    # Check for vulnerabilities
npm outdated                 # Check for updates
npm update                   # Update packages

# Code quality maintenance
npm run lint                 # Check code quality
npm run type-check          # Verify TypeScript
npm test                    # Run test suite
```

### **Monitoring Checklist**
- ✅ Application loads correctly
- ✅ Drag-drop functionality works
- ✅ Template save/load operations
- ✅ Preview modal functionality  
- ✅ Responsive design on mobile
- ✅ Browser compatibility testing

## 🆘 Troubleshooting

### **Common Issues**

#### **Build Fails**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Run type checker
npm run type-check

# Check for unused imports/variables
npm run lint
```

#### **Runtime Errors**
- Check browser console for errors
- Verify localStorage is available
- Check React DevTools for component issues

#### **Performance Issues**
- Use browser Performance tab
- Check for memory leaks in DevTools
- Profile component re-renders

### **Support Resources**
- **Documentation**: `/docs` folder
- **GitHub Issues**: Report bugs and feature requests
- **TypeScript**: Check type definitions
- **React**: Official React documentation

---

*This deployment guide ensures successful setup and operation of the Form Builder in any environment.*