import React, { useEffect, useState, useContext } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View } from "react-native";
import { Asset } from "expo-asset";
import InfoBar from "../components/gameComponents/InfoBar";
import { Provider } from "react-native-paper";
import { UserProvider, UserContext } from "../context/UserContext";
import { GameProvider } from "../context/GameContext";
import { VillageProvider } from "../context/VillageContext";
import { AllianceProvider } from "../context/AllianceContext";

SplashScreen.preventAutoHideAsync();

const RootLayoutContent = () => {
  const [isAppReady, setAppReady] = useState(false);
  const { user, isLoading, setUser, setToken } = useContext(UserContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log("⏳ Loading assets and user data...");

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
          require("../assets/images/townHallIconBlack.png"),
          require("../assets/images/barracksIconBlack.png"),
          require("../assets/images/grainMillIconBlack.png"),
          require("../assets/images/wareHouseIconBlack.png"),
          require("../assets/images/brickyardIconBlack.png"),
          require("../assets/images/sawmillIconBlack.png"),
          require("../assets/images/ironFoundryIconBlack.png"),
          require("../assets/images/lockIcon.png"),
          require("../assets/images/ironFoundryIcon.png"),
          require("../assets/images/ironFoundryIconBlack.png"),
          require("../assets/images/scoutingPost.png"),
          require("../assets/images/scoutingPostBlack.png"),
          require("../assets/images/cropsField.png"),
          require("../assets/images/brickYard.png"),
          require("../assets/images/sawMill.png"),
          require("../assets/images/ironFoundry.png"),
          require("../assets/images/berserkerIcon.png"),
          require("../assets/images/swordsmanIcon.png"),
          require("../assets/images/archerIcon.png"),
          require("../assets/images/knightRaiderIcon.png"),
          require("../assets/images/academyIcon.png"),
          require("../assets/images/academyIconBlack.png"),
          require("../assets/images/AllianceHall.png"),
          require("../assets/images/AllianceHallBlack.png"),
        ];

        await Asset.loadAsync(images);
        console.log("✅ Assets loaded successfully.");

        // ✅ Check authentication via backend
        const checkAuth = async () => {
          try {
            const response = await fetch(`${API_URL}/auth/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`, // Send token for validation
              },
            });

            if (!response.ok) throw new Error("Invalid token");

            const data = await response.json();
            console.log("✅ Authenticated user:", data);

            setUser(data.user);
            setToken(data.token);
          } catch (error) {
            console.log("🚪 No valid session, redirecting to login...");
            setUser(null);
            setToken(null);
          }
        };

        await checkAuth();
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
        router.replace("/auth");
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

const RootLayout = () => (
  <UserProvider>
    <GameProvider>
      <VillageProvider>
        <AllianceProvider>
          <RootLayoutContent />
        </AllianceProvider>
      </VillageProvider>
    </GameProvider>
  </UserProvider>
);

export default RootLayout;
