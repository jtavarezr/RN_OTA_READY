import React, { useEffect, useState } from 'react';
import { View, Text, Image, useColorScheme } from 'react-native';
import { useTailwind } from 'tailwind-rn';

export const CustomSplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const tailwind = useTailwind();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      onFinish();
    }
  }, [progress, onFinish]);

  const styles = {
    container: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
    },
    iconContainer: {
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    },
    titleText: {
      color: isDark ? '#ffffff' : '#0f172a',
    },
    subtitleText: {
      color: isDark ? '#94a3b8' : '#64748b',
    },
    progressTrack: {
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    footerText: {
      color: isDark ? '#4b5563' : '#94a3b8',
    }
  };

  return (
    <View style={[tailwind('flex-1 items-center justify-between'), styles.container]}>
       {/* Top spacer */}
       <View style={{ height: '16%' }} />
       
       {/* Center Content */}
       <View style={tailwind('items-center')}>
         <View style={[tailwind('rounded-2xl items-center justify-center'), { width: 120, height: 120, marginBottom: 32 }, styles.iconContainer]}>
            <Image 
              source={require('../../assets/app_Icon_bot.png')} 
              style={{ width: 80, height: 80, resizeMode: 'contain' }}
            />
         </View>
         
         <Text style={[tailwind('text-4xl font-bold mb-2'), styles.titleText]}>
           JobsPrep<Text style={{ color: '#0a808f' }}>AI</Text>
         </Text>
         
         <Text style={[tailwind('text-sm font-semibold'), { letterSpacing: 2 }, styles.subtitleText]}>
           MOBILE EXPERIENCE
         </Text>
       </View>

       {/* Bottom Content */}
       <View style={tailwind('w-full px-8 pb-12')}>
         <View style={tailwind('flex-row justify-between mb-2')}>
           <Text style={[tailwind('italic text-xs'), styles.subtitleText]}>Initializing AI Interview Coach...</Text>
           <Text style={{ color: '#0a808f', fontSize: 12, fontWeight: 'bold' }}>{progress}%</Text>
         </View>
         
         {/* Progress Bar Track */}
         <View style={[tailwind('w-full h-1.5 rounded-full overflow-hidden'), { marginBottom: 32 }, styles.progressTrack]}>
            {/* Progress Bar Fill */}
            <View style={[
              tailwind('h-full rounded-full'), 
              { width: `${progress}%`, backgroundColor: '#0a808f' }
            ]} />
         </View>

         <View style={tailwind('items-center flex-row justify-center')}>
            <Text style={[tailwind('mr-2'), styles.footerText]}>🛡️</Text>
            <Text style={[tailwind('text-xs font-bold uppercase'), { letterSpacing: 1 }, styles.footerText]}>
              Secure Enterprise Ready
            </Text>
         </View>
       </View>
    </View>
  );
};
