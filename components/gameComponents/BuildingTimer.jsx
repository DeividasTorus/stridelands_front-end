import {useContext, useState, useEffect} from "react";
import {GameContext} from "../../context/GameContext";
import {Text, View} from "react-native";


const BuildingTimer = ({ buildingName }) => {
    const { getBuildingTimeLeft } = useContext(GameContext);
    const [timeLeft, setTimeLeft] = useState(getBuildingTimeLeft(buildingName));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getBuildingTimeLeft(buildingName)); // Update countdown every second
        }, 1000);

        return () => clearInterval(interval);
    }, [buildingName]);

    if (timeLeft === null) return null; // No timer

    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor(timeLeft / 1000 / 60 / 60);

    return (
        <View>
            {timeLeft > 0 ? (
                <Text>⏳ Time left: {hours}h {minutes}m {seconds}s</Text>
            ) : (
                <Text>✅ {buildingName} Built!</Text>
            )}
        </View>
    );
};


export default BuildingTimer;
