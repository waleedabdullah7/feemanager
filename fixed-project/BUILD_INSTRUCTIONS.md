# BUILD INSTRUCTIONS
**School Fee Manager Pro - Desktop Edition**

---

## 🎯 Quick Build Guide

Follow these steps to build the installer for your operating system.

---

## 📋 Prerequisites

### 1. Install Node.js
**Download:** https://nodejs.org/en/download/

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show v9.0.0 or higher
```

### 2. Install Git (Optional)
**Download:** https://git-scm.com/downloads

Only needed if you want to clone from repository.

---

## 🚀 Build Steps

### Step 1: Extract Package
```bash
# Extract the ZIP file to a folder
unzip school-fee-manager-desktop.zip

# Navigate to the folder
cd school-fee-manager-desktop
```

### Step 2: Install Dependencies
```bash
npm install
```

**This will take 5-10 minutes** and download approximately:
- 500MB of Node modules
- Electron binaries
- Build tools

**Common Issues:**
- **Error: EACCES permission denied**
  - Solution (Linux/Mac): `sudo npm install` (not recommended)
  - Better: Fix npm permissions (see below)
- **Error: Python not found**
  - Solution: Install Python 3 from python.org
- **Error: node-gyp rebuild failed**
  - Solution: Install build tools (see below)

**Fix npm permissions (Linux/Mac):**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Install build tools:**
- **Windows:** `npm install --global windows-build-tools`
- **macOS:** `xcode-select --install`
- **Linux:** `sudo apt-get install build-essential`

### Step 3: Add Icons (Optional but Recommended)

Place your school logo/icon in the `assets/` folder:

**Required files:**
- `icon.png` (512x512px) - Master icon
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon
- `tray-icon.png` (16x16px or 32x32px) - System tray

**Quick way to generate all formats:**
```bash
# Install icon generator
npm install -g electron-icon-maker

# Generate from your logo
electron-icon-maker --input=your-logo.png --output=./assets
```

**Or use online tool:**
- https://icon.kitchen (free, easy)
- https://www.icoconverter.com

**Without icons:**
- Installer will use default Electron icon
- App will still work perfectly

### Step 4: Test in Development Mode
```bash
npm run electron:dev
```

**What happens:**
1. Vite dev server starts (port 5173)
2. Electron window opens
3. App loads with hot-reload enabled

**Check:**
- ✅ App opens in window
- ✅ Can add students
- ✅ Data persists after restart
- ✅ System tray icon appears
- ✅ Menus work

**To stop:**
- Close the Electron window
- Or press `Ctrl+C` in terminal

### Step 5: Build Installer

#### For Windows:
```bash
npm run electron:build:win
```

**Output:**
```
release/
├── School Fee Manager Pro-3.0.0-Setup.exe    (Installer)
└── School Fee Manager Pro-3.0.0-Portable.exe (Portable)
```

**Installer size:** ~150MB  
**Build time:** 2-5 minutes

#### For macOS:
```bash
npm run electron:build:mac
```

**Output:**
```
release/
├── School Fee Manager Pro-3.0.0.dmg    (Installer)
└── School Fee Manager Pro-3.0.0-mac.zip (Portable)
```

**Note:** Building for macOS on Windows/Linux may not work properly. Build on Mac for best results.

#### For Linux:
```bash
npm run electron:build:linux
```

**Output:**
```
release/
├── School Fee Manager Pro-3.0.0.AppImage    (Universal)
├── School Fee Manager Pro-3.0.0.deb         (Debian/Ubuntu)
└── School Fee Manager Pro-3.0.0.rpm         (RedHat/Fedora)
```

#### Build All Platforms (on Mac only):
```bash
npm run electron:build
```

**Note:** Building macOS packages requires macOS. Windows and Linux can be built from any platform.

---

## 📦 Installer Details

### Windows Installer (.exe)
- **Type:** NSIS installer
- **Size:** ~150MB
- **Features:**
  - Choose installation directory
  - Desktop shortcut
  - Start menu entry
  - Auto-updates
  - Uninstaller

**Installation location:**
- Per-user: `C:\Users\[User]\AppData\Local\Programs\School Fee Manager Pro`
- Per-machine: `C:\Program Files\School Fee Manager Pro`

**Data location:**
- `C:\Users\[User]\AppData\Roaming\SchoolFeeManager\`

### Windows Portable (.exe)
- **Type:** Self-contained executable
- **Size:** ~150MB
- **Features:**
  - No installation needed
  - Run from USB drive
  - Data stored alongside .exe
  - No registry entries

**Use case:** Testing, USB deployment

### macOS Installer (.dmg)
- **Type:** Disk image
- **Size:** ~150MB
- **Features:**
  - Drag-and-drop installation
  - Code-signed (if certificate available)
  - Auto-updates

**Installation location:**
- `/Applications/School Fee Manager Pro.app`

**Data location:**
- `~/Library/Application Support/SchoolFeeManager/`

### Linux AppImage (.AppImage)
- **Type:** Universal binary
- **Size:** ~150MB
- **Features:**
  - No installation needed
  - Runs on all Linux distros
  - Self-contained

**How to use:**
```bash
chmod +x School-Fee-Manager-Pro-3.0.0.AppImage
./School-Fee-Manager-Pro-3.0.0.AppImage
```

### Linux .deb (Debian/Ubuntu)
```bash
sudo dpkg -i School-Fee-Manager-Pro-3.0.0.deb
```

### Linux .rpm (RedHat/Fedora)
```bash
sudo rpm -i School-Fee-Manager-Pro-3.0.0.rpm
```

**Data location (all Linux):**
- `~/.config/SchoolFeeManager/`

---

## 🔧 Advanced Build Options

### Custom App Name
Edit `package.json`:
```json
{
  "build": {
    "productName": "Your Custom Name"
  }
}
```

### Custom App ID
Edit `package.json`:
```json
{
  "build": {
    "appId": "com.yourcompany.yourapp"
  }
}
```

### Code Signing (Windows)
1. Get code signing certificate
2. Set environment variables:
```bash
set CSC_LINK=path\to\certificate.pfx
set CSC_KEY_PASSWORD=your_password
npm run electron:build:win
```

### Code Signing (macOS)
1. Get Apple Developer account
2. Get Developer ID certificate
3. Build will auto-sign if certificate in Keychain

### Notarization (macOS)
Required for macOS 10.15+:
```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

