import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import { VillageContext } from "../../context/VillageContext";
import { GameContext } from "../../context/GameContext";
import { UserContext } from "../../context/UserContext";
import Countdown from "../gameComponents/Countdown";

export default function ScoutingPostModal({ isVisible, setIsVisible }) {
    // Get building data and update function from VillageContext
    const { buildings, updateBuildings, buildMaterialsMax } = useContext(VillageContext);
    // Get resources, storage capacity values, and XP function from GameContext
    const { resources, buildMaterialsTotal, gainExperience, startStepCounting, isTracking, currentSteps, stepCountingDuration } = useContext(GameContext);
    const { user } = useContext(UserContext);

    // Find the Warehouse building
    const scoutingPost = buildings.find((b) => b.name === "Scouting Post");
    if (!scoutingPost) return null;

    // Calculate upgrade cost (20% increase per level)
    const upgradeCost = scoutingPost?.resourceCost
        ? {
            wood: Math.floor(scoutingPost.resourceCost.wood * 1.2),
            clay: Math.floor(scoutingPost.resourceCost.clay * 1.2),
            iron: Math.floor(scoutingPost.resourceCost.iron * 1.2),
        }
        : { wood: 0, clay: 0, iron: 0 }; // Default values to prevent errors

    const isUpgrading =
        scoutingPost.underConstruction &&
        scoutingPost.finishTime &&
        scoutingPost.finishTime > Date.now();

    // Find Town Hall
    const townHall = buildings.find((b) => b.name === "Town Hall");
    const townHallLevel = townHall ? townHall.level : 0;

    // Get the next upgrade level
    const nextLevel = scoutingPost.built ? scoutingPost.level + 1 : 1;

    // Required Town Hall level for the next Warehouse level
    const requiredTownHallLevel = scoutingPost.upgradeRequirement?.[nextLevel - 1] || 0;

    // Check if resources are sufficient
    const hasEnoughResources =
        resources.wood >= upgradeCost.wood &&
        resources.clay >= upgradeCost.clay &&
        resources.iron >= upgradeCost.iron;

    // Check if the Town Hall meets the requirement
    const meetsTownHallRequirement = townHallLevel >= requiredTownHallLevel;

    // Final upgrade check: Must have enough resources & correct Town Hall level
    const canUpgrade = hasEnoughResources && meetsTownHallRequirement;

    const formatDuration = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    };


    return (
        <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
            <View style={styles.modalContent}>
                <View style={{ flexDirection: "row" }}>
                    <Image
                        source={require("../../assets/images/scoutingPost.png")}
                        style={styles.buildingIcon}
                    />
                    <View>
                        <Text style={styles.modalTitle}>Scouting Post</Text>
                        <Text style={styles.levelText}>Level: {scoutingPost.level}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <View style={styles.storageContainer}>
                            <Text style={styles.storageText}>Scouting time</Text>
                            <Text style={styles.storageNumbers}>{formatDuration(stepCountingDuration)}</Text>
                        </View>
                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            <View style={styles.resourcesContainer}>
                                <Text style={styles.resourceText}>100 steps = </Text>
                                <View style={styles.resourceItem}>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.resourceName}>10</Text>
                                        <Image
                                            source={require("../../assets/images/woodIcon.png")}
                                            style={styles.resourceIcon}
                                        />
                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.resourceName}>10</Text>
                                        <Image
                                            source={require("../../assets/images/bricksIcon.png")}
                                            style={styles.resourceIcon}
                                        />
                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.resourceName}>10</Text>
                                        <Image
                                            source={require("../../assets/images/ironIcon.png")}
                                            style={styles.resourceIcon}
                                        />
                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={styles.resourceName}>10</Text>
                                        <Image
                                            source={require("../../assets/images/cropIcon.png")}
                                            style={styles.resourceIcon}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ alignItems: "center" }}>
                                <View style={styles.stepsTrackerContainer}>
                                    <Text style={styles.stepText}>Steps: {currentSteps}</Text>
                                    <TouchableOpacity style={[styles.scoutingButtonContainer, isTracking && styles.disabledButton]} onPress={startStepCounting}>
                                        <Text style={styles.scoutingText}>{isTracking ? "Scouting..." : "Start Scouting"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {scoutingPost.level < 10 ? (
                            <>
                                <View style={{ alignItems: "center", marginTop: '40' }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "99%" }}>
                                        <Text style={styles.upgradeTitle}>Upgrade:</Text>
                                        <Text style={styles.levelUpCapacityText}>Scouting time 10%</Text>
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
                                                    updateBuildings("Scouting Post", scoutingPost.location, resources, gainExperience);
                                                    setIsVisible(false);
                                                }
                                            }}
                                            disabled={!canUpgrade || isUpgrading}
                                        >
                                            <View style={styles.upgradebuttonContainer}>
                                                {isUpgrading ? (
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Countdown finishTime={scoutingPost.finishTime} />
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
                            <Text style={styles.maxLevelText}>🏛 Warehouse is at Max Level</Text>
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
    buildingIcon: {
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
    levelText: {
        fontSize: 18,
        marginLeft: 5,
        fontWeight: 'bold',
        color: 'rgba(107, 57, 0, 0.70)',
    },
    infoContainer: {
        marginTop: 7,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '94%',
        height: '72%',
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
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '100%',
        marginTop: 10,
        paddingVertical: 5,
        paddingLeft: 5
    },
    resourceItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 5,
        marginVertical: 2,
    },
    stepsTrackerContainer: {
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%"
    },
    stepText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'rgb(107, 57, 0)',
        marginTop: 3
    },
    scoutingButtonContainer: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
    },
    scoutingText: {
        color: "#8B4513",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
    resourceIcon: {
        width: 30,
        height: 30,
    },
    resourceName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#8B4513",
        marginTop: 5,
        marginLeft: 8
    },
    resourceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8B4513",
        marginTop: 7
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