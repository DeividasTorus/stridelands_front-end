import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";

const Countdown = ({ finishTime, textStyle }) => {
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Math.floor((finishTime - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsLeft = Math.floor((finishTime - Date.now()) / 1000);
      setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [finishTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Text style={[styles.defaultText, textStyle]}>
      {formatTime(timeLeft)}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 14,
    color: "rgb(107, 57, 0)",
    fontWeight: 'bold',
  },
});

export default Countdown;
