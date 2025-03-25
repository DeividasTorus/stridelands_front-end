// VillageContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import { GameContext } from "./GameContext";
import { Platform } from "react-native";

export const VillageContext = createContext();

export const VillageProvider = ({ children }) => {
    const baseBuildingData = {
        "Warehouse": { baseStorage: 5000 },
        "Barracks": { troopsStorage: 10 },
        "Scouting Post": { stepCountingDuration: [60, 90, 120, 150, 180, 210] },
        "Grain Mill": { productionRate: 5, },
        "Sawmill": { productionRate: 5, },
        "Brickyard": { productionRate: 5, },
        "Iron Foundry": { productionRate: 5, },
    };
    const { user } = useContext(UserContext);
    const { resources, updateResources, gainExperience, addNotification } = useContext(GameContext);
    const [isLoading, setIsLoading] = useState(true);

    const toCamelCaseKeys = (obj) => {
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
                toCamelCaseKeys(value),
            ])
        );
    };


    // const [buildings, setBuildings] = useState([
    //     { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50, crops: 0 }, buildTime: 3 },
    //     { id: 2, name: "Scouting Post", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50, crops: 0 }, buildTime: 2, stepCountingDuration: [10, 15, 20, 25] },
    //     { id: 3, name: "Academy", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crops: 0 }, buildTime: 2 },
    //     { id: 4, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crops: 0 }, buildTime: 2, troopsStorage: 10 },
    //     { id: 5, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crops: 0 }, buildTime: 2, productionRate: 5 },
    //     { id: 6, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200, crops: 0 }, buildTime: 2, baseStorage: 5000 },
    //     { id: 7, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100, crops: 0 }, buildTime: 2, productionRate: 5 },
    //     { id: 8, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20, crops: 0 }, buildTime: 2, productionRate: 5 },
    //     { id: 9, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200, crops: 0 }, buildTime: 2, productionRate: 5 },
    //     { id: 10, name: "Alliance Hall", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 3, 4, 5], resourceCost: { wood: 300, clay: 250, iron: 200, crops: 0 }, buildTime: 2 },
    // ]);

    const [buildings, setBuildings] = useState([]);
    const [allBuildingTypes, setAllBuildingTypes] = useState([]); // ✅ All building types for build menu
    const [warriors, setWarriors] = useState([
        { id: 1, name: "Swordsman", level: 1, count: 0, resourceCost: { crops: 5, iron: 2 }, trainingCost: { crops: 10, iron: 5 }, trainingTime: 3, upgradingTime: 5, attack: 50, defense: 80, speed: 5, requiredAcademyLevel: 1, upgradeRequirements: [1, 2, 4, 5] },
        { id: 2, name: "Berserker", level: 1, count: 0, resourceCost: { crops: 7, iron: 4 }, trainingCost: { crops: 13, iron: 9 }, trainingTime: 3, upgradingTime: 5, attack: 100, defense: 50, speed: 5, requiredAcademyLevel: 2, upgradeRequirements: [1, 3, 5, 6] },
        { id: 3, name: "Archer", level: 1, count: 0, resourceCost: { crops: 4, iron: 3 }, trainingCost: { crops: 9, iron: 4 }, trainingTime: 3, upgradingTime: 5, attack: 80, defense: 70, speed: 6, requiredAcademyLevel: 3, upgradeRequirements: [1, 2, 4, 6] },
        { id: 4, name: "Knight Raider", level: 1, count: 0, resourceCost: { crops: 1, iron: 6 }, trainingCost: { crops: 14, iron: 20 }, trainingTime: 4, upgradingTime: 5, attack: 120, defense: 50, speed: 12, requiredAcademyLevel: 4, upgradeRequirements: [1, 2, 5, 8] },
    ]);


    function calculateBuildingDynamicValues(building, baseData) {
        const level = building.level ?? 0;
        let updatedProduction = baseData.productionRate ?? 0;

        if (["Grain Mill", "Brickyard", "Sawmill", "Iron Foundry"].includes(building.name)) {
            updatedProduction = Math.round(updatedProduction * Math.pow(1.2, level));
        }

        let updatedStepDuration;
        if (building.name === "Scouting Post") {
            const durationArray = baseData.stepCountingDuration ?? [60, 90, 120, 150];
            updatedStepDuration = durationArray[level - 1] ?? durationArray.at(-1) ?? 60;
        }

        return {
            productionRate: updatedProduction,
            stepCountingDuration: updatedStepDuration,
        };
    }


    let API_URL;
    if (Platform.OS === "android") {
        API_URL = "http://10.0.2.2:3000"; // Android Emulator
    } else if (Platform.OS === "ios") {
        // API_URL = "http://192.168.1.107:3000"; // iOS phone with atomis ip, http://localhost:3000 to ios emulator
        API_URL = "http://192.168.0.75:3000";
    } else {
        API_URL = "http://192.168.0.75:3000"; // Replace with your real IP
    }

    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                setBuildings([]);
                setWarriors([]);
                return;
            }

            try {
                setIsLoading(true);

                // Fetch building types first so we can map data later
                const typesRes = await fetch(`${API_URL}/user/buildings/types`);
                const typesData = await typesRes.json();
                setAllBuildingTypes(typesData);

                const buildingsRes = await fetch(`${API_URL}/user/buildings/${user.id}`);
                const buildingsData = await buildingsRes.json();



                // ✅ Merge full definitions from typesData
                const buildingsWithMergedData = buildingsData.map((b) => {
                    const typeData = typesData.find((t) => t.name === b.name) || {};
                    const camelB = toCamelCaseKeys(b);
                    const baseData = baseBuildingData[b.name] || {};
                    const dynamicValues = calculateBuildingDynamicValues(camelB, baseData);

                    return {
                        ...typeData,
                        ...camelB,
                        ...baseData,
                        ...dynamicValues,
                    };
                });


                setBuildings(buildingsWithMergedData);

                const storedWarriors = await AsyncStorage.getItem(`warriors_${user.id}`);
                if (storedWarriors) setWarriors(JSON.parse(storedWarriors));
            } catch (error) {
                console.error("❌ Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };


        fetchGameData();
    }, [user]);

    const updateBuildings = async (building, location) => {
        const buildingIndex = buildings.findIndex((b) => b.name === building.name);
        if (buildingIndex === -1) return;

        const townHall = buildings.find((b) => b.name === "Town Hall");
        const townHallLevel = townHall ? townHall.level : 0;

        const nextLevel = building.built ? building.level + 1 : 1;
        const requiredTownHallLevel = building.upgradeRequirement?.[nextLevel - 1] || 0;

        // ... (rest of your code remains the same)


        if (townHallLevel < requiredTownHallLevel) {
            alert(`You need Town Hall Level ${requiredTownHallLevel} to upgrade ${building.name} to Level ${nextLevel}!`);
            return;
        }

        const costMultiplier = building.built ? 1.2 : 1;
        const cost = {
            wood: Math.floor(building.resourceCost.wood * costMultiplier),
            clay: Math.floor(building.resourceCost.clay * costMultiplier),
            iron: Math.floor(building.resourceCost.iron * costMultiplier),
            crops: Math.floor(building.resourceCost.crops),
        };

        if (
            resources.wood < cost.wood ||
            resources.clay < cost.clay ||
            resources.iron < cost.iron ||
            resources.crops < cost.crops
        ) {
            alert("Not enough resources!");
            return;
        }

        updateResources({
            ...resources,
            wood: resources.wood - cost.wood,
            clay: resources.clay - cost.clay,
            iron: resources.iron - cost.iron,
            crops: resources.crops,
        });

        const finishTime = Date.now() + building.buildTime * 1000;

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
            return newBuildings;
        });

        const xpReward = 20 * nextLevel;

        try {
            const response = await fetch(`${API_URL}/user/buildings/${building.built ? "upgrade" : "build"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    buildingTypeId: building.buildingTypeId || building.buildingtypeid || building.id,
                    location: building.built ? building.location : location,
                    level: nextLevel, // ✅ Add this line
                }),
            });



            const result = await response.json();
            if (!response.ok) {
                alert(result.error || "Build/Upgrade failed.");
                return;
            }
        } catch (err) {
            console.error("Error syncing building with backend:", err);
        }

        setTimeout(async () => {
            setBuildings((prevBuildings) => {
                const newBuildings = [...prevBuildings];
                const currentBuilding = newBuildings[buildingIndex];
                const baseData = baseBuildingData[currentBuilding.name] || {};

                let updatedStepDuration;
                if (currentBuilding.name === "Scouting Post") {
                    const durationArray =
                        baseBuildingData["Scouting Post"]?.stepCountingDuration ?? [60, 90, 120, 150];
                    updatedStepDuration = durationArray[nextLevel - 1] ?? durationArray.at(-1) ?? 60;
                }

                let updatedProduction = 0;

                if (["Grain Mill", "Brickyard", "Sawmill", "Iron Foundry"].includes(currentBuilding.name)) {
                    const baseRate = baseBuildingData[currentBuilding.name]?.productionRate ?? 0;
                    updatedProduction = Math.round(baseRate * Math.pow(1.2, nextLevel));
                }


                newBuildings[buildingIndex] = {
                    ...currentBuilding,
                    ...baseData, // ✅ merge base properties back in
                    built: true,
                    underConstruction: false,
                    finishTime: null,
                    level: currentBuilding.pendingLevel,
                    resourceCost: currentBuilding.pendingCost,
                    pendingLevel: undefined,
                    pendingCost: undefined,
                    stepCountingDuration: updatedStepDuration,
                    productionRate: updatedProduction,
                };

                return newBuildings;
            });

            addNotification(
                "Building Completed",
                `${building.name} has been successfully ${building.built ? "upgraded to Level " + (building.level + 1) : "built"}.`
            );

            await gainExperience(xpReward);
        }, building.buildTime * 1000);
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
                        crops: Math.floor(warrior.resourceCost.crops * costMultiplier),
                        iron: Math.floor(warrior.resourceCost.iron * costMultiplier),
                    };

                    // Check if the player has enough resources
                    if (
                        resources.crops < cost.crops ||
                        resources.iron < cost.iron
                    ) {
                        alert(`Not enough resources to upgrade ${warrior.name} to Level ${nextLevel}!`);
                        return warrior; // Return unchanged if not enough resources
                    }

                    // Deduct resources immediately
                    updateResources({
                        ...resources,
                        crops: resources.crops - cost.crops,
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
            crops: Math.floor(warrior.trainingCost.crops * costMultiplier * count),
            iron: Math.floor(warrior.trainingCost.iron * costMultiplier * count),
        };

        if (resources.crops < totalCost.crops || resources.iron < totalCost.iron) {
            alert(`Not enough resources to train ${count} ${warrior.name}(s)!`);
            return;
        }

        const newResources = {
            ...resources,
            crops: resources.crops - totalCost.crops,
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


    const warehouse = buildings.find((b) => b.name === "Warehouse");
    const warehouseLevel = warehouse ? warehouse.level : 0;
    const warehouseBaseStorage = warehouse?.baseStorage ?? baseBuildingData["Warehouse"].baseStorage;
    const buildMaterialsMax = Math.round(warehouseBaseStorage * Math.pow(1.2, warehouseLevel));

    const barracks = buildings.find((b) => b.name === "Barracks");
    const barracksLevel = barracks ? barracks.level : 0;
    const barracksBaseStorage = barracks?.troopsStorage ?? baseBuildingData["Barracks"].troopsStorage;
    const troopsMax = Math.round(barracksBaseStorage * Math.pow(1.2, barracksLevel));

    const totalTroops = warriors.reduce((total, warrior) => total + warrior.count, 0);

    return (
        <VillageContext.Provider
            value={{
                isLoading,
                buildings,
                allBuildingTypes, // ✅ Exposed to frontend
                buildMaterialsMax,
                troopsMax,
                totalTroops,
                warriors,
                updateBuildings,
                trainWarrior,
                levelUpWarrior
            }}
        >
            {children}
        </VillageContext.Provider>
    );
};
