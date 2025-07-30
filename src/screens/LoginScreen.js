import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';


export default function LoginScreen({ navigation, route }) {
  const { login } = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const {userType}=route.params || {};
  const handleLogin = async () => {
    try {
      if (userType === "staff") {
        const res = await api.post('/api/auth/login', { userId, password });
        login({ userData: res.data.user, type: res.data.type });
        navigation.replace('Dashboard');
      }
      else if (userType === "tenant") {
        const res = await api.post('/api/user1/login', { userId, password });
        login({ userData: res.data.user, type: res.data.type });
        navigation.replace('UserDashboard');
      }
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            placeholder="userId"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            keyboardType="default"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {userType === "tenant" &&
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Don't have an account? SignUp</Text>
            </TouchableOpacity>
          }
          
          <TouchableOpacity onPress={() => navigation.navigate('UserTypeSelection')}>
              <Text style={styles.signupLink}>Go to User Selection Tab</Text>
          </TouchableOpacity>


        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#3b5998',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#3b5998',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
