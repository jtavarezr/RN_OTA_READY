import { useEffect, useState, useRef } from 'react';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';
import { AppState, AppStateStatus } from 'react-native';

const adUnitId = getAdUnitId('appOpenId');

export const useAppOpenAd = () => {
  const [appOpenAd, setAppOpenAd] = useState<AppOpenAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isShowingAd = useRef(false);

  useEffect(() => {
    if (!adUnitId) return;

    const ad = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = ad.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('App Open Ad loaded');
        setLoaded(true);
      }
    );

    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('App Open Ad closed');
        setLoaded(false);
        isShowingAd.current = false;
        ad.load(); // Preload next ad
      }
    );

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('App Open Ad failed to load', error);
        setLoaded(false);
      }
    );

    ad.load();
    setAppOpenAd(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && loaded && appOpenAd && !isShowingAd.current) {
         console.log('App active, showing App Open Ad');
         try {
            isShowingAd.current = true;
            appOpenAd.show();
         } catch (error) {
            console.error('Failed to show App Open Ad', error);
            isShowingAd.current = false;
         }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loaded, appOpenAd]);

  return { loaded, appOpenAd };
};
