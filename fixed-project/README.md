# School Fee Manager Pro - Desktop Edition 🎓

**Version 3.0 - Complete Desktop Application with Unlimited Storage**

A professional desktop application for managing school fees, students, teachers, and financial records with **unlimited storage** using SQLite database.

---

## ✨ Features

### 💾 **Unlimited Storage**
- SQLite database on hard disk (not limited to 5-10MB like web version)
- Can store millions of records
- Database grows as needed (1GB, 10GB, 100GB+)

### 🖥️ **Native Desktop App**
- Windows, macOS, and Linux support
- System tray integration
- Native file dialogs
- Professional installers

### 📊 **Complete Management**
- Student management (admission, fees, records)
- Teacher management (salary, payments)
- Fee collection (multiple payment modes)
- Comprehensive reporting
- Audit trail

### 🔄 **Backup & Sync**
- One-click database backup
- Restore from backup
- Export/Import JSON
- Google Sheets sync (optional)

### 🔒 **Security**
- Secure password hashing (PBKDF2)
- Role-based access control
- Audit logging
- Context isolation

---

## 🚀 Quick Start

### Option 1: Use Pre-built Installer (Recommended)

**Coming Soon:** Download installers from Releases page:
- `School-Fee-Manager-Pro-3.0.0-Setup.exe` (Windows)
- `School-Fee-Manager-Pro-3.0.0.dmg` (macOS)
- `School-Fee-Manager-Pro-3.0.0.AppImage` (Linux)

Run the installer and start using!

### Option 2: Build from Source

#### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm or yarn
- Git (optional)

#### Installation Steps

```bash
# 1. Extract the package
unzip school-fee-manager-desktop.zip
cd school-fee-manager-desktop

# 2. Install dependencies
npm install

# This will take 5-10 minutes on first install
# Downloads ~500MB of dependencies

# 3. Run in development mode
npm run electron:dev

# App will open in Electron window
```

#### Build Installers

```bash
# Build for your current platform
npm run electron:build

# Or build for specific platforms:
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux

# Installers will be in the 'release' folder
```

---

## 📁 Project Structure

```
school-fee-manager-desktop/
├── electron/              # Electron main process
│   ├── main.js           # App entry point
│   ├── database.js       # SQLite manager
│   └── preload.js        # IPC bridge
├── src/                  # React application
│   ├── components/       # UI components
│   ├── pages/           # Application pages
│   ├── store/           # Data management
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── assets/              # Icons and resources
├── release/             # Built installers (after build)
├── package.json         # Dependencies
└── README.md           # This file
```

---

## 💻 System Requirements

### Minimum
- **OS:** Windows 7+, macOS 10.11+, Linux (most distros)
- **RAM:** 2GB
- **Disk:** 500MB for app + storage for data
- **Screen:** 1024x768

### Recommended
- **OS:** Windows 10+, macOS 12+, Ubuntu 20.04+
- **RAM:** 4GB+
- **Disk:** 1GB+ free space
- **Screen:** 1920x1080

---

## 📖 User Guide

### First Time Setup

1. **Launch the app**
   - Double-click the desktop shortcut
   - Or find in Start Menu / Applications

2. **Setup Wizard**
   - Enter school information
   - Create admin account
   - Configure classes and fee structure

3. **Start Using**
   - Add students
   - Collect fees
   - Generate reports

### Daily Operations

#### Collect Fee
1. Go to **Fees → Collect Fee**
2. Search for student by name/ID
3. Select months
4. Choose payment mode
5. Click "Collect Fee"
6. Receipt generated automatically

#### Add Student
1. Go to **Students → Add Student**
2. Fill in details (name, class, father name, etc.)
3. Set monthly fee
4. Click "Save"

#### Generate Report
1. Go to **Reports**
2. Choose report type (Daily, Monthly, Class-wise, Defaulters)
3. Select date range
4. Click "Generate"
5. Export to PDF/Excel if needed

### Backup & Restore

#### Create Backup
**Method 1: Menu**
- File → Backup Database
- Choose location
- Backup saved as `.db` file

**Method 2: System Tray**
- Right-click tray icon
- Click "Backup Now"
- Opens backup folder

**Method 3: Automatic**
- Backup created daily automatically
- Stored in Documents/SchoolFeeManager/Backups/

#### Restore Backup
- File → Restore from Backup
- Select backup file
- Confirm restoration
- App will restart

---

## 🔧 Configuration

