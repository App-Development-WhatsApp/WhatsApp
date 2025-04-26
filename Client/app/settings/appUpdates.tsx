import React, { useLayoutEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomSwitch from "./customSwitch";


const AppUpdateScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [allowAnyNetwork, setAllowAnyNetwork] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "App Updates",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Updates</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Auto-update WhatsApp</Text>
              <Text style={styles.settingSubtitle}>
                Automatically download app updates.
              </Text>
            </View>
            <CustomSwitch
              value={autoUpdate}
              onToggle={() => setAutoUpdate(!autoUpdate)}
              activeColor="#25D366"
              inactiveColor="gray"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Allow updates over any network</Text>
              <Text style={styles.settingSubtitle}>
                Download updates using mobile data when Wi-Fi is not available. Data charges may apply.
              </Text>
            </View>
            <CustomSwitch
              value={allowAnyNetwork}
              onToggle={() => setAllowAnyNetwork(!allowAnyNetwork)}
              activeColor="#25D366"
              inactiveColor="gray"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>WhatsApp update available</Text>
              <Text style={styles.settingSubtitle}>
                Get notified when updates are available.
              </Text>
            </View>
            <CustomSwitch
              value={updateNotification}
              onToggle={() => setUpdateNotification(!updateNotification)}
              activeColor="#25D366"
              inactiveColor="gray"
            />
          </View>
        </View>
      </ScrollView>
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

export default AppUpdateScreen;
