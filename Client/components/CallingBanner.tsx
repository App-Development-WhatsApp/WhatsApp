import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface CallBannerProps {
  callerId: string;
  callerName: string;
  callerImage: string;
  onAccept: () => void;
  onReject: () => void;
}

const CallBanner: React.FC<CallBannerProps> = ({
  callerId,
  callerName,
  callerImage,
  onAccept,
  onReject,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Image source={{ uri: callerImage }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{callerName}</Text>
          <Text style={styles.id}>ID: {callerId}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={onAccept} style={styles.accept}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReject} style={styles.reject}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2d2d2d',
    color: 'white',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 0,
  },
  id: {
    fontSize: 12,
    color: '#aaa',
    margin: 0,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  accept: {
    backgroundColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  reject: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rejectText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CallBanner;