### Database Location
- **Windows:** `C:\Users\[User]\AppData\Roaming\SchoolFeeManager\`
- **macOS:** `~/Library/Application Support/SchoolFeeManager/`
- **Linux:** `~/.config/SchoolFeeManager/`

### Backup Location
- `Documents/SchoolFeeManager/Backups/`

### Change Settings
1. Go to **Settings**
2. Modify school info, classes, fee structure, etc.
3. Changes saved automatically

---

## 🐛 Troubleshooting

### App won't start
**Solution:**
- Check if another instance is running
- Delete lock file: `[AppData]/SchoolFeeManager/.lock`
- Restart computer

### Database error
**Solution:**
- Restore from recent backup
- File → Restore from Backup

### Slow performance
**Solution:**
- Go to Settings → Maintenance
- Click "Optimize Database"
- Restart app

### Can't find backups
**Solution:**
- Check Documents/SchoolFeeManager/Backups/
- Or use File → Backup Database to create new one

### Missing data after update
**Solution:**
- Don't panic! Data is safe
- File → Restore from Backup
- Choose most recent backup

---

## 🔐 Security

### Password Security
- Passwords hashed with PBKDF2 (100,000 iterations)
- Never stored in plain text
- Salt per user

### Data Security
- Database file encrypted by OS (BitLocker/FileVault)
- Role-based access control
- Complete audit trail

### Best Practices
1. Create strong admin password
2. Regular backups (daily recommended)
3. Limit admin accounts
4. Enable OS disk encryption
5. Keep app updated

---

## 📊 Database Management

### Storage Information
- View: System Tray → Storage Info
- Shows: DB size, free space, record counts

### Optimize Database
- Settings → Maintenance → Optimize
- Reclaims unused space
- Improves performance
- Run monthly

### Export Data
- File → Export Data (JSON)
- Portable format
- Can import into other systems

---

## 🆘 Support

### Documentation
- Full user manual: `/docs/UserManual.pdf` (coming soon)
- Video tutorials: (coming soon)

### Contact
- Email: support@schoolfeemanager.com (example)
- Website: https://schoolfeemanager.com (example)

### Report Issues
- Use Help → Report Issue
- Or email with:
  - Description of problem
  - Steps to reproduce
  - Screenshots (if applicable)

---

## 📝 Developer Information

### Tech Stack
- **Frontend:** React 19, TypeScript
- **Backend:** Electron 28, Node.js
- **Database:** SQLite 5
- **Build:** Vite 7, Electron Builder
- **UI:** Tailwind CSS 4

### Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run electron:dev

# Build for production
npm run electron:build
```

### Contributing
- Fork the repository
- Create feature branch
- Make changes
- Submit pull request

---

## 📜 License

**Commercial License**

Copyright © 2026 MWA Software. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

For licensing inquiries: license@mwasoftware.com (example)

---

## 🎉 Changelog

### Version 3.0.0 (Current)
- ✅ Complete desktop application
- ✅ Unlimited SQLite storage
- ✅ System tray integration
- ✅ Auto-updates support
- ✅ Professional installers
- ✅ Multi-platform support

### Version 2.0.0
- IndexedDB storage (100MB-1GB)
- Enhanced security
- Bug fixes

### Version 1.0.0
- Initial web release
- localStorage (5-10MB limit)

---

## 🙏 Credits

**Developed by:** MWA Software  
**Design:** Modern UI/UX Team  
**Icons:** Lucide React  
**Database:** SQLite  
**Framework:** Electron + React

---

## 📞 Quick Reference

### Keyboard Shortcuts
- `Ctrl+B` - Create Backup
- `Ctrl+Q` - Quit Application
- `F11` - Fullscreen
- `Ctrl+R` - Reload
- `Ctrl+Shift+I` - Developer Tools (Dev mode only)

### Menu Locations
- **Students:** Sidebar → Students
- **Teachers:** Sidebar → Teachers
- **Fees:** Sidebar → Fees
- **Reports:** Sidebar → Reports
- **Settings:** Sidebar → Settings

### Important Files
- **Database:** `[AppData]/SchoolFeeManager/school-data.db`
- **Backups:** `Documents/SchoolFeeManager/Backups/`
- **Logs:** `[AppData]/SchoolFeeManager/logs/`

---

**Thank you for using School Fee Manager Pro!** 🎓

For support: support@schoolfeemanager.com (example)  
For sales: sales@schoolfeemanager.com (example)

---

*Made with ❤️ by MWA Software*
