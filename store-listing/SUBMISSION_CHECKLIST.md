# FitCheck - Google Play Submission Checklist

## App Details
- **Package ID**: com.kreslack07.fitcheck
- **App Name**: FitCheck - AI Outfit Rater
- **Version**: 1.0.0 (versionCode: 1)
- **Category**: Lifestyle
- **Content Rating**: Everyone
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 21 (Android 5.0)

## Store Listing
- [x] App name: FitCheck - AI Outfit Rater
- [x] Short description: store-listing/short-description.txt
- [x] Full description: store-listing/description.txt
- [x] Privacy policy: store-listing/privacy-policy.md
- [ ] Screenshots (phone): Need 2-8 screenshots at 16:9 or 9:16
- [ ] Feature graphic: 1024x500 PNG/JPG
- [x] App icon: 512x512 PNG (icons/icon-512.png)

## Technical Requirements
- [x] TWA config: bubblewrap.config.json
- [x] GitHub Actions build: .github/workflows/build.yml
- [x] PWA manifest: manifest.json
- [x] Service worker: sw.js
- [x] Asset links: public/.well-known/assetlinks.json (needs real SHA256 after keystore)
- [x] Vercel deployment config: vercel.json
- [ ] Deploy to Vercel to get live HTTPS URL
- [ ] Generate Android keystore and get SHA256 fingerprint
- [ ] Update assetlinks.json with real SHA256
- [ ] Build signed APK/AAB via GitHub Actions
- [ ] Upload AAB to Play Console

## Permissions Declared
- Camera (for outfit photo capture)
- Internet (for Gemini API calls)

## Next Steps
1. Deploy repo to Vercel: https://vercel.com/new → import kreslack07/android-fitcheck
2. Set GEMINI_API_KEY in Vercel environment variables
3. Generate keystore: `keytool -genkey -v -keystore android.keystore -alias fitcheck -keyalg RSA -keysize 2048 -validity 10000`
4. Get SHA256: `keytool -list -v -keystore android.keystore`
5. Update public/.well-known/assetlinks.json with real SHA256
6. Run GitHub Actions to build signed AAB
7. Upload AAB to Play Console → Production track
