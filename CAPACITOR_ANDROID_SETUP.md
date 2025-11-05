# Capacitor Android Setup Guide for Vaye Driver App

## Overview

This guide explains how to run your Vaye Driver React application on Android Studio using Capacitor.

## Prerequisites

Before you start, ensure you have the following installed:

1. **Android Studio** (latest version)
2. **Android SDK** (API 22 or higher)
3. **Java Development Kit (JDK)** 11 or newer
4. **Node.js** (version 16 or newer)
5. **npm** or **yarn**

## Setup Status ✅

All Capacitor setup has been completed for your project:

- ✅ Capacitor CLI and Android platform installed
- ✅ Capacitor configuration created (`capacitor.config.ts`)
- ✅ Android platform added with proper permissions
- ✅ Package.json scripts updated
- ✅ Android manifest configured with necessary permissions
- ✅ React app built and synced with Android

## Available Scripts

### Development Scripts

```bash
# Build React app and sync with Capacitor
npm run cap:build

# Open Android Studio with the project
npm run cap:open

# Sync changes to Android platform
npm run cap:sync

# Run app with live reload on Android device/emulator
npm run cap:serve

# Complete Android workflow (build + open Android Studio)
npm run android
```

## Step-by-Step Instructions

### 1. Prepare Your Environment

Ensure Android Studio is installed and configured:

- Install Android Studio from https://developer.android.com/studio
- Install Android SDK (API level 22+)
- Set up environment variables:
  - `ANDROID_HOME` pointing to your Android SDK location
  - `ANDROID_SDK_ROOT` pointing to your Android SDK location

### 2. Open in Android Studio

From your project directory, run:

```bash
npm run android
```

This will:

1. Build your React app
2. Sync with Capacitor
3. Open Android Studio automatically

### 3. Configure Android Virtual Device (AVD)

In Android Studio:

1. Go to **Tools** > **AVD Manager**
2. Create a new virtual device or use existing one
3. Choose a device with API level 22 or higher
4. Start the emulator

### 4. Run the App

In Android Studio:

1. Wait for Gradle sync to complete
2. Select your target device (emulator or physical device)
3. Click the green **Run** button or press `Shift + F10`

### 5. Development Workflow

For ongoing development:

#### Option A: Manual Sync

1. Make changes to your React code
2. Run `npm run build` to build the React app
3. Run `npx cap sync` to sync changes
4. Re-run the app in Android Studio

#### Option B: Live Reload (Recommended)

1. Connect your Android device via USB (enable USB debugging)
2. Run `npm run cap:serve`
3. This enables live reload for faster development

## Project Structure

```
Driver-FrontEnd/
├── android/                    # Generated Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # App permissions and config
│   │   │   └── assets/public/       # Your React build files
│   └── build.gradle
├── src/                        # Your React source code
├── build/                      # React production build
├── capacitor.config.ts         # Capacitor configuration
└── package.json               # Updated with Capacitor scripts
```

## Configured Permissions

Your app has been configured with the following Android permissions:

- **Location Services**: GPS tracking for driver location
- **Camera**: Profile pictures and delivery photos
- **Notifications**: Push notifications for ride requests
- **Phone**: Calling customers
- **Storage**: Accessing device storage
- **Network**: Internet connectivity

## Troubleshooting

### Common Issues and Solutions

1. **Build Fails**

   ```bash
   # Clean and rebuild
   npm run build
   npx cap clean android
   npx cap sync
   ```

2. **Android Studio Won't Open**

   ```bash
   # Manually open Android Studio and import the android folder
   # File > Open > Select /path/to/Driver-FrontEnd/android
   ```

3. **Gradle Sync Issues**

   - In Android Studio: **File** > **Sync Project with Gradle Files**
   - Check internet connection
   - Update Android Studio and SDK tools

4. **Plugin Not Found Errors**

   ```bash
   # Reinstall Capacitor plugins
   npm install @capacitor/core @capacitor/android --save
   npx cap sync
   ```

5. **Permission Denied on Device**
   - Enable USB debugging on your Android device
   - Install device drivers if needed
   - Check device manufacturer's developer options

### Live Reload Issues

If live reload isn't working:

1. Ensure your computer and Android device are on the same network
2. Check firewall settings
3. Try using your computer's IP address instead of localhost

## Additional Features

### Custom App Icon and Splash Screen

To customize your app's appearance:

1. **App Icon**: Replace files in `android/app/src/main/res/mipmap-*/`
2. **Splash Screen**: Modify `android/app/src/main/res/drawable/splash.png`
3. **App Name**: Edit `android/app/src/main/res/values/strings.xml`

### Production Build

For production builds:

```bash
# Build for production
npm run build

# Generate signed APK in Android Studio:
# Build > Generate Signed Bundle / APK
```

## Configuration Files

### capacitor.config.ts

Contains app configuration including:

- App ID: `com.vaye.driver`
- App Name: `Vaye Driver`
- Web directory: `build`
- Plugin configurations for notifications, splash screen, etc.

### AndroidManifest.xml

Contains all necessary permissions for a driver app including location services, camera access, and notifications.

## Next Steps

1. **Test on Device**: Install the app on a real Android device
2. **Customize Branding**: Update app icon, splash screen, and colors
3. **Production Setup**: Configure signing keys for Play Store release
4. **Performance Testing**: Test on various Android versions and devices

## Support

If you encounter issues:

1. Check the [Capacitor Documentation](https://capacitorjs.com/docs)
2. Review the [Android Developer Guide](https://developer.android.com/guide)
3. Check your console logs for specific error messages

---

**Your Vaye Driver app is now ready to run on Android! 🚗📱**
