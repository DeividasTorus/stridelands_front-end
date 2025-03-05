// GameContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import { Pedometer } from "expo-sensors";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {

    const [buildings, setBuildings] = useState([
        { id: 1, name: "Town Hall", level: 0, built: false, location: null, requiredTownHallLevel: 0, resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 10 },

        { id: 2, name: "Scouting Post", level: 0, built: true, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 100, clay: 100, iron: 50 }, buildTime: 10, stepCountingDuration: [10, 15, 20, 25] },

        { id: 3, name: "Barracks", level: 0, built: false, location: null, requiredTownHallLevel: 2, upgradeRequirement: [2, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 15 },
        { id: 4, name: "Grain Mill", level: 0, built: false, location: null, requiredTownHallLevel: 3, upgradeRequirement: [3, 4, 6, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 20, productionRate: 6 },
        { id: 5, name: "Warehouse", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 5, 6, 12], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 25, baseStorage: 5000 },
        { id: 6, name: "Brickyard", level: 0, built: false, location: null, requiredTownHallLevel: 4, upgradeRequirement: [4, 4, 6, 8], resourceCost: { wood: 200, clay: 150, iron: 100 }, buildTime: 30, productionRate: 6 },
        { id: 7, name: "Sawmill", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 50, clay: 50, iron: 20 }, buildTime: 35, productionRate: 6 },
        { id: 8, name: "Iron Foundry", level: 0, built: false, location: null, requiredTownHallLevel: 5, upgradeRequirement: [5, 6, 7, 8], resourceCost: { wood: 300, clay: 250, iron: 200 }, buildTime: 40, productionRate: 6 },
    ]);

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


    const [scoutingPostLevel, setScoutingPostLevel] = useState(0);
    const [stepCountingDuration, setStepCountingDuration] = useState(10); // Default 10s

    // ✅ Step Tracking State
    const [isTracking, setIsTracking] = useState(false);
    const [currentSteps, setCurrentSteps] = useState(0);
    const [stepsAtStart, setStepsAtStart] = useState(null);
    const [finishTime, setFinishTime] = useState(null); // ✅ Store finish time

    // ✅ User Resources
    const [resources, setResources] = useState({
        wood: 5000,
        clay: 3000,
        iron: 3000,
        crop: 1000,
    });

    // ✅ Notifications
    const [notifications, setNotifications] = useState([]);

    // ✅ Mails
    const [mails, setMails] = useState([
        { id: 1, title: "Nothing here", sender: "Mark", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
        { id: 2, title: "Party invite", sender: "David", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
        { id: 3, title: "Games begins", sender: "StrideLands", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false },
    ]);

    const buildMaterialsTotal = resources.wood + resources.clay + resources.iron + resources.crop;

    // ✅ Fetch user-related data on load
    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) {
                // Reset to default stats if no user is logged in
                setLevel(1);
                setExperience(72);
                setMaxExperience(100);
                setHealth(82);
                setMaxHealth(100);
                setStrength(150);
                setDefense(100);
                setCredits(0);
                setIsTracking(false)
                setStepsAtStart(0)
                setCurrentSteps(0)
                setNotifications([])
                setResources({
                    gold: 1000,
                    wood: 5000,
                    clay: 3000,
                    iron: 3000,
                    crop: 1000,
                });
                return;
            }

            try {
                setIsLoading(true);
                const storedResources = await AsyncStorage.getItem(`resources_${user.id}`);
                const storedStats = await AsyncStorage.getItem(`stats_${user.id}`);
                const storedNotifications = await AsyncStorage.getItem(`notifications_${user.id}`);
                const storedMails = await AsyncStorage.getItem(`mails_${user.id}`);

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
                if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
                if (storedMails) setMails(JSON.parse(storedMails));
            } catch (error) {
                console.error("Error loading game data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [user]);


    // ✅ Checking if Sounting Post is built and grow time duration after level up

    useEffect(() => {
        const scoutingPost = buildings.find((b) => b.name === "Scouting Post");
        if (scoutingPost && scoutingPost.built) {
            const level = scoutingPost.level;
            setScoutingPostLevel(level);
            setStepCountingDuration(scoutingPost.stepCountingDuration[level] || scoutingPost.stepCountingDuration[scoutingPost.stepCountingDuration.length - 1]);
        } else {
            setStepCountingDuration(10); // Default if not built
        }
    }, [buildings]);

    // ✅ Notifications read status check

    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
                .catch(error => console.error("Error saving notifications:", error));
        }
    }, [notifications]);


    // ✅ Passive Health Regeneration
    useEffect(() => {
        const healthRegen = setInterval(() => {
            setHealth((prev) => {
                const newHealth = Math.min(prev + 2, maxHealth);
                AsyncStorage.setItem(
                    `stats_${user.id}`,
                    JSON.stringify({
                        health: newHealth,
                        maxHealth,
                        level,
                        experience,
                        maxExperience,
                        strength,
                        defense,
                        credits,
                    })
                );
                return newHealth;
            });
        }, 60000);

        return () => clearInterval(healthRegen);
    }, [maxHealth, user, level, experience, maxExperience, strength, defense, credits]);


    // ✅ Function to update experience and check for level up
    const gainExperience = async (xpGained) => {
        let newXP = experience + xpGained;
        let newLevel = level;
        let newMaxExperience = maxExperience;
        let newCredits = credits;

        while (newXP >= newMaxExperience) {
            newXP -= newMaxExperience;
            newLevel += 1;
            newMaxExperience = Math.floor(newMaxExperience * 1.2);
            newCredits += 3;
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
                    credits: newCredits,
                })
            );
        }
    };

    const addNotification = (title, message) => {
        const newNotification = {
            id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`, // ✅ Unique ID
            title,
            message,
            time: new Date().toLocaleTimeString(),
            read: false,
        };

        setNotifications((prevNotifications) => {
            const updatedNotifications = [newNotification, ...prevNotifications];

            // ✅ Store notifications in AsyncStorage instantly
            if (user) {
                AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
            }

            return updatedNotifications;
        });
    };


    const updateResources = async (newResources) => {
        setResources(newResources);
        if (user) await AsyncStorage.setItem(`resources_${user.id}`, JSON.stringify(newResources));
    };

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

    const levelUpStats = async (allocatedStats) => {
        const newStrength = strength + (allocatedStats.strength || 0);
        const newDefense = defense + (allocatedStats.defense || 0);
        const newCredits = credits - (allocatedStats.strength || 0) - (allocatedStats.defense || 0) - (allocatedStats.resources || 0);

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
                    credits: newCredits,
                })
            );
        }
    };


    // useEffect(() => {
    //     fetchGameData();
    // }, [user]);

    // // ✅ Load game data
    // const fetchGameData = async () => {
    //     if (!user) return;
    //     try {
    //         setIsLoading(true);
    //         const storedResources = await AsyncStorage.getItem(`resources_${user.id}`);
    //         if (storedResources) setResources(JSON.parse(storedResources));
    //     } catch (error) {
    //         console.error("Error loading game data:", error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const startStepCounting = async () => {
        if (isTracking) return;

        const endTime = Date.now() + stepCountingDuration * 2000;
        setFinishTime(endTime); // ✅ Set finish time dynamically
        setIsTracking(true);

        // Get the latest step count at the start
        let initialSteps = currentSteps;
        setStepsAtStart(initialSteps);

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) {
            setIsTracking(false);
            return;
        }

        // Simulated step counting (incrementing steps every second)
        let simulatedSteps = initialSteps;
        const interval = setInterval(() => {
            simulatedSteps += 10;
            setCurrentSteps(simulatedSteps);
        }, 1000);

        // Start pedometer subscription
        // const subscription = Pedometer.watchStepCount(result => {
        //     setCurrentSteps(initialSteps + result.steps); // Update current steps based on real step count
        // });

        // Stop tracking after 10 seconds
        setTimeout(() => {
            clearInterval(interval);
            stopStepCounting(simulatedSteps, initialSteps);
        }, stepCountingDuration * 2000);

        // Stop tracking after the duration
        // setTimeout(() => {
        //     subscription?.remove(); // Stop step tracking
        //     stopStepCounting(currentSteps, initialSteps);
        // }, stepCountingDuration * 1000);
    };

    // ✅ Stop Step Tracking and Convert Steps to Resources
    const stopStepCounting = (finalSteps, initialSteps) => {
        setIsTracking(false);
        setFinishTime(null); // ✅ Reset finish time

        // Calculate steps gained
        const stepsGained = finalSteps - initialSteps;

        if (stepsGained > 0) {
            setResources(prevResources => {

                const grainMill = buildings.find((b) => b.name === "Grain Mill");
                const cropBonus = stepsGained / 50 * grainMill.productionRate

                const brickYard = buildings.find((b) => b.name === "Brickyard");
                const brickBonus = stepsGained / 50 * brickYard.productionRate

                const sawMill = buildings.find((b) => b.name === "Sawmill");
                const woodBonus = stepsGained / 50 * sawMill.productionRate

                const ironFoundry = buildings.find((b) => b.name === "Iron Foundry");
                const ironBonus = stepsGained / 50 * ironFoundry.productionRate

                const newResources = {
                    wood: prevResources.wood + Math.floor(woodBonus),
                    clay: prevResources.clay + Math.floor(brickBonus),
                    iron: prevResources.iron + Math.floor(ironBonus),
                    crop: prevResources.crop + Math.floor(cropBonus)
                };

                const gainedResources = {
                    wood: Math.floor(woodBonus),
                    clay: Math.floor(brickBonus),
                    iron: Math.floor(ironBonus),
                    crop: Math.floor(cropBonus)
                };

                if (user) {
                    AsyncStorage.setItem(`resources_${user.id}`, JSON.stringify(newResources));
                }

                addNotification(
                    "🚶 Journey Completed",
                    `You have traveled ${stepsGained} steps and earned:
                     🪵 ${gainedResources.wood} wood
                     🏺 ${gainedResources.clay} clay
                     ⛏️ ${gainedResources.iron} iron
                     🌾 ${gainedResources.crop} crop!`,
                );

                return newResources;
            });
        }

        // Reset for next session
        setCurrentSteps(0);
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
                notifications,
                mails,
                buildMaterialsTotal,
                setCredits,
                updateLevel,
                levelUpStats,
                gainExperience,
                addNotification,
                setNotifications,
                isTracking,
                currentSteps,
                startStepCounting,
                stopStepCounting,
                updateResources,
                stepCountingDuration,
                finishTime
            }}
        >
            {children}
        </GameContext.Provider>
    );
};



