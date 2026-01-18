import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, RefreshControl, Linking, StyleSheet, Platform } from 'react-native';
import { Text, Button, Icon, useTheme, Avatar } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '../../components/ScreenLayout';
import { EditProfileModal } from '../../components/EditProfileModal';
import { useAuth } from '../../context/AuthContext';
import { useProfileStore } from '../../store/useProfileStore';
import { useTailwind } from '../../utils/tailwind';

// --- Constantes de Respaldo ---
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const DEFAULT_BANNER = 'https://img.freepik.com/free-vector/abstract-binary-code-techno-background_1048-12836.jpg';

// --- Componentes Reutilizables ---
const DetailSection = ({ title, icon, children, theme }: any) => (
  <View style={[styles.sectionCard, { backgroundColor: theme['background-basic-color-1'], borderColor: theme['border-basic-color-3'] }]}>
    <View style={[styles.sectionHeader, { borderBottomColor: theme['border-basic-color-3'] }]}>
      <Ionicons name={icon} size={20} color={theme['color-primary-500']} />
      <Text category="h6" style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const ContactItem = ({ icon, value, label, theme, onPress }: any) => value ? (
  <TouchableOpacity disabled={!onPress} onPress={onPress} style={styles.contactItem}>
    <Ionicons name={icon} size={18} color={theme['color-primary-500']} style={{ width: 25 }} />
    <View style={{ flex: 1 }}>
      <Text category="c1" appearance="hint">{label}</Text>
      <Text category="p2" style={{ fontWeight: '500' }}>{value}</Text>
    </View>
  </TouchableOpacity>
) : null;

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tw = useTailwind();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const { profile, loading, fetchProfile, updateProfile } = useProfileStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
        const uid = (user as any).uid || (user as any).$id || (user as any).id;
        fetchProfile(uid);
    }
  }, [user, fetchProfile]);

  const onRefresh = useCallback(() => {
    if (user) {
        const uid = (user as any).uid || (user as any).$id || (user as any).id;
        fetchProfile(uid, true);
    }
  }, [user, fetchProfile]);

  const handleSave = async (data: any) => {
    try {
      const uid = (user as any).uid || (user as any).$id || (user as any).id;
      await updateProfile(uid, data);
      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  const renderList = (items: any[], keyTitle: string, keySub: string, keyDesc?: string, keyDates?: string) => 
    (Array.isArray(items) && items.length > 0) ? items.map((item, i) => (
      <View key={i} style={[styles.listItem, { borderLeftColor: theme['color-primary-300'] }]}>
        <Text category="s1" style={{ fontWeight: '700' }}>{item[keyTitle]}</Text>
        <Text category="s2" status="primary">{item[keySub]}</Text>
        {keyDates && item[keyDates] && <Text category="c1" appearance="hint">{item[keyDates]}</Text>}
        {keyDesc && item[keyDesc] ? <Text category="p2" style={styles.listDesc}>{item[keyDesc]}</Text> : null}
      </View>
    )) : <Text appearance="hint" style={styles.emptyText}>No information added yet.</Text>;

  if (!profile && loading) return <ScreenLayout><View style={styles.center}><Text>Loading...</Text></View></ScreenLayout>;

  return (
    <ScreenLayout safeArea={false}>
      {/* Navbar Custom */}
      <View style={[styles.navBar, { 
        backgroundColor: theme['background-basic-color-1'], 
        borderBottomColor: theme['border-basic-color-3'],
        paddingTop: Math.max(insets.top, 20)
      }]}>
        <Text category="h6" style={{ fontWeight: 'bold' }}>{t('profile')}</Text>
        <TouchableOpacity onPress={onRefresh}><Ionicons name="refresh" size={22} color={theme['color-primary-500']} /></TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />} 
        bounces={false}
      >
        
        {/* HEADER LINKEDIN STYLE */}
        <View style={{ backgroundColor: theme['background-basic-color-1'], marginBottom: 12 }}>
          <Image 
            source={{ uri: profile?.bannerImage || DEFAULT_BANNER }} 
            style={styles.banner} 
          />
          <View style={styles.avatarContainer}>
            <Avatar 
              source={{ uri: profile?.profilePicture || DEFAULT_AVATAR }} 
              style={[styles.avatar, { borderColor: theme['background-basic-color-1'] }]} 
            />
            <Button 
              size="small" 
              appearance="outline" 
              style={styles.editBtn}
              accessoryLeft={(p) => <Icon {...p} name="edit-outline" />}
              onPress={() => setModalVisible(true)}
            >
              Edit
            </Button>
          </View>

          <View style={styles.headerInfo}>
            <Text category="h4" style={{ fontWeight: 'bold' }}>{profile?.fullName || (user as any)?.name || t('userName')}</Text>
            <Text category="s1" status="primary" style={{ marginTop: 4 }}>{profile?.headline || t('professionalHeadline')}</Text>
            
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={theme['text-hint-color']} />
              <Text appearance="hint" category="c1" style={{ marginLeft: 4 }}>
                {profile?.city ? `${profile.city}, ${profile.country}` : t('locationNotSet')}
              </Text>
            </View>
          </View>
        </View>

        {/* CONTACT QUICK VIEW */}
        <DetailSection title={t('contactInformation')} icon="call-outline" theme={theme}>
          <View style={styles.contactGrid}>
            <ContactItem icon="mail-outline" label={t('email')} value={profile?.email} theme={theme} />
            <ContactItem icon="phone-portrait-outline" label={t('phone')} value={profile?.phoneNumber} theme={theme} />
            {profile?.links?.portfolio && (
                <ContactItem 
                    icon="globe-outline" 
                    label={t('portfolio')} 
                    value={profile.links.portfolio} 
                    theme={theme} 
                    onPress={() => Linking.openURL(profile.links.portfolio)} 
                />
            )}
          </View>
        </DetailSection>

        {/* ABOUT ME */}
        <DetailSection title={t('aboutMe')} icon="person-outline" theme={theme}>
          <Text category="p1" style={{ lineHeight: 22 }}>{profile?.summary || t('introduceYourself')}</Text>
          {profile?.hobbies && (
            <View style={{ marginTop: 15 }}>
              <Text category="s2" appearance="hint">{t('interestsAndHobbies')}:</Text>
              <Text category="p2">{profile.hobbies}</Text>
            </View>
          )}
        </DetailSection>

        {/* EXPERIENCE */}
        <DetailSection title={t('professionalExperience')} icon="briefcase-outline" theme={theme}>
          {renderList(profile?.experience, 'title', 'company', 'description', 'dates')}
        </DetailSection>

        {/* SKILLS */}
        <DetailSection title={t('skillsAndCompetencies')} icon="construct-outline" theme={theme}>
           <View style={styles.skillsWrapper}>
             {(Array.isArray(profile?.skills) && profile.skills.length > 0) ? profile.skills.map((s: string, i: number) => (
               <View key={i} style={[styles.skillBadge, { backgroundColor: theme['color-primary-100'] }]}>
                 <Text category="c1" status="primary" style={{ fontWeight: 'bold' }}>{s.toUpperCase()}</Text>
               </View>
             )) : <Text appearance="hint">{t('addSkills')}</Text>}
           </View>
        </DetailSection>

        {/* EDUCATION & CERTS */}
        <DetailSection title={t('education')} icon="school-outline" theme={theme}>
          {renderList(profile?.education, 'degree', 'institution', undefined, 'dates')}
        </DetailSection>

        <DetailSection title={t('certifications')} icon="checkmark-circle-outline" theme={theme}>
          {renderList(profile?.certifications, 'name', 'issuer')}
        </DetailSection>

        {/* LANGUAGES & OTHERS */}
        <DetailSection title={t('languages')} icon="language-outline" theme={theme}>
            {renderList(profile?.languages, 'name', 'level')}
        </DetailSection>

        <DetailSection title={t('awardsAndVolunteering')} icon="heart-outline" theme={theme}>
            {profile?.awards?.length > 0 && <Text category="s2" appearance="hint" style={{marginBottom: 5}}>{t('awards')}:</Text>}
            {renderList(profile?.awards, 'name', 'issuer')}
            
            {profile?.volunteering?.length > 0 && <Text category="s2" appearance="hint" style={{marginTop: 10, marginBottom: 5}}>{t('volunteering')}:</Text>}
            {renderList(profile?.volunteering, 'role', 'organization')}
        </DetailSection>

        {/* SOCIAL LINKS */}
        <DetailSection title={t('connect')} icon="link-outline" theme={theme}>
          <View style={styles.linksRow}>
            {profile?.links?.linkedin && (
              <TouchableOpacity onPress={() => Linking.openURL(profile.links.linkedin)} style={styles.socialBtn}>
                <Ionicons name="logo-linkedin" size={28} color="#0077B5" />
              </TouchableOpacity>
            )}
            {profile?.links?.github && (
              <TouchableOpacity onPress={() => Linking.openURL(profile.links.github)} style={styles.socialBtn}>
                <Ionicons name="logo-github" size={28} color={theme['text-basic-color']} />
              </TouchableOpacity>
            )}
          </View>
          {profile?.salaryExpectation && (
            <Text category="c1" appearance="hint" style={{ marginTop: 15, textAlign: 'center' }}>
              {t('salaryExpectation')}: {profile.salaryExpectation}
            </Text>
          )}
        </DetailSection>

        <View style={{ height: 40 }} />
      </ScrollView>

      <EditProfileModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleSave} 
        initialData={profile} 
        loading={loading} 
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
    borderBottomWidth: 1 
  },
  banner: { width: '100%', height: 150 },
  avatarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: -50 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
  editBtn: { borderRadius: 20, marginBottom: -10 },
  headerInfo: { paddingHorizontal: 20, paddingVertical: 15 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sectionCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1 },
  sectionTitle: { fontWeight: 'bold', marginLeft: 10 },
  listItem: { marginBottom: 16, paddingLeft: 12, borderLeftWidth: 3 },
  listDesc: { marginTop: 6, lineHeight: 18 },
  emptyText: { fontStyle: 'italic', fontSize: 13 },
  contactGrid: { flexDirection: 'column', gap: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center' },
  skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  linksRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 5 },
  socialBtn: { padding: 5 }
});