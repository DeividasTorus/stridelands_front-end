import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("userToken");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);

          // ✅ If avatar was stored as a string (local require paths or URL), keep it as is
          if (parsedUser.avatar) {
            parsedUser.avatar = parsedUser.avatar; // No change needed
          }

          setUser(parsedUser);
          setToken(storedToken);
        } else {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("user");
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData, authToken) => {
    try {
      console.log("✅ Logging in...", { userData, authToken });

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("userToken", authToken);

      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error("❌ Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("❌ Logout Error:", error);
    }
  };

  // ✅ Update entire user profile (including avatar)
  const updateUser = async (updatedUserData) => {
    try {
      setUser(updatedUserData);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("❌ Error updating user data:", error);
    }
  };

  // ✅ Update only the user's avatar (store full image path)
  const updateUserAvatar = async (newAvatar) => {
    try {
      if (!user) return;

      console.log("🖼 Updating user avatar:", newAvatar);
      const updatedUser = { ...user, avatar: newAvatar };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("❌ Error updating avatar:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, isLoading, login, logout, updateUser, updateUserAvatar }}>
      {children}
    </UserContext.Provider>
  );
};





