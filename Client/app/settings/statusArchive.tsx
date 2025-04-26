import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect, useState, useEffect } from 'react';
import { Video } from 'expo-av';

type MediaItem = { type: string, uri: string };
type ArchiveItem = { id: string, date: string, media: MediaItem[] };

const fetchArchiveData = async (): Promise<ArchiveItem[]> => {
  return [
    {
      id: 'group1',
      date: '31 May',
      media: [
        { type: 'image', uri: 'https://via.placeholder.com/150' },
        { type: 'video', uri: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { type: 'image', uri: 'https://via.placeholder.com/150' },
      ],
    },
    {
      id: 'group2',
      date: '23 Jun',
      media: [
        { type: 'image', uri: 'https://via.placeholder.com/150' },
        { type: 'video', uri: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ],
    },
  ];
};

const numColumns = 3;
const imageSize = Dimensions.get('window').width / numColumns - 12;

export default function StatusArchive() {
  const router = useRouter();
  const navigation = useNavigation();
  const [archiveData, setArchiveData] = useState<ArchiveItem[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Status Archive',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchArchiveData();
      setArchiveData(data);
    };

    loadData();
  }, []);

  const renderItem = ({ item }: { item: ArchiveItem }) => (
    <TouchableOpacity
      style={styles.box}
      onPress={() =>
        router.push({ pathname: "/settings/storyViewer/[id]", params: { id: item.id } })}
    >

      {item.media[0].type === 'image' ? (
        <Image source={{ uri: item.media[0].uri }} style={styles.thumbnail} />
      ) : (
        <Video
          source={{ uri: item.media[0].uri }}
          style={styles.thumbnail}
          useNativeControls
          isLooping
        />
      )}
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={archiveData}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 10 },
  box: {
    margin: 6,
    width: imageSize,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  date: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#000000aa',
    color: 'white',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 12,
 },
});