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

interface NativeAdProps {
  style?: ViewStyle;
}

export const NativeAd: React.FC<NativeAdProps> = ({ style }) => {
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
        console.error('Native Ad failed to load', error);
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
      style={[{ width: '100%' }, style]}
    >
      <View
        style={[
          tw('rounded-2xl p-4 mb-4 border'),
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 4,
            elevation: 3,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={tw('flex-row items-center mb-3')}>
          <NativeAsset assetType={NativeAssetType.ICON}>
             {nativeAd.icon?.url ? (
               <Image source={{ uri: nativeAd.icon.url }} style={tw('w-12 h-12 rounded-lg bg-gray-100')} />
             ) : <View style={tw('w-12 h-12 rounded-lg bg-gray-200')} />}
          </NativeAsset>

          <View style={tw('ml-3 flex-1')}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={[tw('text-base font-semibold'), { color: colors.textMain }]} numberOfLines={1}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]} numberOfLines={2}>
                {nativeAd.body}
              </Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
               <Text style={[tw('text-[10px] mt-0.5'), { color: colors.textSecondary }]}>
                 {nativeAd.advertiser}
               </Text>
            </NativeAsset>
          </View>
        </View>

        {nativeAd.images && nativeAd.images.length > 0 && (
           <NativeAsset assetType={NativeAssetType.IMAGE}>
             <Image 
                source={{ uri: nativeAd.images[0].url }} 
                style={[tw('w-full h-36 rounded-lg mb-3'), { resizeMode: 'cover' }]} 
             />
           </NativeAsset>
        )}

        <View style={tw('flex-row justify-end items-center')}>
           <View style={[tw('px-2 py-0.5 rounded mr-auto'), { backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }]}>
                <Text style={{ fontSize: 9, color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontWeight: '700' }}>
                  AD
                </Text>
           </View>
           <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={[tw('px-4 py-2 rounded-lg'), { backgroundColor: colors.primary }]}>
                 <Text style={tw('text-white text-xs font-bold')}>{nativeAd.callToAction}</Text>
              </View>
           </NativeAsset>
        </View>
      </View>
    </NativeAdView>
  );
};

export default NativeAd;
