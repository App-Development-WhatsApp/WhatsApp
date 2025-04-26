import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Lists",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Icons & Description */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📋 💚 🎁 ➕</Text>
        </View>
        <Text style={styles.description}>
          Any list you create becomes a filter at the top of your Chats tab.
        </Text>

        {/* Create Custom List Button */}
        <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ Create a custom list</Text>
        </TouchableOpacity>

        {/* Lists Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your lists</Text>
          <ListItem title="Unread" subText="Preset" />
          <ListItem title="Favourites" subText="Add people or groups" />
          <ListItem title="Groups" subText="Preset" />
        </View>

        {/* Available Presets */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Available presets</Text>
          <Text style={styles.availablePresetsText}>
            If you remove a preset list like Unread or Groups, it will become available here.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// Reusable List Item Component
const ListItem: React.FC<{ title: string; subText: string }> = ({ title, subText }) => (
  <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
    <View style={styles.textContainer}>
      <Text style={styles.listTitle}>{title}</Text>
      <Text style={styles.listSubText}>{subText}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  iconText: {
    fontSize: 28,
    color: '#fff',
  },
  description: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#25D366",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  createButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#2e3239',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bbb',
    marginBottom: 15,
  },
  listItem: {
    paddingVertical: 18,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3a3d45',
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  listSubText: {
    fontSize: 13,
    color: '#888',
  },
  availablePresetsText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
    lineHeight: 20,
  },
});

export default ListScreen;

