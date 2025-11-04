# 🚀 QUICKSTART GUIDE - C. Sambu Farm Management System

## Get Started in 5 Minutes!

### Prerequisites
Before you begin, ensure you have these installed:
- **Docker & Docker Compose** - For backend services
- **Node.js (v16+)** - For frontend development
- **npm** - Comes with Node.js

### Step 1: Start the Backend (1 minute)

```bash
# Navigate to your project directory
cd /home/c0bw3b/Documents/Farm

# Start the backend services with Docker
docker-compose up -d

# Wait about 30 seconds for services to initialize
```

**What this does:**
- Starts PostgreSQL database on port 5432
- Starts FastAPI backend on http://localhost:8000
- Creates all necessary database tables automatically

### Step 2: Initialize Factories (30 seconds)

```bash
# Initialize the 6 tea factories with correct rates
curl -X POST http://localhost:8000/factories/initialize-default
```

**This creates these factories:**
1. **Kaisugu** - KES 22/kg (Transport: KES 3/kg)
2. **Finlays** - KES 27/kg (Transport: KES 3/kg)
3. **Kuresoi** - KES 23/kg (Transport: KES 3/kg)
4. **Mbogo Valley** - KES 23/kg (Transport: KES 3/kg)
5. **Unilever** - KES 28/kg (Transport: KES 3/kg)
6. **KTDA** - KES 26/kg (Transport: KES 3/kg)

### Step 3: Start the Frontend (2 minutes)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only needed first time)
npm install

# Start the development server
npm run dev
```

**The frontend will be available at:**
- Local: http://localhost:5173
- Network: Check terminal output for network URL

### Step 4: Access the Application (30 seconds)

Open your browser and go to: **http://localhost:5173**

You'll see the beautiful farm-themed interface with:
- 🌿 Green navigation bar
- 📊 Dashboard with statistics
- 🍃 Tea plucking management
- 💰 Payroll system
- 🌱 Fertilizer tracking
- And more!

---

## 📝 Quick Usage Guide

### Add Your First Worker

1. Click **👥 Staff** in the navigation
2. Fill in worker details:
   - Name: e.g., "John Doe"
   - Role: e.g., "Tea Plucker"
   - Pay Type: Select **"per_kilo"** for tea pluckers
   - Pay Rate: Leave at 0 (factory rates will be used)
3. Click "Add Staff"

### Record Tea Plucking

1. Click **🍃 Tea Plucking** in the navigation
2. Select worker from dropdown
3. Select factory (e.g., "Unilever - KES 28/kg")
4. Enter quantity in kg
5. Select date (defaults to today)
6. Click "Add Record"

**Automatic Calculations:**
- Gross Amount = Quantity × Factory Rate
- Transport Deduction = Quantity × KES 3
- Net Amount = Gross - Transport

### View Monthly Payroll

1. Click **💰 Payroll** in the navigation
2. Select month and year
3. Click **"Calculate Payroll"**
4. View detailed salary breakdown with fertilizer deductions

### Track Fertilizer

1. Click **🌱 Fertilizer** in the navigation
2. Select worker and factory
3. Enter quantity and cost per unit
4. Choose deduction type:
   - **Monthly** - Deduct from monthly salary
   - **Annual Bonus** - Deduct from year-end bonus
   - **Immediate** - Deduct immediately
5. Click "Add Transaction"

---

## 🔧 Troubleshooting

### Backend Not Starting?

```bash
# Check if services are running
docker-compose ps

# View backend logs
docker-compose logs backend

# Restart services
docker-compose restart
```

### Frontend Not Loading?

```bash
# Make sure you're in the frontend directory
cd /home/c0bw3b/Documents/Farm/frontend

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start again
npm run dev
```

### Database Connection Issues?

```bash
# Stop all services
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d

# Reinitialize factories
curl -X POST http://localhost:8000/factories/initialize-default
```

### Port Already in Use?

```bash
# Check what's using port 8000
sudo lsof -i :8000

# Check what's using port 5173
sudo lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

---

## 📱 Access from Mobile/Other Devices

### On Same Network (WiFi/LAN)

1. Find your computer's IP address:
   ```bash
   # On Linux
   hostname -I | awk '{print $1}'
   
   # Or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. On your phone/tablet, open browser and go to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```
   Example: `http://192.168.1.100:5173`

3. The app works as a PWA (Progressive Web App):
   - Add to Home Screen for app-like experience
   - Works offline after first visit
   - Responsive design for mobile devices

---

## 🎯 Next Steps

1. **Add Staff Members** - Add all your tea plucking workers
2. **Record Daily Tea Plucking** - Track daily production
3. **Generate Monthly Payroll** - Calculate salaries automatically
4. **Track Fertilizer** - Manage fertilizer distribution and deductions
5. **View Dashboard** - Monitor farm statistics and performance

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Tea Farm Features Guide**: See `TEA_FARM_FEATURES_GUIDE.md`
- **Mobile Deployment**: See `MOBILE_DEPLOYMENT_GUIDE.md`
- **Hosting Guide**: See `HOSTING_GUIDE.md` (for remote access)

---

## 🆘 Need Help?

- Check backend API docs at http://localhost:8000/docs
- View browser console for frontend errors (F12)
- Check Docker logs: `docker-compose logs -f`
- Review error messages carefully - they're usually informative!

**Happy Farming! 🌿🍃**
