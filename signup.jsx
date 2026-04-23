import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
//Ndodhet ne folder app
export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = () => {
  
     router.replace("login"); 

    //KLENT KETU TE LUTEM SHTO NJE IF QE NESE ESHTE KRIJUAR ACC TE NXJERRI ALETRT DHE NQS JO TE MOS NRYSHOJE TAB DHE TE THOT PROBLEMIN PLZ
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 30
  },
  title: {
    color: "black",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center"
  },
  input: {
    backgroundColor: "#FFF",
    color: "black",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#000000",
     borderStyle: "solid",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }

});
