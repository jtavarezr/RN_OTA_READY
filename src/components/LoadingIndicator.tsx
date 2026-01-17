import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spinner, Text } from '@ui-kitten/components';

interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <Spinner size='giant' />
      {text && <Text category='s1' style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
  },
});
