# Netlify Build Troubleshooting Guide

## Current Status
✅ Local build works perfectly (tested and confirmed)
✅ `netlify.toml` is correctly configured
✅ All files committed to GitHub

## If Netlify is Still Failing

### Option 1: Clear Build Cache (Recommended)
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site Settings** → **Build & Deploy**
4. Scroll to **Build Settings**
5. Click **Clear cache and retry deploy**
6. Wait for the new build to complete

### Option 2: Manual Deploy Settings Check
1. Go to Netlify Dashboard → Your Site
2. Click **Site Settings** → **Build & Deploy** → **Build Settings**
3. Verify these settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (NOT `frontend/dist`)
4. If any are wrong, update them and click **Save**
5. Go to **Deploys** → Click **Trigger deploy** → **Deploy site**

### Option 3: Force New Deploy
```bash
# Make a small change to force rebuild
cd /home/c0bw3b/Documents/Farm
echo "# Force rebuild" >> README.md
git add README.md
git commit -m "Force Netlify rebuild"
git push origin main
```

### Option 4: Check Build Logs
1. Go to Netlify Dashboard → Your Site → **Deploys**
2. Click on the latest failed deploy
3. Look for specific error messages
4. Common errors and fixes:

#### Error: "Deploy directory does not exist"
**Fix**: Already fixed in `netlify.toml` (publish = "dist")

#### Error: "npm ERR! missing script: build"
**Fix**: Check `frontend/package.json` has build script

#### Error: "Module not found"
**Fix**: Delete `node_modules` and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### Error: "Out of memory"
**Fix**: Add to `netlify.toml`:
```toml
[build.environment]
  NODE_OPTIONS = "--max-old-space-size=4096"
```

### Option 5: Use Netlify CLI (Advanced)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
cd /home/c0bw3b/Documents/Farm
netlify link

# Deploy manually
netlify deploy --prod --dir=frontend/dist
```

## Quick Deploy Script
Use the provided script for easy deployment:
```bash
cd /home/c0bw3b/Documents/Farm
./deploy.sh
```

## Verification Checklist
- [ ] Local build works (`cd frontend && npm run build`)
- [ ] `frontend/dist` folder exists after build
- [ ] `netlify.toml` has `publish = "dist"` (not `frontend/dist`)
- [ ] Latest commit pushed to GitHub
- [ ] Netlify build cache cleared
- [ ] Build logs checked for specific errors

## Still Not Working?
Share the **exact error message** from Netlify build logs and I'll help you fix it!
