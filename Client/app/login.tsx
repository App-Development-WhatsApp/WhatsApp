import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { generateRandomId } from '@/utils/RandomValues';
import { useRef } from 'react';
import { login } from '@/Services/Api';
import { getUser } from '@/Services/LocallyData';
import showToast from '@/utils/ToastHandler';


export default function SignupPage() {
  const router = useRouter();
  const usernameRef = useRef('');
  const phoneNumberRef = useRef('');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        router.push('/(tabs)');
      }
    };
    checkUser();
  }, [router])

  const handleSignup = async () => {
    if (!usernameRef.current || !phoneNumberRef.current || !image) {
      Alert.alert('Validation Error', 'Please fill all fields and pick an image.');
      return;
    }

    setLoading(true);

    try {
      const response = await login(usernameRef.current, phoneNumberRef.current, image);
      if (response.success) {
        router.push('/(tabs)');
        Alert.alert('Success', 'Account created!');

      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });

      if (!result.canceled) {
        const compressed = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(compressed.uri);
      } else {
      }
    } catch (error: any) {
      showToast("error", "bottom", "Error PickingImage", error.message)
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.profileImage} />}
      <Text style={styles.headerText}>Create Account</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          onChangeText={(text) => (usernameRef.current = text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          onChangeText={(text) => (phoneNumberRef.current = text)}
        />
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Pick a Profile Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  imageButtonText: {
    color: '#333',
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});
