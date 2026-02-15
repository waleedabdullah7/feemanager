ICON PLACEHOLDER

To build installers, you need proper icon files:

Required Files:
- icon.png (512x512px) - For Linux
- icon.ico - For Windows
- icon.icns - For macOS  
- tray-icon.png (16x16px) - For system tray

You can:
1. Create icons manually using your school logo
2. Use online tools like: https://icon.kitchen
3. Use electron-icon-maker: npm install -g electron-icon-maker

Quick generation:
electron-icon-maker --input=your-logo.png --output=./assets

For now, the build will use default Electron icon.
