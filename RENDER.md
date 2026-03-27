# BedWars Tournament - Render Deployment Configuration

## 🚀 Render-Specific Optimizations

### Build Configuration
- **Node Version**: 18.x (specified in package.json)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`

### Environment Variables Required
```env
# Discord Integration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_GUILD_ID=your_discord_guild_id

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Performance Monitoring
NODE_ENV=production
```

### Render Service Settings
- **Service Type**: Web Service
- **Environment**: Node
- **Region**: Oregon (or closest to users)
- **Instance Type**: Free (upgrade to Standard for production)
- **Auto-Deploy**: Enabled (push to main branch)

## 📱 Mobile Optimization for Render

### Static Asset Optimization
- Images optimized via Next.js Image component
- CSS minified and purged
- JavaScript code splitting
- Font optimization with Google Fonts

### Performance Headers
```javascript
// Added via next.config.js
headers: [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      }
    ]
  }
]
```

### Caching Strategy
- Static assets cached for 1 year
- API responses cached appropriately
- Service worker for offline support (future)

## 🔧 Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Optimized for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Login to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure settings as above

### 3. Configure Environment
Add all environment variables in Render dashboard

### 4. Deploy and Test
- Wait for build completion
- Test mobile responsiveness
- Verify Discord bot integration
- Check all functionality

## 📊 Post-Deployment Checklist

### Performance Testing
- [ ] Google PageSpeed Insights (90+ mobile score)
- [ ] GTmetrix performance test
- [ ] Mobile device testing
- [ ] Load testing with multiple users

### Functionality Testing
- [ ] Tournament creation works
- [ ] Team registration functional
- [ ] Discord bot online with custom status
- [ ] Mobile responsive design
- [ ] All pages load correctly

### Monitoring Setup
- [ ] Render logs monitoring
- [ ] Error tracking setup
- [ ] Performance metrics
- [ ] Uptime monitoring

## 🚨 Troubleshooting Render Issues

### Common Problems
1. **Build Failures**
   - Check package.json scripts
   - Verify Node version compatibility
   - Review build logs

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify Firebase credentials

3. **Mobile Issues**
   - Test with Chrome DevTools
   - Check responsive breakpoints
   - Verify touch interactions

4. **Discord Bot Problems**
   - Verify bot token is correct
   - Check bot permissions
   - Ensure bot is online

### Debug Commands
```bash
# Local testing
npm run build
npm start

# Check environment
npm run env-check

# Performance test
npm run lighthouse
```

## 🎯 Production Optimizations

### Bundle Size Reduction
- Tree shaking enabled
- Dead code elimination
- Dynamic imports for heavy components
- Image optimization

### SEO and Accessibility
- Meta tags optimized
- Structured data
- Alt tags for images
- Semantic HTML5
- ARIA labels

### Security
- Environment variables secure
- CSRF protection
- XSS protection headers
- Content Security Policy (future)

---

**Ready for production deployment on Render!** 🚀
