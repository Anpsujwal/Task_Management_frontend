import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const handleSelection = (role) => {
    if (role === 'tenant') {
      navigation.navigate('TenantLogin'); 
    } else {
      navigation.navigate('StaffLogin');  
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => handleSelection('tenant')}
      >
        <Text style={styles.buttonText}>Tenant</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={() => handleSelection('staff')}
      >
        <Text style={styles.buttonText}>Staff</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2, // shadow for Android
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
