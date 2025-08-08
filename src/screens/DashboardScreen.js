
import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredCard}>
        <Text style={styles.heading}>Welcome, {user?.name}</Text>
        <Text style={styles.role}>Role: {user?.isAdmin ? `${user.adminType} Admin` : 'Worker'}</Text>

        {user?.isAdmin && (
          <>
            <CustomButton title="Task Report" onPress={() => navigation.navigate('TaskReports')} />
            <CustomButton title="User Management" onPress={() => navigation.navigate('UserManagement')} />

            {user.adminType === 'root' &&
             (<>
              <CustomButton title="Group Management" onPress={() => navigation.navigate('GroupManagement')} />
              <CustomButton title="Task Management" onPress={() => navigation.navigate('TaskManagement')} />
                </>)
            }

            {user.adminType === 'group' && (
              <>
                <CustomButton title="Task Management" onPress={() => navigation.navigate('TaskManagement')} />
                <CustomButton title="Tickets Generated" onPress={() => navigation.navigate('AdminTicketManagement')} />
              </>
            )}
          </>
        )}

        {!user?.isAdmin && (
          <>
            <CustomButton title="Task Report" onPress={() => navigation.navigate('WorkerTaskReport')} />
            <CustomButton title="Assigned Tasks" onPress={() => navigation.navigate('WorkerTaskPanel')} />
            <CustomButton title="Ticket Management" onPress={() => navigation.navigate('WorkerTicketManagement')} />
          </>
        )}

        <CustomButton title="Ticket Report" onPress={() => navigation.navigate('TicketReportScreen')} />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout();
            navigation.replace('UserTypeSelection');
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
    padding: 24,
  },
  centeredCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32, // increased
    color: '#2D3436',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  role: {
    fontSize: 18, // increased
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: 280, // increased
    backgroundColor: '#3498DB',
    paddingVertical: 18, // increased
    borderRadius: 16, // more rounded
    alignItems: 'center',
    marginVertical: 10, // more spacing
    shadowColor: '#2980B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // increased
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 28,
    paddingVertical: 16, // increased
    borderRadius: 16,
    borderColor: '#E74C3C',
    borderWidth: 1.8,
    alignItems: 'center',
    width: 280,
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: 18, // increased
    fontWeight: '700',
  },
});


