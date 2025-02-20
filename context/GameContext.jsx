import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext"; // Import UserContext to get user info

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { user } = useContext(UserContext); // Get logged-in user
    const [isLoading, setIsLoading] = useState(true);

    // ✅ User Stats
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(72);
    const [maxExperience, setMaxExperience] = useState(100);
    const [health, setHealth] = useState(100);
    const [maxHealth, setMaxHealth] = useState(100);
    const [strength, setStrength] = useState(10);
    const [credits, setCredits] = useState(5);

    // ✅ User Resources
    const [resources, setResources] = useState({
        gold: 100,
        wood: 500,
        clay: 300,
        iron: 200,
        crop: 100,
    });

    // ✅ Total and Max Resources
    const buildMaterialsTotal = resources.wood + resources.clay + resources.iron + resources.crop;
    const buildMaterialsMax = 5000; // Set max resources limit

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

    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) return; // Exit if no user is logged in

            try {
                setIsLoading(true);
                console.log("Fetching game data for user:", user.id);

                // Load data from AsyncStorage
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
                    setCredits(parsedStats.credits);
                }
                if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
                if (storedMails) setMails(JSON.parse(storedMails));
            } catch (error) {
                console.error("❌ Error loading game data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [user]); // Runs when `user` changes (after login)

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

    // ✅ Function to add a notification
    const addNotification = async (newNotification) => {
        const updatedNotifications = [...notifications, newNotification];
        setNotifications(updatedNotifications);
        if (user) await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    };

    // ✅ Function to add a mail message
    const addMail = async (newMail) => {
        const updatedMails = [...mails, newMail];
        setMails(updatedMails);
        if (user) await AsyncStorage.setItem(`mails_${user.id}`, JSON.stringify(updatedMails));
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
                credits,
                resources,
                buildMaterialsTotal,
                buildMaterialsMax,
                notifications,
                mails,
                updateResources,
                updateLevel,
                addNotification,
                addMail,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};


