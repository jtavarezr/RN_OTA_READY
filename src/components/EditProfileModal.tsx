import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Modal, TouchableOpacity, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { Input, Text, Button, useTheme, Icon, Tab, TabView, CheckBox, Avatar, Card, Modal as UIKittenModal } from '@ui-kitten/components';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// --- Constantes ---
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const DEFAULT_BANNER = 'https://img.freepik.com/free-vector/abstract-binary-code-techno-background_1048-12836.jpg';

// --- Esquema Zod ---
const optString = z.string().optional();
const itemSchema = z.object({
  title: optString, company: optString, dates: optString, description: optString,
  isCurrent: z.boolean().default(false),
  degree: optString, institution: optString,
  name: optString, tech: optString, link: optString, issuer: optString, level: optString,
  organization: optString, role: optString
});

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  headline: optString,
  summary: optString,
  email: z.string().email('Invalid email').or(z.literal('')),
  phoneNumber: optString,
  city: optString,
  country: optString,
  profilePicture: optString,
  bannerImage: optString,
  skills: optString,
  hobbies: optString,
  salaryExpectation: optString,
  links: z.object({
    github: optString,
    linkedin: optString,
    portfolio: optString,
  }).optional(),
  experience: z.array(itemSchema).optional(),
  education: z.array(itemSchema).optional(),
  projects: z.array(itemSchema).optional(),
  languages: z.array(itemSchema).optional(),
  certifications: z.array(itemSchema).optional(),
  volunteering: z.array(itemSchema).optional(),
  awards: z.array(itemSchema).optional(),
});

type FormData = z.infer<typeof profileSchema>;

const FormInput = ({ control, name, label, icon, ...props }: any) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <Input
        label={label}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value || ''}
        status={error ? 'danger' : 'basic'}
        caption={error?.message}
        accessoryLeft={(p) => icon ? <Icon {...p} name={icon} /> : null}
        style={styles.input}
        {...props}
      />
    )}
  />
);

