import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';

const isProduction = !__DEV__;

const admobConfig = {
  android: {
    appId: Constants.expoConfig?.extra?.admobAndroidAppId || 'ca-app-pub-3940256099942544~3347511713',
    bannerId: isProduction ? Constants.expoConfig?.extra?.admobAndroidBannerId : TestIds.BANNER,
    interstitialId: isProduction ? Constants.expoConfig?.extra?.admobAndroidInterstitialId : TestIds.INTERSTITIAL,
    rewardedId: isProduction ? Constants.expoConfig?.extra?.admobAndroidRewardedId : TestIds.REWARDED,
    rewardedInterstitialId: isProduction ? Constants.expoConfig?.extra?.admobAndroidRewardedInterstitialId : TestIds.REWARDED_INTERSTITIAL,
    nativeId: isProduction ? Constants.expoConfig?.extra?.admobAndroidNativeId : TestIds.NATIVE,
    appOpenId: isProduction ? Constants.expoConfig?.extra?.admobAndroidAppOpenId : TestIds.APP_OPEN,
  },
  ios: {
    appId: Constants.expoConfig?.extra?.admobIosAppId || 'ca-app-pub-3940256099942544~1458002511',
    bannerId: isProduction ? Constants.expoConfig?.extra?.admobIosBannerId : TestIds.BANNER,
    interstitialId: isProduction ? Constants.expoConfig?.extra?.admobIosInterstitialId : TestIds.INTERSTITIAL,
    rewardedId: isProduction ? Constants.expoConfig?.extra?.admobIosRewardedId : TestIds.REWARDED,
    rewardedInterstitialId: isProduction ? Constants.expoConfig?.extra?.admobIosRewardedInterstitialId : TestIds.REWARDED_INTERSTITIAL,
    nativeId: isProduction ? Constants.expoConfig?.extra?.admobIosNativeId : TestIds.NATIVE,
    appOpenId: isProduction ? Constants.expoConfig?.extra?.admobIosAppOpenId : TestIds.APP_OPEN,
  },
};

export const getAdUnitId = (type: keyof typeof admobConfig.android) => {
  return Platform.select({
    ios: admobConfig.ios[type],
    android: admobConfig.android[type],
  }) || '';
};
