
import {Button,View,StyleSheet} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function GoBackToDashboard() {
    
    const {type}=useContext(AuthContext)
    const navigation=useNavigation();
    const handleNavigation=()=>{
      if(type==="tenant"){
        navigation.navigate('UserDashboard');
      }else navigation.navigate('Dashboard');
    }
  return (
    <View style={styles.container}>
    <Button 
       title="Go to Dashboard"
       onPress={()=>{handleNavigation()}}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});