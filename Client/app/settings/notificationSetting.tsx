import React, { useLayoutEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomSwitch from "./customSwitch"; // ✅ using your CustomSwitch

interface SettingItemProps {
  text: string;
  subText?: string;
  switchEnabled?: boolean;
  toggleSwitch?: () => void;
}

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [conversationTones, setConversationTones] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [highPriorityNotifications, setHighPriorityNotifications] = useState(false);
  const [reactionNotifications, setReactionNotifications] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Notifications",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <SettingItem
            text="Conversation tones"
            subText="Play sounds for incoming and outgoing messages."
            switchEnabled={conversationTones}
            toggleSwitch={() => setConversationTones(!conversationTones)}
          />
          <SettingItem
            text="Reminders"
            subText="Get occasional reminders about messages or status updates you haven't seen"
            switchEnabled={reminders}
            toggleSwitch={() => setReminders(!reminders)}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <SettingItem text="Notification tone" subText="Default" />
          <SettingItem text="Vibrate" subText="Default" />
          <SettingItem text="Popup notification" subText="Not available" />
          <SettingItem text="Light" subText="White" />
          <SettingItem
            text="Use high priority notifications"
            subText="Show previews of notifications at the top of the screen"
            switchEnabled={highPriorityNotifications}
            toggleSwitch={() => setHighPriorityNotifications(!highPriorityNotifications)}
          />
          <SettingItem
            text="Reaction notifications"
            subText="Show notifications for reactions to messages you send"
            switchEnabled={reactionNotifications}
            toggleSwitch={() => setReactionNotifications(!reactionNotifications)}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Groups</Text>
          <SettingItem text="Notification tone" subText="Default (Signal)" />
          <SettingItem text="Vibrate" subText="Default" />
          <SettingItem text="Light" subText="Red" />
          <SettingItem
            text="Use high priority notifications"
            subText="Show previews of notifications at the top of the screen"
            switchEnabled={highPriorityNotifications}
            toggleSwitch={() => setHighPriorityNotifications(!highPriorityNotifications)}
          />
          <SettingItem
            text="Reaction notifications"
            subText="Show notifications for reactions to messages you send"
            switchEnabled={reactionNotifications}
            toggleSwitch={() => setReactionNotifications(!reactionNotifications)}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Calls</Text>
          <SettingItem text="Ringtone" subText="Default (Galaxy Bells)" />
          <SettingItem text="Vibrate" subText="Default" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status</Text>
          <SettingItem
            text="Reactions"
            subText="Show notifications when you get likes on your status"
            switchEnabled={reactionNotifications}
            toggleSwitch={() => setReactionNotifications(!reactionNotifications)}
          />
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

export default NotificationScreen;
