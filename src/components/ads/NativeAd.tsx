import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import {
  NativeAd as GAMNativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';

const adUnitId = getAdUnitId('nativeId');

interface NativeAdProps {
  style?: ViewStyle;
}

export const NativeAd: React.FC<NativeAdProps> = ({ style }) => {
  const [nativeAd, setNativeAd] = useState<GAMNativeAd | null>(null);
  const [loading, setLoading] = useState(true);

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
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View style={styles.iconAndText}>
          <NativeAsset assetType={NativeAssetType.ICON}>
             {nativeAd.icon?.uri ? (
               <Image source={{ uri: nativeAd.icon.uri }} style={styles.icon} />
             ) : <View style={styles.iconPlaceholder} />}
          </NativeAsset>

          <View style={styles.textContainer}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline}>{nativeAd.headline}</Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.tagline} numberOfLines={2}>{nativeAd.body}</Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
               <Text style={styles.advertiser}>{nativeAd.advertiser}</Text>
            </NativeAsset>
          </View>
        </View>

        {nativeAd.images && nativeAd.images.length > 0 && (
           <NativeAsset assetType={NativeAssetType.IMAGE}>
             <Image source={{ uri: nativeAd.images[0].url }} style={styles.image} />
           </NativeAsset>
        )}

        <View style={styles.bottomContainer}>
           <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={styles.callToAction}>
                 <Text style={styles.callToActionText}>{nativeAd.callToAction}</Text>
              </View>
           </NativeAsset>
        </View>
      </View>
    </NativeAdView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  content: {
    flex: 1,
  },
  iconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  headline: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  tagline: {
    fontSize: 12,
    color: 'gray',
  },
  advertiser: {
    fontSize: 10,
    color: 'gray',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 4,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  callToAction: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
  },
  callToActionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});
