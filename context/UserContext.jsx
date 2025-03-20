import React, { createContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  let API_URL;
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:3000"; // Android Emulator
  } else if (Platform.OS === "ios") {
    API_URL = "http:localhost:3000"; // iOS real device (use local network IP)
  } else {
    API_URL = "http://192.168.1.100:5000"; // Replace with your actual server IP
  }

  // ✅ Load user session from backend on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // ✅ Send cookies for authentication
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        console.log("✅ User session restored:", data);
        setUser(data.user);
      } catch (error) {
        console.log("🚪 User not logged in or session expired.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // ✅ Register a new user
  const registerUser = async (username, email, password, tribe, avatar) => {
    try {

      console.log(avatar)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Ensure cookies are included
        body: JSON.stringify({ username, email, password, tribe, avatar }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      console.log("✅ Registration Success:", data);
      setUser(data.user); // Automatically log in the user after registration

      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Registration Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  // ✅ Log in the user
  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Ensure cookies are handled automatically
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("✅ Login Success:", data);
      setUser(data.user); // ✅ Set user from backend response

      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Login Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  // ✅ Log out the user (backend request)
  const logout = async () => {
    try {
      console.log("🚪 Logging out...");

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // ✅ Ensure cookies are cleared in backend
      });

      // ✅ Log the response status for debugging
      console.log("🔍 Logout Response:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Logout API Error:", errorData);
        throw new Error(errorData.error || "Logout failed");
      }

      
      console.log("✅ Logout successful.");
    } catch (error) {
      console.error("❌ Logout Error:", error.message);
    }
  };


  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        registerUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};






