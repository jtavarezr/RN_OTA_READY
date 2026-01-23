import { useEffect, useState, useRef } from 'react';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../utils/admobConfig';
import { AppState, AppStateStatus } from 'react-native';

const adUnitId = getAdUnitId('appOpenId');

export const useAppOpenAd = () => {
  const [appOpenAd, setAppOpenAd] = useState<AppOpenAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isShowingAd = useRef(false);
  const hasShownInitialAd = useRef(false);
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

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
    const showAdIfReady = () => {
      if (loaded && appOpenAd && !isShowingAd.current) {
        console.log('Showing App Open Ad (Ready)');
        try {
          isShowingAd.current = true;
          hasShownInitialAd.current = true;
          appOpenAd.show();
        } catch (error) {
          console.error('Failed to show App Open Ad', error);
          isShowingAd.current = false;
        }
      }
    };

    // Solo mostramos automáticamente si es la primera vez que se carga (inicio de app)
    // o si el AppState es 'active' pero venimos de 'background'/'inactive'
    if (AppState.currentState === 'active' && loaded && !hasShownInitialAd.current) {
      showAdIfReady();
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        
        // Calcular tiempo de inactividad
        const now = Date.now();
        const inactiveDuration = backgroundTime.current ? (now - backgroundTime.current) : 0;
        const ONE_MINUTE = 60 * 1000;

        // Mostrar anuncio solo si ha pasado más de 1 minuto o es el inicio (handled by hasShownInitialAd logic)
        if (inactiveDuration > ONE_MINUTE) {
          showAdIfReady();
        } else {
          console.log(`Skipping ad: only ${Math.round(inactiveDuration / 1000)}s elapsed`);
        }
      }

      if (nextAppState.match(/inactive|background/)) {
        backgroundTime.current = Date.now();
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [loaded, appOpenAd]);

  return { loaded, appOpenAd };
};
