import React from 'react';
import { View, TouchableOpacity, Image, Text, ViewProps, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTailwind } from '../utils/tailwind';
import { useThemeColors } from '../utils/themeColors';
import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../store/useProfileStore';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const RANDOM_AVATAR = 'https://i.pravatar.cc/100';
import { useSidebar } from '../context/SidebarContext';

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
 //userRole = 'Senior Developer',
  userAvatar,
  style,
  ...props
}) => {
  const colors = useThemeColors();
  const tw = useTailwind();
  const { user } = useAuth();
  
  // Try to use sidebar context, but don't fail if used outside provider (though currently it will throw per context definition)
  // For this app structure, we assume it's inside provider.
  const { toggleSidebar } = useSidebar();

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
    else {
      toggleSidebar();
    }
  };

  const { profile } = useProfileStore();
  const displayName = userName || profile?.fullName || 'Alex Rodriguez';
  const displayAvatar = userAvatar || profile?.profilePicture || DEFAULT_AVATAR || RANDOM_AVATAR;
  const userRole = profile?.headline || 'Role';

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
          <TouchableOpacity style={tw('mr-3')} onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Image source={{ uri: displayAvatar }} style={tw('w-10 h-10 rounded-full mr-3')} />
          <View>
            <Text style={[tw('text-base font-semibold'), { color: colors.primary }]}>
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
            <Ionicons name="search-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={tw('w-9 h-9 justify-center items-center relative')}
            onPress={onNotificationPress}
          >
            {notificationCount > 0 && (
              <View style={[tw('absolute -top-1 -right-1 rounded-lg w-4 h-4 justify-center items-center z-10'), { backgroundColor: colors.error }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{notificationCount}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
