# Installing YATA on Your iPhone

## Method 1: Using Expo Go (Easiest)

1. Install the Expo Go app from the App Store on your iPhone
2. On your computer, run:
   ```
   npm start
   ```
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

Note: When you close your laptop, the development server stops and the app will disconnect. The app will continue running but won't receive live updates.

## Method 2: Installing as a Development Build

1. Change the bundle identifier in `app.json` to something unique:
   ```json
   "ios": {
     "supportsTablet": true,
     "bundleIdentifier": "com.yourname.yata"
   }
   ```

2. Set up Xcode signing:
   - Open Xcode > Settings > Accounts
   - Add your Apple ID (free, no paid developer account needed)
   - Click "Manage Certificates" and add an Apple Development certificate

3. Build and install:
   ```
   npx expo prebuild --clean
   npx expo run:ios --device
   ```

4. When prompted, select your connected iPhone

Note: Using a free Apple ID means certificates expire after 7 days and will need to be refreshed.
