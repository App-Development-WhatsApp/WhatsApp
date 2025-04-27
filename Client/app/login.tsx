import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { login } from '@/Services/Api';
import { getUser } from '@/Services/LocallyData';
import showToast from '@/utils/ToastHandler';

export default function SignupPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const usernameRef = useRef('');
  const phoneNumberRef = useRef('');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        router.push('/(tabs)');
      }
    };
    checkUser();
  }, []);

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
      }
    } catch (error: any) {
      showToast("error", "bottom", "Error Picking Image", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}> No Image </Text>
        </View>
      )}
      <Text style={styles.headerText}>Create Your Account</Text>
      <View style={styles.glassCard}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#ccc"
          onChangeText={(text) => (usernameRef.current = text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          onChangeText={(text) => (phoneNumberRef.current = text)}
        />
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}> Pick Profile Image </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#5dcf94' }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 255, 150, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    shadowColor: '#00FF99',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    alignItems: 'center',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined, // for web
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    shadowColor: '#00FF99',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    elevation: 9,
    shadowColor: '#00FF99',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#0d0d0d',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  imageButton: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  imageButtonText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '500',
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#00FF99',
    backgroundColor: 'rgba(0,255,153,0.05)',
    elevation: 25,
    shadowColor: '#00FF99',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});