---

## 🐛 Troubleshooting Build Issues

### Error: Cannot find module 'electron'
```bash
npm install electron --save-dev
```

### Error: EPERM operation not permitted
- Close any running instances of the app
- Disable antivirus temporarily
- Run terminal as administrator (Windows)

### Error: Python not found
**Windows:**
```bash
npm install --global windows-build-tools
```

**macOS:**
```bash
brew install python3
```

**Linux:**
```bash
sudo apt-get install python3
```

### Error: node-gyp rebuild failed
**Install build tools:**
- **Windows:** Visual Studio Build Tools
- **macOS:** Xcode Command Line Tools
- **Linux:** build-essential package

### Build is very slow
**Normal:** First build takes 5-10 minutes  
**Subsequent builds:** 2-3 minutes (cached)

**Speed up:**
- Use SSD
- Close other applications
- Increase Node.js memory:
```bash
export NODE_OPTIONS=--max_old_space_size=4096
npm run electron:build
```

### Installer is too large
**Normal size:** 100-150MB (includes Chromium engine)

**Reduce size:**
- Remove unused dependencies
- Use `asar` packing (already enabled)
- Can't reduce much without breaking app

### Build succeeds but installer won't run
- **Check antivirus:** May block unsigned executables
- **Check Windows SmartScreen:** Click "More info" → "Run anyway"
- **Sign the installer:** Get code signing certificate

---

## ✅ Verification Checklist

After building, verify:

- [ ] Installer file exists in `release/` folder
- [ ] Installer runs without errors
- [ ] App installs to correct location
- [ ] Desktop shortcut created
- [ ] Start menu entry created
- [ ] App launches successfully
- [ ] Can add student (data persists)
- [ ] Can create backup
- [ ] Database file created in AppData
- [ ] System tray icon appears
- [ ] All menus work
- [ ] No console errors

---

## 📤 Distribution

### Method 1: Direct Download
1. Upload installer to your website
2. Create download page
3. Users download and install

### Method 2: USB Distribution
1. Copy installer to USB drives
2. Distribute to schools
3. Users install from USB

### Method 3: Network Share
1. Place installer on shared network drive
2. Users install from network
3. Automatic deployment possible

### Method 4: GitHub Releases
1. Create GitHub repository
2. Tag a release
3. Upload installers as release assets
4. Users download from Releases page

### Method 5: Auto-Update Server
1. Setup update server
2. Configure in package.json
3. App auto-updates when new version available

---

## 🔄 Updating the App

### For Developers (Creating Updates)
1. Update version in `package.json`
2. Make code changes
3. Build new installer: `npm run electron:build`
4. Distribute new installer

### For Users (Installing Updates)
**Method 1: Auto-update (if configured)**
- App notifies when update available
- Click "Download and Install"
- App restarts with new version

**Method 2: Manual update**
- Download new installer
- Run installer (will replace old version)
- Data preserved automatically

---

## 📊 Build Statistics

**Typical build output:**

| Platform | Installer Type | Size | Build Time |
|----------|---------------|------|------------|
| Windows | NSIS .exe | ~150MB | 3-5 min |
| Windows | Portable .exe | ~150MB | 2-3 min |
| macOS | DMG | ~150MB | 4-6 min |
| macOS | ZIP | ~140MB | 2-3 min |
| Linux | AppImage | ~150MB | 3-4 min |
| Linux | .deb | ~150MB | 2-3 min |
| Linux | .rpm | ~150MB | 2-3 min |

**Development build:**
- No installer creation
- Instant reload
- Debug tools enabled

**Production build:**
- Optimized code
- Compressed assets
- No source maps
- Smaller final size

---

## 🎓 Tips for Success

1. **Test before distributing**
   - Install on clean machine
   - Test all features
   - Check for errors

2. **Version your builds**
   - Use semantic versioning (3.0.0)
   - Document changes
   - Keep old versions

3. **Backup before updating**
   - Always create backup of current version
   - Test update process
   - Have rollback plan

4. **Sign your installers**
   - Prevents Windows SmartScreen warnings
   - Increases user trust
   - Required for some organizations

5. **Provide documentation**
   - Include README
   - Create quick start guide
   - Record video tutorial

---

## 📞 Need Help?

**Build issues:**
- Check Electron Builder docs: https://www.electron.build
- Check Node.js version: `node --version`
- Search GitHub issues

**App issues:**
- Check console for errors: `Ctrl+Shift+I`
- Check database file exists
- Try clean install

**Contact:**
- Email: dev@mwasoftware.com (example)
- GitHub: https://github.com/mwa/school-fee-manager (example)

---

**Happy Building! 🎉**

Your installer will be ready in the `release/` folder after successful build.
