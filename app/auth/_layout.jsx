import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, ActivityIndicator } from "react-native";

export default function AuthLayout() {

  return (
    <ImageBackground
      source={require("../../assets/images/StrideLands.png")}
      style={styles.background}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // Prevents flickering
  },
});








