# C. Sambu Farm Manager (Professional Edition)

A comprehensive, **Local-First** Farm Management System designed for multi-enterprise farms. Manage Tea, Dairy, Livestock, Poultry, Avocado, and General Labor operations entirely offline, with powerful reporting, visualization, and notifications.

## Features

### Livestock Management
- **Dairy Cows**: Track individual cows (5 pre-loaded)
- **AI Services**: Record artificial insemination, track gestation (283 days)
- **Calving Records**: Birth tracking with auto-status updates
- **Pregnancy Tracking**: Visual alerts when cows are due

### Poultry Management
- **Egg Production**: Daily egg count tracking
- **Feed Management**: Growers, Finishers, Kienyeji feeds
- **Monthly Stats**: Total eggs, feed costs, averages

### Reports & Visualization
- **Dashboard Charts**: Visual trends for Tea and Milk production (6-month view)
- **Monthly Salary Lists**: Print-ready payslips with CSV export
- **Annual Reports**: Comprehensive farm performance summary
- **CSV Export**: Download any report for Excel analysis

### Push Notifications
- **Smart Reminders**: Payroll ready, plucking reminders, weather alerts
- **Offline Support**: Notifications work even when app is closed
- **Customizable**: Test and configure notification preferences

### Expense Tracking
- **10 Categories**: Fertilizer, Feeds, Labor, Transport, Utilities, etc.
- **Monthly Summaries**: Visual breakdown by category
- **Budget Tracking**: Monitor spending patterns

### Weather Integration
- **Live Weather**: Current conditions for Kericho, Kenya
- **Farming Tips**: Context-aware recommendations

### Tea Enterprise
- **Plucking Records**: Track daily harvest per worker
- **Factory Management**: Manage rates for multiple factories
- **Payroll**: Auto-calc at **KES 8/kg**

### Dairy Enterprise
- **Production**: Track milk liters and sales
- **Feeds**: Monitor feed costs
- **Labor**: Track dairy work at **KES 233/hr**

### Avocado Enterprise
- **Sales Tracking**: Record Kg, Buyer, and Rate (KES 15-50)
- **Revenue Analysis**: Track income per buyer

### Labor & Payroll
- **Multi-Enterprise**: Unified payroll for all farm activities
- **Manual Labor**: Track general work at **KES 216/hr**
- **Fixed Staff**: Auto-pay for Watchmen/Supervisors (**KES 7,500/mo**)
- **Detailed Breakdown**: See exactly how each worker's pay is calculated

## Quick Start

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

## PWA Features (Local Development Only)

**Note:** PWA features are disabled in production builds to ensure compatibility with hosting platforms like Netlify. For the best offline experience, run the app locally using Docker.

### Progressive Web App (Local Development)
When running locally, this app includes Progressive Web App features that can be installed on your device like a native app.

#### Local PWA Installation Steps:
1. **Start the app locally**: `docker compose up --build`
2. **Open in Browser**: Visit `http://localhost:5173` in Chrome, Edge, or Safari
3. **Install Prompt**: Look for the install icon in the address bar
4. **Add to Home Screen**: The app will appear on your home screen like a native app

#### Local PWA Features:
- **Offline Access**: Full functionality even without internet
- **Local Storage**: All data stored in your browser's IndexedDB
- **Installable**: Can be installed as a standalone app
- **Native Feel**: Standalone experience without browser UI

### Offline Capabilities

#### Data Storage:
- **IndexedDB**: All farm data stored locally in your browser
- **Automatic Sync**: Changes sync when you reconnect to internet
- **No Data Loss**: Everything saves automatically to local storage
- **Storage Monitoring**: App shows local storage usage

#### Offline Features:
- **Record Everything**: Add plucking records, dairy production, expenses
- **View Reports**: Access all reports and charts offline
- **Calculate Payroll**: Generate payslips without internet
- **Export Data**: Download PDFs and CSVs offline

#### Online Benefits:
- **Real-time Weather**: Live weather data when connected
- **Data Backup**: Optional cloud sync (future feature)
- **Push Notifications**: Server-sent notifications

### Storage & Data Management

#### Local Storage Details:
- **Farm Data**: Workers, livestock, production records
- **Reports**: Generated reports and export files
- **Settings**: User preferences and configurations
- **Cache**: App resources for fast loading

#### Data Persistence:
- **Auto-Save**: Every change saves immediately to local storage
- **Backup**: Export data as CSV/JSON for external backup
- **Import**: Restore data from backup files
- **Migration**: Data survives app updates

#### Storage Monitoring:
- **Usage Display**: Shows local storage usage in offline indicator
- **Quota Management**: Monitors available browser storage
- **Cleanup**: Automatic cleanup of old cached data

### Sync & Updates

#### Automatic Updates:
- **Background Updates**: App updates automatically when online
- **Version Checking**: Notifies when new features are available
- **Seamless Upgrades**: Updates without data loss

#### Data Synchronization:
- **Conflict Resolution**: Smart merging of local and remote changes
- **Change Tracking**: Shows what data has been modified offline
- **Sync Status**: Visual indicators for sync progress

### Technical Features

#### Service Worker:
- **Offline Caching**: App shell and critical resources cached
- **Background Sync**: Data syncs when connection restored
- **Push Notifications**: Works offline and online

#### Installable Features:
- **Standalone Mode**: No browser chrome when installed
- **App Shortcuts**: Quick access to Dashboard, Plucking, Payroll
- **Splash Screen**: Custom loading screen
- **Theme Integration**: Respects system dark/light preferences

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Storage**: IndexedDB (Local-First)
- **PWA**: Service Worker, Push Notifications
- **Architecture**: Offline-First, No Backend Required

## Pre-loaded Data
The system comes with:
- **40+ Workers** (Victor, Linet, Chepnondiin, etc.)
- **5 Dairy Cows** (2 milking, 1 pregnant, 2 calves)
- **6 Tea Factories** (Kaisugu, Finlays, KTDA, etc.)
- **Sample 2024 Data** (for charts and reports)

## Key Workflows

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

## Troubleshooting

### Can't Access on Network?
1. Make sure Docker is running: `docker compose up`
2. Check your firewall allows port 5173
3. Find your IP: `ip addr show` or `ifconfig`
4. Access via: `http://YOUR_IP:5173`

### Workers Not Showing?
```bash
docker compose down -v
docker compose up --build
```

## Support
For issues or questions, check the walkthrough guide in the artifacts folder.
