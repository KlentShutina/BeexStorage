import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
//Ndodhet ne folder app
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); 

  const handleLogin = () => {

    if (username.trim() === "albi" && password.trim() === "berat123") {

      router.replace("/(tabs)/myinventory"); 
      <Stack.Screen 
        name="myinventory" 
        options={{ 
          headerShown: false 
        }} 
      />
    } else {
      Alert.alert("Gabim", "Username ose password gabim");
    }
  };
  const handleSignUp = () => {
  
      router.replace("signup"); 

    
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage App</Text>

      <TextInput 
        placeholder="Username" 
        placeholderTextColor="#888" 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#888" 
        style={styles.input} 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={handleSignUp}>
        <Text style={styles.link}>Don't have an account? Sign up!</Text>
      </TouchableOpacity>
    </View>

  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", paddingHorizontal: 30 },
  title: { color: "black", fontSize: 28, fontWeight: "bold", marginBottom: 40, textAlign: "center" },
  input: { backgroundColor: "#ffffff", color: "black", padding: 15, borderRadius: 8, marginBottom: 15 ,borderWidth: 2,borderColor: "#000000", borderStyle: "solid",},
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: {color: "black", fontWeight: "bold", fontSize: 16}

});
