# 🌐 HOSTING GUIDE - C. Sambu Farm Management System

## Deploy Your Farm Management System for Remote Access

This guide shows how to host the application so colleagues can access it from anywhere via the internet.

---

## 🎯 Recommended Hosting Solutions

### Option 1: Railway.app (Easiest - Recommended)
**Cost:** Free tier available, ~$5/month for production
**Best for:** Quick deployment with minimal configuration

### Option 2: Render.com
**Cost:** Free tier available
**Best for:** Free hosting with automatic HTTPS

### Option 3: DigitalOcean App Platform
**Cost:** ~$12/month
**Best for:** Production-ready deployment with scaling

### Option 4: AWS/Azure/Google Cloud
**Cost:** Variable
**Best for:** Enterprise deployments with custom requirements

---

## 🚀 OPTION 1: Railway.app (EASIEST - 15 minutes)

### Step 1: Prepare Your Application

1. **Update Backend API URL** in frontend code:

```bash
# Edit frontend/src/App.jsx and all component files
# Change from:
const API_BASE = 'http://localhost:8000'

# To:
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

2. **Create environment file** `frontend/.env.production`:

```bash
cd frontend
cat > .env.production << EOF
VITE_API_URL=https://your-backend-url.railway.app
EOF
```

### Step 2: Deploy Backend to Railway

1. **Sign up at Railway.app** (use GitHub account)

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repository

3. **Add PostgreSQL database:**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will provide connection URL automatically

4. **Configure backend service:**
   - Click "+ New" → "GitHub Repo"
   - Select your repository
   - Set root directory: `/backend`
   - Railway auto-detects Dockerfile

5. **Set environment variables:**
   ```
   DATABASE_URL=<auto-filled by Railway>
   CORS_ORIGINS=https://your-frontend-url.netlify.app,https://your-frontend-url.vercel.app
   ```

6. **Get your backend URL:**
   - Copy the generated URL (e.g., `https://farmbackend.railway.app`)

### Step 3: Deploy Frontend to Netlify

1. **Sign up at Netlify.com** (use GitHub account)

2. **Create production build:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy via Netlify CLI:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist
   ```

4. **Or deploy via Netlify UI:**
   - Drag and drop the `frontend/dist` folder to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

5. **Set environment variable:**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://your-backend-url.railway.app`

6. **Get your frontend URL:**
   - Copy the generated URL (e.g., `https://csambu-farm.netlify.app`)

### Step 4: Update CORS Settings

Update backend CORS to allow your frontend:

```python
# In backend/app/main.py
origins = [
    "http://localhost:5173",
    "https://csambu-farm.netlify.app",  # Add your Netlify URL
]
```

Push changes and Railway will auto-deploy.

### Step 5: Initialize Database

```bash
# Initialize factories on Railway
curl -X POST https://your-backend-url.railway.app/factories/initialize-default
```

**Done! Share the Netlify URL with your colleagues! 🎉**

---

## 🚀 OPTION 2: Render.com (FREE - 20 minutes)

### Step 1: Deploy Backend

1. **Sign up at Render.com**

2. **Create PostgreSQL database:**
   - Click "New +" → "PostgreSQL"
   - Name: `farm-db`
   - Plan: Free
   - Copy the "Internal Database URL"

3. **Create web service for backend:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - Name: `farm-backend`
     - Root Directory: `backend`
     - Environment: Docker
     - Plan: Free
   - Environment Variables:
     ```
     DATABASE_URL=<paste internal database URL>
     CORS_ORIGINS=https://farm-frontend.onrender.com
     ```

4. **Get backend URL:**
   - Copy the Render URL (e.g., `https://farm-backend.onrender.com`)

### Step 2: Deploy Frontend

1. **Create static site:**
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Settings:
     - Name: `farm-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://farm-backend.onrender.com
     ```

2. **Get frontend URL:**
   - Copy the Render URL (e.g., `https://farm-frontend.onrender.com`)

### Step 3: Update CORS and Initialize

Same as Railway option above.

**Note:** Free tier on Render spins down after 15 minutes of inactivity. First request takes ~30 seconds.

---

## 🚀 OPTION 3: DigitalOcean App Platform (Production - 30 minutes)

### Step 1: Prepare Your Code

1. **Create `backend/app.yaml`:**

```yaml
name: farm-management
services:
  - name: backend
    source:
      repo: your-github-repo
      branch: main
      root: backend
    dockerfile_path: backend/Dockerfile
    http_port: 8000
    instance_size: basic-xxs
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.DATABASE_URL}
      - key: CORS_ORIGINS
        value: ${APP_URL}

  - name: frontend
    source:
      repo: your-github-repo
      branch: main
      root: frontend
    build_command: npm install && npm run build
    run_command: npm run preview
    http_port: 4173
    instance_size: basic-xxs
    envs:
      - key: VITE_API_URL
        value: ${backend.PUBLIC_URL}

databases:
  - name: db
    engine: PG
    production: true
    cluster_name: farm-db
```

