import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { UtilityScreen } from '../screens/main/UtilityScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AdsScreenDemo } from '../screens/main/AdsScreenDemo';
import { JobResumeCompatibility } from '../components/CVBuilderAndTools/JobResumeCompatibility';
import { BottomNavigation, BottomNavigationTab, Icon, IconElement } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/AppHeader';
import { SidebarProvider } from '../context/SidebarContext';
import { CustomSidebar } from '../components/CustomSidebar';

// Navigation Stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const BottomTabBar = ({ navigation, state }: any) => {
    const { t } = useTranslation();

    return (
        <BottomNavigation
            selectedIndex={state.index}
            onSelect={index => navigation.navigate(state.routeNames[index])}
        >
            <BottomNavigationTab title={t('home')} icon={(props) => <Icon {...props} name='home-outline'/>} />
            <BottomNavigationTab title={t('utility')} icon={(props) => <Icon {...props} name='grid-outline'/>} />
            <BottomNavigationTab title={t('profile')} icon={(props) => <Icon {...props} name='person-outline'/>} />
            <BottomNavigationTab title={t('settings')} icon={(props) => <Icon {...props} name='settings-outline'/>} />
            <BottomNavigationTab title="Ads" icon={(props) => <Icon {...props} name='gift-outline'/>} />
        </BottomNavigation>
    );
};

const MainTabs = () => (
  <SidebarProvider>
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        header: (props) => <AppHeader />,
        headerShown: true
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: true }} />
      <Tab.Screen name="Utility" component={UtilityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Ads" component={AdsScreenDemo} />
      <Tab.Screen 
        name="JobResumeCompatibility" 
        component={JobResumeCompatibility} 
        options={{ tabBarButton: () => null }} // Hide from bottom tab bar
      />
    </Tab.Navigator>
    <CustomSidebar />
  </SidebarProvider>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
