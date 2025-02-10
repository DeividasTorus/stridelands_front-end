import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword || !selectedTribe) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      Alert.alert("Error", "You must agree to the terms & conditions.");
      return;
    }

    Alert.alert("Success", "Account created successfully!");
    router.replace("/auth/login"); // Navigate to login after successful registration
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#000"
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#000"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#000"
        />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#000"
        />

        {/* Tribe Selection */}
        <Text style={styles.label}>Choose Your Tribe</Text>
        <View style={styles.tribeContainer}>
          {["Romans", "Gauls", "Teutons"].map((tribe) => (
            <TouchableOpacity
              key={tribe}
              style={[
                styles.tribeButton,
                selectedTribe === tribe ? styles.selectedTribe : null,
              ]}
              onPress={() => setSelectedTribe(tribe)}
            >
              <Text style={[styles.tribeText, selectedTribe === tribe && styles.selectedTribeText]}>
                {tribe}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)}>
            <View style={[styles.checkbox, agreeTerms ? styles.checkedBox : null]} />
          </TouchableOpacity>
          <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{ marginTop: 10 }}
        >
          <Text style={styles.linkText}>Already have an account? Log In</Text>
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
    backgroundColor: "#F8E8C1",
    borderWidth: 5,
    borderColor: "#8B4513",
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 5,
  },
  tribeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  tribeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#8B4513",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FFF8DC",
  },
  selectedTribe: {
    backgroundColor: "#A0522D",
  },
  tribeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  selectedTribeText: {
    color: "#FFF", // Brightens text when selected
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#8B4513",
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: "#8B4513",
  },
  termsText: {
    fontSize: 14,
    color: "#8B4513",
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
  loginButton: {
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




