import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (loading) return;

    if (!username.trim() || !password.trim()) {
      Alert.alert("Gabim", "Ju lutem plotësoni të gjitha fushat.");
      return;
    }

    setLoading(true);
    try {
      // LINKU I SAKTË I RENDER
      const response = await fetch(
        "https://beex-storage-backend.onrender.com/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Sukses", "Llogaria u krijua me sukses!");
        router.replace("/login");
      } else {
        Alert.alert(
          "Gabim",
          data.message ||
            "Ky përdorues mund të ekzistojë ose të dhënat janë gabim.",
        );
      }
    } catch (error) {
      // KETU ISHTE PROBLEMI - Mesazhi duhet të jetë i përgjithshëm tani
      Alert.alert(
        "Gabim Lidhjeje",
        "Nuk mund të lidhem me serverin në Cloud. Sigurohu që ke internet në telefon.",
      );
      console.log("Detajet e gabimit:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>BeexStorage</Text>
        <Text style={styles.subtitle}>Krijo një llogari të re</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.linkText}>Ke një llogari? Login këtu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkText: {
    color: "#007AFF",
    marginTop: 25,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
  },
});
