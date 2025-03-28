import React, { useState, useContext, useEffect } from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  ScrollView,
  Button
} from "react-native";
import TownHallModal from "../../components/buildingsModals/TownHallModal";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import ScoutingPostModal from "../../components/buildingsModals/ScoutingPostModal";
import WarehouseModal from "../../components/buildingsModals/WarehouseModal";
import { GameContext } from "../../context/GameContext";
import { VillageContext } from "../../context/VillageContext";
import Countdown from "../../components/gameComponents/Countdown";
import GrainMillModal from "../../components/buildingsModals/GrainMillModal";
import BrickYardModal from "../../components/buildingsModals/BrickYardModal";
import SawMillModal from "../../components/buildingsModals/SawMillModal";
import IronFoundryModal from "../../components/buildingsModals/IronFoundryModal";
import BarracksModal from "../../components/buildingsModals/BarracksModal";
import AcademyModal from "../../components/buildingsModals/AcademyModal";
import AllianceHallModal from "../../components/buildingsModals/AllianceHall";

const { width, height } = Dimensions.get("window");

const buildingIcons = {
  "Town Hall": require("../../assets/images/townHallIcon.png"),
  "Scouting Post": require("../../assets/images/scoutingPost.png"),
  "Barracks": require("../../assets/images/barracksIcon.png"),
  "Grain Mill": require("../../assets/images/grainMillIcon.png"),
  "Warehouse": require("../../assets/images/wareHouseIcon.png"),
  "Brickyard": require("../../assets/images/brickyardIcon.png"),
  "Sawmill": require("../../assets/images/sawmillIcon.png"),
  "Iron Foundry": require("../../assets/images/ironFoundryIcon.png"),
  "Academy": require("../../assets/images/academyIcon.png"),
  "Alliance Hall": require("../../assets/images/AllianceHall.png"),
};
const buildingIconsBlack = {
  "Town Hall": require("../../assets/images/townHallIconBlack.png"),
  "Scouting Post": require("../../assets/images/scoutingPostBlack.png"),
  "Barracks": require("../../assets/images/barracksIconBlack.png"),
  "Grain Mill": require("../../assets/images/grainMillIconBlack.png"),
  "Warehouse": require("../../assets/images/wareHouseIconBlack.png"),
  "Brickyard": require("../../assets/images/brickyardIconBlack.png"),
  "Sawmill": require("../../assets/images/sawmillIconBlack.png"),
  "Iron Foundry": require("../../assets/images/ironFoundryIconBlack.png"),
  "Academy": require("../../assets/images/academyIconBlack.png"),
  "Alliance Hall": require("../../assets/images/AllianceHallBlack.png"),
};


