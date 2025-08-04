import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [flatNo,setFlatNo]=useState('')
  

  const handleSignup = async () => {
    try {
      if(!userId || !name || !password || !flatNo){
        return Alert.alert( "Enter all Details");
      }
      const res=await api.post('/api/user1/signup', {userId, name, password,flatNo });
      if(res.status == 409){
        return Alert.alert( "userId already exists. Please choose a different one.");
      } 
      Alert.alert("Success", "Account created. Please log in.");
      navigation.navigate('Login',{userType:'tenant'});
    } catch (err) {
      Alert.alert("Signup Failed", err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <LinearGradient colors={['#00c6ff', '#0072ff']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="userId"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
          />
          
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

           <TextInput
            placeholder="Flat No."
            placeholderTextColor="#aaa"
            style={styles.input}
            value={flatNo}
            onChangeText={setFlatNo}
            secureTextEntry
          />
           

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login',{userType:'tenant'})}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
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
    backgroundColor: '#f1f6fb',
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
    backgroundColor: '#0072ff',
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
  loginLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0072ff',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
