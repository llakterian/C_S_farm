# Complete Restart & Testing Guide

## 🚀 Quick Start Guide

### Prerequisites
- Docker installed
- Docker Compose installed
- Node.js & npm installed (for frontend development)

---

## 📋 Complete System Restart

### Option 1: Quick Restart (Development)

```bash
# Navigate to project directory
cd /home/c0bw3b/Documents/Farm

# Restart all services
docker-compose restart

# Check if services are running
docker-compose ps

# View backend logs
docker-compose logs -f backend
```

### Option 2: Clean Restart (Recommended if issues)

```bash
# Navigate to project directory
cd /home/c0bw3b/Documents/Farm

# Stop all services
docker-compose down

# Start all services fresh
docker-compose up -d

# Wait 5 seconds for services to initialize
sleep 5

# Check status
docker-compose ps

# View logs
docker-compose logs backend
```

### Option 3: Complete Clean Restart (Database Reset)

```bash
# WARNING: This will DELETE all data!

# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build -d

# Monitor startup
docker-compose logs -f backend
```

---

## ✅ Service Status Check

### Check All Services

```bash
# List all running containers
docker-compose ps

# Should show:
# - cs_farm_db (PostgreSQL)
# - cs_farm_api (Backend API)
# - cs_farm_pgadmin (Database Admin)
```

### Test Backend API

```bash
# Test root endpoint
curl http://localhost:8000/

# Expected: {"message":"Welcome to C_S Farm API"}

# Test API documentation
curl http://localhost:8000/docs

# Test specific endpoints
curl http://localhost:8000/staff/
curl http://localhost:8000/teaplucking/
curl http://localhost:8000/poultry/flocks
curl http://localhost:8000/dairy/cows
curl http://localhost:8000/dogs/dogs
curl http://localhost:8000/inventory/
curl http://localhost:8000/finance/
```

### View Logs

```bash
# View backend logs
docker-compose logs backend

# View database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend

# View last 50 lines
docker-compose logs --tail=50 backend
```

---

## 🖥️ Frontend Development

### Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Server will start at: http://localhost:5173
```

### Access Frontend

1. **Development:** http://localhost:5173
2. **Backend API:** http://localhost:8000
3. **API Docs:** http://localhost:8000/docs
4. **PgAdmin:** http://localhost:5050

---

## 🧪 Complete Testing Checklist

### Backend API Tests

```bash
# 1. Test Root Endpoint
curl http://localhost:8000/
# ✅ Should return: {"message":"Welcome to C_S Farm API"}

# 2. Test Staff Endpoint
curl http://localhost:8000/staff/
# ✅ Should return: []

# 3. Test Tea Plucking (NEW)
curl http://localhost:8000/teaplucking/
# ✅ Should return: []

# 4. Test Poultry
curl http://localhost:8000/poultry/flocks
curl http://localhost:8000/poultry/eggs
# ✅ Should return: []

# 5. Test Dairy
curl http://localhost:8000/dairy/cows
curl http://localhost:8000/dairy/milk
# ✅ Should return: []

# 6. Test Dogs
curl http://localhost:8000/dogs/dogs
curl http://localhost:8000/dogs/litters
# ✅ Should return: []

# 7. Test Inventory
curl http://localhost:8000/inventory/
# ✅ Should return: []

# 8. Test Finance
curl http://localhost:8000/finance/
# ✅ Should return: []
```

### Add Sample Data (POST Tests)

```bash
# Add a staff member
curl -X POST http://localhost:8000/staff/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "role": "Tea Plucker",
    "pay_type": "per_kilo",
    "pay_rate": 50
  }'

# Add a tea plucking record
curl -X POST http://localhost:8000/teaplucking/ \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": 1,
    "quantity": 25.5,
    "comment": "Morning shift"
  }'

# Add a cow
curl -X POST http://localhost:8000/dairy/cows \
  -H "Content-Type: application/json" \
  -d '{
    "tag_no": "COW001",
    "breed": "Friesian",
    "lactation_no": 2,
    "age": 4,
    "status": "active"
  }'

# Add a flock
curl -X POST http://localhost:8000/poultry/flocks \
  -H "Content-Type: application/json" \
  -d '{
    "breed": "Rhode Island Red",
    "current_count": 50,
    "mortality": 0,
    "housing_unit": "Coop A"
  }'
