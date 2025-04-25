import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GetUsersInCalls } from '@/Database/ChatQuery'; // Your query function

const CallsScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await GetUsersInCalls();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await GetUsersInCalls();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  } else if (users.length === 0) {
    return <Text style={styles.loading}>No calls found</Text>;
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity key={item.jid} style={styles.callItem}>
      <Image source={{ uri: item.image || 'https://example.com/avatar.jpg' }} style={styles.avatar} />
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
      <Ionicons name="call-outline" size={20} color="green" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.jid}
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
  },
  list: {
    paddingBottom: 20,
  },
  callItem: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
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
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callStatus: {
    color: 'gray',
    marginLeft: 6,
  },
});

export default CallsScreen;
