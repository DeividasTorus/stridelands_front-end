import { Stack, useSegments } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InfoBar from "@/components/gameComponents/InfoBar";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();

  // Ensures authentication state is refreshed when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          console.log("Token fetched:", token); // Debugging
          setIsAuthenticated(!!token);
        } catch (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
        }
      };

      checkAuth();
    }, [])
  );

  const showInfoBar = !segments.includes("auth");

  if (isAuthenticated === null) {
    // Prevent rendering UI until authentication check is complete
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden={true} />
      {isAuthenticated && showInfoBar && <InfoBar />}
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="auth" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </>
  );
}




