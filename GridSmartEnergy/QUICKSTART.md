# GridSmart Energy - Quick Start Guide

## 🚀 Run in 3 Minutes

### Prerequisites
- Node.js installed (v20+)
- Git installed

### Step 1: Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd GridSmartEnergy

# Install dependencies
npm install
```

### Step 2: Run the App

#### Option A: Run on Web Browser
```bash
npm run web
```
- Opens automatically at http://localhost:8081
- Press `w` in terminal to open web browser
- Works on Chrome, Firefox, Safari, Edge

#### Option B: Run on Mobile (Phone)
```bash
npm start
```
1. Install "Expo Go" app on your phone (App Store/Play Store)
2. Scan the QR code shown in terminal
3. App opens on your phone instantly

#### Option C: Run on Mobile Emulator
```bash
# For Android
npm run android

# For iOS (Mac only)
npm run ios
```

### Step 3: Test Features

1. **Home Screen**
   - View transformer load gauge
   - See BlockDAG network status (real block numbers!)

2. **Earn Rewards Tab**
   - Click "Commit to Reduce"
   - Enter kWh amount (e.g., 2)
   - Submit to see mock transaction

3. **Trading Tab**
   - Browse available energy offers
   - Click trade cards to simulate P2P trading

4. **Wallet Tab**
   - Click "Connect Wallet"
   - View connection status and stats

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill existing process
npx kill-port 8081
npm start
```

### Clear Cache
```bash
# Reset everything
npm start -- --clear
```

### Dependencies Issue
```bash
# Reinstall clean
rm -rf node_modules
npm install
```

## 📱 Mobile Testing

### Using Expo Go (Fastest)
1. Download "Expo Go" from App/Play Store
2. Run `npm start`
3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Using Web Browser
- Visit http://localhost:8081 after running `npm run web`
- Press F12 → Toggle device toolbar for mobile view

## 🌐 Production Build

### Build for Web Deployment
```bash
# Create production build
npx expo export --platform web --output-dir dist

# Files ready in dist/ folder
# Deploy to any static host (Vercel, Netlify, GitHub Pages)
```

## 💡 Quick Tips

- **Hot Reload**: Save any file to see changes instantly
- **Developer Menu**: Shake phone or press `d` in terminal
- **Console Logs**: Check terminal for debug output
- **Network Issues**: Ensure phone and computer on same WiFi

## 📞 Need Help?

- **Expo Docs**: https://docs.expo.dev
- **BlockDAG Explorer**: https://awakening.bdagscan.com
- **Check README.md** for detailed documentation

---
**Ready to run!** Just `npm start` and scan the QR code! 🎉