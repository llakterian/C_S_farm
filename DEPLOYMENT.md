# Deployment Guide - Netlify + GitHub

This guide will help you deploy the C. Sambu Farm Manager to Netlify with automatic GitHub deployments.

## Prerequisites
- GitHub account
- Netlify account (free tier works perfectly)
- Git installed on your computer

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository
```bash
cd /home/c0bw3b/Documents/Farm
git init
git add .
git commit -m "Initial commit: C. Sambu Farm Manager"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name it: `farm-manager` (or your preferred name)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create Repository"

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/farm-manager.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Netlify UI (Recommended for First Time)

1. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign up or log in

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify to access your repositories
   - Select your `farm-manager` repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - Click "Deploy site"

4. **Wait for Deployment**
   - First deployment takes 2-3 minutes
   - You'll get a URL like: `https://random-name-123.netlify.app`

5. **Custom Domain (Optional)**
   - Go to "Site settings" → "Domain management"
   - Click "Add custom domain"
   - Follow instructions to add your domain

### Option B: Netlify CLI (Advanced)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd /home/c0bw3b/Documents/Farm
netlify deploy --prod
```

## Step 3: Configure Auto-Deployment

### 3.1 Get Netlify Tokens
1. Go to Netlify → User Settings → Applications
2. Create a new Personal Access Token
3. Copy the token (you'll need it for GitHub)

### 3.2 Get Site ID
1. Go to your site in Netlify
2. Site Settings → General → Site details
3. Copy the "Site ID"

### 3.3 Add GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add two secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify token
   - `NETLIFY_SITE_ID`: Your site ID

### 3.4 Enable GitHub Actions
The `.github/workflows/deploy.yml` file is already set up!
Every push to `main` will automatically deploy to Netlify.

## Step 4: Share with Your Team

### Your Live URL
After deployment, you'll get a URL like:
```
https://your-site-name.netlify.app
```

### Share Instructions for Team:
1. **Desktop Users**:
   - Visit the URL in Chrome, Edge, or Safari
   - Click the install icon in the address bar
   - App will install like a native application

2. **Mobile Users (Android)**:
   - Visit the URL in Chrome
   - Tap the menu (⋮) → "Add to Home Screen"
   - App will appear on home screen like a native app

3. **Mobile Users (iOS)**:
   - Visit the URL in Safari
   - Tap the Share button (□↑)
   - Tap "Add to Home Screen"
   - App will appear on home screen

### Default Credentials
Share these with your team:
- **Email**: `admin@farm.com`
- **Password**: `admin123`

**Important**: Each user's data is stored locally on their device!

## Step 5: Making Updates

### Push Changes
```bash
cd /home/c0bw3b/Documents/Farm
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Actions will automatically:
1. Build the new version
2. Deploy to Netlify
3. Users will get updates automatically (PWA auto-update)

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure `frontend/package.json` has all dependencies
- Verify Node version is 20

### Users Not Getting Updates
- PWA updates on next app restart
- Tell users to close and reopen the app
- Or refresh the browser

### Data Not Syncing Between Devices
- **This is expected!** Data is stored locally on each device
- Each device has its own independent database
- This is a feature, not a bug (offline-first design)

## Advanced: Custom Domain

### Add Your Domain
1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Netlify: Site Settings → Domain Management
3. Add custom domain
4. Update DNS records as instructed by Netlify
5. Wait for DNS propagation (can take up to 48 hours)

Example final URL: `https://farm.yourdomain.com`

## Security Notes

1. **HTTPS**: Netlify provides free SSL certificates
2. **Local Data**: All farm data stays on each user's device
3. **No Backend**: No server to hack or maintain
4. **Offline**: Works without internet after first load

## Cost

- **Netlify Free Tier**: 
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Unlimited sites
  - **Perfect for your farm management needs!**

## Support

If deployment fails, check:
1. GitHub Actions logs
2. Netlify build logs
3. Browser console for errors

---

**You're all set!** Your farm management system is now live and accessible from anywhere! 🎉
