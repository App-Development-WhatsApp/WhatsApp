import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomSwitch from './customSwitch'; // ✅ using your CustomSwitch

const StorageAndDataScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [useLessData, setUseLessData] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Storage and Data",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Manage Storage */}
        <View style={styles.sectionCard}>
          <SettingItem text="Manage storage" subText="0.8 GB" />
        </View>

        {/* Network Usage & Data Settings */}
        <View style={styles.sectionCard}>
          <SettingItem
            text="Network usage"
            subText="646.3 MB sent • 3.3 GB received"
          />
          <SettingItem
            text="Use less data for calls"
            switchEnabled={useLessData}
            toggleSwitch={() => setUseLessData(!useLessData)}
          />
          <SettingItem text="Proxy" subText="Off" />
        </View>

        {/* Media Upload Quality */}
        <View style={styles.sectionCard}>
          <SettingItem text="Media upload quality" subText="Standard quality" />
        </View>

        {/* Media Auto-Download */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Media auto-download</Text>
          <Text style={styles.sectionSubtitle}>
            Voice messages are always automatically downloaded
          </Text>
          <SettingItem text="When using mobile data" subText="Photos" />
          <SettingItem text="When connected on Wi-Fi" subText="All media" />
          <SettingItem text="When roaming" subText="No media" />
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
  sectionSubtitle: {
    fontSize: 12,
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

export default StorageAndDataScreen;
