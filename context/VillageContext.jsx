// VillageContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import { GameContext } from "./GameContext";

export const VillageContext = createContext();

export const VillageProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const { resources, updateResources, gainExperience, addNotification } = useContext(GameContext);
    const [isLoading, setIsLoading] = useState(true);

    // Buildings state
    const [buildings, setBuildings] = useState([
        { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50, crop: 0 }, buildTime: 3 },
        { id: 2, name: "Scouting Post", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50, crop: 0 }, buildTime: 2, stepCountingDuration: [10, 15, 20, 25] },
        { id: 3, name: "Academy", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2 },
        { id: 4, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crop: 0 }, buildTime: 2, troopsStorage: 10 },
        { id: 5, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2, productionRate: 5 },
        { id: 6, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2, baseStorage: 5000 },
        { id: 7, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crop: 0 }, buildTime: 2, productionRate: 5 },
        { id: 8, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2, productionRate: 5 },
        { id: 9, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2, productionRate: 5 },
        { id: 10, name: "Alliance Hall", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 5], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2 },
    ]);

    const [warriors, setWarriors] = useState([
        { id: 1, name: "Swordsman", level: 1, count: 0, resourceCost: { crop: 5, iron: 2 }, trainingCost: { crop: 10, iron: 5 }, trainingTime: 3, upgradingTime: 5, attack: 50, defense: 80, speed: 5, requiredAcademyLevel: 1, upgradeRequirements: [1, 2, 4, 5] },
        { id: 2, name: "Berserker", level: 1, count: 0, resourceCost: { crop: 7, iron: 4 }, trainingCost: { crop: 13, iron: 9 }, trainingTime: 3, upgradingTime: 5, attack: 100, defense: 50, speed: 5, requiredAcademyLevel: 2, upgradeRequirements: [1, 3, 5, 6] },
        { id: 3, name: "Archer", level: 1, count: 0, resourceCost: { crop: 4, iron: 3 }, trainingCost: { crop: 9, iron: 4 }, trainingTime: 3, upgradingTime: 5, attack: 80, defense: 70, speed: 6, requiredAcademyLevel: 3, upgradeRequirements: [1, 2, 4, 6] },
        { id: 4, name: "Knight Raider", level: 1, count: 0, resourceCost: { crop: 1, iron: 6 }, trainingCost: { crop: 14, iron: 20 }, trainingTime: 4, upgradingTime: 5, attack: 120, defense: 50, speed: 12, requiredAcademyLevel: 4, upgradeRequirements: [1, 2, 5, 8] },
    ]);


    // Calculate Warehouse storage capacity
    const warehouse = buildings.find((b) => b.name === "Warehouse");
    const warehouseLevel = warehouse ? warehouse.level : 0;

    // Ensure storage capacity only increases, even during upgrades
    const effectiveWarehouseLevel = warehouseLevel;

    const buildMaterialsMax = warehouse
        ? Math.round(warehouse.baseStorage * Math.pow(1.2, effectiveWarehouseLevel))
        : 5000;


    // Calculate Warehouse storage capacity
    const barracks = buildings.find((b) => b.name === "Barracks");
    const barracksLevel = barracks ? barracks.level : 0;

    // Ensure storage capacity only increases, even during upgrades
    const effectivebarracksLevel = barracksLevel;

    const troopsMax = barracks
        ? Math.round(barracks.troopsStorage * Math.pow(1.2, effectivebarracksLevel))
        : 10;

    const totalTroops = warriors.reduce((total, warrior) => total + warrior.count, 0);



    // Fetch building data on load
    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                // Reset to default buildings when user changes
                setBuildings([
                    { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50, crop: 0 }, buildTime: 3 },
                    { id: 2, name: "Scouting Post", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50, crop: 0 }, buildTime: 2, stepCountingDuration: [10, 15, 20, 25] },
                    { id: 3, name: "Academy", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2 },
                    { id: 4, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crop: 0 }, buildTime: 2, troopsStorage: 10 },
                    { id: 5, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2, productionRate: 5 },
                    { id: 6, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2, baseStorage: 5000 },
                    { id: 7, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crop: 0 }, buildTime: 2, productionRate: 5 },
                    { id: 8, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crop: 0 }, buildTime: 2, productionRate: 5 },
                    { id: 9, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2, productionRate: 5 },
                    { id: 10, name: "Alliance Hall", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 5], resourceCost: { wood: 300, clay: 250, iron: 200, crop: 0 }, buildTime: 2 },
                ]);
                setWarriors([
                    { id: 1, name: "Swordsman", level: 1, count: 0, resourceCost: { crop: 5, iron: 2 }, trainingCost: { crop: 10, iron: 5 }, trainingTime: 3, upgradingTime: 5, attack: 50, defense: 80, speed: 5, requiredAcademyLevel: 1, upgradeRequirements: [1, 2, 4, 5] },
                    { id: 2, name: "Berserker", level: 1, count: 0, resourceCost: { crop: 7, iron: 4 }, trainingCost: { crop: 13, iron: 9 }, trainingTime: 3, upgradingTime: 5, attack: 100, defense: 50, speed: 5, requiredAcademyLevel: 2, upgradeRequirements: [1, 3, 5, 6] },
                    { id: 3, name: "Archer", level: 1, count: 0, resourceCost: { crop: 4, iron: 3 }, trainingCost: { crop: 9, iron: 4 }, trainingTime: 3, upgradingTime: 5, attack: 80, defense: 70, speed: 6, requiredAcademyLevel: 3, upgradeRequirements: [1, 2, 4, 6] },
                    { id: 4, name: "Knight Raider", level: 1, count: 0, resourceCost: { crop: 1, iron: 6 }, trainingCost: { crop: 14, iron: 20 }, trainingTime: 4, upgradingTime: 5, attack: 120, defense: 50, speed: 12, requiredAcademyLevel: 4, upgradeRequirements: [1, 2, 5, 8] },
                ]);
                return;
            }

            try {
                setIsLoading(true);
                console.log("Fetching game data for user:", user.id);

                const storedBuildings = await AsyncStorage.getItem(`buildings_${user.id}`);
                if (storedBuildings) setBuildings(JSON.parse(storedBuildings));

                const storedWarriors = await AsyncStorage.getItem(`warriors_${user.id}`);
                if (storedWarriors) setWarriors(JSON.parse(storedWarriors));

            } catch (error) {
                console.error("❌ Error loading game data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [user]);


    useEffect(() => {
        const checkUpgrades = setInterval(() => {
            setBuildings((prevBuildings) => {
                let updated = false;
                const newBuildings = prevBuildings.map((b) => {
                    if (b.underConstruction && b.finishTime && b.finishTime <= Date.now()) {
                        updated = true;

                        // ✅ Add Notification Immediately
                        addNotification(
                            "Building Completed",
                            `${b.name} has been successfully ${b.built ? "upgraded to Level " + (b.level + 1) : "built"}.`
                        );

                        return {
                            ...b,
                            built: true,
                            underConstruction: false,
                            finishTime: null,
                            level: b.pendingLevel !== undefined ? b.pendingLevel : b.level,
                            resourceCost: b.pendingCost !== undefined ? b.pendingCost : b.resourceCost,
                            pendingLevel: undefined,
                            pendingCost: undefined,
                        };
                    }
                    return b;
                });

                if (updated && user) {
                    AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(newBuildings));
                }

                return newBuildings;
            });
        }, 1000);

        return () => clearInterval(checkUpgrades);
    }, [user]);



    useEffect(() => {
        const checkUpgrading = () => {
            setWarriors((prevWarriors) => {
                let updated = false;
                const newWarriors = prevWarriors.map((warrior) => {
                    if (warrior.underTraining && warrior.finishTime && warrior.finishTime <= Date.now()) {
                        updated = true;

                        // ✅ Add Notification for Training Completion
                        addNotification(
                            "Warrior Training Complete",
                            `${warrior.name} has reached Level ${warrior.pendingLevel}!`
                        );

                        return {
                            ...warrior,
                            underTraining: false, // Training finished
                            finishTime: null,
                            level: warrior.pendingLevel, // Apply new level
                            attack: Math.round(warrior.attack * 1.2),
                            defense: Math.round(warrior.defense * 1.2),
                            speed: Math.round(warrior.speed * 1.1),
                            resourceCost: warrior.pendingCost, // Update next level's cost
                            upgradingTime: warrior.pendingUpgradingTime, // ✅ Apply increased training time
                            pendingLevel: undefined,
                            pendingCost: undefined,
                            pendingUpgradingTime: undefined,
                        };
                    }
                    return warrior;
                });

                // ✅ Only update AsyncStorage if there's a change
                if (updated) {
                    AsyncStorage.setItem(`warriors_${user.id}`, JSON.stringify(newWarriors));
                }

                return newWarriors;
            });
        };

        // ✅ Use `setInterval` inside `useEffect`
        const trainingInterval = setInterval(() => {
            checkUpgrading();
        }, 1000); // Check every second

        return () => clearInterval(trainingInterval);
    }, [user]); // Run only when user changes



    const trainWarrior = async (warriorId, count) => {
        if (!warriors || !resources || !buildings) {
            console.error("Missing warriors, resources, or buildings data");
            return;
        }

        const warrior = warriors.find((w) => w.id === warriorId);
        if (!warrior) return;

        const barracks = buildings.find((b) => b.name === "Barracks");
        const barracksMaxTroops = barracks ? Math.round(barracks.troopsStorage * Math.pow(1.2, barracks.level)) : 200;
        const totalTroops = warriors.reduce((total, warrior) => total + warrior.count, 0);

        if (totalTroops + count > barracksMaxTroops) {
            alert("Not enough space in the Barracks!");
            return;
        }

        const costMultiplier = Math.pow(1.2, warrior.level);
        const totalCost = {
            crop: Math.floor(warrior.trainingCost.crop * costMultiplier * count),
            iron: Math.floor(warrior.trainingCost.iron * costMultiplier * count),
        };

        if (resources.crop < totalCost.crop || resources.iron < totalCost.iron) {
            alert(`Not enough resources to train ${count} ${warrior.name}(s)!`);
            return;
        }

        const newResources = {
            ...resources,
            crop: resources.crop - totalCost.crop,
            iron: resources.iron - totalCost.iron,
        };

        updateResources(newResources);

        const trainQueue = Array(count).fill(warriorId);
        const trainNext = async () => {
            // if (trainQueue.length === 0) {
            //     addNotification("Warrior Training Complete", `${count} ${warrior.name}(s) have been trained!`);
            //     return;
            // }

            const nextWarriorId = trainQueue.shift();
            const nextWarrior = warriors.find((w) => w.id === nextWarriorId);
            if (!nextWarrior) return;

            setTimeout(async () => {
                setWarriors((prev) => {
                    const newWarriors = prev.map((w) =>
                        w.id === nextWarriorId ? { ...w, count: w.count + 1 } : w
                    );
                    AsyncStorage.setItem(`warriors_${user.id}`, JSON.stringify(newWarriors));
                    return newWarriors;
                });

                trainNext();
            }, nextWarrior.trainingTime * 1000);
        };

        trainNext();
    };


    const levelUpWarrior = async (warriorId) => {
        setWarriors((prevWarriors) => {
            const updatedWarriors = prevWarriors.map((warrior) => {
                if (warrior.id === warriorId) {
                    const nextLevel = warrior.level + 1;

                    // ✅ Find the Academy building
                    const academy = buildings.find((b) => b.name === "Academy");
                    const academyLevel = academy ? academy.level : 0;

                    // ✅ Get required Academy level for this upgrade
                    const requiredAcademyLevel = warrior.upgradeRequirements[nextLevel - 2]; // Adjust index (level 2 -> index 0)

                    // ✅ Check if Academy level is high enough for upgrade
                    if (academyLevel < requiredAcademyLevel) {
                        alert(`You need Academy Level ${requiredAcademyLevel} to upgrade ${warrior.name} to Level ${nextLevel}!`);
                        return warrior; // Return unchanged if the Academy level is too low
                    }

                    // ✅ Training time increases by 20% per level
                    const newTrainingTime = Math.round(warrior.upgradingTime * 1.2);


                    // Calculate new resource cost (scaling per level)
                    const costMultiplier = Math.pow(1.5, nextLevel);
                    const cost = {
                        crop: Math.floor(warrior.resourceCost.crop * costMultiplier),
                        iron: Math.floor(warrior.resourceCost.iron * costMultiplier),
                    };

                    // Check if the player has enough resources
                    if (
                        resources.crop < cost.crop ||
                        resources.iron < cost.iron
                    ) {
                        alert(`Not enough resources to upgrade ${warrior.name} to Level ${nextLevel}!`);
                        return warrior; // Return unchanged if not enough resources
                    }

                    // Deduct resources immediately
                    updateResources({
                        ...resources,
                        crop: resources.crop - cost.crop,
                        iron: resources.iron - cost.iron,
                    });

                    // Set new finish time (increased training time)
                    const finishTime = Date.now() + newTrainingTime * 1000;

                    return {
                        ...warrior,
                        underTraining: true, // Flag to show that the warrior is leveling up
                        finishTime,
                        pendingLevel: nextLevel, // Store next level but apply only after countdown
                        pendingCost: cost, // Store new cost for later
                        pendingUpgradingTime: newTrainingTime, // Store new training time for later
                    };
                }
                return warrior;
            });

            return [...updatedWarriors]; // Return new state to trigger UI update
        });

        // Persist updated warriors with training info
        await AsyncStorage.setItem(`warriors_${user.id}`, JSON.stringify(warriors));
    };




    // Function to build or upgrade a building, deduct resources, and award XP
    const updateBuildings = async (buildingName, location) => {
        const buildingIndex = buildings.findIndex((b) => b.name === buildingName);
        if (buildingIndex === -1) return;

        const building = buildings[buildingIndex];

        // Find Town Hall
        const townHall = buildings.find((b) => b.name === "Town Hall");
        const townHallLevel = townHall ? townHall.level : 0;

        // Check if the upgrade is allowed based on Town Hall level
        const nextLevel = building.built ? building.level + 1 : 1;
        const requiredTownHallLevel = building.upgradeRequirement?.[nextLevel - 1] || 0;

        if (townHallLevel < requiredTownHallLevel) {
            alert(`You need Town Hall Level ${requiredTownHallLevel} to upgrade ${building.name} to Level ${nextLevel}!`);
            return;
        }

        // Calculate cost (adjust multiplier for upgrades)
        const costMultiplier = building.built ? 1.2 : 1;
        const cost = {
            wood: Math.floor(building.resourceCost.wood * costMultiplier),
            clay: Math.floor(building.resourceCost.clay * costMultiplier),
            iron: Math.floor(building.resourceCost.iron * costMultiplier),
            crop: Math.floor(building.resourceCost.crop * costMultiplier),
        };

        // Check if player has enough resources
        if (
            resources.wood < cost.wood ||
            resources.clay < cost.clay ||
            resources.iron < cost.iron ||
            resources.crop < cost.crop
        ) {
            alert("Not enough resources!");
            return;
        }

        // Deduct resources immediately
        updateResources({
            ...resources,
            wood: resources.wood - cost.wood,
            clay: resources.clay - cost.clay,
            iron: resources.iron - cost.iron,
            crop: resources.crop - cost.crop,
        });

        const finishTime = Date.now() + building.buildTime * 1000;

        // Update building to mark it under construction
        setBuildings((prevBuildings) => {
            const newBuildings = [...prevBuildings];
            newBuildings[buildingIndex] = {
                ...building,
                underConstruction: true,
                finishTime,
                pendingLevel: nextLevel,
                pendingCost: cost,
                location: building.built ? building.location : location,
            };
            // Persist the updated state.
            AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(newBuildings));
            return newBuildings;
        });

        // XP reward calculation
        const xpReward = 20 * nextLevel;

        // When the countdown ends, update the building's level and cost.
        setTimeout(async () => {
            setBuildings((prevBuildings) => {
                const newBuildings = [...prevBuildings];
                const currentBuilding = newBuildings[buildingIndex];

                // If upgrading Scouting Post, update stepCountingDuration
                let updatedStepDuration = currentBuilding.stepCountingDuration;
                if (currentBuilding.name === "Scouting Post" && currentBuilding.stepCountingDuration) {
                    updatedStepDuration = currentBuilding.stepCountingDuration[nextLevel - 1] || currentBuilding.stepCountingDuration[currentBuilding.stepCountingDuration.length - 1];
                }

                // If upgrading Grain Mill, update production rate
                let updatedProduction = currentBuilding.productionRate;
                if (currentBuilding.name === "Grain Mill") {
                    updatedProduction = Math.round(currentBuilding.productionRate * Math.pow(1.2, nextLevel));
                }

                if (currentBuilding.name === "Brickyard") {
                    updatedProduction = Math.round(currentBuilding.productionRate * Math.pow(1.2, nextLevel));
                }

                if (currentBuilding.name === "Sawmill") {
                    updatedProduction = Math.round(currentBuilding.productionRate * Math.pow(1.2, nextLevel));
                }

                if (currentBuilding.name === "Iron Foundry") {
                    updatedProduction = Math.round(currentBuilding.productionRate * Math.pow(1.2, nextLevel));
                }



                newBuildings[buildingIndex] = {
                    ...currentBuilding,
                    built: true,
                    underConstruction: false,
                    finishTime: null,
                    level: currentBuilding.pendingLevel,
                    resourceCost: currentBuilding.pendingCost,
                    pendingLevel: undefined,
                    pendingCost: undefined,
                    stepCountingDuration: updatedStepDuration, // Update step duration for Scouting Post
                    productionRate: updatedProduction, // ✅ Update Grain Mill production
                };

                // Persist updated state
                AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(newBuildings));
                return newBuildings;
            });

            // ✅ Add Notification
            addNotification(
                "Building Completed",
                `${building.name} has been successfully ${building.built ? "upgraded to Level " + (building.level + 1) : "built"}.`
            );

            await gainExperience(xpReward);
        }, building.buildTime * 1000);
    };





    return (
        <VillageContext.Provider
            value={{
                isLoading,
                buildings,
                buildMaterialsMax,
                troopsMax,
                totalTroops,
                warriors,
                updateBuildings,
                levelUpWarrior, // ✅ Exposing the new function
                trainWarrior,
            }}
        >
            {children}
        </VillageContext.Provider>
    );
};
