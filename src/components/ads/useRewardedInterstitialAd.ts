import { useEffect, useState, useCallback } from 'react';
import { RewardedInterstitialAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';

const adUnitId = getAdUnitId('rewardedInterstitialId');

export const useRewardedInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [rewardedInterstitial, setRewardedInterstitial] = useState<RewardedInterstitialAd | null>(null);

  useEffect(() => {
    if (!adUnitId) return;

    const ad = RewardedInterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        ad.load(); // Preload next ad
      }
    );

    ad.load();
    setRewardedInterstitial(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showRewardedInterstitial = useCallback(() => {
    if (loaded && rewardedInterstitial) {
      rewardedInterstitial.show();
    } else {
      console.log('Rewarded Interstitial Ad not loaded yet');
    }
  }, [loaded, rewardedInterstitial]);

  return { loaded, showRewardedInterstitial };
};
