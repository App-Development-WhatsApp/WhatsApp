import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useState } from 'react';
import { useLayoutEffect } from 'react';

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [name, setName] = useState('Sahil');
  const [about, setAbout] = useState('Creating New Things');

  useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Profile',
        headerStyle: { backgroundColor: '#25292e' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
      });
    }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://placekitten.com/200/200' }}
        style={styles.profileImage}
      />
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>About</Text>
        <TextInput
          value={about}
          onChangeText={setAbout}
          style={styles.input}
        />
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => router.back()}
      >
        <Text style={styles.saveText}> Save </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
    backgroundColor: '#ccc',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 18,
    paddingVertical: 4,
    color: 'white'
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  saveText: {
    color: '#25292e',
    fontSize: 18,
  },
});