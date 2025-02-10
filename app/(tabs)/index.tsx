import React from "react";
import { View, ImageBackground, TouchableOpacity, StyleSheet, Alert, Dimensions, Text } from "react-native";

const { width, height } = Dimensions.get("window");

export default function VillageScreen() {
  const handleBuildingPress = (buildingName) => {
    Alert.alert(`You clicked on ${buildingName}`);
    // You can replace this with navigation to another screen
  };

  const buildings = [
    { name: "Town Hall", top: "48%", left: "45%" },
    { name: "Woodcutter", top: "55%", left: "25%" },
    { name: "Clay Pit", top: "65%", left: "50%" },
    { name: "Iron Mine", top: "70%", left: "75%" },
    { name: "Crops", top: "73%", left: "40%" },
  ];

  return (
    <View style={styles.container}>
      {/* Village Background */}
      <View style={styles.centeredContainer}>
        <ImageBackground
          source={require("../../assets/images/villageMap.png")} // Replace with your Travian-style background
          style={styles.villageMap}
        >
          {buildings.map((building, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.building, { top: building.top, left: building.left }]}
              onPress={() => handleBuildingPress(building.name)}
            >
              <Text style={styles.buildingText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    width: width * 1, // Reduce size of village map
    height: height * 0.45, // Keep it smaller and centered
    justifyContent: "center",
    alignItems: "center",
  },
  villageMap: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Ensures the image is fully visible
  },
  building: {
    position: "absolute",
    width: width * 0.08, // Dynamic sizing based on screen size
    height: width * 0.08,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight transparency for visibility
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buildingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});





