import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function UserDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.heading}>Welcome, {user?.name}</Text>
        <Text style={styles.role}>Flat No. {user?.flatNo}</Text>

        <View style={styles.buttonContainer}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6ff', // Light blue background
    paddingHorizontal: 20,
  },
  card: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    marginVertical: 50,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heading: {
    fontSize: 30,
    color: '#0a0a0a',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  role: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderColor: '#1e90ff',
    borderWidth: 1.5,
  },
  logoutText: {
    color: '#1e90ff',
    fontSize: 16,
    fontWeight: '600',
  },
});