export default function VillageScreen() {
  // Get building state and update function from VillageContext.
  const { buildings, updateBuildings, allBuildingTypes } = useContext(VillageContext);
  // Get resources and XP function from GameContext.
  const { resources, gainExperience, } = useContext(GameContext);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildMenuVisible, setBuildMenuVisible] = useState(false);
  const [selectedBuildSpot, setSelectedBuildSpot] = useState(null);

  // Function to open the building menu.
  const openBuildMenu = (spot) => {
    setSelectedBuildSpot(spot);
    setBuildMenuVisible(true);
  };

  // Function to build a new building.
  // ✅ Updated build logic
  const buildBuilding = (building) => {
    if (selectedBuildSpot) {
      updateBuildings(building, selectedBuildSpot);
      setBuildMenuVisible(false);
    }
  };


  // Get built buildings
  // ✅ Get built buildings only
  const builtBuildings = buildings.filter((b) => b.built === true);
  const builtNames = builtBuildings.map((b) => b.name.toLowerCase());

  const townHall = builtBuildings.find((b) => b.name === "Town Hall");
  const townHallLevel = townHall?.level || 0;

  // ✅ Show all buildings, exclude only already built ones
  const availableToBuild = Array.isArray(allBuildingTypes)
  ? allBuildingTypes.filter((b) => !builtNames.includes(b.name.toLowerCase()))
  : [];



  // Spots where buildings can be placed.
  const buildSpots = [
    { name: "Spot1", top: "47%", left: "49%" },
    { name: "Spot2", top: "60%", left: "27%" },
    { name: "Spot3", top: "40%", left: "45%" },
    { name: "Spot4", top: "40%", left: "68%" },
    { name: "Spot5", top: "60%", left: "61%" },
    { name: "Spot6", top: "54%", left: "17%" },
    { name: "Spot7", top: "47%", left: "74%" },
    { name: "Spot8", top: "62%", left: "43%" },
    { name: "Spot9", top: "47%", left: "15%" },
    { name: "Spot10", top: "40%", left: "20%" },
    { name: "Spot11", top: "54%", left: "70%" },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.centeredContainer}>
        <ImageBackground
          source={require("../../assets/images/villageMap.png")}
          style={styles.villageMap}
        >
          {/* Global Countdown Overlay */}
          <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 9999 }}>
            {buildings
              .filter(b => b.finishTime && new Date() < new Date(b.finishTime))
              .map(b => (
                <View key={b.name} style={styles.countDownContainer}>
                  <View
                    style={{
                      backgroundColor: "#DCC7A1",
                      padding: 5,
                      borderRadius: 50,
                      borderWidth: 4,
                      borderColor: "rgba(107, 57, 0, 0.90)",
                    }}
                  >
                    <Image style={{ width: 35, height: 35 }} source={buildingIcons[b.name]} />
                  </View>
                  <View style={{ marginTop: 15, marginLeft: -6 }}>
                    <View
                      style={{
                        backgroundColor: "#DCC7A1",
                        paddingRight: 15,
                        paddingLeft: 2,
                        borderTopWidth: 4,
                        borderBottomWidth: 4,
                        borderRightWidth: 4,
                        borderColor: "rgba(107, 57, 0, 0.80)",
                        borderBottomRightRadius: 12,
                      }}
                    >
                      <Countdown finishTime={b.finishTime} />
                    </View>
                  </View>
                </View>
              ))}
          </View>



          {buildSpots.map((spot, index) => {
            const buildingAtSpot = buildings.find(b => b.location === spot.name);
            const isCountingDown = buildingAtSpot
              ? new Date() < new Date(buildingAtSpot.finishTime)
              : false;

            return buildingAtSpot ? (
              <TouchableOpacity
                key={index}
                style={[styles.building, { top: spot.top, left: spot.left }]}
                onPress={() => setSelectedBuilding(buildingAtSpot.name)}
              >
                <Image
                  style={{ width: 50, height: 50, zIndex: 9999 }}
                  source={
                    isCountingDown
                      ? buildingIconsBlack[buildingAtSpot.name]
                      : buildingIcons[buildingAtSpot.name]
                  }
                />
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
          <View style={{ alignItems: "center" }}>
            <ScrollView style={styles.scrollContainer}>
              {availableToBuild.map((building, index) => {
                const canBuild = townHallLevel >= building.requiredTownHallLevel;
                return (
                  <View key={index} style={styles.buildOptionContainer}>
                    <TouchableOpacity
                      style={[styles.buildOption, !canBuild && styles.disabledOption]}
                      onPress={() => canBuild && buildBuilding(building)}
                      disabled={!canBuild}
                    >
                      <View style={styles.buildingInfo}>
                        <Image
                          style={{ width: 100, height: 100, zIndex: 9999 }}
                          source={buildingIcons[building.name]}
                        />
                        <Text style={styles.buildingText}>{building.name}</Text>
                        {canBuild ? (
                          <View>
                            <Text style={styles.costsText}>Costs</Text>
                            <View style={{ flexDirection: "row" }}>
                              <View style={styles.resourcesCostContainer}>
                                <Image source={require("../../assets/images/woodIcon.png")} style={{ height: 30, width: 30 }} />
                                <Text style={styles.resourceCost}>{building.resourceCost?.wood ?? 0}</Text>
                              </View>
                              <View style={styles.resourcesCostContainer}>
                                <Image source={require("../../assets/images/bricksIcon.png")} style={{ height: 30, width: 30 }} />
                                <Text style={styles.resourceCost}>{building.resourceCost?.clay ?? 0}</Text>
                              </View>
                              <View style={styles.resourcesCostContainer}>
                                <Image source={require("../../assets/images/ironIcon.png")} style={{ height: 30, width: 30 }} />
                                <Text style={styles.resourceCost}>{building.resourceCost?.iron ?? 0}</Text>
                              </View>
                            </View>
                          </View>
                        ) : (
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Image source={require("../../assets/images/lockIcon.png")} style={{ height: 30, width: 30 }} />
                            <Text style={styles.requirementText}>
                              Requires Town Hall Level {building.requiredTownHallLevel}
                            </Text>
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

      {selectedBuilding === "Town Hall" && (
        <TownHallModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Scouting Post" && (
        <ScoutingPostModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Warehouse" && (
        <WarehouseModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Grain Mill" && (
        <GrainMillModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Brickyard" && (
        <BrickYardModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Sawmill" && (
        <SawMillModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Iron Foundry" && (
        <IronFoundryModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Barracks" && (
        <BarracksModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Academy" && (
        <AcademyModal isVisible setIsVisible={setSelectedBuilding} />
      )}
      {selectedBuilding === "Alliance Hall" && (
        <AllianceHallModal isVisible setIsVisible={setSelectedBuilding} />
      )}
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
    color: "rgb(107, 57, 0)",
    paddingVertical: 3,
    paddingHorizontal: 30,
    marginTop: 34,
    fontWeight: "bold",
  },
  buildOption: {
    marginTop: 5,
    padding: 5,
    width: "100%",
    borderWidth: 2,
    borderColor: "#8B4513",
    borderTopWidth: 2,
    borderRadius: 8,
    backgroundColor: "rgba(182, 135, 81, 0.20)",
  },
  scrollContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "79%",
  },
  buildingText: {
    fontSize: 20,
    color: "rgb(107, 57, 0)",
    fontWeight: "bold",
  },
  costsText: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: "rgba(107, 57, 0, 0.70)",
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
  resourcesCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: "7%",
  },
  resourceCost: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    marginLeft: 3,
    color: "rgb(107, 57, 0)",
  },
  disabledOption: {
    backgroundColor: "rgba(182, 135, 81, 0.52)",
  },
  requirementText: {
    fontSize: 15,
    color: "rgb(107, 57, 0)",
    marginTop: 10,
    fontWeight: "bold",
  },
  countDownContainer: {
    borderRadius: 50,
    marginTop: 6,
    flexDirection: 'row'
  }
});
