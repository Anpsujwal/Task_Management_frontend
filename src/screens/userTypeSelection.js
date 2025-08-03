import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const handleSelection = (role) => {
    navigation.navigate('Login', { userType: role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>

      <TouchableOpacity
        style={[styles.button, styles.tenantButton]}
        onPress={() => handleSelection('tenant')}
      >
        <Text style={styles.buttonText}>Flat Member</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.staffButton]}
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
    backgroundColor: '#f5f9ff', // light blue tint background
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#1f3b66',
  },
  button: {
    width: '85%',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenantButton: {
    backgroundColor: '#3498db', 
  },
  staffButton: {
    backgroundColor: '#1abc9c', // soft teal
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
