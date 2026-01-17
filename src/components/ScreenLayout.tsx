import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { Layout, LayoutProps } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps extends LayoutProps {
  children: React.ReactNode;
  safeArea?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, safeArea = true, style, ...props }) => {
  const Content = (
    <Layout style={[styles.container, style]} {...props}>
      {children}
    </Layout>
  );

  if (safeArea) {
    return (
      <Layout style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          {Content}
        </SafeAreaView>
      </Layout>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
