// VillageContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import { GameContext } from "./GameContext";

export const VillageContext = createContext();

export const VillageProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const { resources, updateResources, gainExperience } = useContext(GameContext);
    const [isLoading, setIsLoading] = useState(true);

    // Buildings state
    const [buildings, setBuildings] = useState([
        { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 10 },
        { id: 2, name: "Barracks", level: 1, built: false, location: null, requiredTownHallLevel: 2, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 15 },
        { id: 3, name: "Grain Mill", level: 1, built: false, location: null, requiredTownHallLevel: 3, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 20 },
        { id: 4, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 25, baseStorage: 5000 },
        { id: 5, name: "Brickyard", level: 1, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 30 },
        { id: 6, name: "Sawmill", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 35 },
        { id: 7, name: "Iron Foundry", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 40 },
    ]);

    // Calculate Warehouse storage capacity
    // Calculate Warehouse storage capacity
    const warehouse = buildings.find((b) => b.name === "Warehouse");
    const warehouseLevel = warehouse ? warehouse.level : 0;

    // If the warehouse is upgrading (underConstruction and finishTime in the future),
    // use the previous level for capacity calculation.
    const effectiveWarehouseLevel =
        warehouse && warehouse.underConstruction && warehouse.finishTime > Date.now()
            ? (warehouse.level > 0 ? warehouse.level - 1 : 0)
            : warehouseLevel;

    const buildMaterialsMax = warehouse
        ? Math.round(warehouse.baseStorage * Math.pow(1.2, effectiveWarehouseLevel))
        : 5000;


    // Fetch building data on load
    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                // Reset to default buildings when user changes
                setBuildings([
                    { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 10 },
                    { id: 2, name: "Barracks", level: 1, built: false, location: null, requiredTownHallLevel: 2, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 15 },
                    { id: 3, name: "Grain Mill", level: 1, built: false, location: null, requiredTownHallLevel: 3, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 20 },
                    { id: 4, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 25, baseStorage: 5000 },
                    { id: 5, name: "Brickyard", level: 1, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 30 },
                    { id: 6, name: "Sawmill", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 35 },
                    { id: 7, name: "Iron Foundry", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 40 },
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
        // This interval checks every second.
        const checkUpgrades = setInterval(() => {
            setBuildings((prevBuildings) => {
                let updated = false;
                const newBuildings = prevBuildings.map((b) => {
                    if (
                        b.underConstruction &&
                        b.finishTime &&
                        b.finishTime <= Date.now()
                    ) {
                        updated = true;
                        return {
                            ...b,
                            built: true,
                            underConstruction: false,
                            finishTime: null,
                            // Apply pending values (if any) to finalize the upgrade.
                            level: b.pendingLevel !== undefined ? b.pendingLevel : b.level,
                            resourceCost:
                                b.pendingCost !== undefined ? b.pendingCost : b.resourceCost,
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

        // Calculate cost (and adjust multiplier for upgrades)
        const costMultiplier = building.built ? 1.2 : 1;
        const cost = {
            wood: Math.floor(building.resourceCost.wood * costMultiplier),
            clay: Math.floor(building.resourceCost.clay * costMultiplier),
            iron: Math.floor(building.resourceCost.iron * costMultiplier),
        };

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

        // Update building to mark it under construction; assign location if not yet built.
        setBuildings((prevBuildings) => {
            const newBuildings = [...prevBuildings];
            newBuildings[buildingIndex] = {
                ...building,
                underConstruction: true,
                finishTime,
                // Store pending new level and cost; update location if building was not built yet.
                pendingLevel: building.built ? building.level + 1 : 1,
                pendingCost: cost,
                location: building.built ? building.location : location,
            };
            // Persist the updated state.
            AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(newBuildings));
            return newBuildings;
        });

        // XP reward calculation
        const xpReward = 20 * (building.built ? building.level + 1 : 1);

        // When the countdown ends, update the building's level and cost.
        setTimeout(async () => {
            setBuildings((prevBuildings) => {
                const newBuildings = [...prevBuildings];
                const currentBuilding = newBuildings[buildingIndex];
                newBuildings[buildingIndex] = {
                    ...currentBuilding,
                    built: true,
                    underConstruction: false,
                    finishTime: null,
                    level: currentBuilding.pendingLevel,
                    resourceCost: currentBuilding.pendingCost,
                    pendingLevel: undefined,
                    pendingCost: undefined,
                };
                // Persist final update.
                AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(newBuildings));
                return newBuildings;
            });

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
