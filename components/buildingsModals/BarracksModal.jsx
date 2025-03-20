import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import Countdown from "../gameComponents/Countdown";
import { VillageContext } from "../../context/VillageContext";
import { GameContext } from "../../context/GameContext";
import { UserContext } from "../../context/UserContext";

export default function BarracksModal({ isVisible, setIsVisible }) {
    // Get building data and update function from VillageContext
    const { buildings, updateBuildings, buildMaterialsMax, troopsMax, totalTroops, warriors } = useContext(VillageContext);
    // Get resources, storage capacity values, and XP function from GameContext
    const { resources, buildMaterialsTotal, gainExperience, startStepCounting, isTracking, currentSteps, finishTime } = useContext(GameContext);
    const { user } = useContext(UserContext);

    // Find the Warehouse building
    const barracks = buildings.find((b) => b.name === "Barracks");
    if (!barracks) return null;

    // Calculate upgrade cost (20% increase per level)
    const upgradeCost = barracks?.resourceCost
        ? {
            wood: Math.floor((barracks?.resourceCost?.wood ?? 0) * 1.2),
            clay: Math.floor(barracks.resourceCost.clay * 1.2),
            iron: Math.floor(barracks.resourceCost.iron * 1.2),
        }
        : { wood: 0, clay: 0, iron: 0 }; // Default values to prevent errors

    const isUpgrading =
        barracks.underConstruction &&
        barracks.finishTime &&
        barracks.finishTime > Date.now();

    // Find Town Hall
    const townHall = buildings.find((b) => b.name === "Town Hall");
    const townHallLevel = townHall ? townHall.level : 0;

    // Get the next upgrade level
    const nextLevel = barracks.built ? barracks.level + 1 : 1;

    // Required Town Hall level for the next Warehouse level
    const requiredTownHallLevel = barracks.upgradeRequirement?.[nextLevel - 1] || 0;

    // Check if resources are sufficient
    const hasEnoughResources =
        (resources?.wood ?? 0) >= (upgradeCost?.wood ?? 0) &&
        (resources?.clay ?? 0) >= (upgradeCost?.clay ?? 0) &&
        (resources?.iron ?? 0) >= (upgradeCost?.iron ?? 0);

    // Check if the Town Hall meets the requirement
    const meetsTownHallRequirement = townHallLevel >= requiredTownHallLevel;

    // Final upgrade check: Must have enough resources & correct Town Hall level
    const canUpgrade = hasEnoughResources && meetsTownHallRequirement;


    const warriorImages = {
        Swordsman: require("../../assets/images/swordsmanIcon.png"),
        Berserker: require("../../assets/images/berserkerIcon.png"),
        Archer: require("../../assets/images/archerIcon.png"),
        "Knight Raider": require("../../assets/images/knightRaiderIcon.png"),
    };

    return (
        <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
            <View style={styles.modalContent}>
                <View style={{ flexDirection: "row" }}>
                    <Image
                        source={require("../../assets/images/barracksIcon.png")}
                        style={styles.buildingIcon}
                    />
                    <View>
                        <Text style={styles.modalTitle}>Barracks</Text>
                        <Text style={styles.levelText}>Level: {barracks.level}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <View style={styles.storageContainer}>
                            <Text style={styles.storageText}>Troops: </Text>
                            <Text style={styles.storageNumbers}>
                                {troopsMax} / {totalTroops}
                            </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <View style={styles.resourcesContainer}>
                                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                                    {warriors.map((warrior) => (
                                        <View key={warrior.id} style={styles.resourceItem}>
                                            <View style={{ flexDirection: "row" }}>
                                                <Image
                                                    source={warriorImages[warrior.name]} // Use pre-defined image mapping
                                                    style={styles.resourceIcon}
                                                />
                                                <Text style={styles.resourceName}>{warrior.name}:</Text>
                                            </View>
                                            <Text style={styles.resourceText}>{warrior.count}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        {barracks.level < 10 ? (
                            <>
                                <View style={{ alignItems: "center", marginTop: -55 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "99%" }}>
                                        <Text style={styles.upgradeTitle}>Upgrade:</Text>
                                        <Text style={styles.levelUpCapacityText}>Barracks Capacity +20%</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: "99%" }}>
                                        <Text style={styles.upgradeText}>Costs:</Text>
                                        <View style={{ alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%" }}>
                                                <View style={styles.resourcesCostContainer}>
                                                    <Image
                                                        source={require("../../assets/images/woodIcon.png")}
                                                        style={{ height: 25, width: 25 }}
                                                    />
                                                    <Text style={styles.resourceCost}>{upgradeCost.wood}</Text>
                                                </View>
                                                <View style={styles.resourcesCostContainer}>
                                                    <Image
                                                        source={require("../../assets/images/bricksIcon.png")}
                                                        style={{ height: 25, width: 25 }}
                                                    />
                                                    <Text style={styles.resourceCost}>{upgradeCost.clay}</Text>
                                                </View>
                                                <View style={styles.resourcesCostContainer}>
                                                    <Image
                                                        source={require("../../assets/images/ironIcon.png")}
                                                        style={{ height: 25, width: 25 }}
                                                    />
                                                    <Text style={styles.resourceCost}>{upgradeCost.iron}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.upgradeButton, !canUpgrade && styles.disabledButton]}
                                            onPress={() => {
                                                if (!isUpgrading && canUpgrade) {
                                                    // Pass the current warehouse location to preserve it during upgrade.
                                                    updateBuildings("Barracks", barracks.location, resources, gainExperience);
                                                    setIsVisible(false);
                                                }
                                            }}
                                            disabled={!canUpgrade || isUpgrading}
                                        >
                                            <View style={styles.upgradebuttonContainer}>
                                                {isUpgrading ? (
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Countdown finishTime={barracks.finishTime} />
                                                    </View>
                                                ) : (
                                                    <Text style={styles.upgradeButtonText}>
                                                        {!meetsTownHallRequirement
                                                            ? `Requires Town Hall Level ${requiredTownHallLevel}`
                                                            : !hasEnoughResources
                                                                ? "Not Enough Resources"
                                                                : "Upgrade"}
                                                    </Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.maxLevelText}>🏛 Barracks is at Max Level</Text>
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
    scrollContainer: {
        flexGrow: 1,
    },
    buildingIcon: {
        height: 80,
        width: 80,
        marginTop: 25,
        marginLeft: 15,
    },
    modalTitle: {
        fontSize: 30,
        color: "rgb(107, 57, 0)",
        paddingVertical: 3,
        marginLeft: 5,
        marginTop: 30,
        fontWeight: "bold",
    },
    levelText: {
        fontSize: 18,
        marginLeft: 6,
        fontWeight: "bold",
        color: "rgba(107, 57, 0, 0.70)",
    },
    infoContainer: {
        marginTop: 7,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: "rgba(107, 57, 0, 0.43)",
        width: "94%",
        height: "83%",
    },
    storageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5
    },
    storageText: {
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    storageNumbers: {
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    resourcesContainer: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '90%',
        height: '74%',
        marginTop: 10
    },
    resourceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 10,
        marginVertical: 5,
    },
    resourceIcon: {
        width: 28,
        height: 35,
    },
    resourceName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#8B4513",
        marginTop: 12,
        marginLeft: 8
    },
    resourceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8B4513",
    },
    upgradeTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        paddingHorizontal: 5,
        color: 'rgba(107, 57, 0, 0.70)',
    },
    levelUpCapacityText: {
        fontSize: 14,
        fontWeight: "bold",
        color: 'rgba(107, 57, 0, 0.70)',
        marginTop: 12,
    },
    upgradeText: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
        paddingHorizontal: 5,
        color: 'rgba(107, 57, 0, 0.70)',
    },
    resourcesCostContainer: {
        flexDirection: "row",
    },
    resourceCost: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 6,
        marginLeft: 3,
        color: 'rgb(107, 57, 0)',
    },
    upgradebuttonContainer: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 5,
        marginTop: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
    },
    upgradeButtonText: {
        color: "#8B4513",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
});