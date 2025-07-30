import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

export default function UserDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.card}>
          <Text style={styles.heading}>Welcome, {user?.name}</Text>
          <Text style={styles.role}>Flat No.{user?.flatNo}</Text>

            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('TaskReports')}
              >
                <Text style={styles.buttonText}>Tickets Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('TicketManagement')}
              >
                <Text style={styles.buttonText}>Create Tickets</Text>
              </TouchableOpacity>
            </View>



          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              navigation.replace('UserTypeSelection');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginVertical: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  heading: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  role: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 12,
    borderColor: '#f44',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  logoutText: {
    color: '#f44',
    fontSize: 16,
    fontWeight: '600',
  },
});