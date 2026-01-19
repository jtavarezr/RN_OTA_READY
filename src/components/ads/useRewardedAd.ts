import { useEffect, useState, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';

const adUnitId = getAdUnitId('rewardedId');

export const useRewardedAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
  const [reward, setReward] = useState<{ type: string; amount: number } | null>(null);

  useEffect(() => {
    if (!adUnitId) return;

    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('Rewarded Ad Loaded');
        setLoaded(true);
      }
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward', reward);
        setReward(reward);
      }
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Rewarded Ad Closed');
        setLoaded(false);
        setReward(null);
        rewardedAd.load(); // Preload next ad
      }
    );

    const unsubscribeError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Rewarded Ad failed to load', error);
        setLoaded(false);
      }
    );

    console.log('Loading Rewarded Ad...');
    rewardedAd.load();
    setRewarded(rewardedAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showRewarded = useCallback(() => {
    if (loaded && rewarded) {
      rewarded.show();
    } else {
      console.log('Rewarded Ad not loaded yet');
    }
  }, [loaded, rewarded]);

  return { loaded, showRewarded, reward };
};
