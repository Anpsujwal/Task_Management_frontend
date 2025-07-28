import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GroupManagementScreen from '../screens/GroupManagementScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import TaskManagementScreen from '../screens/TaskAssignmentScreen';
import TaskReportScreen from '../screens/TaskReport';
import TaskDashboard from '../screens/WorkerTaskPanel';
import WorkerTaskReport from '../screens/WorkerReportScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="TaskManagement" component={TaskManagementScreen} />
        <Stack.Screen name="TaskReports" component={TaskReportScreen}/>
        <Stack.Screen name="WorkerTaskPanel" component={TaskDashboard} />
        <Stack.Screen name="WorkerTaskReport" component={WorkerTaskReport}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}