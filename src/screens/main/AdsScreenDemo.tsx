import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Button, Divider, Layout } from '@ui-kitten/components';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AdBanner } from '../../components/ads/AdBanner';
import { NativeAd } from '../../components/ads/NativeAd';
import { useInterstitialAd } from '../../components/ads/useInterstitialAd';
import { useRewardedAd } from '../../components/ads/useRewardedAd';
import { useRewardedInterstitialAd } from '../../components/ads/useRewardedInterstitialAd';
import { useAppOpenAd } from '../../components/ads/useAppOpenAd';
import { BannerAdSize } from 'react-native-google-mobile-ads';

export const AdsScreenDemo = () => {
  const { loaded: interstitialLoaded, showInterstitial } = useInterstitialAd();
  const { loaded: rewardedLoaded, showRewarded, reward } = useRewardedAd();
  const { loaded: rewardedInterstitialLoaded, showRewardedInterstitial } = useRewardedInterstitialAd();
  // App Open Ad is typically handled automatically on app resume, but we hook it up here to show status
  const { loaded: appOpenLoaded } = useAppOpenAd();

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text category='h4' style={styles.title}>AdMob Demo</Text>
        <Text category='p1' style={styles.subtitle}>
          Test different ad formats integrated with Expo & react-native-google-mobile-ads.
        </Text>

        <Divider style={styles.divider} />

        {/* Banner Ads Section */}
        <Text category='h5' style={styles.sectionTitle}>Banner Ads</Text>
        <Card style={styles.card}>
          <Text category='s1'>Standard Banner</Text>
          <Text category='c1' style={styles.description}>
            Adaptive banner that fits the screen width.
          </Text>
          <View style={styles.bannerContainer}>
            <AdBanner />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text category='s1'>Medium Rectangle</Text>
          <Text category='c1' style={styles.description}>
            Fixed size banner (300x250).
          </Text>
          <View style={styles.bannerContainer}>
            <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
          </View>
        </Card>

        {/* Full Screen Ads Section */}
        <Text category='h5' style={styles.sectionTitle}>Full Screen Ads</Text>
        
        <Card style={styles.card}>
          <Text category='s1'>Interstitial Ad</Text>
          <Text category='c1' style={styles.description}>
            Full screen ad that covers the interface.
          </Text>
          <Button 
            style={styles.button} 
            onPress={showInterstitial}
            disabled={!interstitialLoaded}
            status={interstitialLoaded ? 'primary' : 'basic'}
          >
            {interstitialLoaded ? 'Show Interstitial' : 'Loading Interstitial...'}
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text category='s1'>Rewarded Ad</Text>
          <Text category='c1' style={styles.description}>
            User gets a reward for watching the video.
          </Text>
          {reward && (
            <Text style={styles.rewardText} status='success'>
              Last Reward: {reward.amount} {reward.type}
            </Text>
          )}
          <Button 
            style={styles.button} 
            onPress={showRewarded}
            disabled={!rewardedLoaded}
            status={rewardedLoaded ? 'success' : 'basic'}
          >
            {rewardedLoaded ? 'Show Rewarded Ad' : 'Loading Rewarded...'}
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text category='s1'>Rewarded Interstitial</Text>
          <Text category='c1' style={styles.description}>
            Hybrid format. Can be skipped after a delay.
          </Text>
          <Button 
            style={styles.button} 
            onPress={showRewardedInterstitial}
            disabled={!rewardedInterstitialLoaded}
            status={rewardedInterstitialLoaded ? 'warning' : 'basic'}
          >
            {rewardedInterstitialLoaded ? 'Show Rewarded Interstitial' : 'Loading...'}
          </Button>
        </Card>

        {/* Native Ads Section */}
        <Text category='h5' style={styles.sectionTitle}>Native Ads</Text>
        <Card style={styles.card}>
          <Text category='s1'>Native Advanced</Text>
          <Text category='c1' style={styles.description}>
            Ad components that match the look and feel of the app.
          </Text>
          <NativeAd style={styles.nativeAd} />
        </Card>

        {/* Status Section */}
        <Text category='h5' style={styles.sectionTitle}>Ad Status</Text>
        <Layout level='2' style={styles.statusContainer}>
          <Text category='c1'>Interstitial Loaded: {interstitialLoaded ? '✅' : '❌'}</Text>
          <Text category='c1'>Rewarded Loaded: {rewardedLoaded ? '✅' : '❌'}</Text>
          <Text category='c1'>Rewarded Interstitial Loaded: {rewardedInterstitialLoaded ? '✅' : '❌'}</Text>
          <Text category='c1'>App Open Ad Loaded: {appOpenLoaded ? '✅' : '❌'}</Text>
        </Layout>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  title: {
    marginVertical: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#8F9BB3',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  divider: {
    marginVertical: 10,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 12,
    color: '#8F9BB3',
  },
  bannerContainer: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 4,
  },
  button: {
    marginTop: 8,
  },
  rewardText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  nativeAd: {
    marginTop: 10,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
});
