import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';

const fileUri = "";

export default function CreateCommunity() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Create Community',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
    });
  }, [navigation]);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState(
    'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.'
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const saveCommunity = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter a community name');
      return;
    }

    const newCommunity = {
      id: Date.now().toString(),
      name,
      description,
      imageUri,
    };

    try {
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      let communities = [];

      if (fileExists.exists) {
        const existing = await FileSystem.readAsStringAsync(fileUri);
        communities = JSON.parse(existing);
      }

      communities.push(newCommunity);
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(communities));

      Alert.alert('Community created!');
      router.back(); // Navigate back
    } catch (err) {
      console.error('Saving error:', err);
      Alert.alert('Error saving community');
    }
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

      <TextInput
        multiline
        value={description}
        onChangeText={setDescription}
        maxLength={2048}
        style={styles.description}
        placeholderTextColor="#ccc"
      />
      <Text style={styles.counter}>{description.length}/1000</Text>

      <TouchableOpacity onPress={saveCommunity} style={styles.saveButton}>
        <AntDesign name="arrowright" size={28} color="white" />
      </TouchableOpacity>
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