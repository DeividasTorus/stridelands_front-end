import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import Countdown from "../gameComponents/Countdown";
import { VillageContext } from "../../context/VillageContext";
import { GameContext } from "../../context/GameContext";
import { UserContext } from "../../context/UserContext";

export default function AcademyModal({ isVisible, setIsVisible }) {
    // Get building data and update function from VillageContext
    const { buildings, updateBuildings, buildMaterialsMax, troopsMax, totalTroops, warriors, levelUpWarrior, trainWarrior } = useContext(VillageContext);
    // Get resources, storage capacity values, and XP function from GameContext
    const { resources, buildMaterialsTotal, gainExperience, startStepCounting, isTracking, currentSteps, finishTime } = useContext(GameContext);
    const { user } = useContext(UserContext);

    // Find the Warehouse building
    const academy = buildings.find((b) => b.name === "Academy");
    if (!academy) return null;

    // Calculate upgrade cost (20% increase per level)
    const upgradeCost = academy?.resourceCost
        ? {
            wood: Math.floor(academy.resourceCost.wood * 1.2),
            clay: Math.floor(academy.resourceCost.clay * 1.2),
            iron: Math.floor(academy.resourceCost.iron * 1.2),
        }
        : { wood: 0, clay: 0, iron: 0 }; // Default values to prevent errors

    const isUpgrading =
        academy.underConstruction &&
        academy.finishTime &&
        academy.finishTime > Date.now();

    // Find Town Hall
    const townHall = buildings.find((b) => b.name === "Town Hall");
    const townHallLevel = townHall ? townHall.level : 0;

    // Get the next upgrade level
    const nextLevel = academy.built ? academy.level + 1 : 1;

    // Required Town Hall level for the next Warehouse level
    const requiredTownHallLevel = academy.upgradeRequirement?.[nextLevel - 1] || 0;

    // Check if resources are sufficient
    const hasEnoughResources =
        resources.wood >= upgradeCost.wood &&
        resources.clay >= upgradeCost.clay &&
        resources.iron >= upgradeCost.iron;

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

    const [currentView, setCurrentView] = useState("troops");
    const [selectedWarrior, setSelectedWarrior] = useState(null);
    const [selectedWarriors, setSelectedWarriors] = useState({});
    const [remainingCapacity, setRemainingCapacity] = useState(0);
    const [totalTrainingTime, setTotalTrainingTime] = useState(0);
    const [trainingEndTime, setTrainingEndTime] = useState(null);

    const barracks = buildings.find((b) => b.name === "Barracks");
    const barracksMaxTroops = barracks ? Math.round(barracks.troopsStorage * Math.pow(1.2, barracks.level)) : 10;
    const totalsTroops = warriors.reduce((total, warrior) => total + warrior.count, 0);

    useEffect(() => {
        setRemainingCapacity(barracksMaxTroops - totalsTroops);
    }, [totalsTroops, barracksMaxTroops]);

    useEffect(() => {
        if (selectedWarrior) {
            const updatedWarrior = warriors.find((w) => w.id === selectedWarrior.id);
            if (updatedWarrior) {
                setSelectedWarrior(updatedWarrior); // ✅ Update UI immediately
            }
        }
    }, [warriors]); // Runs whenever warriors change

    useEffect(() => {
        let totalTime = Object.entries(selectedWarriors).reduce((acc, [warriorId, count]) => {
            const warrior = warriors.find(w => w.id == warriorId);
            return acc + (warrior ? warrior.trainingTime * count : 0);
        }, 0);
        setTotalTrainingTime(totalTime);
    }, [selectedWarriors]);

    useEffect(() => {
        if (trainingEndTime) {
            const timer = setInterval(() => {
                if (Date.now() >= trainingEndTime) {
                    setTrainingEndTime(null);
                    setRemainingCapacity(barracksMaxTroops - warriors.reduce((total, warrior) => total + warrior.count, 0));
                    clearInterval(timer);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [trainingEndTime, warriors]);

    const handleTrainAll = () => {
        let totalTrainingCount = Object.values(selectedWarriors).reduce((a, b) => a + b, 0);

        if (totalTrainingCount > 0) {
            setTrainingEndTime(Date.now() + totalTrainingTime * 1000);

            Object.entries(selectedWarriors).forEach(([warriorId, count]) => {
                if (count > 0) {
                    trainWarrior(parseInt(warriorId), count);
                }
            });
            setSelectedWarriors({});
        }
    };


    // ✅ Get required Academy level for warrior upgrade
    const nextWarriorLevel = selectedWarrior ? selectedWarrior.level + 1 : 1;
    const requiredAcademyLevel = selectedWarrior?.upgradeRequirements[nextWarriorLevel - 1] || 9999;

    // ✅ Check if Academy meets the requirement
    const meetsAcademyRequirement = academy.level >= requiredAcademyLevel;

    // ✅ Check if player has enough resources for warrior upgrade
    const upgradeWarriorCost = {
        crop: Math.floor(selectedWarrior?.resourceCost.crop * Math.pow(1.5, nextWarriorLevel)),
        iron: Math.floor(selectedWarrior?.resourceCost.iron * Math.pow(1.5, nextWarriorLevel)),
    };

    const hasEnoughWarriorResources =
        resources.crop >= upgradeWarriorCost.crop &&
        resources.iron >= upgradeWarriorCost.iron;

    // ✅ Final condition: Can only upgrade if Academy level is high enough and resources are enough
    const canUpgradeWarrior = meetsAcademyRequirement && hasEnoughWarriorResources;

    const handleIncrease = (warriorId) => {
        setSelectedWarriors((prev) => {
            const newCount = (prev[warriorId] || 0) + 1;
            const totalSelectedTroops = Object.values(prev).reduce((a, b) => a + b, 0) + 1; // Include the new one

            if (totalsTroops + totalSelectedTroops > barracksMaxTroops) {
                return prev; // Don't update if over capacity
            }

            // Calculate new remaining capacity before updating state
            const newRemainingCapacity = barracksMaxTroops - (totalsTroops + totalSelectedTroops);

            // Update remaining capacity
            setRemainingCapacity(newRemainingCapacity);

            return { ...prev, [warriorId]: newCount };
        });
    };

    const handleDecrease = (warriorId) => {
        setSelectedWarriors((prev) => {
            if (!prev[warriorId] || prev[warriorId] === 0) {
                return prev; // Prevent decreasing below 0
            }

            const newCount = prev[warriorId] - 1;
            const totalSelectedTroops = Object.values(prev).reduce((a, b) => a + b, 0) - 1; // Remove one

            // Ensure total troops don't go negative and update capacity correctly
            const newRemainingCapacity = Math.min(
                barracksMaxTroops - (totalsTroops + totalSelectedTroops),
                barracksMaxTroops
            );

            setRemainingCapacity(newRemainingCapacity);

            return { ...prev, [warriorId]: newCount };
        });
    };


    const [intervalId, setIntervalId] = useState(null);

    const startCounter = (action, warriorId) => {
        let speed = 5; // Start slow (400ms per increment)

        // First tap should increase only ONCE
        const firstTimeout = setTimeout(() => {
            action(warriorId); // Start increasing
            const id = setInterval(() => {
                action(warriorId);
                speed = Math.max(speed * 0.9, 100); // Gradually speed up
            }, speed);
            setIntervalId(id);
        }, 400); // First delay before repeated action

        setIntervalId(firstTimeout);
    };

    const stopCounter = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const warriorsTrainingCosts = warriors.map((warrior) => ({
        id: warrior.id,
        name: warrior.name,
        crop: Math.floor(warrior.trainingCost.crop * Math.pow(1.2, warrior.level)),
        iron: Math.floor(warrior.trainingCost.iron * Math.pow(1.2, warrior.level)),
        trainingTime: warrior.trainingTime
    }));

    const totalCost = warriorsTrainingCosts.reduce(
        (acc, warrior) => {
            const count = selectedWarriors[warrior.id] || 0; // Get selected amount (default 0)
            acc.crop += warrior.crop * count;
            acc.iron += warrior.iron * count;
            return acc;
        },
        { crop: 0, iron: 0 }
    );

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${remainingSeconds}s`;
    };

    return (
        <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
            <View style={styles.modalContent}>
                <View style={{ flexDirection: "row" }}>
                    <Image
                        source={require("../../assets/images/academyIcon.png")}
                        style={styles.buildingIcon}
                    />
                    <View>
                        <Text style={styles.modalTitle}>Academy</Text>
                        <Text style={styles.levelText}>Level: {academy.level}</Text>
                    </View>
                </View>
                {currentView === "troops" && (
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.infoContainer}>
                            <View style={styles.storageContainer}>
                                {trainingEndTime ? (
                                    <View style={{ flexDirection: 'row', justifyContent: "space-between", }}>
                                        <Text style={styles.storageText}>Training Completion:</Text>
                                        <Countdown finishTime={trainingEndTime} />
                                    </View>
                                ) : (
                                    <View style={styles.storageContainer}>
                                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                            <Text style={styles.storageText}>Barracks Capacity:</Text>
                                            <Text style={styles.storageText}>{remainingCapacity}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <View style={{ alignItems: "center" }}>
                                <View style={styles.resourcesContainer}>
                                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                                        {warriors.map((warrior) => {
                                            // Find the computed training cost for the current warrior
                                            const warriorCost = warriorsTrainingCosts.find((w) => w.id === warrior.id);
                                            const warriorsLevel = warriors.find((w) => w.id === warrior.id);
                                            const academy = buildings.find((b) => b.name === "Academy");
                                            const canTrain =
                                                academy && academy.level >= warriorsLevel.requiredAcademyLevel;
                                            return (
                                                <TouchableOpacity
                                                    key={warrior.id}
                                                    onPress={() => {
                                                        canTrain &&
                                                            setSelectedWarrior(warrior);
                                                        setCurrentView("info");
                                                    }}
                                                    disabled={!canTrain}
                                                    style={[styles.troopsButtonContainer, !canTrain && styles.disabledOption]}
                                                >
                                                    {canTrain ? (
                                                        <View>
                                                            <View style={styles.resourceItem}>
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Image source={warriorImages[warrior.name]} style={styles.resourceIcon} />
                                                                    <Text style={styles.resourceName}>{warrior.name}</Text>
                                                                </View>
                                                                <View style={styles.counterContainer}>
                                                                    {/* Decrease Button */}
                                                                    <TouchableOpacity
                                                                        style={styles.counterButton}
                                                                        onPress={() => handleDecrease(warrior.id)}
                                                                        onPressIn={() => startCounter(handleDecrease, warrior.id)}
                                                                        onPressOut={stopCounter}
                                                                    >
                                                                        <Text style={styles.counterText}>-</Text>
                                                                    </TouchableOpacity>

                                                                    {/* Counter Display */}
                                                                    <Text style={styles.counterValue}>{selectedWarriors[warrior.id] || 0}</Text>

                                                                    {/* Increase Button */}
                                                                    <TouchableOpacity
                                                                        style={styles.counterButton}
                                                                        onPress={() => handleIncrease(warrior.id)}
                                                                        onPressIn={() => startCounter(handleIncrease, warrior.id)}
                                                                        onPressOut={stopCounter}
                                                                    >
                                                                        <Text style={styles.counterText}>+</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                            <View style={{ marginLeft: 50 }}>
                                                                <View key={warrior.id} style={{ marginBottom: 5, marginTop: -18 }}>
                                                                    {/* Resource Cost Row */}
                                                                    <View style={{ flexDirection: "row", width: "90%" }}>
                                                                        {/* Crop Cost */}
                                                                        <View style={styles.resourcesTrainingCostContainer}>
                                                                            <Image source={require("../../assets/images/cropIcon.png")} style={{ height: 25, width: 25 }} />
                                                                            <Text style={styles.resourceCost}>{warriorCost?.crop}</Text>
                                                                        </View>

                                                                        {/* Iron Cost */}
                                                                        <View style={styles.resourcesTrainingCostContainer}>
                                                                            <Image source={require("../../assets/images/ironIcon.png")} style={{ height: 25, width: 25 }} />
                                                                            <Text style={styles.resourceCost}>{warriorCost?.iron}</Text>
                                                                        </View>

                                                                        <View style={styles.resourcesTrainingCostContainer}>
                                                                            <Image source={require("../../assets/images/clockIcon.png")} style={{ height: 25, width: 25 }} />
                                                                            <Text style={styles.resourceCost}> {formatDuration(warriorCost?.trainingTime)}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ) : (
                                                        <View>
                                                            <View style={{ flexDirection: "row", alignItems: "center", margin: 10 }}>
                                                                <Image source={warriorImages[warrior.name]} style={styles.resourceIcon} />
                                                                <Image
                                                                    source={require("../../assets/images/lockIcon.png")}
                                                                    style={{ height: 30, width: 30, marginLeft: 10 }}
                                                                />
                                                                <Text style={styles.requirementText}>
                                                                    Requires Academy Level {warriorsLevel.requiredAcademyLevel}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-around", width: '100%' }}>
                                    <View>
                                        <Text style={styles.trainingCostText}>Total Training Cost</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                            <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                                                <Image source={require("../../assets/images/cropIcon.png")} style={{ height: 20, width: 20 }} />
                                                <Text style={styles.resourceTrainingCost}>{totalCost.crop}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row' }}>
                                                <Image source={require("../../assets/images/ironIcon.png")} style={{ height: 20, width: 20 }} />
                                                <Text style={styles.resourceTrainingCost}>{totalCost.iron}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.trainAllButton}
                                        onPress={handleTrainAll}
                                    >
                                        <Text style={styles.trainingButtonText}>Start Training</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                            {academy.level < 10 ? (
                                <>
                                    <View style={{ alignItems: "center", marginTop: -35 }}>
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
                                                        updateBuildings("Academy", academy.location, resources, gainExperience);
                                                        setIsVisible(false);
                                                    }
                                                }}
                                                disabled={!canUpgrade || isUpgrading}
                                            >
                                                <View style={styles.upgradebuttonContainer}>
                                                    {isUpgrading ? (
                                                        <View style={{ alignItems: 'center' }}>
                                                            <Countdown finishTime={academy.finishTime} />
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
                                <Text style={styles.maxLevelText}>🏛 Academy is at Max Level</Text>
                            )}
                        </View>
                    </View>
                )
                }
                {
                    currentView === "info" && selectedWarrior && (
                        <View style={{ alignItems: "center" }}>
                            <View style={styles.troopsInfoContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <Image source={warriorImages[selectedWarrior.name]} style={styles.infoImage} />
                                        <Text style={styles.troopTitle}>{selectedWarrior.name}</Text>
                                    </View>
                                    <View style={styles.statsContainer}>
                                        <View>
                                            <View style={{ alignItems: "center" }}>
                                                <Text
                                                    style={{
                                                        position: "absolute",
                                                        top: 8,
                                                        fontWeight: "bold",
                                                        fontSize: 23,
                                                        color: "rgba(107, 57, 0, 0.90)"
                                                    }}
                                                >
                                                    {selectedWarrior.level}
                                                </Text>
                                                <Image style={{ width: 63, height: 53 }} source={require("../../assets/images/lvlIcon.png")} />
                                            </View>
                                        </View>
                                        {/* <Text style={styles.statsTitle}>Stats</Text> */}
                                        <View style={styles.statsBottomLine}></View>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                                            <Text style={styles.infoText}>Attack:</Text>
                                            <Text style={styles.statsNumbers}>{selectedWarrior.attack}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                                            <Text style={styles.infoText}>Defense:</Text>
                                            <Text style={styles.statsNumbers}>{selectedWarrior.defense}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                                            <Text style={styles.infoText}>Speed:</Text>
                                            <Text style={styles.statsNumbers}>{selectedWarrior.speed}</Text>
                                        </View>
                                        <View style={styles.statsBottomLine}></View>
                                        <View>
                                            <Text style={styles.upgradeWarriorTitle}>Upgrade:</Text>
                                            <View style={{ alignItems: "center" }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%" }}>
                                                    <View style={styles.resourcesCostContainer}>
                                                        <Image
                                                            source={require("../../assets/images/cropIcon.png")}
                                                            style={{ height: 25, width: 25 }}
                                                        />
                                                        <Text style={styles.resourceCost}>{upgradeWarriorCost.crop}</Text>
                                                    </View>
                                                    <View style={styles.resourcesCostContainer}>
                                                        <Image
                                                            source={require("../../assets/images/ironIcon.png")}
                                                            style={{ height: 25, width: 25 }}
                                                        />
                                                        <Text style={styles.resourceCost}>{upgradeWarriorCost.iron}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.levelUpButton, (!canUpgradeWarrior || selectedWarrior.underTraining) && styles.disabledButton]}
                                                onPress={() => {
                                                    if (!selectedWarrior.underTraining && canUpgradeWarrior) {
                                                        levelUpWarrior(selectedWarrior.id);
                                                    }
                                                }}
                                                disabled={!canUpgradeWarrior || selectedWarrior.underTraining}
                                            >
                                                <Text style={styles.trainingButtonText && styles.disabledText}>
                                                    {selectedWarrior.underTraining
                                                        ? <Countdown finishTime={selectedWarrior.finishTime} />
                                                        : !meetsAcademyRequirement
                                                            ? `Requires Academy Level ${requiredAcademyLevel}`
                                                            : !hasEnoughWarriorResources
                                                                ? "Not Enough Resources"
                                                                : "Upgrade"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity title="Back to Troops" style={styles.backButton} onPress={() => setCurrentView("troops")} >
                                        <Text style={styles.trainingButtonText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )
                }
            </View >
        </SlidingModal >
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
        marginTop: 30,
        fontWeight: "bold",
    },
    levelText: {
        fontSize: 18,
        marginLeft: 5,
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
    storageText: {
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    trainingCostText: {
        fontSize: 14,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
        marginTop: 4
    },
    resourceTrainingCost: {
        fontSize: 14,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    storageNumbers: {
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    troopsButtonContainer: {
        borderWidth: 3,
        margin: 5,
        borderRadius: 8,
        borderColor: 'rgba(107, 57, 0, 0.43)',
    },
    resourcesContainer: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '100%',
        height: '66%',
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
        width: 45,
        height: 58,
    },
    resourceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "#8B4513",
        marginTop: 2,
        marginLeft: 12
    },
    counterContainer: {
        flexDirection: 'row'
    },
    counterButton: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#8B4513",
        paddingHorizontal: 8,
        marginHorizontal: 7,
        marginTop: -18,
    },
    counterText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#8B4513",
    },
    counterValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#8B4513",
        marginTop: -16
    },
    trainAllButton: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
        paddingHorizontal: 15,
        marginVertical: 8
    },
    trainingButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: 'rgba(107, 57, 0, 0.70)',
        textAlign: 'center'
    },
    resourceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8B4513",
    },
    upgradeText: {
        fontSize: 16,
        fontWeight: "bold",
        paddingHorizontal: 5,
        color: 'rgba(107, 57, 0, 0.70)',
    },
    resourcesCostContainer: {
        flexDirection: "row",
    },
    resourcesTrainingCostContainer: {
        flexDirection: "row",
        marginHorizontal: 10
    },
    resourceCost: {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 4,
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
    troopsInfoContainer: {
        marginTop: 7,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '94%',
        height: '83%',
    },
    infoImage: {
        width: 170,
        height: 260,
        resizeMode: 'cover',
    },
    troopTitle: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 25,
        fontWeight: "bold",
        color: "#8B4513",
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopColor: 'rgba(107, 57, 0, 0.43)',
        borderBottomColor: 'rgba(107, 57, 0, 0.43)'
    },
    statsContainer: {
        marginLeft: 8,
        width: '43%',
        paddingHorizontal: 5,
        marginTop: 50

    },
    infoTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10
    },
    infoText: {
        fontSize: 15,
        marginTop: 5,
        fontWeight: "bold",
        color: "#8B4513",
    },
    statsNumbers: {
        fontSize: 15,
        marginTop: 5,
        fontWeight: "bold",
        color: "#8B4513",
    },
    statsBottomLine: {
        borderBottomWidth: 5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomColor: 'rgba(107, 57, 0, 0.43)',
        marginTop: 6
    },
    levelUpButton: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 13,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
        marginTop: 8
    },
    backButton: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
        paddingHorizontal: 10,
        marginTop: 42
    },
    upgradeWarriorTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 2,
        color: 'rgba(107, 57, 0, 0.70)',
        marginBottom: 3,
        marginTop: 5
    },
    disabledButton: {
        paddingHorizontal: 5,
        paddingVertical: 5
    },
    disabledText: {
        fontSize: 14,
        fontWeight: "bold",
        color: 'rgba(107, 57, 0, 0.70)',
        textAlign: 'center'
    },
    disabledOption: {
        backgroundColor: "rgba(182, 135, 81, 0.52)",
    },
    requirementText: {
        fontSize: 15,
        color: "rgb(107, 57, 0)",
        marginTop: 2,
        fontWeight: "bold",
    },
});