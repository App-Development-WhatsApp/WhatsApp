import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, AVPlaybackStatusSuccess } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { MediaItem } from "@/types/ChatsType";
import * as VideoThumbnails from "expo-video-thumbnails";
import { getUser } from "@/Services/LocallyData";
import { Upload_Status } from "@/Services/Api";

const screenWidth = Dimensions.get("window").width;

export default function UploadStatus() {
  const { uri, type }: { uri: string; type: "image" | "video" } =
    useLocalSearchParams();
  const navigation = useNavigation();
  const UserData = useRef(null);
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Uploading, setUpLoading] = useState(false);

  const videoRef = useRef<Video>(null);
  const isMounted = useRef(true);

  const currentMedia = selectedMedia[currentIndex];
  
  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      UserData.current = user;
    };
    if (!UserData.current) {
      checkUser();
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: { backgroundColor: "#25292e" },
      headerTintColor: "#fff",
      headerShadowVisible: false,
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 16, marginRight: 10 }}>
          <TouchableOpacity onPress={() => console.log("music")}>
            <Ionicons name="musical-notes" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("emoji")}>
            <Ionicons name="happy" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("text")}>
            <Ionicons name="text" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("crop")}>
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
        caption: "",
        start: 0,
        end: 0,
        duration: 0,
      };
      setSelectedMedia([newMedia]);
    }
  }, [uri, type]);

  useEffect(() => {
    isMounted.current = true;
    if (currentMedia && currentMedia.type !== "video") {
      setThumbnails([]);
    }
    return () => {
      isMounted.current = false;
    };
  }, [currentMedia]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const pickedItems: MediaItem[] = result.assets.map((item) => ({
        id: `${item.assetId}-${Date.now()}`,
        uri: item.uri,
        type: item.type === "video" ? "video" : "image",
        caption: "",
        start: 0,
        end: item.duration || 1000,
        duration: item.duration || 1000,
      }));

      setSelectedMedia((prev) => [...prev, ...pickedItems]);
    }
  };

  const handleUploadStatus = async () => {
    if (UserData.current === null) return;
    setUpLoading(true);
    const formattedMedia = selectedMedia.map((item) => {
      if (item.type === "image") {
        return {
          uri: item.uri,
          caption: item.caption || "",
          start: 0,
          end: 10,
          duration: 10,
          type: "image",
        };
      } else {
        return {
          uri: item.uri,
          caption: item.caption || "",
          start: item.start || 0,
          end: item.end || 10,
          duration: (item.end || 10) - (item.start || 0),
          type: "video",
        };
      }
    });

    const formData = new FormData();

    formData.append("id", UserData.current._id); // User ID

    formattedMedia.forEach((mediaItem, index) => {
      formData.append("media", {
        uri: mediaItem.uri,
        name: `media_${index}.${mediaItem.type === "image" ? "jpg" : "mp4"}`,
        type: mediaItem.type === "image" ? "image/jpeg" : "video/mp4",
      } as any);

      formData.append(`meta[${index}][type]`, mediaItem.type);
      formData.append(`meta[${index}][caption]`, mediaItem.caption);
      formData.append(`meta[${index}][start]`, `${mediaItem.start}`);
      formData.append(`meta[${index}][end]`, `${mediaItem.end}`);
      formData.append(`meta[${index}][duration]`, `${mediaItem.duration}`);
    });

    // Optional: Debug log formData entries
    for (let pair of formData.entries()) {
      console.log(pair[0] + ":", pair[1]);
    }

    const result = await Upload_Status(formData);
    if (result.success) {
      console.log("Status upload successful!", result.response);
      router.replace("/Updates");
    } else {
      console.warn("Status upload failed:", result.message);
    }
    setUpLoading(false);
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
      console.error("Playback error:", error);
    }
  };

  const generateThumbnails = async (
    videoUri: string,
    videoDurationMillis: number
  ) => {
    try {
      setLoading(true);

      const numThumbnails = 10;
      const interval = videoDurationMillis / numThumbnails;
      const newThumbnails: string[] = [];

      for (let i = 0; i < numThumbnails; i++) {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: Math.floor(i * interval),
        });
        if (isMounted.current) {
          newThumbnails.push(uri);
        }
      }

      if (isMounted.current) {
        setThumbnails(newThumbnails);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate thumbnails");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = (index: number) => {
    const updated = [...selectedMedia];
    updated.splice(index, 1);
    if (updated.length === 0) {
      navigation.goBack();
    } else {
      setSelectedMedia(updated);
      setCurrentIndex(0);
    }
  };

  const renderMediaPreview = ({
    item,
    index,
  }: {
    item: MediaItem;
    index: number;
  }) => {
    const isImage = item.type === "image";

    return (
      <TouchableOpacity
        onPress={() => setCurrentIndex(index)}
        style={styles.mediaBox}
      >
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
            <Ionicons
              name="play-circle-outline"
              size={24}
              color="white"
              style={styles.playIcon}
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMedia(index)}
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

  if (!uri || !currentMedia) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No media selected</Text>
      </View>
    );
  }

  const isImage = currentMedia.type === "image";

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {isImage ? (
        <Image source={{ uri: currentMedia.uri }} style={styles.fullImage} />
      ) : (
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <View style={styles.trimContainer}>
              <View style={styles.trimTrack}>
                <View style={[styles.overlay, { width: "10%" }]} />
                <View
                  style={[styles.selectedRange, { left: "10%", width: "60%" }]}
                />
                <View style={[styles.overlay, { left: "70%", width: "30%" }]} />
                <View style={styles.trimThumbnailStrip}>
                  {thumbnails.map((thumb, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: thumb }}
                      style={styles.trimThumbnail}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.trimLabel}>
                Start: {startTime.toFixed(2)}s - End: {endTime.toFixed(2)}s
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={togglePlayPause}
          >
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.uri }}
              style={{ width: "100%", height: "90%", top: 50 }}
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              onLoad={(status) => {
                if (status.isLoaded) {
                  const duration = status.durationMillis || 10000;
                  setEndTime(duration / 1000);
                  generateThumbnails(currentMedia.uri, duration);
                }
              }}
            />
            {!isPlaying && (
              <Ionicons
                name="play-circle-outline"
                size={64}
                color="white"
                style={styles.centerPlayIcon}
              />
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
          <Ionicons
            name="add-circle-outline"
            size={26}
            color="#ccc"
            onPress={handlePickMedia}
          />
          <TextInput
            placeholder="Add a caption..."
            placeholderTextColor="#aaa"
            style={styles.captionInput}
            value={selectedMedia[currentIndex]?.caption || ""}
            onChangeText={(text) => {
              const updated = [...selectedMedia];
              updated[currentIndex].caption = text;
              setSelectedMedia(updated);
            }}
          />
          <TouchableOpacity disabled={Uploading} onPress={handleUploadStatus}>
            {Uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={22} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  message: { color: "#fff", fontSize: 16 },
  fullImage: { flex: 1, resizeMode: "contain", maxHeight: "90%" },
  trimContainer: { padding: 10 },
  trimTrack: {
    height: 60,
    backgroundColor: "#444",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  selectedRange: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  handle: {
    width: 8,
    backgroundColor: "red",
  },
  trimThumbnailStrip: {
    flexDirection: "row",
    position: "absolute",
    top: 0,
    height: 60,
    width: "100%",
  },
  trimThumbnail: {
    height: 60,
    width: screenWidth / 10,
  },
  trimLabel: {
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
  },
  centerPlayIcon: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  mediaListWrapper: {
    position: "absolute",
    bottom: 110,
    width: "100%",
    paddingLeft: 10,
  },
  mediaBox: {
    marginRight: 10,
    position: "relative",
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
    overflow: "hidden",
  },
  videoThumb: {
    width: "100%",
    height: "100%",
  },
  playIcon: {
    position: "absolute",
    top: "35%",
    left: "35%",
  },
  deleteButton: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  bottomBar: {
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderTopColor: "#333",
    borderTopWidth: 1,
  },
  captionInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  captionInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
  },
});
