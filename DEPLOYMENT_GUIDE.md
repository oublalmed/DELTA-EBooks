# DELTA EBooks - Deployment Guide

This guide covers setting up AdMob, building the Android app, and submitting to Google Play Store.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [AdMob Setup](#admob-setup)
3. [Mobile App Build](#mobile-app-build)
4. [Google Play Store Submission](#google-play-store-submission)
5. [Backend Deployment](#backend-deployment)
6. [Post-Launch Checklist](#post-launch-checklist)

---

## Project Overview

### What Was Added

| Feature | Location | Description |
|---------|----------|-------------|
| **Enhanced Journal** | `server/routes/journal.js` | Full CRUD with title, tags, images, mood tracking |
| **Journal View** | `components/JournalView.tsx` | Calendar view, timeline, analytics |
| **Premium System** | `server/routes/premium.js` | Ad-based premium access tracking |
| **Premium Manager** | `components/PremiumManager.tsx` | UI for trial & ad unlock |
| **Mobile App** | `mobile/` | React Native with AdMob |

### What Was Modified

| File | Changes |
|------|---------|
| `server/db.js` | Added journal_entries, premium_access, user_trials tables |
| `server/index.js` | Added journal and premium routes |
| `types.ts` | Added Journal and Premium types |
| `services/api.ts` | Added Journal and Premium API functions |
| `App.tsx` | Integrated JournalView and PremiumManager |

### What Remains Unchanged

- All existing authentication logic
- User accounts and data
- Book content and reading experience
- Existing payment system (PayPal/Stripe) - can coexist with ad-based

---

## AdMob Setup

### Step 1: Create AdMob Account

1. Go to [Google AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Accept the terms and conditions
4. Complete account setup

### Step 2: Create App in AdMob

1. Click **Apps** → **Add App**
2. Select **Android**
3. Answer "Is the app listed on a supported app store?" → **No** (if not published yet)
4. Enter app name: `DELTA EBooks`
5. Note your **App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`

### Step 3: Create Rewarded Ad Unit

1. Go to your app in AdMob
2. Click **Ad units** → **Add ad unit**
3. Select **Rewarded**
4. Configure:
   - Ad unit name: `Premium Unlock Reward`
   - Reward amount: `1`
   - Reward item: `premium_days`
5. Note your **Ad Unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`

### Step 4: Update App Configuration

Update these files with your real Ad Unit IDs:

**`mobile/App.tsx`:**
```typescript
const ADMOB_REWARDED_AD_ID = Platform.select({
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your real ID
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
  default: TestIds.REWARDED,
});
```

**`mobile/app.json`:**
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
        "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
      }
    ]
  ]
}
```

### Step 5: Server-Side Verification (Optional but Recommended)

For enhanced security, enable Server-Side Verification (SSV):

1. In AdMob, go to your rewarded ad unit
2. Enable **Server-side verification**
3. Set callback URL: `https://your-api-domain.com/api/premium/verify-ad`
4. Update `server/routes/premium.js` to verify the signature

---

## Mobile App Build

### Prerequisites

- Node.js 18+
- Java JDK 17
- Android Studio with SDK
- React Native CLI

### Step 1: Setup Environment

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# For Android, ensure ANDROID_HOME is set
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Step 2: Create Keystore (For Release Builds)

```bash
# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore delta-ebooks-release.keystore -alias delta-ebooks -keyalg RSA -keysize 2048 -validity 10000

# Store securely! You'll need this for all future updates
```

### Step 3: Configure Gradle for Signing

Create `mobile/android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=delta-ebooks-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=delta-ebooks
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Update `mobile/android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Release APK/AAB

```bash
# Build debug APK (for testing)
npm run android

# Build release AAB (for Play Store)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 5: Test the Release Build

```bash
# Install release APK on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Google Play Store Submission

### Step 1: Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the $25 registration fee
3. Complete identity verification

### Step 2: Create App Listing

1. Click **Create app**
2. Fill in:
   - App name: `DELTA EBooks - Wisdom Library`
   - Default language: English
   - App type: App
   - Category: Books & Reference
   - Free or Paid: Free

### Step 3: Store Listing

**Short description (80 chars):**
```
Read wisdom books, journal your journey, track your growth with DELTA.
```

**Full description (4000 chars):**
```
📚 DELTA EBooks - Your Personal Wisdom Library

Discover a curated collection of transformative books on philosophy, self-improvement, and personal growth. DELTA is more than just an e-book reader—it's your companion on the journey to wisdom.

✨ KEY FEATURES

📖 WISDOM LIBRARY
• Access a growing collection of carefully selected books
• Read anywhere, anytime with our beautiful reader
• Multiple themes: Light, Dark, and Sepia modes
• Adjustable font sizes for comfortable reading

📝 EXPRESSIVE JOURNAL
• Document your thoughts, feelings, and experiences
• Track your mood with visual calendar
• Categorize entries: Adventures, Successes, Reflections, and more
• Add tags and images to your entries
• View mood analytics and trends

🎯 READING PROGRESS
• Track chapters completed
• Reading streaks and badges
• Personal reflections on each chapter
• See your growth over time

🤖 AI COMPANION
• Discuss book ideas with our AI assistant
• Get deeper insights into chapters
• Ask questions about concepts

💎 PREMIUM ACCESS
• Watch a short video to unlock 7 days of premium
• Full access to all books and chapters
• Unlimited journal entries with images
• Advanced analytics

🔒 PRIVACY FIRST
• Your journal entries are private by default
• Secure account with email authentication
• Data stored securely

Start your journey to wisdom today with DELTA EBooks!
```

### Step 4: App Content

**Privacy Policy URL:** Create and host at your domain
```
https://your-domain.com/privacy-policy
```

**Content Rating:** Complete the questionnaire (likely Everyone)

**Target Audience:** 13+ (Books/Reading)

**Ads Declaration:**
- Contains ads: Yes
- Ads are appropriate for target audience: Yes
- Rewarded ads only

### Step 5: Release Management

1. Go to **Production** → **Create new release**
2. Upload your AAB file
3. Add release notes:
```
Version 1.0.0
• Initial release
• Wisdom book library
• Personal journal with mood tracking
• AI chat companion
• Ad-supported premium access
```

4. Review and start rollout

### Step 6: App Review

Google will review your app (1-7 days typically). Address any issues if rejected.

---

## Backend Deployment

### Option 1: Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: Deploy to Render

1. Connect your GitHub repo
2. Create a new Web Service
3. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-production-secret`
   - `FRONTEND_URL=https://your-app.com`
4. Deploy

### Option 3: Deploy to VPS (DigitalOcean, etc.)

```bash
# On server
git clone your-repo
cd DELTA-EBooks/server
npm install
npm run start

# Use PM2 for process management
npm i -g pm2
pm2 start index.js --name delta-api
pm2 save
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-very-secure-random-string-here
FRONTEND_URL=https://your-production-domain.com

# Optional: For payment system
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
STRIPE_SECRET_KEY=xxx
```

---

## Post-Launch Checklist

### Before Launch

- [ ] Replace all test Ad Unit IDs with production IDs
- [ ] Set `__DEV__` checks to use production URLs
- [ ] Test ad flow end-to-end on real device
- [ ] Verify premium access grants correctly
- [ ] Test journal CRUD operations
- [ ] Create and host Privacy Policy
- [ ] Create app store screenshots (5-8 images)
- [ ] Create feature graphic (1024x500)
- [ ] Create app icon (512x512)

### After Launch

- [ ] Monitor AdMob dashboard for revenue
- [ ] Check crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Monitor server logs for errors
- [ ] Track premium conversion rates

### Google Play Policy Compliance

✅ **Rewarded Ads Policy:**
- Users must actively choose to watch ads
- Clear disclosure of what they receive
- Ads don't interrupt core functionality

✅ **User Data Policy:**
- Privacy policy clearly states data collection
- Users can delete their accounts
- No selling of user data

✅ **Families Policy (if applicable):**
- Ads are appropriate for all ages
- No collection of children's data
- Age gate if needed

---

## Troubleshooting

### AdMob Issues

**Ads not loading:**
- Ensure you're not using test IDs in production
- Check AdMob account is approved
- Wait 24-48 hours for new ad units to activate

**Low fill rate:**
- Add more ad networks via mediation
- Ensure app is in active markets
- Check for policy violations

### Build Issues

**Gradle build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

### WebView Issues

**Content not loading:**
- Check WEB_APP_URL is correct
- Ensure HTTPS for production
- Check CORS settings on backend

---

## Support

For questions or issues:
- Check GitHub Issues
- Review React Native documentation
- AdMob Help Center

---

*Last updated: January 2026*
