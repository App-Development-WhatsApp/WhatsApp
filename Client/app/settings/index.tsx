import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { getUser } from '@/Services/LocallyData';
import * as ImagePicker from 'expo-image-picker';

// Type definition for user data
interface User {
  username: string;
  about: string;
  image: string;
}

// Shimmer Effect Component
const Shimmer: React.FC = () => (
  <View style={styles.shimmerContainer}>
    <View style={styles.shimmerBlock} />
    <View style={styles.shimmerBlock} />
  </View>
);

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<User | null>(null);
  const loading = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // List of settings options
  const settingsOptions = [
    { icon: '📁', title: 'Status Archive', routes: '/settings/statusArchive' },
    { icon: '⬆️', title: 'App Update', routes: '/settings/appUpdates' },
    { icon: '⬆', title: 'App Update', routes: '/settings/appUpdates' },
    { icon: '💬', title: 'Chat', routes: '/settings/chatSetting' },
    { icon: '🆘', title: 'Help', routes: '/settings/helpSetting' },
    { icon: '📨', title: 'Invite a Friend', routes: '/settings/inviteFriends' },
    { icon: '📝', title: 'List', routes: '/settings/listSetting' },
    { icon: '🔔', title: 'Notifications', routes: '/settings/notificationSetting' },
    { icon: '🔒', title: 'Privacy', routes: '/settings/privacySetting' },
    { icon: '💾', title: 'Storage and Data', routes: '/settings/storageSetting' },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push('/login');
      }
      userData.current = user;
      setIsLoading(false);
    };

    if (!userData.current) {
      loading.current = true;
      checkUser();
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Settings',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
    });
  }, [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const handleProfilePress = () => setIsEditing(true);

  const handleSave = () => {
    console.log('username:', username);
    console.log('about   :', about);
    console.log('image   :', imageUri);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Shimmer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.profileCard} onPress={handleProfilePress}>
          <Image
            source={{ uri: userData.current?.image || 'https://placekitten.com/200/200' }}
            style={styles.profileImage}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{userData.current?.username}</Text>
            <Text style={styles.about}>{userData.current?.about || 'No about info'}</Text>
          </View>
        </TouchableOpacity>

        {/* Settings Options */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.archiveTab}
            onPress={() => router.push(item.routes)}
          >
            <Text style={styles.archiveText}>{item.icon} {item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      {isEditing && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editSheet}
        >
          <Pressable style={styles.backdrop} onPress={() => setIsEditing(false)} />
          <View style={styles.sheetContent}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: imageUri || 'https://placekitten.com/200/200' }}
                style={styles.editImage}
              />
              <Text style={styles.changePhotoTxt}>Change photo</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#777"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="About"
              placeholderTextColor="#777"
              value={about}
              onChangeText={setAbout}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  infoContainer: {
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  about: {
    fontSize: 16,
    color: 'gray',
  },
  archiveTab: {
    height: 70,
    marginTop: 10,
    padding: 15,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    justifyContent: 'center',
  },
  archiveText: {
    fontSize: 18,
    color: 'white',
  },
  shimmerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shimmerBlock: {
    backgroundColor: '#444',
    height: 50,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    opacity: 0.3,
  },
  editSheet: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContent: {
    backgroundColor: '#1b1b1b',
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  editImage: { width: 90, height: 90, borderRadius: 45, alignSelf: 'center', borderWidth: 2, borderColor: 'gray' },
  changePhotoTxt: { color: '#25D366', textAlign: 'center', marginTop: 6 },
  input: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  saveBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 22,
  },
  saveTxt: { color: 'white', textAlign: 'center', fontSize: 17, fontWeight: '600' },
});

export default SettingsScreen;
