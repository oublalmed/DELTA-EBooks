# Google Play Release Guide (Rewarded Ad Model)

This project ships as a Vite web app. To publish on Google Play, wrap it as an Android app
using Capacitor or a Trusted Web Activity (TWA). The steps below assume Capacitor.

## 1) Prerequisites
- Android Studio + Android SDK
- Java 17+
- Google Play Console account
- Google Mobile Ads (AdMob) account
- Privacy policy URL hosted publicly

## 2) Configure environment
Add the following to your production `.env`:
```
GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 3) Wrap the app with Capacitor
```
npm install @capacitor/core @capacitor/cli
npx cap init "Delta EBooks" "com.delta.ebooks"
npm run build
npx cap add android
npx cap sync android
```

## 4) Integrate rewarded ads (required for policy compliance)
The React UI currently uses a placeholder rewarded-ad flow in `AdUnlockModal`.
Replace this with a real rewarded ad implementation (Google Mobile Ads SDK):
1. Add AdMob App ID and Rewarded Ad Unit IDs to the Android project.
2. Show rewarded ads in native code and only call the JS unlock callbacks on
   `onUserEarnedReward`.
3. Record impressions and reward completion events.

## 5) Data safety & policy checklist
- Publish a privacy policy URL in Play Console.
- Disclose data collection in the Data Safety form (email, auth, analytics).
- Use Google Play’s User Data policies for ads, children, and sensitive data.
- Make sure rewarded ads do not block access to content that is required for
  core app functionality without clear disclosure.

## 6) Signing configuration (Android Studio)
1. Create a keystore: **Build > Generate Signed Bundle / APK**.
2. Store keystore securely and back it up.
3. Configure signing in `android/app/build.gradle`.

## 7) Build release bundle (AAB)
```
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```
The bundle is generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 8) Upload to Google Play Console
1. Create a new app.
2. Upload the AAB in **Production** or **Internal testing**.
3. Fill in Store Listing, Content Rating, Data Safety, and Ads declaration.
4. Submit for review.

## 9) Post-release
- Monitor ANR/crash reports.
- Validate rewarded-ad events and unlock flows.
- Run Play policy checks for ads and user data.
