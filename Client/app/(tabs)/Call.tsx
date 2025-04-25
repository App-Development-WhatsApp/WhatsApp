import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const demoData = [
  {
    jid: 'user_1',
    name: 'Alice Johnson',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    last_call_type: 'audio',
    last_call_status: 'accepted',
  },
  {
    jid: 'user_2',
    name: 'Bob Smith',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    last_call_type: 'video',
    last_call_status: 'rejected',
  },
  {
    jid: 'user_3',
    name: 'Charlie Brown',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    last_call_type: 'audio',
    last_call_status: 'missed',
  },
  {
    jid: 'user_4',
    name: 'Diana Prince',
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    last_call_type: 'video',
    last_call_status: 'accepted',
  },
];

const CallsScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setUsers(demoData);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setTimeout(() => {
        setUsers(demoData);
        setLoading(false);
      }, 1000);
    };

    fetchUsers();
  }, []);

  if (loading || users.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>
          {loading ? 'Loading...' : 'No calls found'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity key={item.jid} style={styles.callItem}>
      <Image
        source={{ uri: item.image || 'https://example.com/avatar.jpg' }}
        style={styles.avatar}
      />
      <View style={styles.callInfo}>
        <Text style={styles.name}>{item.name || 'Unknown User'}</Text>
        {item.last_call_type && (
          <View style={styles.callDetails}>
            <MaterialIcons
              name={item.last_call_type === 'audio' ? 'phone' : 'video-call'}
              size={16}
              color={
                item.last_call_status === 'rejected'
                  ? 'red'
                  : item.last_call_status === 'accepted'
                  ? 'green'
                  : 'orange'
              }
            />
            <Text style={styles.callStatus}>{item.last_call_status}</Text>
          </View>
        )}
      </View>
      {item.last_call_type === 'audio' ? (
        <Ionicons name="call-outline" size={28} color="green" />
      ) : (
        <MaterialIcons name="video-call" size={30} color="green" />
      )}
    </TouchableOpacity>
  );  

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.jid || index.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  loading: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  callItem: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'gray',
  },
  callInfo: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callStatus: {
    color: 'gray',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
});

export default CallsScreen;
