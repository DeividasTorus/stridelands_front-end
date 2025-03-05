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
        { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 3 },
        { id: 2, name: "Scouting Post", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 2, stepCountingDuration: [10, 15, 20, 25] },
        { id: 3, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 2 },
        { id: 4, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 2, productionRate: 5 },
        { id: 5, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 2, baseStorage: 5000 },
        { id: 6, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 2, productionRate: 5 },
        { id: 7, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 2, productionRate: 5 },
        { id: 8, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 2, productionRate: 5 },
    ]);


    // Calculate Warehouse storage capacity
    const warehouse = buildings.find((b) => b.name === "Warehouse");
    const warehouseLevel = warehouse ? warehouse.level : 0;

    // Ensure storage capacity only increases, even during upgrades
    const effectiveWarehouseLevel = warehouseLevel;

    const buildMaterialsMax = warehouse
        ? Math.round(warehouse.baseStorage * Math.pow(1.2, effectiveWarehouseLevel))
        : 5000;


    // Fetch building data on load
    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                // Reset to default buildings when user changes
                setBuildings([
                    { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 3 },
                    { id: 2, name: "Scouting Post", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 2, stepCountingDuration: [10, 15, 20, 25] },
                    { id: 3, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 2 },
                    { id: 4, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 2, productionRate: 5 },
                    { id: 5, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 2, baseStorage: 5000 },
                    { id: 6, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 2, productionRate: 5 },
                    { id: 7, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 2, productionRate: 5 },
                    { id: 8, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 2, productionRate: 5 },
                ]);
                return;
            }

            try {
                setIsLoading(true);
                console.log("Fetching game data for user:", user.id);
                const storedBuildings = await AsyncStorage.getItem(`buildings_${user.id}`);
                if (storedBuildings) setBuildings(JSON.parse(storedBuildings));
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
        };

        // Check if player has enough resources
        if (
            resources.wood < cost.wood ||
            resources.clay < cost.clay ||
            resources.iron < cost.iron
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
                updateBuildings,
            }}
        >
            {children}
        </VillageContext.Provider>
    );
};
