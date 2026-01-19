import React, { useState } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: StyleProp<ViewStyle>;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, 
  style,
  onAdLoaded,
  onAdFailedToLoad
}) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adUnitId = getAdUnitId('bannerId');

  if (!adUnitId) {
    return null;
  }

  return (
    <View style={style}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
          if (onAdLoaded) onAdLoaded();
        }}
        onAdFailedToLoad={(error) => {
          setIsAdLoaded(false);
          console.error('Banner Ad failed to load', error);
          if (onAdFailedToLoad) onAdFailedToLoad(error);
        }}
      />
    </View>
  );
};
