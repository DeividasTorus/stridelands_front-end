import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ User Stats
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(72);
    const [maxExperience, setMaxExperience] = useState(100);
    const [health, setHealth] = useState(82);
    const [maxHealth, setMaxHealth] = useState(100);
    const [strength, setStrength] = useState(150);
    const [defense, setDefense] = useState(100);
    const [credits, setCredits] = useState(0);

    // ✅ User Resources
    const [resources, setResources] = useState({
        gold: 1000,
        wood: 5000,
        clay: 3000,
        iron: 3600,
        crop: 1000,
    });

    const [buildings, setBuildings] = useState([
        { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 60 },
        { id: 2, name: "Barracks", level: 1, built: false, location: null, requiredTownHallLevel: 2, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 120 },
        { id: 3, name: "Grain Mill", level: 1, built: false, location: null, requiredTownHallLevel: 3, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 90 },
        { id: 4, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 180, baseStorage: 5000},
        { id: 5, name: "Brickyard", level: 1, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 150 },
        { id: 6, name: "Sawmill", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 100 },
        { id: 7, name: "Iron Foundry", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 200 },
    ]);


    const warehouse = buildings.find(b => b.name === "Warehouse");
    const warehouseLevel = warehouse ? warehouse.level : 0;
    const buildMaterialsMax = warehouse
        ? Math.round(warehouse.baseStorage * Math.pow(1.2, warehouseLevel))
        : 5000;

    const buildMaterialsTotal = resources.wood + resources.clay + resources.iron + resources.crop;


    // ✅ Notifications
    const [notifications, setNotifications] = useState([
        { id: 1, title: "New Message", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
        { id: 2, title: "Order Update", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
        { id: 3, title: "Meeting Reminder", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false },
        { id: 4, title: "New Message", message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum", time: "10:30 AM", read: false },
        { id: 5, title: "Order Update", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
        { id: 6, title: "Meeting Reminder", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false }
    ]);

    // ✅ Mails
    const [mails, setMails] = useState([
        { id: 1, title: "Nothing here", sender: "Mark", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
        { id: 2, title: "Party invite", sender: "David", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
        { id: 3, title: "Games begins", sender: "StrideLands", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false },
    ]);


    // ✅ Passive Health Regeneration
    useEffect(() => {
        const healthRegen = setInterval(() => {
            setHealth(prev => {
                const newHealth = Math.min(prev + 2, maxHealth);
                // Store the updated health in AsyncStorage
                AsyncStorage.setItem(`stats_${user.id}`, JSON.stringify({
                    health: newHealth,
                    maxHealth,
                    level,
                    experience,
                    maxExperience,
                    strength,
                    defense,
                    credits,
                }));
                return newHealth;
            });
        }, 60000); // Regenerate every 1 minute

        return () => clearInterval(healthRegen);
    }, [maxHealth, user, level, experience, maxExperience, strength, defense, credits]);

    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                // Reset to default stats when user changes
                setLevel(1);
                setExperience(72);
                setMaxExperience(100);
                setHealth(82);
                setMaxHealth(100);
                setStrength(150);
                setDefense(100);
                setCredits(0);
                setResources({
                    gold: 1000,
                    wood: 5000,
                    clay: 3000,
                    iron: 3600,
                    crop: 1000,
                });
                setBuildings([
                    { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 60 },
                    { id: 2, name: "Barracks", level: 1, built: false, location: null, requiredTownHallLevel: 2, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 120 },
                    { id: 3, name: "Grain Mill", level: 1, built: false, location: null, requiredTownHallLevel: 3, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 90 },
                    { id: 4, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4,
                        resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 180,
                        baseStorage: 5000 // ✅ Base storage capacity
                    },
                    { id: 5, name: "Brickyard", level: 1, built: false, location: null, requiredTownHallLevel: 4, resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 150 },
                    { id: 6, name: "Sawmill", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 100 },
                    { id: 7, name: "Iron Foundry", level: 1, built: false, location: null, requiredTownHallLevel: 5, resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 200 },
                ]);
                // setNotifications([]);
                // setMails([]);
                return;
            }

            try {
                setIsLoading(true);
                console.log("Fetching game data for user:", user.id);

                const storedResources = await AsyncStorage.getItem(`resources_${user.id}`);
                const storedStats = await AsyncStorage.getItem(`stats_${user.id}`);
                const storedNotifications = await AsyncStorage.getItem(`notifications_${user.id}`);
                const storedMails = await AsyncStorage.getItem(`mails_${user.id}`);
                const storedBuildings = await AsyncStorage.getItem(`buildings_${user.id}`);

                if (storedResources) setResources(JSON.parse(storedResources));
                if (storedStats) {
                    const parsedStats = JSON.parse(storedStats);
                    setLevel(parsedStats.level);
                    setExperience(parsedStats.experience);
                    setMaxExperience(parsedStats.maxExperience);
                    setHealth(parsedStats.health);
                    setMaxHealth(parsedStats.maxHealth);
                    setStrength(parsedStats.strength);
                    setDefense(parsedStats.defense);
                    setCredits(parsedStats.credits);
                }
                if (storedBuildings) { setBuildings(JSON.parse(storedBuildings)); }
                if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
                if (storedMails) setMails(JSON.parse(storedMails));

            } catch (error) {
                console.error("❌ Error loading game data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [user]);

    // ✅ Function to update experience and check for level up
    const gainExperience = async (xpGained) => {
        let newXP = experience + xpGained;
        let newLevel = level;
        let newMaxExperience = maxExperience;
        let newCredits = credits;

        // Check for level up
        while (newXP >= newMaxExperience) {
            newXP -= newMaxExperience; // Carry over extra XP
            newLevel += 1; // Increase level
            newMaxExperience = Math.floor(newMaxExperience * 1.2); // Increase max XP for next level
            newCredits += 3; // Reward 3 credits per level-up
        }

        setLevel(newLevel);
        setExperience(newXP);
        setMaxExperience(newMaxExperience);
        setCredits(newCredits);

        if (user) {
            await AsyncStorage.setItem(
                `stats_${user.id}`,
                JSON.stringify({
                    level: newLevel,
                    experience: newXP,
                    maxExperience: newMaxExperience,
                    health,
                    maxHealth,
                    strength,
                    defense,
                    credits: newCredits
                })
            );
        }
    };


    const updateBuildings = async (buildingName, location) => {
        const buildingIndex = buildings.findIndex((b) => b.name === buildingName);
        if (buildingIndex === -1) return; // Building not found

        const building = buildings[buildingIndex];

        // Calculate cost (increase by 20% per level for upgrades)
        const costMultiplier = building.built ? 1.2 : 1; // If upgrading, increase cost
        const cost = {
            wood: Math.floor(building.resourceCost.wood * costMultiplier),
            clay: Math.floor(building.resourceCost.clay * costMultiplier),
            iron: Math.floor(building.resourceCost.iron * costMultiplier),
        };

        // Check if the player has enough resources
        if (
            resources.wood < cost.wood ||
            resources.clay < cost.clay ||
            resources.iron < cost.iron
        ) {
            alert("Not enough resources!");
            return;
        }

        // Deduct resources
        const newResources = {
            ...resources,
            wood: resources.wood - cost.wood,
            clay: resources.clay - cost.clay,
            iron: resources.iron - cost.iron,
        };
        setResources(newResources);
        if (user) await AsyncStorage.setItem(`resources_${user.id}`, JSON.stringify(newResources));

        // If building is already built, upgrade it. Otherwise, build it.
        const updatedBuildings = [...buildings];
        updatedBuildings[buildingIndex] = {
            ...building,
            built: true,
            location: building.built ? building.location : location, // Keep location same if upgrading
            level: building.level + 1, // Increase level
            resourceCost: cost, // Update cost for next upgrade
        };

        // ✅ If upgrading Warehouse, update buildMaterialsMax
        if (buildingName === "Warehouse") {
            const newWarehouseLevel = building.level + 1;
            const newBuildMaterialsMax = Math.round(warehouse.baseStorage * Math.pow(1.2, newWarehouseLevel));
            console.log("New max storage:", newBuildMaterialsMax);
        }

        setBuildings(updatedBuildings);
        if (user) await AsyncStorage.setItem(`buildings_${user.id}`, JSON.stringify(updatedBuildings));

        // Gain experience when leveling up buildings
        const xpReward = 20 * (building.level + 1); // Example XP calculation
        await gainExperience(xpReward);


        // ✅ Save to AsyncStorage
        if (user) {
            await AsyncStorage.setItem(
                `stats_${user.id}`,
                JSON.stringify({ level: newLevel, experience: newExperience, maxExperience: newMaxExperience })
            );
        }
    };



    // ✅ Function to update resources
    const updateResources = async (newResources) => {
        setResources(newResources);
        if (user) await AsyncStorage.setItem(`resources_${user.id}`, JSON.stringify(newResources));
    };


    // ✅ Function to update level & experience
    const updateLevel = async (newLevel, newXP) => {
        setLevel(newLevel);
        setExperience(newXP);
        if (user) {
            await AsyncStorage.setItem(
                `stats_${user.id}`,
                JSON.stringify({ level: newLevel, experience: newXP, maxExperience })
            );
        }
    };

    // ✅ Function to level up stats
    const levelUpStats = async (allocatedStats) => {
        let newStrength = strength + (allocatedStats.strength || 0);
        let newDefense = defense + (allocatedStats.defense || 0);
        let newCredits = credits - (allocatedStats.strength || 0) - (allocatedStats.defense || 0) - (allocatedStats.resources || 0);

        if (newCredits < 0) return;

        setStrength(newStrength);
        setDefense(newDefense);
        setCredits(newCredits);

        if (user) {
            await AsyncStorage.setItem(
                `stats_${user.id}`,
                JSON.stringify({
                    level,
                    experience,
                    maxExperience,
                    health,
                    maxHealth,
                    strength: newStrength,
                    defense: newDefense,
                    credits: newCredits
                })
            );
        }
    };

    return (
        <GameContext.Provider
            value={{
                isLoading,
                level,
                experience,
                maxExperience,
                health,
                maxHealth,
                strength,
                defense,
                credits,
                resources,
                buildMaterialsTotal,
                buildMaterialsMax,
                notifications,
                mails,
                updateResources,
                updateLevel,
                levelUpStats,
                setCredits,
                buildings, // ✅ Buildings added to context
                updateBuildings, // ✅ Function to update buildings
            }}
        >
            {children}
        </GameContext.Provider>
    );
};



