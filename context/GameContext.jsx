// GameContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import { Pedometer } from "expo-sensors";
import { Platform } from "react-native";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const baseBuildingData = {
        "Warehouse": { baseStorage: 5000 },
        "Barracks": { troopsStorage: 10 },
        "Scouting Post": { stepCountingDuration: [60, 90, 120, 150, 180, 210] },
        "Grain Mill": { productionRate: 5, },
        "Sawmill": { productionRate: 5, },
        "Brickyard": { productionRate: 5, },
        "Iron Foundry": { productionRate: 5, },
    };
    const [buildings, setBuildings] = useState([]);
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);

    const [userSteps, setUserSteps] = useState({
        is_tracking: false,
        stepsGained: 0,
        totalSteps: 0,
        steps_at_session_start: 0,
    });


    // ✅ User Stats
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);
    const [maxExperience, setMaxExperience] = useState(100);
    const [health, setHealth] = useState(100);
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
        wood: 0,
        clay: 0,
        iron: 0,
        crops: 0,
    });

    // ✅ Notifications
    const [notifications, setNotifications] = useState([]);

    // ✅ Mails
    const [mails, setMails] = useState([
        { id: 1, title: "Nothing here", sender: "Mark", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
        { id: 2, title: "Party invite", sender: "David", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
        { id: 3, title: "Games begins", sender: "StrideLands", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false },
    ]);

    const toCamelCaseKeys = (obj) => {
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
                toCamelCaseKeys(value),
            ])
        );
    };

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

    const buildMaterialsTotal = resources.wood + resources.clay + resources.iron + resources.crops;

    let API_URL;

    if (Platform.OS === "android") {
        API_URL = "http://10.0.2.2:3000"; // Android Emulator
    } else if (Platform.OS === "ios") {
        // API_URL = "http://192.168.1.107:3000"; // iOS phone with atomis ip, http://localhost:3000 to ios emulator
        API_URL = "http://192.168.0.75:3000";
    } else {
        API_URL = "http://192.168.0.75:3000"; // Replace with your real IP
    }
    // ✅ Fetch user-related data on load
    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) return;

            try {
                setIsLoading(true);

                // Fetch user stats
                const statsResponse = await fetch(`${API_URL}/user/stats/${user.id}`);
                const statsText = await statsResponse.text();
                console.log("🔍 Raw User Stats:", statsText);

                if (!statsResponse.ok) {
                    throw new Error(`Stats Error: ${statsResponse.status} ${statsResponse.statusText}`);
                }

                const statsData = JSON.parse(statsText);
                console.log("✅ Parsed User Stats:", statsData);

                // Fetch user resources
                const resourcesResponse = await fetch(`${API_URL}/user/resources/${user.id}`);
                const resourcesText = await resourcesResponse.text();
                console.log("🔍 Raw Resources:", resourcesText);

                if (!resourcesResponse.ok) {
                    throw new Error(`Resources Error: ${resourcesResponse.status} ${resourcesResponse.statusText}`);
                }

                const resourcesData = JSON.parse(resourcesText);
                console.log("✅ Parsed Resources:", resourcesData);

                // ✅ Set resources
                setResources({
                    wood: resourcesData.wood || 0,
                    clay: resourcesData.clay || 0,
                    iron: resourcesData.iron || 0,
                    crops: resourcesData.crops || 0,
                });

                // ✅ Set stats
                setLevel(statsData.level);
                setExperience(statsData.experience);
                setMaxExperience(statsData.max_experience);
                setHealth(statsData.health);
                setMaxHealth(statsData.max_health);
                setStrength(statsData.strength);
                setDefense(statsData.defense);
                setCredits(statsData.credits);
                setNotifications(statsData.notifications || []);
                setMails(statsData.mails || []);

                // ✅ Fetch and enrich buildings
                const buildingsResponse = await fetch(`${API_URL}/user/buildings/${user.id}`);
                const buildingsData = await buildingsResponse.json();

                const camelBuildings = buildingsData.map(toCamelCaseKeys);

                const enrichedBuildings = camelBuildings.map((building) => {
                    const baseData = baseBuildingData[building.name] || {};
                    const dynamicValues = calculateBuildingDynamicValues(building, baseData);
                    return {
                        ...building,
                        ...baseData,
                        ...dynamicValues,
                    };
                });

                setBuildings(enrichedBuildings);

                // 🔁 Fetch step tracking data
                const stepRes = await fetch(`${API_URL}/user/steps/${user.id}`);
                const stepData = await stepRes.json();
                setUserSteps(stepData);
                setIsTracking(stepData.is_tracking || false);


            } catch (error) {
                console.error("❌ Error loading game data:", error.message);
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
            const level = scoutingPost.level ?? 0;
            setScoutingPostLevel(level);

            const defaultDurations = [60, 90, 120, 150, 180, 210];
            const durationArray = Array.isArray(scoutingPost.stepCountingDuration)
                ? scoutingPost.stepCountingDuration
                : defaultDurations;

            const duration = durationArray[level - 1] ?? durationArray.at(-1) ?? 10;

            setStepCountingDuration(duration);
        } else {
            setStepCountingDuration(10);
        }
    }, [buildings]);




    // ✅ Notifications read status check

    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
                .catch(error => console.error("Error saving notifications:", error));
        }
    }, [notifications]);


    // // ✅ Passive Health Regeneration
    // useEffect(() => {
    //     const healthRegen = setInterval(() => {
    //         setHealth((prev) => {
    //             const newHealth = Math.min(prev + 2, maxHealth);
    //             AsyncStorage.setItem(
    //                 `stats_${user.id}`,
    //                 JSON.stringify({
    //                     health: newHealth,
    //                     maxHealth,
    //                     level,
    //                     experience,
    //                     maxExperience,
    //                     strength,
    //                     defense,
    //                     credits,
    //                 })
    //             );
    //             return newHealth;
    //         });
    //     }, 60000);
    //
    //     return () => clearInterval(healthRegen);
    // }, [maxHealth, user, level, experience, maxExperience, strength, defense, credits]);


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
            try {

                const response = await fetch(`${API_URL}/user/stats/${user.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        level: newLevel,
                        experience: newXP,
                        max_experience: newMaxExperience,
                        health,
                        max_health: maxHealth,
                        strength,
                        defense,
                        credits: newCredits
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to update user stats");
                }

                console.log("✅ User stats updated successfully!");
            } catch (error) {
                console.error("❌ Error updating user stats:", error.message);
            }
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


    const updateResources = async (newResources, excludeCrops = false) => {
        if (!user) return;

        try {
            // ✅ Fetch the latest resources from the backend
            const response = await fetch(`${API_URL}/user/resources/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch current resources: ${response.statusText}`);
            }

            const currentResources = await response.json();
            console.log("🔄 Current Resources from DB:", currentResources);

            // ✅ Merge: Only update changed values, keep others the same
            const updatedResources = {
                wood: newResources.wood ?? currentResources.wood,
                clay: newResources.clay ?? currentResources.clay,
                iron: newResources.iron ?? currentResources.iron,
                crops: newResources.crops ?? currentResources.crops,
                // ✅ Only update crops if not excluded
            };

            console.log("🛠 Updating Resources with:", updatedResources);

            // ✅ Send the updated resources to the backend
            const updateResponse = await fetch(`${API_URL}/user/resources/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedResources),
            });

            if (!updateResponse.ok) {
                throw new Error(`Failed to update resources: ${updateResponse.statusText}`);
            }

            console.log("✅ Resources updated successfully on the backend");

            // ✅ Update the local state with the latest values
            setResources(updatedResources);

        } catch (error) {
            console.error("❌ Error updating resources:", error.message);
        }
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

        if (newCredits < 0) return; // Prevent negative credits

        // Update local state
        setStrength(newStrength);
        setDefense(newDefense);
        setCredits(newCredits);

        // Send updated stats to backend
        if (user) {
            try {
                const response = await fetch(`${API_URL}/user/stats/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        level,
                        experience,
                        max_experience: maxExperience,
                        health,
                        max_health: maxHealth,
                        strength: newStrength,
                        defense: newDefense,
                        credits: newCredits
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to update stats on server");
                }

                console.log("Stats successfully updated on backend");
            } catch (error) {
                console.error("Error updating stats:", error);
            }
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
        if (isTracking || !user) return;

        const currentStepCount = currentSteps; // or fetch from pedometer if using real device

        try {
            const response = await fetch(`${API_URL}/user/steps/${user.id}/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentStepCount }),
            });

            if (!response.ok) throw new Error("Failed to start step tracking");

            const stepData = await response.json();
            setUserSteps(stepData.userSteps);
            setStepsAtStart(currentStepCount);
            setIsTracking(true);
        } catch (error) {
            console.error("❌ Start Step Tracking Error:", error);
        }

        const scoutingPost = buildings.find((b) => b.name === "Scouting Post" && b.built);

        let dynamicDuration = 60;
        const defaultDurations = [60, 90, 120, 150, 180, 210];

        if (scoutingPost) {
            const level = scoutingPost.level ?? 1;
            const durationArray = Array.isArray(scoutingPost.stepCountingDuration)
                ? scoutingPost.stepCountingDuration
                : defaultDurations;

            dynamicDuration = durationArray[level - 1] ?? durationArray.at(-1) ?? 60;
        }

        const durationInMs = dynamicDuration * 1000;
        const endTime = Date.now() + durationInMs;

        setFinishTime(endTime);
        setIsTracking(true);
        setStepsAtStart(currentSteps);

        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) {
            console.warn("Pedometer not available.");
            setIsTracking(false);
            return;
        }

        // Simulate steps
        let simulatedSteps = currentSteps;
        const interval = setInterval(() => {
            simulatedSteps += 10;
            setCurrentSteps(simulatedSteps);
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            stopStepCounting(simulatedSteps, currentSteps);
        }, durationInMs);


        // Start pedometer subscription
        // const subscription = Pedometer.watchStepCount(result => {
        //     setCurrentSteps(initialSteps + result.steps); // Update current steps based on real step count
        // });

        // Stop tracking after the duration
        // setTimeout(() => {
        //     subscription?.remove(); // Stop step tracking
        //     stopStepCounting(currentSteps, initialSteps);
        // }, stepCountingDuration * 1000);
    };



    // ✅ Stop Step Tracking and Convert Steps to Resources
    const stopStepCounting = (finalSteps, initialSteps) => {
        setIsTracking(false);
        setFinishTime(null);

        const stepsGained = finalSteps - initialSteps;
        if (stepsGained <= 0) return;

        let newResources = {};

        setResources((prev) => {
            const getRate = (name) => {
                const b = buildings.find((b) => b.name === name && b.built);
                return isNaN(Number(b?.productionRate)) ? 1 : Number(b.productionRate);
            };

            const cropBonus = stepsGained / 50 * getRate("Grain Mill");
            const brickBonus = stepsGained / 50 * getRate("Brickyard");
            const woodBonus = stepsGained / 50 * getRate("Sawmill");
            const ironBonus = stepsGained / 50 * getRate("Iron Foundry");

            newResources = {
                wood: prev.wood + Math.floor(woodBonus),
                clay: prev.clay + Math.floor(brickBonus),
                iron: prev.iron + Math.floor(ironBonus),
                crops: prev.crops + Math.floor(cropBonus),
            };

            updateResources(newResources);

            addNotification(
                "🚶 Journey Completed",
                `You traveled ${stepsGained} steps and earned:\n🪵 ${Math.floor(woodBonus)} wood\n🏺 ${Math.floor(brickBonus)} clay\n⛏️ ${Math.floor(ironBonus)} iron\n🌾 ${Math.floor(cropBonus)} crop!`
            );

            return newResources;
        });

        // ✅ Update on server too
        if (user) {


            fetch(`${API_URL}/user/steps/${user.id}/stop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currentStepCount: finalSteps }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("✅ Step tracking stopped on backend:", data);
                })
                .catch((error) => {
                    console.error("❌ Failed to stop tracking on backend:", error);
                });
        }

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



