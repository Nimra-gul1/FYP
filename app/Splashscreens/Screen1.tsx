import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rf, scale, wp, hp } from '../utils/responsive';

const Screen1 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
     <Image
  source={require('../../assets/images/mindful.jpg')}
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
  <TouchableOpacity style={styles.buttonWrap} onPress={() => router.push('/Register/Account')}>
    <Text style={styles.skip}>Skip</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.buttonWrap} onPress={() => router.push('/Splashscreens/Screen2')}>
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
    paddingHorizontal: scale(25),
    paddingTop: 0, 
  },
  image: {
    width: '110%',
    height: scale(500),
    marginBottom: scale(30),
    marginTop: scale(-40), 
    alignSelf: 'center',
    resizeMode: 'cover', 
  },
  title: {
    fontSize: rf(20),
    fontWeight: '600',
    color: '#5E2B97',
    textAlign: 'center',
    marginBottom: scale(10),
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    fontSize: rf(14),
    lineHeight: scale(22),
    marginBottom: scale(25),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scale(30),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginHorizontal: scale(4),
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
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: scale(5),
  marginBottom: scale(10),
  marginTop: scale(40),
},

buttonWrap: {
  justifyContent: 'center', 
  alignItems: 'center',
  paddingVertical: scale(10),
},

skip: {
  color: '#7D3C98',
  fontSize: rf(16),
  fontWeight: '600',
  lineHeight: scale(22),
},

next: {
  color: '#7D3C98',
  fontSize: rf(16),
  fontWeight: '600',
  lineHeight: scale(22),
},
});