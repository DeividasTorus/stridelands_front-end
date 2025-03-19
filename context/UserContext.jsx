import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

  let API_URL;

  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:5000"; // Android Emulator
  } else if (Platform.OS === "ios") {
    API_URL = "http://localhost:3000"; // iOS phone with atomis ip, http://localhost:5000 to ios emulator
  } else {
    API_URL = "http://192.168.1.100:5000"; // Replace with your real IP
  }

  const registerUser = async (username, email, password, tribe) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, tribe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      console.log("✅ Registration Success:", data);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Registration Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("✅ Login Success:", data);

      // Assuming the backend returns a user object and a token
      setUser(data.user);
      setToken(data.token);

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error("❌ Login Error:", error.message);
      return { success: false, error: error.message };
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
    <UserContext.Provider value={{ user, token, isLoading, registerUser, loginUser, logout, updateUser, updateUserAvatar }}>
      {children}
    </UserContext.Provider>
  );
};