```

### Frontend Manual Tests

1. **Navigation**
   - ✅ Click each menu item
   - ✅ Verify page loads correctly
   - ✅ Check navigation between pages

2. **Staff Page**
   - ✅ View staff list
   - ✅ Add new staff member
   - ✅ Verify staff appears in list

3. **Tea Plucking Page** (NEW)
   - ✅ View tea plucking records
   - ✅ Select a worker
   - ✅ Add tea plucking record
   - ✅ Verify pay calculation
   - ✅ Check daily summary
   - ✅ Delete a record

4. **Poultry Page**
   - ✅ View flocks and eggs
   - ✅ Add new flock
   - ✅ Add egg production record

5. **Dairy Page**
   - ✅ View cows and milk records
   - ✅ Add new cow
   - ✅ Add milk production record

6. **Dogs Page**
   - ✅ View dogs and litters
   - ✅ Add new dog
   - ✅ Add litter record

7. **Inventory Page**
   - ✅ View inventory items
   - ✅ Add new item

8. **Finance Page**
   - ✅ View transactions
   - ✅ Add new transaction
   - ✅ Delete transaction

---

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check if database is running
docker-compose ps

# If database is not running, restart all
docker-compose down
docker-compose up -d

# Check backend logs for errors
docker-compose logs backend

# Common issue: Port 8000 already in use
# Solution: Stop other services using port 8000
sudo lsof -i :8000
# Then kill the process or change port in docker-compose.yml
```

### Database connection errors

```bash
# Restart database
docker-compose restart db

# Wait for database to initialize
sleep 5

# Restart backend
docker-compose restart backend

# If still failing, rebuild
docker-compose down
docker-compose up --build -d
```

### Frontend can't connect to backend

1. **Check CORS is enabled**
   - Verify backend/app/main.py has CORS middleware

2. **Check backend is running**
   ```bash
   curl http://localhost:8000/
   ```

3. **Check API URL in frontend**
   - Verify each component uses http://localhost:8000

4. **Check browser console for errors**
   - Press F12 in browser
   - Check Console tab

### Port conflicts

```bash
# Check what's using ports
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :8000  # Backend API
sudo lsof -i :5050  # PgAdmin
sudo lsof -i :5173  # Frontend dev server

# Kill process if needed
kill -9 <PID>
```

---

## 📊 Performance Check

### Check Resource Usage

```bash
# Check Docker container resource usage
docker stats

# Should show CPU and Memory usage for each container
```

### Check Response Times

```bash
# Test API response time
time curl http://localhost:8000/staff/

# Should complete in < 1 second
```

---

## 🔄 Daily Operations

### Morning Startup

```bash
# Quick startup check
docker-compose ps

# If services are down, start them
docker-compose up -d

# Verify backend is responding
curl http://localhost:8000/
```

### End of Day Shutdown (Optional)

```bash
# Stop services (keeps data)
docker-compose stop

# Or keep them running (recommended)
# Docker will auto-restart if system reboots
```

### Weekly Maintenance

```bash
# Check for updates
cd /home/c0bw3b/Documents/Farm
git pull

# Rebuild if code changed
docker-compose up --build -d

# View system health
docker-compose ps
docker system df
```

---

## 📱 Access from Mobile Devices

### Same Network Access

1. **Find server IP address**
   ```bash
   hostname -I
   # Example: 192.168.1.100
   ```

2. **Update CORS in backend**
   - Already set to allow all origins (*)

3. **Access from phone**
   - Frontend: http://192.168.1.100:5173
   - Backend: http://192.168.1.100:8000

### Production Access

For production deployment, see MOBILE_DEPLOYMENT_GUIDE.md

---

## 🎯 Quick Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps

# Rebuild and restart
docker-compose up --build -d

# Clean restart (no data loss)
docker-compose down && docker-compose up -d

# Complete reset (DELETES DATA)
docker-compose down -v && docker-compose up --build -d
```

---

## ✅ Success Indicators

### System is working correctly if:

1. ✅ `docker-compose ps` shows all services as "Up"
2. ✅ `curl http://localhost:8000/` returns welcome message
3. ✅ API docs load at http://localhost:8000/docs
4. ✅ Frontend loads at http://localhost:5173
5. ✅ Can add/view data in all modules
6. ✅ No errors in `docker-compose logs backend`

---

## 📞 Need Help?

### Check Logs First

```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs db

# All logs
docker-compose logs
```

### Common Solutions

1. **503 Error:** Backend starting up, wait 10 seconds
2. **CORS Error:** Check CORS middleware in main.py
3. **404 Error:** Check endpoint URL is correct
4. **500 Error:** Check backend logs for details
5. **Connection Refused:** Service not running, check docker-compose ps

---

## 🎉 You're All Set!

Your farm management system is ready to use. For mobile deployment, refer to MOBILE_DEPLOYMENT_GUIDE.md.

**Next Steps:**
1. ✅ Test all features
2. ✅ Add sample data
3. ✅ Train users
4. ✅ Deploy to production (optional)
5. ✅ Collect feedback and improve
