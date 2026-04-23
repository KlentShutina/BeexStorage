import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Gabim", "Plotësoni të gjitha fushat.");
      return;
    }

    try {
      // NDRYSHIMI KETU: Nga IP lokale ne linkun e Render
      const response = await fetch(
        "https://beex-storage-backend.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Gabim", data.message || "Username ose password i gabuar.");
      }
    } catch (error) {
      // Mesazhi i ri i gabimit per Cloud
      Alert.alert(
        "Gabim",
        "Nuk u realizua lidhja me serverin. Kontrollo internetin.",
      );
      console.log("Login Error:", error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeexStorage Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.linkText}>Nuk ke llogari? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  linkText: { color: "#007AFF", marginTop: 15, textAlign: "center" },
});
