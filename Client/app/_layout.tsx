import '../global.css';
import ToastManager from 'toastify-react-native';
import { getDB } from '@/Database/ChatDatabase';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { SocketProvider } from '@/Context/SocketContext';

export default function RootLayout() {
  useEffect(() => {
    const initializeDatabase = async () => {
      const db = await getDB();
      if (db) {
        console.log('Database initialized successfully');
      } else {
        console.error('Failed to initialize database');
      }
    };
    initializeDatabase();
  }, []);

  return (
    <SocketProvider> 
      <MenuProvider>
        <ToastManager position="top" duration={3000} style={{ marginTop: 40 }} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </MenuProvider>
    </SocketProvider>
  );
}
