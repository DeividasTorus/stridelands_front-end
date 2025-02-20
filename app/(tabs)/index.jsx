import React, { useState } from "react";
import { View, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, Text, Image } from "react-native";
import TownHallModal from "../../components/buildingsModals/TownHallModal";
import SlidingModal from "../../components/gameComponents/SlidingModal";

const { width, height } = Dimensions.get("window");

const buildingIcons = {
  "Town Hall": require("../../assets/images/townHallIcon.png"),
  "Barracks": require("../../assets/images/barracksIcon.png"),
  "Grain Mill": require("../../assets/images/grainMillIcon.png"),
  "Warehouse": require("../../assets/images/wareHouseIcon.png"),
  "Brickyard": require("../../assets/images/brickyardIcon.png"),
  "Sawmill": require("../../assets/images/sawmillIcon.png"),
  "Iron Foundry": require("../../assets/images/ironFoundryIcon.png"),

};

export default function VillageScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [builtBuildings, setBuiltBuildings] = useState({});
  const [buildMenuVisible, setBuildMenuVisible] = useState(false);
  const [selectedBuildSpot, setSelectedBuildSpot] = useState(null);

  const openBuildMenu = (spot) => {
    setSelectedBuildSpot(spot);
    setBuildMenuVisible(true);
  };

  const buildBuilding = (buildingName) => {
    if (selectedBuildSpot) {
      setBuiltBuildings((prev) => ({ ...prev, [selectedBuildSpot]: buildingName }));
      setBuildMenuVisible(false);
    }
  };

  const availableBuildings = Object.keys(buildingIcons);
  const filteredAvailableBuildings = availableBuildings.filter(
    (building) => !Object.values(builtBuildings).includes(building)
  );

  const buildSpots = [
    { name: "Spot1", top: "47%", left: "49%" },
    { name: "Spot2", top: "46%", left: "31%" },
    { name: "Spot3", top: "40%", left: "45%" },
    { name: "Spot4", top: "42%", left: "71%" },
    { name: "Spot5", top: "58%", left: "50%" },
    { name: "Spot6", top: "53%", left: "17%" },
    { name: "Spot7", top: "49%", left: "71%" },
    // { name: "Spot8", top: "43%", left: "68%" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.centeredContainer}>
        <ImageBackground
          source={require("../../assets/images/villageMap.png")}
          style={styles.villageMap}
        >
          {buildSpots.map((spot, index) => (
            builtBuildings[spot.name] ? (
              <TouchableOpacity
                key={index}
                style={[styles.building, { top: spot.top, left: spot.left }]}
                onPress={() => setSelectedBuilding(builtBuildings[spot.name])}
              >
                <Image style={{ width: 50, height: 50, zIndex: 9999 }} source={buildingIcons[builtBuildings[spot.name]]} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                style={[styles.buildButton, { top: spot.top, left: spot.left }]}
                onPress={() => openBuildMenu(spot.name)}
              />
            )
          ))}
        </ImageBackground>
      </View>

      <SlidingModal isVisible={buildMenuVisible} setIsVisible={setBuildMenuVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose Building</Text>
          {filteredAvailableBuildings.map((building, index) => (
            <TouchableOpacity key={index} style={styles.buildOption} onPress={() => buildBuilding(building)}>
              <Text style={styles.buildingText}>{building}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setBuildMenuVisible(false)}>
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SlidingModal>

      
      {selectedBuilding === "Town Hall" && <TownHallModal isVisible setIsVisible={setSelectedBuilding} />}
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  buildButton: {
    position: "absolute",
    width: 32,
    height: 32,
    backgroundColor: "rgba(236, 236, 236, 0.36)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalTitle: {
    fontSize: 30,
    color: '#8B4513',
    marginTop: 170,
    fontWeight: 'bold',
  },
  buildOption: {
    padding: 10,
    backgroundColor: "white",
    marginVertical: 5,
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 10,
    color: "red",
    fontSize: 18,
  },
});













