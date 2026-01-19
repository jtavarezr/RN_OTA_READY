import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';

const adUnitId = getAdUnitId('interstitialId');

export const useInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);

  useEffect(() => {
    if (!adUnitId) return;

    const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeClosed = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitialAd.load(); // Preload the next ad
      }
    );

    interstitialAd.load();
    setInterstitial(interstitialAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showInterstitial = () => {
    if (loaded && interstitial) {
      interstitial.show();
    } else {
      console.log('Interstitial Ad not loaded yet');
    }
  };

  return { loaded, showInterstitial };
};
