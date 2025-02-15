import React from "react";
import { View, ActivityIndicator, StyleSheet, ImageBackground } from "react-native";


const Loader = () => {
  return (
    <ImageBackground source={require("../assets/images/StrideLands.png")} style={styles.background}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black", // ✅ Prevents blank screen issue
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;


