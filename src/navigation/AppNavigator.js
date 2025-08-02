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
import RoleSelectionScreen from '../screens/userTypeSelection';
import UserDashboardScreen from '../screens/UserDashboard';
import TicketManagementScreen from '../screens/TicketCreationScreen';
import AdminTicketManagement from '../screens/AdminTicketManagement';
import WorkerTicketManagement from '../screens/WorkerTicketManagement';
import TicketReportScreen from '../screens/TicketReportScreen';
import ReportSummaryDownload from '../screens/ReportSummaryDownload';
import TicketSummaryDownload from '../screens/TicketSummaryDownload';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UserTypeSelection" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserTypeSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="UserDashboard" component={UserDashboardScreen}/>
        <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="TaskManagement" component={TaskManagementScreen} />
        <Stack.Screen name="TaskReports" component={TaskReportScreen}/>
        <Stack.Screen name="WorkerTaskPanel" component={TaskDashboard} />
        <Stack.Screen name="WorkerTaskReport" component={WorkerTaskReport}/>
        <Stack.Screen name="TicketManagement" component={TicketManagementScreen}/>
        <Stack.Screen name="AdminTicketManagement" component={AdminTicketManagement}/>
        <Stack.Screen name="WorkerTicketManagement" component={WorkerTicketManagement}/>
        <Stack.Screen name="TicketReportScreen" component={TicketReportScreen}/>
        <Stack.Screen name="ReportDownload" component={ReportSummaryDownload}></Stack.Screen>
        <Stack.Screen name="TicketSummaryDownload" component={TicketSummaryDownload} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}