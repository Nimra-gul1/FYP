import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Screen1 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 🖼️ Illustration Image */}
     <Image
  source={require('../../assets/images/SplashPeace.png')}
  style={styles.image}
  resizeMode="contain"
/>

      {/* Title */}
      <Text style={styles.title}>Your Journey to Inner Peace</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Discover your mindful path to emotional balance, guided wisdom, and personal growth.
      </Text>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => router.push('/Register/Account')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Splashscreens/Screen2')}>
          <Text style={styles.next}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Screen1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 25,
    paddingTop: 0, // no top padding
  },
  image: {
    width: '110%',
    height: 500,
    marginBottom: 30,
    marginTop: -40, // pulls image upward
    alignSelf: 'center',
    resizeMode: 'cover', // ensures image fills fully
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5E2B97',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#7D3C98',
  },
  dotInactive: {
    backgroundColor: '#D8BFD8',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skip: {
    color: '#7D3C98',
    fontSize: 16,
  },
  next: {
    color: '#7D3C98',
    fontSize: 16,
    fontWeight: '600',
  },
});
