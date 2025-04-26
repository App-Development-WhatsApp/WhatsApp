import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Linking, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import * as Contact from 'expo-contacts';

const InviteFriendScreen = () => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Invite a friend",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const { status } = await Contact.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contact.getContactsAsync({
          fields: [Contact.Fields.PhoneNumbers],
        });
        const formattedContacts = data.flatMap(contact => 
          (contact.phoneNumbers || []).map(numObj => ({
            name: contact.name,
            phone: numObj.number,
          }))
        );
        setContacts(formattedContacts);
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  const inviteUser = (phone: string) => {
    const message = `Hey! I'm using ChatApp. Join me here! [App Link]`;
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  const ContactItem = ({ name, phone }: { name: string; phone: string }) => (
    <TouchableOpacity style={styles.contactItem} activeOpacity={0.7} disabled>
      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.contactImage}
      />
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.contactPhone}>{phone}</Text>
      </View>
      <TouchableOpacity style={styles.inviteButton} activeOpacity={0.7} onPress={() => inviteUser(phone)}>
        <Text style={styles.inviteButtonText}>Invite</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.shareLink} activeOpacity={0.8}>
        <Ionicons name="share-social-outline" size={24} color="white" />
        <Text style={styles.shareText}>Share link</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>From Contacts</Text>

      {loading ? (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#25D366" />
          <Text style={{ color: "#888", marginTop: 10, textAlign: "center" }}>Fetching contacts...</Text>
        </View>
      ) : (
        <FlatList
          nestedScrollEnabled
          data={contacts}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ContactItem name={item.name} phone={item.phone} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  shareLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e3239",
    padding: 15,
    margin: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  shareText: {
    fontSize: 16,
    color: "white",
    marginLeft: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#aaa",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#3a3d45",
  },
  contactImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  contactPhone: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  inviteButton: {
    backgroundColor: "#25D366",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  inviteButtonText: {
    fontSize: 14,
    color: "#25292e",
    fontWeight: "bold",
  },
});

export default InviteFriendScreen;