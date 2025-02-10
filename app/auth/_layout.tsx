import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Asset } from "expo-asset";

export default function AuthLayout() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    async function loadImage() {
      await Asset.loadAsync(require("../../assets/images/StrideLands.png")); // Preload image
      setIsImageLoaded(true);
    }
    loadImage();
  }, []);

  if (!isImageLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    ); // Show loader while loading image
  }

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








