import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Image,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Divider } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../utils/themeColors';
import { useTailwind } from '../utils/tailwind';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75; // 75% of screen width

export const CustomSidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const tw = useTailwind();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Animation values
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSidebarOpen, slideAnim, fadeAnim]);

  const handleNavigation = (screenName: string) => {
    closeSidebar();
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    closeSidebar();
    await logout();
  };

  const menuGroups = [
    {
      title: null,
      items: [
        { label: t('home') || 'Home', icon: 'home-outline', screen: 'Home' },
        { label: t('utility') || 'Utility', icon: 'grid-outline', screen: 'Utility' },
        { label: t('profile') || 'Profile', icon: 'person-outline', screen: 'Profile' },
        { label: t('settings') || 'Settings', icon: 'settings-outline', screen: 'Settings' },
        { label: 'Ads Demo', icon: 'gift-outline', screen: 'Ads' },
      ]
    },
    {
      title: 'Career Tools',
      items: [
        { label: 'Job & Resume compatibility', icon: 'analytics-outline', screen: 'JobResumeCompatibility' },
        { label: 'AI Career Coach', icon: 'chatbubbles-outline', screen: 'CareerCoach' },
      ]
    }
  ];

  return (
    <View style={[styles.container, !isSidebarOpen && styles.containerClosed]} pointerEvents="box-none">
      {/* Backdrop / Overlay */}
      <Animated.View
        style={[
          styles.backdrop,
          { 
            opacity: fadeAnim, 
            backgroundColor: '#000',
            // Disable touches on backdrop when sidebar is closed/closing
            transform: [{ translateX: isSidebarOpen ? 0 : SCREEN_WIDTH }] 
          }
        ]}
        pointerEvents={isSidebarOpen ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
      </Animated.View>

      {/* Sidebar Container */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.card,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            borderRightWidth: 1,
            borderRightColor: colors.cardBorder
          },
        ]}
      >
        {/* Header Section */}
        <View style={tw('p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between')}>
            <View style={tw('flex-row items-center')}>
                <Image 
                    source={{ uri: user?.avatar || 'https://i.pravatar.cc/100' }} 
                    style={tw('w-10 h-10 rounded-full mr-3')} 
                />
                <View style={{ maxWidth: '70%' }}>
                    <Text style={[tw('text-base font-bold'), { color: colors.textSecondary }]} numberOfLines={1}>
                        {user?.email || 'User'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={closeSidebar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView style={tw('flex-1 py-4')}>
          {menuGroups.map((group, gIndex) => (
            <View key={gIndex} style={tw('mb-4')}>
              {group.title && (
                <Text style={[tw('px-6 py-2 text-xs font-bold uppercase'), { color: colors.textSecondary, opacity: 0.6 }]}>
                  {group.title}
                </Text>
              )}
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[tw('flex-row items-center px-4 py-3 mb-1 mx-2 rounded-lg')]}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={colors.primary}
                    style={tw('mr-3')}
                  />
                  <Text style={[tw('text-base'), { color: colors.textSecondary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {gIndex < menuGroups.length - 1 && <Divider style={tw('mx-4 mt-2')} />}
            </View>
          ))}
        </ScrollView>

        {/* Footer / Logout */}
        <View style={tw('p-4 border-t border-gray-200 dark:border-gray-700')}>
          <TouchableOpacity
            style={tw('flex-row items-center px-2 py-2')}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} style={tw('mr-3')} />
            <Text style={[tw('text-base font-semibold'), { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  containerClosed: {
    zIndex: -1, 
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, 
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
