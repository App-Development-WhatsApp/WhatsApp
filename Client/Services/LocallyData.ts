import { SaveUser } from '@/Database/ChatQuery';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUser = async (user: any) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));

    const UserData = await getUser();
    if (UserData) {
      await SaveUser({
        id:1,
        jid: UserData._id,
        name: UserData.username,
        image: UserData.image,
        phone: UserData.phoneNumber,
      });
    }
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};


export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};
