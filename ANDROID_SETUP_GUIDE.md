# Running CarYuk on Android - Quick Start Guide

## Option 1: Android Studio Emulator (Recommended)

### Prerequisites Check:
- ✅ Android Studio installed
- ✅ JDK installed (comes with Android Studio)
- ✅ Android SDK installed (Android Studio setup wizard should have done this)

### Step 1: Create Virtual Device in Android Studio

1. **Open Android Studio**
2. Go to **Tools → Device Manager**
3. Click **"Create Virtual Device"** button
4. In the "Virtual Device Configuration" window:
   - **Select a device**: Choose "Pixel 5" or any phone model
   - Click **"Next"**
   - **Select System Image**: 
     - Choose "Recommended" tab
     - Select an Android version (API 30 or higher recommended)
     - Click **"Next"**
   - **Verify Configuration**:
     - Check the settings (defaults are fine)
     - Click **"Finish"**

### Step 2: Start the Virtual Device

1. In **Device Manager**, find your created device
2. Click the **Play button (▶)** on the right
3. Wait 1-2 minutes for the emulator to fully boot
4. You should see an Android phone screen appear

### Step 3: Run Your Expo App on the Emulator

```bash
# Navigate to client folder
cd client

# Start Expo development server
npm start
```

When you see the Expo menu, you have options:
```
› Metro waiting on exp://...
Press a to run Android
Press w to run web
Press i to run iOS simulator
...
```

**Press `a`** - Expo will automatically detect your running emulator and install your app.

The app should launch on the emulator within 30-60 seconds.

---

## Option 2: Physical Android Phone (Easiest!)

### Prerequisites:
- Android phone with USB cable
- Expo Go app (free from Google Play Store)

### Steps:

1. **Enable Developer Mode on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Toggle "USB Debugging" ON
   - If prompted, allow the connection

3. **Connect via USB:**
   - Plug phone into computer with USB cable
   - On your phone, tap "Allow" when prompted for debugging access

4. **Run Expo:**
   ```bash
   cd client
   npm start
   ```

5. **Choose Android:**
   - Press `a` when prompted
   - Expo will detect your connected phone and install the app automatically

---

## Option 3: Expo Go App (Fastest for Quick Testing)

This is the fastest way to see your app running without setup!

### Steps:

1. **On your Android phone:**
   - Download "Expo Go" from Google Play Store
   - Open the Expo Go app

2. **On your computer:**
   ```bash
   cd client
   npm start
   ```

3. **In your Expo terminal, you'll see:**
   ```
   › Metro waiting on exp://192.168.1.100:19000

   To run the app with live reloading, press:
   a for Android
   i for iOS
   w for web
   ```

4. **Scan QR Code:**
   - Your phone has the Expo Go app open
   - Click the "Scan" button in Expo Go
   - Scan the QR code shown in your terminal
   - Your app loads automatically!

---

## 🔧 Troubleshooting

### Emulator won't start
- Ensure virtualization is enabled in BIOS (computer settings)
- Try allocating more RAM to the emulator (Device Manager → Edit → Memory)
- Restart Android Studio and try again

### "adb not found" error
- Android Studio should include adb, but you may need to:
  ```bash
  # Check if adb is available
  adb --version

  # If not found, check your Android SDK location:
  # Android Studio → File → Settings → Appearance & Behavior → System Settings → Android SDK
  ```

### App won't install on emulator
- Make sure emulator has fully booted (you see Android home screen)
- Try clearing the app: `adb uninstall host.exp.exponent`
- Restart emulator and try again

### Can't connect physical phone
- Verify USB Debugging is enabled on phone
- Try a different USB cable
- Disconnect and reconnect the phone
- Restart adb: `adb kill-server` then `adb devices`

### Hot reload not working
- Save the file again
- If stuck, restart Expo: Press Ctrl+C and run `npm start` again
- For physical devices, reload app by shaking the phone or pressing Ctrl+M

---

## 📱 Testing Your Full Stack

Once the app is running, you can test:

1. **Start Backend Server** (in another terminal):
   ```bash
   cd server
   npm install  # if not done yet
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Test API Health:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Update Client API Base URL** (when ready to connect frontend to backend):
   - Currently, the app uses mock Zustand stores
   - Update API calls to point to your server
   - Configure axios with base URL: `http://10.0.2.2:5000` (for emulator) or `http://192.168.x.x:5000` (for physical phone)

---

## ⚡ Quick Command Reference

```bash
# Start Expo dev server
npm start

# Run on Android Emulator
npm start → press 'a'

# Run on physical Android phone
npm start → press 'a'

# Run on Expo Go (QR scan)
npm start → scan QR with Expo Go app

# Run on web (testing only)
npm start → press 'w'

# Clear Expo cache if needed
npm start --clear

# Reset npm cache
npm cache clean --force
npm install
```

---

## 🎯 Recommended First Steps

1. **Try Option 3 (Expo Go)** - Fastest, minimal setup
   - Install Expo Go on your phone
   - Run `npm start` in client folder
   - Scan QR code
   - See your app running in seconds!

2. **Then try Option 1 (Emulator)** - For development without physical device
   - Set up Android Emulator
   - Run on emulator for deeper testing

3. **Connect Backend** - When app is running:
   - Start server: `cd server && npm run dev`
   - Update API endpoints in client code
   - Test full functionality

---

Good luck! Let me know if you hit any issues. 🚀
