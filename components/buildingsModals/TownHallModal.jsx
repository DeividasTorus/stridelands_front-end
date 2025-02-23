import React, { useContext } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import { GameContext } from "../../context/GameContext";
import {UserContext} from "../../context/UserContext";

export default function TownHallModal({ isVisible, setIsVisible }) {
  const { buildings, updateBuildings, resources } = useContext(GameContext);
  const { user, } = useContext(UserContext);

  const townHall = buildings.find((b) => b.name === "Town Hall"); // ✅ Find Town Hall data
  if (!townHall) return null;

  const upgradeCost = {
    wood: Math.floor(townHall.resourceCost.wood * 1.2), // 20% increase
    clay: Math.floor(townHall.resourceCost.clay * 1.2),
    iron: Math.floor(townHall.resourceCost.iron * 1.2),
  };

  const canUpgrade =
    resources.wood >= upgradeCost.wood &&
    resources.clay >= upgradeCost.clay &&
    resources.iron >= upgradeCost.iron;

  return (
    <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
      <View style={styles.modalContent}>
        <View style={{flexDirection: "row"}}>
          <Image source={require("../../assets/images/townHallIcon.png")} style={styles.buildingIcon} />
          <View>
        <Text style={styles.modalTitle}>Town Hall</Text>
        <Text style={styles.levelText}>Level: {townHall.level}</Text>
          </View>
        </View>
        <View style={{alignItems: "center"}}>
         <View style={styles.infoContainer}>
           <Text style={styles.villageName}>{user.name} Village</Text>
           <View style={styles.populationContainer}>
             <Text style={styles.populationText}>Village Population: </Text>
             <Text style={styles.populationNumbers}>200 / 150</Text>
           </View>
           <View>
             <Text>Grow population</Text>
           </View>
        {townHall.level < 10 ? (
          <>
            <Text style={styles.upgradeText}>Next Upgrade Cost:</Text>
            <Text style={styles.resourceText}>
              🪵 Wood: {upgradeCost.wood} | 🧱 Clay: {upgradeCost.clay} | ⚙️ Iron: {upgradeCost.iron}
            </Text>

            <TouchableOpacity
              style={[styles.upgradeButton, !canUpgrade && styles.disabledButton]}
              onPress={() => {
                if (canUpgrade) {
                  updateBuildings("Town Hall"); // ✅ Upgrade Town Hall
                  setIsVisible(false); // ✅ Close modal after upgrade
                }
              }}
              disabled={!canUpgrade}
            >
              <Text style={styles.upgradeButtonText}>
                {canUpgrade ? "Upgrade Town Hall" : "Not Enough Resources"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.maxLevelText}>🏛 Town Hall is at Max Level</Text>
        )}
     </View>
     </View>
      </View>
    </SlidingModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {

  },
  buildingIcon:{
    height: 80,
    width: 80,
    marginTop: 75,
    marginLeft: 15,
  },
  modalTitle: {
      fontSize: 30,
      color: 'rgb(107, 57, 0)',
      paddingVertical: 3,
      marginTop: 80,
      fontWeight: 'bold',
  },
  levelText:{
    fontSize: 18,
    marginLeft: 5,
    fontWeight: 'bold',
    color: 'rgba(107, 57, 0, 0.70)',
  },
  infoContainer:{
    marginTop: 7,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
    height: '72%',
  },
  villageName:{
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(107, 57, 0)',
  },
  populationContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    paddingHorizontal: 5
  },
  populationText:{
    fontSize: 16,
    color: 'rgba(107, 57, 0, 0.70)',
    fontWeight: 'bold',
  },
  populationNumbers:{
    fontSize: 16,
    color: 'rgba(107, 57, 0, 0.70)',
    fontWeight: 'bold',
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  resourceText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },

});

