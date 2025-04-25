import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { MediaItem } from '@/types/ChatsType';
import * as VideoThumbnails from 'expo-video-thumbnails';

const { width } = Dimensions.get('window');

export default function UploadStatus() {
  const { uri, type }: { uri: string; type: 'image' | 'video' } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const currentMedia = selectedMedia[currentIndex];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
          <TouchableOpacity onPress={() => console.log('music')}>
            <Ionicons name="musical-notes" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('emoji')}>
            <Ionicons name="happy" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text')}>
            <Ionicons name="text" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('crop')}>
            <Ionicons name="crop" size={22} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    if (uri && type) {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        uri,
        type,
        caption: '',
        start: 0,
        end: 0,
        duration: 0,
      };
      setSelectedMedia([newMedia]);
    }
  }, [uri, type]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets) {
      const pickedItems: MediaItem[] = result.assets.map((item) => ({
        id: `${item.assetId}-${Date.now()}`,
        uri: item.uri,
        type: item.type === 'video' ? 'video' : 'image',
        caption: '',
        start: 0,
        end: item.duration || 1000,
        duration: item.duration || 1000,
      }));

      setSelectedMedia((prev) => [...prev, ...pickedItems]);
    }
  };

  const handleUploadStatus = () => {
    console.log('Uploading:', selectedMedia);
  };

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (isPlaying) {
        await video.pauseAsync();
        setIsPlaying(false);
      } else {
        await video.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const generateThumbnails = async (uri: string, duration: number) => {
    setLoading(true);
    const interval = Math.floor(duration / 10);
    const frames: string[] = [];

    for (let i = 1; i <= 10; i++) {
      try {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: i * interval,
        });
        frames.push(thumbnailUri);
      } catch (e) {
        console.error('Thumbnail error:', e);
      }
    }

    setThumbnails(frames);
    setLoading(false);
  };

  const renderMediaPreview = ({ item, index }: { item: MediaItem; index: number }) => {
    const isImage = item.type === 'image';

    return (
      <TouchableOpacity onPress={() => setCurrentIndex(index)} style={styles.mediaBox}>
        {isImage ? (
          <Image source={{ uri: item.uri }} style={styles.imageThumb} />
        ) : (
          <View style={styles.videoThumbWrapper}>
            <Video
              source={{ uri: item.uri }}
              style={styles.videoThumb}
              resizeMode="cover"
              isMuted
              shouldPlay={false}
            />
            <Ionicons name="play-circle-outline" size={24} color="white" style={styles.playIcon} />
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            const updated = [...selectedMedia];
            updated.splice(index, 1);
            setSelectedMedia(updated);
            if (index === currentIndex && updated.length > 0) {
              setCurrentIndex(0);
            }
          }}
        >
          <Ionicons name="close-circle" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!uri || !currentMedia) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No media selected</Text>
      </View>
    );
  }

  const isImage = currentMedia.type === 'image';

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {isImage ? (
        <Image source={{ uri: currentMedia.uri }} style={styles.fullImage} />
      ) : (
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.trimContainer}>
              <View style={styles.trimTrack}>
                <View style={[styles.overlay, { width: '10%' }]} />
                <View style={[styles.selectedRange, { left: '10%', width: '60%' }]}>
                  <View style={styles.handle} />
                  <View style={styles.handle} />
                </View>
                <View style={[styles.overlay, { left: '70%', width: '30%' }]} />
                <View style={styles.trimThumbnailStrip}>
                  {thumbnails.map((thumb, idx) => (
                    <Image key={idx} source={{ uri: thumb }} style={styles.trimThumbnail} />
                  ))}
                </View>
              </View>
              <Text style={styles.trimLabel}>Start: {startTime} - End: {endTime}</Text>
            </View>
          )}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={togglePlayPause}>
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.uri }}
              style={{ width: '100%', height: '90%', top: 50 }}
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              onLoad={(status) => {
                if (!status.isLoaded) return;
                const duration = status.durationMillis || 10000;
                generateThumbnails(currentMedia.uri, duration);
              }}
            />
            {!isPlaying && (
              <Ionicons name="play-circle-outline" size={64} color="white" style={styles.centerPlayIcon} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {selectedMedia.length > 1 && (
        <View style={styles.mediaListWrapper}>
          <FlatList
            data={selectedMedia}
            horizontal
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            renderItem={renderMediaPreview}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.bottomBar}>
        <View style={styles.captionInputWrapper}>
          <Ionicons name="add-circle-outline" size={26} color="#ccc" onPress={handlePickMedia} />
          <TextInput
            placeholder="Add a caption..."
            placeholderTextColor="#aaa"
            style={styles.captionInput}
            value={selectedMedia[currentIndex]?.caption || ''}
            onChangeText={(text) => {
              const updated = [...selectedMedia];
              updated[currentIndex].caption = text;
              setSelectedMedia(updated);
            }}
          />
          <TouchableOpacity onPress={handleUploadStatus}>
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  message: { color: '#fff', fontSize: 16 },
  fullImage: { flex: 1, resizeMode: 'contain', maxHeight: '90%' },
  trimContainer: { padding: 10 },
  trimTrack: {
    height: 60,
    backgroundColor: '#444',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectedRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderColor: 'white',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handle: {
    width: 8,
    backgroundColor: '#fff',
  },
  trimThumbnailStrip: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    height: 60,
    width: '100%',
  },
  trimThumbnail: {
    height: 60,
    width: width / 10,
  },
  trimLabel: {
    color: '#fff',
    marginTop: 6,
    textAlign: 'center',
  },
  centerPlayIcon: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
  mediaListWrapper: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    paddingLeft: 10,
  },
  mediaBox: {
    marginRight: 10,
    position: 'relative',
  },
  imageThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  videoThumbWrapper: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '35%',
    left: '35%',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  bottomBar: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  captionInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captionInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 8,
  },
});
