import React, { useLayoutEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomSwitch from "./customSwitch"; // ✅ using your CustomSwitch

interface SettingItemProps {
  text: string;
  subText?: string;
  switchEnabled?: boolean;
  toggleSwitch?: () => void;
}

const ChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(false);
  const [voiceTranscripts, setVoiceTranscripts] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chats",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Display</Text>
          <SettingItem text="Theme" subText="System default" />
          <SettingItem text="Default chat theme" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chat Settings</Text>
          <SettingItem
            text="Enter is send"
            subText="Enter key will send your message"
            switchEnabled={enterIsSend}
            toggleSwitch={() => setEnterIsSend(!enterIsSend)}
          />
          <SettingItem
            text="Media visibility"
            subText="Show newly downloaded media in your device's gallery"
            switchEnabled={mediaVisibility}
            toggleSwitch={() => setMediaVisibility(!mediaVisibility)}
          />
          <SettingItem text="Font size" subText="Medium" />
          <SettingItem
            text="Voice message transcripts"
            subText="Read new voice messages."
            switchEnabled={voiceTranscripts}
            toggleSwitch={() => setVoiceTranscripts(!voiceTranscripts)}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Archived Chats</Text>
          <SettingItem
            text="Keep chats archived"
            subText="Archived chats will remain archived when you receive a new message"
            switchEnabled={keepChatsArchived}
            toggleSwitch={() => setKeepChatsArchived(!keepChatsArchived)}
          />
        </View>

        <View style={styles.sectionCard}>
          <SettingItem text="Chat backup" />
          <SettingItem text="Transfer chats" />
          <SettingItem text="Chat history" />
        </View>

      </ScrollView>
    </View>
  );
};

// Reusable Setting Item Component
const SettingItem: React.FC<SettingItemProps> = ({ text, subText, switchEnabled, toggleSwitch }) => {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{text}</Text>
        {subText && <Text style={styles.settingSubtitle}>{subText}</Text>}
      </View>
      {toggleSwitch !== undefined ? (
        <CustomSwitch
          value={switchEnabled ?? false}
          onToggle={toggleSwitch}
          activeColor="#25D366"
          inactiveColor="gray"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexGrow: 1,
    paddingBottom: 30,
  },
  sectionCard: {
    backgroundColor: "#2e3239",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#aaa",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#3d4048",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 3,
    marginRight: 10
  },
});

export default ChatScreen;
