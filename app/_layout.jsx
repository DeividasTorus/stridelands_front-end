import React, { useEffect, useState, useContext } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View } from "react-native";
import { Asset } from "expo-asset"; // ✅ Added asset loading back
import InfoBar from "../components/gameComponents/InfoBar";
import { Provider } from "react-native-paper";
import { UserProvider, UserContext } from "../context/UserContext";
import { GameProvider } from "../context/GameContext";

// ✅ Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayoutContent = () => {
  const [isAppReady, setAppReady] = useState(false);
  const { user, isLoading, login } = useContext(UserContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log("⏳ Loading assets and user data...");

        // ✅ Load assets before proceeding
        const images = [
          require("../assets/images/villageMap.png"),
          require("../assets/images/barbarian.jpg"),
          require("../assets/images/goldIcon.png"),
          require("../assets/images/woodIcon.png"),
          require("../assets/images/bricksIcon.png"),
          require("../assets/images/ironIcon.png"),
          require("../assets/images/cropIcon.png"),
          require("../assets/images/StrideLands.png"),
          require("../assets/images/modalFrame.png"),
          require("../assets/images/soldier.png"),
          require("../assets/images/xpIcon.png"),
          require("../assets/images/healthIcon.png"),
          require("../assets/images/swordIcon.png"),
          require("../assets/images/lvlIcon.png"),
          require("../assets/images/townHallIcon.png"),
          require("../assets/images/barracksIcon.png"),
          require("../assets/images/grainMillIcon.png"),
          require("../assets/images/wareHouseIcon.png"),
          require("../assets/images/brickyardIcon.png"),
          require("../assets/images/sawmillIcon.png"),
          require("../assets/images/ironFoundryIcon.png"),
        ];

        await Asset.loadAsync(images); // ✅ Ensures assets are loaded
        console.log("✅ Assets loaded successfully.");

        // ✅ Load authentication data
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUser = await AsyncStorage.getItem("user");

        console.log("🔄 On app start, AsyncStorage values:", { storedUser, storedToken });

        if (storedToken && storedUser) {
          login(JSON.parse(storedUser), storedToken);
        } else {
          console.log("🚪 No valid user found, clearing invalid token...");
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("user");
        }
      } catch (error) {
        console.error("❌ Error loading assets or checking auth:", error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (isAppReady && !isLoading) {
      if (!user) {
        console.log("🔄 Redirecting to login screen...");
        router.replace("/auth"); // ✅ Forces redirect to login
      }
    }
  }, [isAppReady, isLoading, user]);

  if (!isAppReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const isAuthenticated = !!user;
  const showInfoBar = isAuthenticated && !segments.includes("auth");

  return (
    <Provider>
      <StatusBar hidden={true} />
      {showInfoBar && <InfoBar />}
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="auth" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </Provider>
  );
};

// ✅ Wrap everything inside UserProvider
const RootLayout = () => (
  <UserProvider>
    <GameProvider>
      <RootLayoutContent />
    </GameProvider>
  </UserProvider>
);

export default RootLayout;













