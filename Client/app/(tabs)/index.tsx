import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { getUser } from '@/Services/LocallyData';
import { getAllUsers, getChats } from '@/Database/ChatQuery';
import { ChatItem } from '@/types/ChatsType';
import showToast from '@/utils/ToastHandler';


export default function Chat() {
  const router = useRouter();
  const netInfo = useNetInfo();

  const loading = useRef(false);
  const userData = useRef(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);

  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push('/login');
      }
      // showToast('success', 'top', `Hi ${user.username}`, 'Wellcome to Chat Screen');
      userData.current = user;
    };
    if (!userData.current) {
      checkUser();
    }
  }, []);

  const fetchChats = async () => {
    if (dataFetchedRef.current) {
      return;
    }
    loading.current = true

    const Chats: ChatItem[] = await getChats();
    setChats(Chats);
    setFilteredChats(Chats);
    loading.current = false;
    dataFetchedRef.current = true;
  };

  useEffect(() => {
    fetchChats();
    const intervalId = setInterval(() => {
      fetchChats();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = async (searchValue: string) => {
    setSearchText(searchValue);
    if (searchValue.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filteredData = chats.filter((chat: ChatItem) =>
        (chat.name ?? '').toLowerCase().includes(searchValue.toLowerCase())
      );

      setFilteredChats(filteredData);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <View style={styles.searchCtn}>
        <Feather name="search" size={20} color="#b4c7c5" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInp}
          placeholder="Ask Meta AI or Search"
          placeholderTextColor="#b4c7c5"
          onChangeText={handleSearch}  // Use debounced search
          value={searchText}
        />
      </View>

      {loading.current ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Fetching data...</Text>
        </View>
      ) : (
        filteredChats.length > 0 ? (
          <FlatList
            data={filteredChats}
            renderItem={({ item }: { item: ChatItem }) => (
              <View style={styles.userCtn}>
                <TouchableOpacity onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.jid } })}>
                  <Image source={{ uri: item.image || "" }} style={styles.image} />
                </TouchableOpacity>

                <View style={styles.userDetail}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.message}>{item.last_message}</Text>
                </View>
                <Text style={styles.time}>{item.last_message_time}</Text>
              </View>
            )}
            keyExtractor={(item, index) => `user-${item.jid || index}`}
          />
        ) : (
          <Text style={styles.emptyText}>Start Chatting with New Users.</Text>
        )
      )}

      <View style={styles.newUpdate}>
        <TouchableOpacity style={styles.msg} onPress={() => router.push('/Contacts')}>
          <MaterialCommunityIcons name="message-plus" size={28} color="#011513" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#25292e',
    height: '100%',
  },
  searchCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInp: {
    flex: 1,
    fontSize: 16,
    color: '#b4c7c5',
  },
  userCtn: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  userDetail: {
    gap: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
  message: {
    fontSize: 14,
    color: '#cbd5c0',
  },
  time: {
    fontSize: 12,
    color: '#cbd5c0',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  newUpdate: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  msg: {
    borderRadius: 50,
    backgroundColor: 'rgb(95, 252, 123)',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#cbd5c0',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#cbd5c0',
    fontSize: 16,
  },
});
