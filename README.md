# C. Sambu Farm Manager (Professional Edition)

A comprehensive, **Local-First** Farm Management System designed for multi-enterprise farms. Manage Tea, Dairy, Livestock, Poultry, Avocado, and General Labor operations entirely offline, with powerful reporting, visualization, and notifications.

## 🌟 Features

### 🐄 **Livestock Management**
- **Dairy Cows**: Track individual cows (5 pre-loaded)
- **AI Services**: Record artificial insemination, track gestation (283 days)
- **Calving Records**: Birth tracking with auto-status updates
- **Pregnancy Tracking**: Visual alerts when cows are due

### 🐔 **Poultry Management**
- **Egg Production**: Daily egg count tracking
- **Feed Management**: Growers, Finishers, Kienyeji feeds
- **Monthly Stats**: Total eggs, feed costs, averages

### 📊 **Reports & Visualization**
- **Dashboard Charts**: Visual trends for Tea and Milk production (6-month view)
- **Monthly Salary Lists**: Print-ready payslips with CSV export
- **Annual Reports**: Comprehensive farm performance summary
- **CSV Export**: Download any report for Excel analysis

### 🔔 **Push Notifications**
- **Smart Reminders**: Payroll ready, plucking reminders, weather alerts
- **Offline Support**: Notifications work even when app is closed
- **Customizable**: Test and configure notification preferences

### 💰 **Expense Tracking**
- **10 Categories**: Fertilizer, Feeds, Labor, Transport, Utilities, etc.
- **Monthly Summaries**: Visual breakdown by category
- **Budget Tracking**: Monitor spending patterns

### 🌤️ **Weather Integration**
- **Live Weather**: Current conditions for Kericho, Kenya
- **Farming Tips**: Context-aware recommendations

### 🌿 **Tea Enterprise**
- **Plucking Records**: Track daily harvest per worker
- **Factory Management**: Manage rates for multiple factories
- **Payroll**: Auto-calc at **KES 8/kg**

### 🐄 **Dairy Enterprise**
- **Production**: Track milk liters and sales
- **Feeds**: Monitor feed costs
- **Labor**: Track dairy work at **KES 233/hr**

### 🥑 **Avocado Enterprise**
- **Sales Tracking**: Record Kg, Buyer, and Rate (KES 15-50)
- **Revenue Analysis**: Track income per buyer

### 👥 **Labor & Payroll**
- **Multi-Enterprise**: Unified payroll for all farm activities
- **Manual Labor**: Track general work at **KES 216/hr**
- **Fixed Staff**: Auto-pay for Watchmen/Supervisors (**KES 7,500/mo**)
- **Detailed Breakdown**: See exactly how each worker's pay is calculated

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
docker compose up --build
```

### Access the Application
Once running, access the app at:
- **Local Machine**: [http://localhost:5173](http://localhost:5173)
- **Network Access**: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
- **Find Your IP**:
  - Linux/Mac: `ip addr show` or `ifconfig`
  - Windows: `ipconfig`

### Default Credentials
- **Email**: `admin@farm.com`
- **Password**: `admin123`

## 📱 PWA Installation
1. Open the app in Chrome/Edge
2. Click the "Install" icon in the address bar
3. Use it like a native app!

## 🔧 Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Storage**: IndexedDB (Local-First)
- **PWA**: Service Worker, Push Notifications
- **Architecture**: Offline-First, No Backend Required

## 📈 Pre-loaded Data
The system comes with:
- **40+ Workers** (Victor, Linet, Chepnondiin, etc.)
- **5 Dairy Cows** (2 milking, 1 pregnant, 2 calves)
- **6 Tea Factories** (Kaisugu, Finlays, KTDA, etc.)
- **Sample 2024 Data** (for charts and reports)

## 🎯 Key Workflows

### Daily Operations
1. **Morning**: Check weather on Dashboard
2. **During Day**: Record tea plucking, dairy production, egg collection
3. **Evening**: Log labor hours, add expenses

### Monthly Tasks
1. **Generate Payroll**: Click "Generate" in Payroll page
2. **Review Reports**: Check Monthly Salary List
3. **Export Data**: Download CSV for accounting

### Livestock Management
1. **Track Cows**: Monitor individual cow status
2. **Record AI**: Log artificial insemination services
3. **Calving Alerts**: Yellow highlight when cow is due (270+ days)

## 🔧 Troubleshooting

### Can't Access on Network?
1. Make sure Docker is running: `docker compose up`
2. Check your firewall allows port 5173
3. Find your IP: `ip addr show` or `ipconfig`
4. Access via: `http://YOUR_IP:5173`

### Workers Not Showing?
```bash
docker compose down -v
docker compose up --build
```

## 📞 Support
For issues or questions, check the walkthrough guide in the artifacts folder.

