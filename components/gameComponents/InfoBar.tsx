import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView } from "react-native";
import { Asset } from "expo-asset";
import { useRouter } from "expo-router";

export default function InfoBar() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadResources() {
      try {
        await Asset.loadAsync([
            require("../../assets/images/barbarian.jpg"),
            require("../../assets/images/goldIcon.png"),
            require("../../assets/images/woodIcon.png"),
            require("../../assets/images/bricksIcon.png"),
            require("../../assets/images/ironIcon.png"),
            require("../../assets/images/cropIcon.png"),
        ]); // Preload all images
        setIsImageLoaded(true);
      } catch (error) {
        console.error("Error loading images:", error);
        setIsImageLoaded(false);
      }
    }

    loadResources();
  }, []);

  useEffect(() => {
    if (isImageLoaded) {
      const fetchUserData = async () => {
        try {
          const fetchedUser = {
            name: "Player1",
            icon: require("../../assets/images/barbarian.jpg"),
            experience: 300,
            maxExperience: 500,
          };
          const fetchedResources = [
            { name: "Gold", value: 200, icon: require("../../assets/images/goldIcon.png") },
            { name: "Wood", value: 1000, icon: require("../../assets/images/woodIcon.png") },
            { name: "Clay", value: 800, icon: require("../../assets/images/bricksIcon.png") },
            { name: "Iron", value: 600, icon: require("../../assets/images/ironIcon.png") },
            { name: "Crop", value: 200, icon: require("../../assets/images/cropIcon.png") },
          ];
          setUser(fetchedUser);
          setResources(fetchedResources);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [isImageLoaded]);

  if (!isImageLoaded || !user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* User and Actions Section */}
                <View style={styles.userAndActionsSection}>
                    {/* User Info */}
                    <View style={styles.userSection}>
                        <Image source={user.icon} style={styles.userIcon} />
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{user.name}</Text>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { width: `${(user.experience / user.maxExperience) * 100}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionText}>💬</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionText}>🔔</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/auth/register")}>
                            <Text style={styles.actionText}>⚙️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.resourcesSection}>
                    {resources.map((resource) => (
                        <View key={resource.name} style={styles.resourceItem}>
                            <Image source={resource.icon} style={styles.resourceIcon} />
                            <Text style={styles.resourceText}>{resource.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 0,
        backgroundColor: "#F4E2C8", // Matches the InfoBar background color
    },
    container: {
        backgroundColor: "#F4E2C8",
        paddingHorizontal: 10,
        paddingTop: Platform.OS === "ios" ? 0 : 20,
        borderBottomWidth: 2,
        borderColor: "#8B4513",
        width: "100%", // Fill entire screen width
    },
    userAndActionsSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    userIcon: {
        width: 60,
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
    },
    userInfo: {
        marginLeft: 10,
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#8B4513",
    },
    progressBarContainer: {
        width: 100,
        height: 10,
        backgroundColor: "#DDD",
        borderRadius: 5,
        overflow: "hidden",
        marginTop: 5,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#8B4513",
    },
    actionsSection: {
        flexDirection: "row",
    },
    actionButton: {
        marginHorizontal: 8,
        borderRadius: 5,
    },
    actionText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#8B4513",
    },
    resourcesSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    resourceItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 5,
        marginVertical: 5,
    },
    resourceIcon: {
        width: 25,
        height: 25,
        marginRight: 5,
    },
    resourceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8B4513",
    },
});