export const EditProfileModal = ({ visible, onClose, onSubmit, initialData, loading }: any) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Estado para el Dialog flotante de imágenes
  const [imgModalVisible, setImgModalVisible] = useState(false);
  const [imgEditType, setImgEditType] = useState<'avatar' | 'banner'>('avatar');
  
  const { control, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(profileSchema) as any,
    mode: 'onChange',
    defaultValues: { 
        experience: [], education: [], projects: [], languages: [], 
        certifications: [], volunteering: [], awards: [],
        links: { github: '', linkedin: '', portfolio: '' }
    }
  });

  const avatarUrl = watch('profilePicture');
  const bannerUrl = watch('bannerImage');

  const expArr = useFieldArray({ control, name: "experience" });
  const eduArr = useFieldArray({ control, name: "education" });
  const projArr = useFieldArray({ control, name: "projects" });
  const langArr = useFieldArray({ control, name: "languages" });
  const certArr = useFieldArray({ control, name: "certifications" });
  const volArr = useFieldArray({ control, name: "volunteering" });
  const awardArr = useFieldArray({ control, name: "awards" });

  useEffect(() => {
    if (visible && initialData) {
      reset({
        ...initialData,
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : initialData.skills,
      });
    }
  }, [visible, initialData]);

  const onFinalSubmit = (data: FormData) => {
    const payload = {
      ...data,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    onSubmit(payload);
  };

  const openImageEditor = (type: 'avatar' | 'banner') => {
    setImgEditType(type);
    setImgModalVisible(true);
  };

  const DynamicSection = ({ title, icon, fields, onAdd, onRemove, renderItem }: any) => (
    <View style={[styles.section, { backgroundColor: theme['background-basic-color-1'], borderColor: theme['border-basic-color-3'] }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.rowAlign}>
            <Icon name={icon} fill={theme['text-basic-color']} style={styles.sectionIcon} />
            <Text category="h6">{title}</Text>
        </View>
        <Button size="tiny" appearance="ghost" accessoryLeft={(p) => <Icon {...p} name="plus-outline"/>} onPress={onAdd}>{t('add')}</Button>
      </View>
      {fields.map((field: any, index: number) => (
        <View key={field.id} style={[styles.itemCard, { backgroundColor: theme['background-basic-color-2'] }]}>
          {renderItem(index)}
          <Button status="danger" appearance="ghost" size="tiny" accessoryLeft={(p) => <Icon {...p} name="trash-2-outline"/>} onPress={() => onRemove(index)} style={styles.deleteBtn} />
        </View>
      ))}
    </View>
  );

  return (
    <Modal animationType="slide" visible={visible} presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: theme['background-basic-color-2'] }]}>
        
        {/* HEADER PRINCIPAL */}
        <View style={[styles.header, { 
          backgroundColor: theme['background-basic-color-1'], 
          borderBottomColor: theme['border-basic-color-3'],
          paddingTop: Math.max(insets.top, 10)
        }]}>
          <Text category="h5">{t('editProfessionalProfile')}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={theme['text-hint-color']} /></TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TabView selectedIndex={selectedIndex} onSelect={index => setSelectedIndex(index)} style={{ flex: 1 }}>
            
            <Tab title={t('basic')} icon={(p) => <Icon {...p} name="person-outline"/>}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                
                {/* DISEÑO LINKEDIN: Avatar sobre Banner */}
                <View style={styles.profileHeaderContainer}>
                  <Image source={{ uri: bannerUrl || DEFAULT_BANNER }} style={styles.bannerPreview} />
                  <TouchableOpacity style={styles.editBannerBtn} onPress={() => openImageEditor('banner')}>
                    <Icon name="camera" fill="white" style={styles.cameraIconSmall} />
                  </TouchableOpacity>

                  <View style={styles.avatarWrapper}>
                    <Avatar source={{ uri: avatarUrl || DEFAULT_AVATAR }} style={[styles.avatarPreview, { borderColor: theme['background-basic-color-1'] }]} />
                    <TouchableOpacity 
                        style={[styles.editAvatarBtn, { backgroundColor: theme['color-primary-500'], borderColor: theme['background-basic-color-1'] }]}
                        onPress={() => openImageEditor('avatar')}
                    >
                        <Icon name="camera" fill="white" style={styles.cameraIconSmall} />
                    </TouchableOpacity>
                  </View>
                </View>

                <FormInput control={control} name="fullName" label={t('fullName')} icon="person-outline" />
                <FormInput control={control} name="headline" label={t('headline')} icon="briefcase-outline" />
                <FormInput control={control} name="summary" label={t('aboutMe')} icon="edit-2-outline" multiline textStyle={{ minHeight: 100 }} />
                
                <Text category="s1" style={styles.subTitle}>{t('contactInformation')}</Text>
                <FormInput control={control} name="email" label={t('email')} icon="email-outline" keyboardType="email-address" />
                <FormInput control={control} name="phoneNumber" label={t('phone')} icon="phone-outline" keyboardType="phone-pad" />
                
                <View style={styles.row}>
                  <FormInput control={control} name="city" label={t('city')} style={{flex: 1, marginRight: 8}} icon="map-outline" />
                  <FormInput control={control} name="country" label={t('country')} style={{flex: 1}} icon="globe-outline" />
                </View>

                <Text category="s1" style={styles.subTitle}>{t('linksAndPortfolio')}</Text>
                <FormInput control={control} name="links.portfolio" label={t('portfolioWebsite')} icon="browser-outline" />
                <FormInput control={control} name="links.linkedin" label={t('linkedIn')} icon="linkedin" />
                <FormInput control={control} name="links.github" label={t('gitHub')} icon="github" />
                
                <FormInput control={control} name="skills" label={t('skills')} icon="star-outline" />
                <FormInput control={control} name="hobbies" label={t('hobbies')} icon="heart-outline" />
              </ScrollView>
            </Tab>

            <Tab title={t('experience')} icon={(p) => <Icon {...p} name="briefcase-outline"/>}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                <DynamicSection title={t('experience')} icon="archive-outline" fields={expArr.fields} onAdd={() => expArr.append({ title: '', company: '', isCurrent: false })} onRemove={expArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`experience.${i}.title`} placeholder={t('roleTitle')} icon="award-outline" />
                      <FormInput control={control} name={`experience.${i}.company`} placeholder={t('company')} icon="home-outline" />
                      <Controller control={control} name={`experience.${i}.isCurrent`} render={({field}) => (
                        <CheckBox checked={field.value} onChange={field.onChange} style={styles.checkbox}>{t('currentPosition')}</CheckBox>
                      )}/>
                      <FormInput control={control} name={`experience.${i}.dates`} placeholder="Jan 2021 - Present" icon="calendar-outline" />
                      <FormInput control={control} name={`experience.${i}.description`} placeholder={t('describeAccomplishments')} multiline />
                    </>
                  )}
                />
                <DynamicSection title={t('projects')} icon="layers-outline" fields={projArr.fields} onAdd={() => projArr.append({ name: '', description: '', tech: '', link: '', isCurrent: false })} onRemove={projArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`projects.${i}.name`} placeholder={t('projectName')} />
                      <FormInput control={control} name={`projects.${i}.link`} placeholder={t('url')} icon="link-2-outline" />
                      <FormInput control={control} name={`projects.${i}.description`} placeholder={t('details')} multiline />
                    </>
                  )}
                />
              </ScrollView>
            </Tab>

            <Tab title={t('education')} icon={(p) => <Icon {...p} name="book-open-outline"/>}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                <DynamicSection title={t('education')} icon="book-outline" fields={eduArr.fields} onAdd={() => eduArr.append({ degree: '', institution: '', dates: '', isCurrent: false })} onRemove={eduArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`education.${i}.degree`} placeholder={t('degree')} />
                      <FormInput control={control} name={`education.${i}.institution`} placeholder={t('university')} />
                      <FormInput control={control} name={`education.${i}.dates`} placeholder={t('year')} icon="calendar-outline" />
                    </>
                  )}
                />
                <DynamicSection title={t('certifications')} icon="checkmark-circle-outline" fields={certArr.fields} onAdd={() => certArr.append({ name: '', issuer: '', isCurrent: false })} onRemove={certArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`certifications.${i}.name`} placeholder={t('certificationName')} />
                      <FormInput control={control} name={`certifications.${i}.issuer`} placeholder={t('issuer')} />
                    </>
                  )}
                />
              </ScrollView>
            </Tab>

            <Tab title={t('more')} icon={(p) => <Icon {...p} name="more-horizontal-outline"/>}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                <DynamicSection title={t('languages')} icon="message-square-outline" fields={langArr.fields} onAdd={() => langArr.append({ name: '', level: '', isCurrent: false })} onRemove={langArr.remove}
                  renderItem={(i: number) => (
                    <View style={styles.row}>
                      <FormInput control={control} name={`languages.${i}.name`} placeholder={t('language')} style={{ flex: 2, marginRight: 8 }} />
                      <FormInput control={control} name={`languages.${i}.level`} placeholder={t('level')} style={{ flex: 1 }} />
                    </View>
                  )}
                />
                <DynamicSection title={t('volunteering')} icon="people-outline" fields={volArr.fields} onAdd={() => volArr.append({ role: '', organization: '', isCurrent: false })} onRemove={volArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`volunteering.${i}.role`} placeholder={t('role')} />
                      <FormInput control={control} name={`volunteering.${i}.organization`} placeholder={t('organization')} />
                    </>
                  )}
                />
                <DynamicSection title={t('awards')} icon="gift-outline" fields={awardArr.fields} onAdd={() => awardArr.append({ name: '', issuer: '', isCurrent: false })} onRemove={awardArr.remove}
                  renderItem={(i: number) => (
                    <>
                      <FormInput control={control} name={`awards.${i}.name`} placeholder={t('awardName')} />
                      <FormInput control={control} name={`awards.${i}.issuer`} placeholder={t('issuer')} />
                    </>
                  )}
                />
                <FormInput control={control} name="salaryExpectation" label={t('salaryExpectation')} icon="pricetags-outline" />
              </ScrollView>
            </Tab>
          </TabView>
        </KeyboardAvoidingView>

        {/* FOOTER FIJO */}
        <View style={[styles.footer, { 
          backgroundColor: theme['background-basic-color-1'], 
          borderTopColor: theme['border-basic-color-3'],
          paddingBottom: Math.max(insets.bottom, 16)
        }]}>
          <Button appearance="ghost" status="basic" onPress={onClose} style={{ flex: 1 }}>{t('cancel')}</Button>
          <Button onPress={handleSubmit(onFinalSubmit)} disabled={loading} style={{ flex: 2 }}>
            {loading ? t('saving') : t('saveProfile')}
          </Button>
        </View>

        {/* DIALOG POP-UP FLOTANTE (UI KITTEN MODAL) */}
        <UIKittenModal
          visible={imgModalVisible}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setImgModalVisible(false)}
        >
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.modalHeader}>
                <Text category="h6">{imgEditType === 'avatar' ? t('updateProfilePicture') : t('updateBanner')}</Text>
                <TouchableOpacity onPress={() => setImgModalVisible(false)}>
                    <Icon name="close" fill={theme['text-hint-color']} style={{width: 20, height: 20}} />
                </TouchableOpacity>
            </View>
            <Input
              label={t('imageUrl')}
              placeholder="https://example.com/image.jpg"
              value={imgEditType === 'avatar' ? avatarUrl : bannerUrl}
              onChangeText={(nextValue) => setValue(imgEditType === 'avatar' ? 'profilePicture' : 'bannerImage', nextValue)}
              style={{ marginVertical: 15 }}
              accessoryRight={(p) => <Icon {...p} name="link-outline" />}
            />
            <Button size="medium" onPress={() => setImgModalVisible(false)}>
              {t('confirmChange')}
            </Button>
          </Card>
        </UIKittenModal>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  // LinkedIn Header
  profileHeaderContainer: { marginBottom: 75, position: 'relative' },
  bannerPreview: { width: '100%', height: 140, borderRadius: 12 },
  editBannerBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  avatarWrapper: { position: 'absolute', bottom: -55, left: 20 },
  avatarPreview: { width: 110, height: 110, borderRadius: 55, borderWidth: 4 },
  editAvatarBtn: { position: 'absolute', bottom: 5, right: 5, padding: 6, borderRadius: 15, borderWidth: 2 },
  cameraIconSmall: { width: 18, height: 18 },

  section: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionIcon: { width: 22, height: 22, marginRight: 8 },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  
  itemCard: { padding: 12, borderRadius: 8, marginBottom: 12, paddingTop: 35 },
  input: { marginBottom: 15 },
  checkbox: { marginBottom: 12, marginLeft: 5 },
  row: { flexDirection: 'row' },
  subTitle: { marginVertical: 15, fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { position: 'absolute', top: 8, right: 8 },
  footer: { padding: 16, flexDirection: 'row', borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  // Estilos del Dialog Flotante
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalCard: { width: 320, padding: 5, borderRadius: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }
});