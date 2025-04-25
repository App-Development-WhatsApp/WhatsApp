import { getUser } from '@/Services/LocallyData';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, Text, Image, Touchable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '@/Context/SocketContext';
export default function CallScreen() {
  const { User } = useLocalSearchParams();
  const parsedUser = User ? JSON.parse(User as string) : null;
  const router = useRouter();
  const userData = useRef<any | null>(null)
  const { sendIncomingCall, RegisterAcceptCall, RegisterRejectCall,sendCancelCall } = useSocket();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push('/login');
      }
      userData.current = user;
      if (parsedUser && userData.current) {
        sendIncomingCall(userData.current._id, userData.current.username, userData.current.image, parsedUser._id);
      }
    };
    if (!userData.current) {
      checkUser();
    }

    RegisterAcceptCall((callerId: string) => {
      console.log('Call accepted by:', callerId);
      router.push({
        pathname: "/call/acceptCall",
        params: {
          User, // must be stringified if object
        },
      });
    })
    RegisterRejectCall((callerId: string) => {
      console.log('Call Rejected to me with:', callerId);
      router.canGoBack() && router.back();
    })
  }, []);

  const HandleCancel = () => {
    if (parsedUser && userData.current) {
      sendCancelCall(userData.current._id, parsedUser.id);
    }
    router.canGoBack() && router.back();
  }

  return (
    <View>
      {parsedUser && (
        <>
          <Image source={{ uri: parsedUser.image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text>{parsedUser.name}</Text>
          <Text>{parsedUser.phone}</Text>
          <TouchableOpacity onPress={HandleCancel}>
            <Text>Cancel Call</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
