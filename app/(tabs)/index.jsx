import React, { useState, useContext } from "react";
import { View, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, Text, Image, ScrollView } from "react-native";
import TownHallModal from "../../components/buildingsModals/TownHallModal";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import { GameContext } from "../../context/GameContext";
import WarehouseModal from "../../components/buildingsModals/WarehouseModal"; // ✅ Import Game Context

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
  const { buildings, updateBuildings } = useContext(GameContext); // ✅ Get buildings from context
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildMenuVisible, setBuildMenuVisible] = useState(false);
  const [selectedBuildSpot, setSelectedBuildSpot] = useState(null);

  // ✅ Function to open the building menu
  const openBuildMenu = (spot) => {
    setSelectedBuildSpot(spot);
    setBuildMenuVisible(true);
  };

  // ✅ Function to build a new building
  const buildBuilding = (buildingName) => {
    if (selectedBuildSpot) {
      updateBuildings(buildingName, selectedBuildSpot);
      setBuildMenuVisible(false);
    }
  };

  // ✅ Filter available buildings (those not yet built)
  const availableBuildings = buildings.filter((b) => !b.built).map((b) => b.name);

  // ✅ Spots where buildings can be placed
  const buildSpots = [
    { name: "Spot1", top: "47%", left: "49%" },
    { name: "Spot2", top: "46%", left: "31%" },
    { name: "Spot3", top: "40%", left: "45%" },
    { name: "Spot4", top: "42%", left: "71%" },
    { name: "Spot5", top: "58%", left: "50%" },
    { name: "Spot6", top: "53%", left: "17%" },
    { name: "Spot7", top: "49%", left: "71%" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.centeredContainer}>
        <ImageBackground
          source={require("../../assets/images/villageMap.png")}
          style={styles.villageMap}
        >
          {buildSpots.map((spot, index) => {
            const buildingAtSpot = buildings.find((b) => b.location === spot.name);

            return buildingAtSpot ? (
              <TouchableOpacity
                key={index}
                style={[styles.building, { top: spot.top, left: spot.left }]}
                onPress={() => setSelectedBuilding(buildingAtSpot.name)}
              >
                <Image style={{ width: 50, height: 50, zIndex: 9999 }} source={buildingIcons[buildingAtSpot.name]} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                style={[styles.buildButton, { top: spot.top, left: spot.left }]}
                onPress={() => openBuildMenu(spot.name)}
              />
            );
          })}
        </ImageBackground>
      </View>

      <SlidingModal isVisible={buildMenuVisible} setIsVisible={setBuildMenuVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose Building</Text>
          <View style={{ alignItems: 'center' }}>
          <ScrollView style={styles.scrollContainer}>
            {availableBuildings.map((buildingName, index) => {
              const building = buildings.find((b) => b.name === buildingName);
              if (!building) return null; // ✅ Prevent errors if building is undefined
              const townHall = buildings.find((b) => b.name === "Town Hall"); // ✅ Get Town Hall data
              const canBuild = townHall && townHall.level >= building.requiredTownHallLevel; // ✅ Unlock only if Town Hall reaches the required level
              return (
                <View key={index} style={styles.buildOptionContainer}>
                  <TouchableOpacity
                    style={[styles.buildOption, !canBuild && styles.disabledOption]} // ✅ Disable button if locked
                    onPress={() => canBuild && buildBuilding(building.name)}
                    disabled={!canBuild} // ✅ Prevent clicking on locked buildings
                  >
                    <View style={styles.buildingInfo}>
                      <Image style={{ width: 100, height: 100, zIndex: 9999 }} source={buildingIcons[building.name]} />
                      <Text style={styles.buildingText}>{building.name}</Text>
                      {canBuild ? (
                          <View>
                            <Text style={styles.costsText}>Costs</Text>
                          <View style={{flexDirection: 'row', }}>
                            <View style={styles.resourcesCostContainer}>
                              <Image source={require("../../assets/images/woodIcon.png")} style={{height: 30, width: 30}} />
                              <Text style={styles.resourceCost}>{building.resourceCost.wood}</Text>
                            </View>
                            <View style={styles.resourcesCostContainer}>
                              <Image source={require("../../assets/images/bricksIcon.png")} style={{height: 30, width: 30}} />
                              <Text style={styles.resourceCost}>{building.resourceCost.clay}</Text>
                            </View>
                            <View style={styles.resourcesCostContainer}>
                              <Image source={require("../../assets/images/ironIcon.png")} style={{height: 30, width: 30}}  />
                              <Text style={styles.resourceCost}>{building.resourceCost.iron}</Text>
                            </View>
                            </View>
                          </View>
                      ) : (
                          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                          <Image source={require("../../assets/images/lockIcon.png")} style={{height: 30, width: 30}} />
                        <Text style={styles.requirementText}> Requires Town Hall Level {building.requiredTownHallLevel}</Text>
                          </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          </View>
        </View>
      </SlidingModal>


      {selectedBuilding === "Town Hall" && <TownHallModal isVisible setIsVisible={setSelectedBuilding} />}
      {selectedBuilding === "Warehouse" && <WarehouseModal isVisible setIsVisible={setSelectedBuilding} />}
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
    color: 'rgb(107, 57, 0)',
    paddingVertical: 3,
    paddingHorizontal: 30,
    marginTop: 80,
    fontWeight: 'bold',
  },
  buildOption: {
    marginTop: 5,
    padding: 5,
    width: '100%',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderTopWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(182, 135, 81, 0.20)',
  },
  scrollContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
    height: '67%',
  },
  buildingText:{
    fontSize: 20,
    color: 'rgb(107, 57, 0)',
    fontWeight: 'bold',
  },
  costsText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'rgba(107, 57, 0, 0.70)',
  },
  buildOptionContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  buildingInfo: {
    flexDirection: "column",
    alignItems: "center",
    padding: 5,
  },
  resourcesCostContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: '7%',
  },
  resourceCost: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 3,
    color: 'rgb(107, 57, 0)',
  },

  disabledOption: {
    backgroundColor: 'rgba(182, 135, 81, 0.52)'
  },

  requirementText: {
    fontSize: 15,
    color: 'rgb(107, 57, 0)',
    marginTop: 10,
    fontWeight: "bold",
  },

});














