import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    // Simulate login & save token
    await AsyncStorage.setItem("userToken", "12345");
    router.replace("/"); // Navigate to the home screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#000"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          placeholderTextColor="#000"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOG IN</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={{ marginTop: 10 }}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#F8E8C1", // Scroll-like color
    borderWidth: 5,
    borderColor: "#8B4513", // Scroll border
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#8B4513",
  },
  input: {
    width: "90%",
    height: 40,
    backgroundColor: "#FFF8DC",
    borderWidth: 2,
    borderColor: "#8B4513",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    backgroundColor: "#8B4513",
    padding: 10,
    margin: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  signUpButton: {
    backgroundColor: "#A0522D",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#8B4513",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

