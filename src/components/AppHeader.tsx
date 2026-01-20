import React from 'react';
import { View, TouchableOpacity, Image, Text, ViewProps, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTailwind } from '../utils/tailwind';
import { getThemeColors } from '../utils/themeColors';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps extends ViewProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  notificationCount = 5,
  userName,
  userRole = 'Senior Developer',
  userAvatar,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const tw = useTailwind();
  const { user } = useAuth();

  const displayName = userName || user?.name || 'Alex Rodriguez';
  const displayAvatar = userAvatar || 'https://i.pravatar.cc/100';

  return (
    <SafeAreaView 
      edges={['top', 'left', 'right']}
      style={[
        { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
        style
      ]}
      {...props}
    >
      <View style={tw('flex-row justify-between items-center px-4 py-3')}>
        <View style={tw('flex-row items-center')}>
          <TouchableOpacity style={tw('mr-3')} onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color={colors.textMain} />
          </TouchableOpacity>
          <Image source={{ uri: displayAvatar }} style={tw('w-10 h-10 rounded-full mr-3')} />
          <View>
            <Text style={[tw('text-base font-semibold'), { color: colors.textMain }]}>
              {displayName}
            </Text>
            <Text style={[{ color: colors.textSecondary, fontSize: 12 }]}>
              {userRole}
            </Text>
          </View>
        </View>
        <View style={tw('flex-row items-center')}>
          <TouchableOpacity
            style={tw('w-9 h-9 justify-center items-center mr-3')}
            onPress={onSearchPress}
          >
            <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={tw('w-9 h-9 justify-center items-center relative')}
            onPress={onNotificationPress}
          >
            {notificationCount > 0 && (
              <View style={tw('absolute -top-1 -right-1 bg-red-500 rounded-lg w-4 h-4 justify-center items-center z-10')}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{notificationCount}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
