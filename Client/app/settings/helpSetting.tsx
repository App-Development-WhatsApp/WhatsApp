import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface HelpItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  subText?: string;
}

const HelpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Help",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <View style={styles.container}>
        <HelpItem icon="help-circle-outline" text="Help Centre" subText="Get help, contact us" />
        <HelpItem icon="document-text-outline" text="Terms and Privacy Policy" />
        <HelpItem icon="alert-circle-outline" text="Channel reports" />
        <HelpItem icon="information-circle-outline" text="App info" />
      </View>
    </View>
  );
};

const HelpItem: React.FC<HelpItemProps> = ({ icon, text, subText }) => {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8}>
      <Ionicons name={icon} size={26} color="#d1d5db" style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{text}</Text>
        {subText && <Text style={styles.itemSubtitle}>{subText}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e3239",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 18,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#aaa",
  },
});

export default HelpScreen;
