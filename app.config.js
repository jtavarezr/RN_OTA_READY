import 'dotenv/config';

export default {
  expo: {
    name: "JobsPrepAI",
    slug: "jobsprepai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jobsprepai.app.v1",
      infoPlist: {
        NSUserTrackingUsageDescription: "This identifier will be used to deliver personalized ads to you."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.jobsprepai.app.v1"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-updates",
        {
          checkOnLaunch: "ALWAYS",
          enabled: true
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713", // Test ID fallback
          iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511", // Test ID fallback
          userTrackingUsageDescription: "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ],
    updates: {
      url: "https://ota.tavarez.dev/manifest"
    },
    runtimeVersion: "1.0.0",
    extra: {
      eas: {
        projectId: "your-project-id"
      },
      admobAndroidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
      admobIosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
      admobAndroidBannerId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
      admobIosBannerId: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
      admobAndroidInterstitialId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
      admobIosInterstitialId: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
      admobAndroidRewardedId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID,
      admobIosRewardedId: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID,
      admobAndroidRewardedInterstitialId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID,
      admobIosRewardedInterstitialId: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID,
      admobAndroidNativeId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_ID,
      admobIosNativeId: process.env.EXPO_PUBLIC_ADMOB_IOS_NATIVE_ID,
      admobAndroidAppOpenId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_OPEN_ID,
      admobIosAppOpenId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_OPEN_ID
    }
  }
};
