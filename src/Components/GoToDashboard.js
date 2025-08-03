import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons'; // or use FontAwesome, MaterialIcons

export default function GoBackToDashboard() {
  const { type } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleNavigation = () => {
    if (type === 'tenant') {
      navigation.navigate('UserDashboard');
    } else {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigation} style={styles.iconButton}>
        <Ionicons name="home-outline" size={30} color="#3498db" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    backgroundColor: '#eaf4fb',
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#cce4f6',
  },
});
