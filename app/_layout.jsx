import { Stack, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";
import InfoBar from "../components/gameComponents/InfoBar";
import { Provider } from "react-native-paper";

// ✅ Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppReady, setAppReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log("Starting to load images...");

        const images = [
          require("../assets/images/villageMap.png"),
          require("../assets/images/barbarian.jpg"),
          require("../assets/images/goldIcon.png"),
          require("../assets/images/woodIcon.png"),
          require("../assets/images/bricksIcon.png"),
          require("../assets/images/ironIcon.png"),
          require("../assets/images/cropIcon.png"),
          require("../assets/images/StrideLands.png"),
          require("../assets/images/cloud1.png"),
          require("../assets/images/cloud2.png"),
          require("../assets/images/modalFrame.png"),
          require("../assets/images/soldier.png"),
          require("../assets/images/xpIcon.png"),
          require("../assets/images/healthIcon.png"),
          require("../assets/images/swordIcon.png"),
        ];

        // ✅ Use Asset.loadAsync instead of .downloadAsync()
        await Asset.loadAsync(images);

        console.log("All images loaded successfully.");

        const token = await AsyncStorage.getItem("userToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error loading assets or checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);


  // ✅ Keep the splash screen visible until everything is loaded
  if (!isAppReady) {
    return null;
  }

  const showInfoBar = !segments.includes("auth");

  return (
    <><Provider>
      <StatusBar hidden={true} />
      {/*{isAuthenticated && showInfoBar && <InfoBar />}*/}
      {showInfoBar && <InfoBar />}
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="auth" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </Provider>
    </>
  );
}







