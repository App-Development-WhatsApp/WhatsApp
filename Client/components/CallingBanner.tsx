import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import the Ionicons library

interface CallBannerProps {
  callerId: string;
  callerName: string;
  callerImage: string;
  onAccept: () => void;
  onReject: () => void;
}

const { width } = Dimensions.get('window');

const CallBanner: React.FC<CallBannerProps> = ({
  callerId,
  callerName,
  callerImage,
  onAccept,
  onReject,
}) => {
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    heartbeat.start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.left}>
        <Image source={{ uri: callerImage }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{callerName}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onAccept} style={[styles.button, styles.accept]}>
          <Ionicons name="call" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onReject} style={[styles.button, styles.reject]}>
          <Ionicons name="call" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 10,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'linear-gradient(45deg, rgba(38,38,38,1) 0%, rgba(0,0,0,1) 100%)',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    width: width - 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#25D366',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
  id: {
    fontSize: 12,
    color: '#ccc',
    margin: 0,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  accept: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  reject: {
    backgroundColor: '#F44336',
    borderColor: '#D32F2F',
    transform: [{ rotate: '135deg' }],
  },
});

export default CallBanner;
