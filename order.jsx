import { View, Text, StyleSheet } from 'react-native';
//Ndodhet ne folder tabs qe ndodhet brenda folderit app
export default function OrderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Orders</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});