// app/index.tsx
import { getUser } from '@/Services/LocallyData';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function IndexPage() {
  const router = useRouter();
  const [isloading, setLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        router.push('/(tabs)');
      }
    };
    setLoading(true)
    checkUser();
    setLoading(false)
  }, [router])

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInDown.delay(100)} style={styles.title}>
        Welcome to ChatHub!
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
        Start your eco-friendly journey 🌿
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(500)}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#065f46',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
