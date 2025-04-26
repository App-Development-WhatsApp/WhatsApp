import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';
import { createCommunity, getAllUsers } from '@/Database/ChatQuery';
import showToast from '@/utils/ToastHandler';
import { UserItem } from '@/types/ChatsType';
import { sendFile } from '@/Services/Api';


export default function CreateCommunity() {
  const router = useRouter();
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string>("");
  const [name, setName] = useState('');
  const [description, setDescription] = useState(
    'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.'
  );
  const membersJids = useRef<string[]>([]);
  const last_time = useRef<string>(new Date().toISOString());
  const users = useRef<UserItem[]>([])
  const [openMemberSection, setopenMemberSection] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isloading, setLoading] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Create Community',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
    });
  }, [navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  const AddCommunity = async (newList: { name: string, image: string, description: string, last_time: string, memberJids: string[] }) => {
    try {
      const newCommunity = await createCommunity(newList.name, newList.image, newList.description, newList.last_time, newList.memberJids);
      if (newCommunity) {
        router.push('/(tabs)/Community');
        showToast('success', 'top', `Success`, 'Community created successfully');
      } else {
        showToast('error', 'bottom', `Error`, 'Failed to create community');
      }
    } catch (error) {
      console.error("Error saving communities:", error);
    }
  };

  const saveCommunity = async () => {
    if (!name.trim()) {
      showToast('error', 'bottom', `Name Missing`, 'Enter a name for the community');
      return;
    }
    if (imageUri) {
      const result = await sendFile(imageUri)
      if (result?.success) {
        setImageUri(result.response[0])
      }
    }
    console.log(name, imageUri, description, last_time, selectedMembers)
    setLoading(true)
    try {
      // await AddCommunity({
      //   name,
      //   image: imageUri,
      //   description,
      //   last_time: last_time.current,
      //   memberJids:selectedMembers,
      // });
      setLoading(false)
    } catch (err) {
      console.error('Saving error:', err);
      showToast('error', 'bottom', `Error`, 'Failed to create community');
      setLoading(false)
    }
  };
  useEffect(() => {
    (async () => {
      const fetchedUsers = await getAllUsers();
      users.current = fetchedUsers;
    })();
  }, []);
  const toggleMemberSelection = (userJid: string) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(userJid)) {
        // Deselect the user
        return prevSelected.filter((jid) => jid !== userJid);
      } else {
        // Select the user
        return [...prevSelected, userJid];
      }
    });
  };


  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require('../../assets/images/icon.png')
            }
            style={styles.image}
          />
          <View style={styles.addIcon}>
            <Feather name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Change photo </Text>
      </View>

      <TextInput
        placeholder="Community name"
        value={name}
        onChangeText={setName}
        maxLength={100}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <Text style={styles.counter}>{name.length}/100</Text>

      <TouchableOpacity onPress={() => setopenMemberSection(true)}>
        <Text style={{ color: '#25D366', marginTop: 12 }}>+ Add Members</Text>
      </TouchableOpacity>

      <TextInput
        multiline
        value={description}
        onChangeText={setDescription}
        maxLength={2048}
        style={styles.description}
        placeholderTextColor="#ccc"
      />
      <Text style={styles.counter}>{description.length}/1000</Text>

      <TouchableOpacity disabled={isloading} onPress={saveCommunity} style={styles.saveButton}>
        {
          isloading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <AntDesign name="arrowright" size={28} color="white" />
          )
        }
      </TouchableOpacity>

      {openMemberSection && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Select Members
          </Text>

          {users.current.length === 0 ? (
            <Text style={{ color: '#888' }}>No users available</Text>
          ) : (
            users.current.map((user) => {
              const isSelected = selectedMembers.includes(user.jid);

              return (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => toggleMemberSelection(user.jid)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    backgroundColor: '#333',
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={user.image ? { uri: user.image } : require('../../assets/images/blank.jpeg')}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                    />
                    <View>
                      <Text style={{ color: 'white', fontSize: 16 }}>{user.name}</Text>
                      <Text style={{ color: '#aaa', fontSize: 12 }}>{user.phone}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <AntDesign name="checkcircle" size={20} color="#25D366" />
                  )}
                </TouchableOpacity>
              );
            })

          )}



          <TouchableOpacity
            onPress={() => setopenMemberSection(false)}
            style={{
              marginTop: 10,
              backgroundColor: '#444',
              padding: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white' }}>Select</Text>
          </TouchableOpacity>
        </View>
      )}



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtext: {
    color: '#888',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
  },
  addIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#25D366',
    borderRadius: 15,
    padding: 4,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  changePhotoText: {
    color: '#aaa',
    marginTop: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  description: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 12,
  },
  counter: {
    color: '#777',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#25D366',
    padding: 14,
    alignSelf: 'flex-end',
    borderRadius: 16,
    marginTop: 20,
  },
});