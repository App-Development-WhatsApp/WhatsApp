import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomSwitch from './customSwitch'; // ✅ using your CustomSwitch

const PrivacyScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [readReceipts, setReadReceipts] = React.useState(true);
  const toggleReadReceipts = () => setReadReceipts(!readReceipts);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Privacy",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Who can see my personal info</Text>
          <SettingItem text="Last seen and online" subText="107 contacts excluded" />
          <SettingItem text="Profile photo" subText="My contacts" />
          <SettingItem text="About" subText="Everyone" />
          <SettingItem text="Status" subText="16 contacts excluded" />
        </View>

        <View style={styles.sectionCard}>
          <SettingItem 
            text="Read receipts" 
            subText="If turned off, you won’t send or receive Read receipts. Read receipts are always sent for group chats."
            switchEnabled={readReceipts}
            toggleSwitch={toggleReadReceipts}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Disappearing messages</Text>
          <SettingItem text="Default message timer" subText="Start new chats with disappearing messages set to your timer   Off" />
        </View>

        <View style={styles.sectionCard}>
          <SettingItem text="Groups" subText="Everyone" />
          <SettingItem text="Live location" />
          <SettingItem text="Calls" subText="Silence unknown callers" />
          <SettingItem text="Blocked contacts" subText="4" />
          <SettingItem text="App lock" subText="Disabled" />
          <SettingItem text="Chat lock" />
        </View>

        <View style={styles.sectionCard}>
          <SettingItem 
            text="Allow camera effects" 
            subText="Use effects in the camera and video calls."
            switchEnabled={false} // Initially disabled
          />
        </View>

        <View style={styles.sectionCard}>
          <SettingItem text="Advanced" subText="Protect IP address in calls, Disable link previews" />
          <SettingItem text="Privacy checkup" subText="Control your privacy and choose the right settings for you." />
        </View>
      </ScrollView>
    </View>
  );
};

// Reusable Setting Item Component
const SettingItem: React.FC<{ text: string, subText?: string, switchEnabled?: boolean, toggleSwitch?: () => void }> = ({ text, subText, switchEnabled, toggleSwitch }) => {
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
    marginRight: 10,
  },
});

export default PrivacyScreen;