2. **Push to GitHub**

### Step 2: Deploy on DigitalOcean

1. **Create App:**
   - Go to App Platform
   - Click "Create App"
   - Select GitHub repository
   - DigitalOcean detects `app.yaml` automatically

2. **Review and Deploy:**
   - Review configuration
   - Click "Create Resources"
   - Wait for deployment (~5 minutes)

3. **Get URLs:**
   - Backend: `https://backend-xxxxx.ondigitalocean.app`
   - Frontend: `https://farm-xxxxx.ondigitalocean.app`

**Cost:** ~$12/month for basic setup

---

## 📱 Custom Domain Setup (Optional)

### For Netlify:

1. **Buy a domain** (e.g., from Namecheap, Google Domains)

2. **Add to Netlify:**
   - Site settings → Domain management
   - Add custom domain: `farm.yourdomain.com`

3. **Configure DNS:**
   - Add CNAME record pointing to Netlify:
     ```
     Type: CNAME
     Name: farm
     Value: your-site.netlify.app
     ```

4. **Enable HTTPS:**
   - Netlify provides free SSL automatically

### For Railway/Render:

Similar process - add custom domain in platform settings and configure DNS.

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit these to Git:**
```bash
# backend/.env (add to .gitignore)
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-frontend.com
```

### 2. Database Backups

**Railway:**
- Automatic daily backups on paid plans
- Manual backup: Export from Railway dashboard

**Render:**
- Automatic backups on paid plans
- Manual: `pg_dump` to export

**DigitalOcean:**
- Automatic daily backups included
- Point-in-time recovery available

### 3. HTTPS/SSL

All modern platforms (Netlify, Railway, Render, DO) provide:
- ✅ Free automatic HTTPS
- ✅ SSL certificates from Let's Encrypt
- ✅ Auto-renewal

### 4. Authentication (Future Enhancement)

Consider adding user authentication:
- JWT tokens for API access
- Role-based access control
- Password protection for sensitive pages

---

## 📊 Monitoring & Maintenance

### Monitor Application Health

**Uptime Monitoring:**
- Use UptimeRobot.com (free)
- Monitor: `https://your-backend.com/docs`
- Get alerts if site goes down

**Performance Monitoring:**
- Check Railway/Render/DO dashboards
- Monitor response times
- Track database usage

### Regular Maintenance

**Weekly:**
- Check application logs
- Review error reports
- Test critical features

**Monthly:**
- Review database size
- Check backup status
- Update dependencies if needed

**Quarterly:**
- Security audit
- Performance optimization
- Feature improvements

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Railway** | $5 credit/month | ~$5-10/month | Easy deployment |
| **Render** | Yes (with limits) | $7/month | Free hosting |
| **Netlify** | Yes | $19/month | Frontend only |
| **DigitalOcean** | No | $12/month | Production apps |
| **Heroku** | Limited | $7/month | Legacy option |

**Recommended for you:** Railway ($5/month) + Netlify (free) = $5/month total

---

## 🎯 Quick Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] PostgreSQL database created
- [ ] Factories initialized
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connected successfully
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Colleagues can access the system

---

## 📞 Share with Colleagues

Once deployed, share this with your team:

```
🌿 C. Sambu Farm Management System

Access the system at: https://your-farm-url.netlify.app

Features:
- 📊 Real-time dashboard
- 🍃 Tea plucking records
- 💰 Automated payroll
- 🌱 Fertilizer tracking
- 📱 Mobile-friendly (Add to Home Screen!)

For mobile: 
1. Open the link on your phone
2. Click "Add to Home Screen"
3. Use like a native app!

Questions? Contact: [Your Name/Number]
```

---

## 🆘 Troubleshooting Deployment

### Backend Won't Start

```bash
# Check logs on Railway/Render
# Look for database connection errors
# Verify DATABASE_URL is set correctly
```

### Frontend Can't Connect to Backend

```bash
# Check CORS settings in backend
# Verify VITE_API_URL is correct
# Check browser console for errors
```

### Database Connection Failed

```bash
# Verify DATABASE_URL format
# Check database is running
# Ensure IP whitelist includes platform IPs
```

### Slow Performance

```bash
# Upgrade to paid tier
# Enable caching
# Optimize database queries
# Use CDN for static assets
```

---

## 🎉 Success!

Your farm management system is now accessible to your colleagues from anywhere in the world!

**Next steps:**
1. Train your team on how to use the system
2. Set up regular database backups
3. Monitor usage and performance
4. Gather feedback for improvements

**Happy Farming! 🌿🍃**
