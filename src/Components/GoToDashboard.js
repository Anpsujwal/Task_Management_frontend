
import {Button,View,StyleSheet} from 'react-native'
import { useNavigation } from '@react-navigation/native';
export default function GoBackToDashboard() {
    const navigation=useNavigation();
  return (
    <View style={styles.container}>
    <Button 
       title="Go to Dashboard"
       onPress={()=>{navigation.navigate('Dashboard')}}
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