import React, { useState, useEffect } from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import {
  NativeAd as GAMNativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';
import { useTheme } from '../../context/ThemeContext';
import { useTailwind } from '../../utils/tailwind';

const adUnitId = getAdUnitId('nativeId');

interface NativeAdSmallProps {
  style?: ViewStyle;
}

export const NativeAdSmall: React.FC<NativeAdSmallProps> = ({ style }) => {
  const [nativeAd, setNativeAd] = useState<GAMNativeAd | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const tw = useTailwind();

  const colors = {
    card: theme === 'dark' ? '#1f2937' : '#ffffff',
    cardBorder: theme === 'dark' ? '#374151' : '#e5e7eb',
    textMain: theme === 'dark' ? '#f9fafb' : '#1f2937',
    textSecondary: theme === 'dark' ? '#9ca3af' : '#6b7280',
    primary: '#6366f1',
  };

  useEffect(() => {
    if (!adUnitId) return;

    let mounted = true;
    GAMNativeAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
      .then((ad) => {
        if (mounted) {
          setNativeAd(ad);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Native Ad Small failed to load', error);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      if (nativeAd) {
        nativeAd.destroy();
      }
    };
  }, []);

  if (loading || !nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      style={[
        { width: '100%' },
        style
      ]}
    >
      <View
        style={[
          tw('rounded-2xl p-4 items-center mb-4'),
          {
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 2,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={tw('w-full items-center')}>
             <NativeAsset assetType={NativeAssetType.ICON}>
                 {nativeAd.icon?.url ? (
                   <View style={[tw('w-12 h-12 rounded-full justify-center items-center mb-2'), { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                     <Image source={{ uri: nativeAd.icon.url }} style={tw('w-8 h-8 rounded-full')} />
                   </View>
                 ) : (
                    <View style={[tw('w-12 h-12 rounded-full justify-center items-center mb-2'), { backgroundColor: 'rgba(99,102,241,0.15)' }]} />
                 )}
              </NativeAsset>
            
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
               <Text style={[tw('text-sm font-medium mt-2 text-center'), { color: colors.textMain }]} numberOfLines={1}>
                 {nativeAd.headline}
               </Text>
            </NativeAsset>

            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={[tw('text-[11px] mt-1 text-center'), { color: colors.textSecondary }]} numberOfLines={2}>
                 {nativeAd.body}
              </Text>
            </NativeAsset>
            
             <View style={[tw('absolute top-0 right-0 px-1.5 py-0.5 rounded'), { backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }]}>
                <Text style={{ fontSize: 7, color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontWeight: '700' }}>
                  AD
                </Text>
           </View>
        </View>
      </View>
    </NativeAdView>
  );
};
