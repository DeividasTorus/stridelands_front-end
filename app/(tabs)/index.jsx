import React, { useEffect, useRef, useState } from "react";
import { View, ImageBackground, TouchableOpacity, StyleSheet, Alert, Dimensions, Text, Animated } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";

const { width, height } = Dimensions.get("window");

export default function VillageScreen() {

  const [buildingsModalVisible, setBuildingsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const handleBuildingPress = (buildingName) => {
    setSelectedBuilding(buildingName);
    setBuildingsModalVisible(true);
  };

  const buildings = [
    { name: "Town Hall", top: "44%", left: "44%" },
    { name: "Woodcutter", top: "53%", left: "17%" },
    { name: "Clay Pit", top: "48%", left: "5%" },
    { name: "Crops", top: "49%", left: "83%" },
    { name: "IronMine", top: "65%", left: "48%" },
  ];


  const cloud1 = useRef(new Animated.Value(-1000)).current;
  const cloud2 = useRef(new Animated.Value(-1000)).current; // Starts offscreen on the right

  useEffect(() => {
    const animateCloud = (cloudAnim, startPos, endPos, speed, delay = 0) => {
      const loopAnimation = () => {
        cloudAnim.setValue(startPos);
        Animated.timing(cloudAnim, {
          toValue: endPos,
          duration: speed,
          useNativeDriver: false,
        }).start(() => loopAnimation());
      };
      setTimeout(loopAnimation, delay); // Start after delay
    };

    // Cloud 1 moves left to right
    animateCloud(cloud1, -1000, width, 120000);

    // Cloud 2 starts when Cloud 1 reaches the middle of the screen
    setTimeout(() => {
      animateCloud(cloud2, -1000, width, 120000);
    }, 60000); // Halfway through Cloud 1's journey

  }, []);

  return (
    <View style={styles.container}>
      {/* Moving Clouds */}
      <Animated.Image
        source={require("../../assets/images/cloud1.png")}
        style={[styles.cloud, { top: height * -0.12, transform: [{ translateX: cloud1 }] }]}
      />
      <Animated.Image
        source={require("../../assets/images/cloud2.png")}
        style={[styles.cloud, { top: height * -0.12, transform: [{ translateX: cloud2 }] }]}
      />

      {/* Village Background */}
      <View style={styles.centeredContainer}>
        <ImageBackground
          source={require("../../assets/images/villageMap.png")}
          style={styles.villageMap}
        >
          {buildings.map((building, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.building, { top: building.top, left: building.left }]}
              onPress={() => {
                handleBuildingPress(building.name);
                setBuildingsModalVisible(true);
              }}
            >
              <Text style={styles.buildingText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </ImageBackground>
      </View>
      <SlidingModal isVisible={buildingsModalVisible} setIsVisible={setBuildingsModalVisible}>
        <Text style={styles.modalTitle}>
          {selectedBuilding}
        </Text>
      </SlidingModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  villageMap: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  building: {
    position: "absolute",
    width: width * 0.07,
    height: width * 0.07,
    backgroundColor: "rgb(247, 206, 145)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgb(80, 59, 28)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  buildingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  cloud: {
    position: "absolute",
    width: 1000, // Bigger clouds
    height: 400,
    opacity: 0.5,
    zIndex: 99
  },
  modalTitle: {
    fontSize: 30,
    color: '#8B4513',
    marginTop: 170,
    fontWeight: 'bold'
  },
});












