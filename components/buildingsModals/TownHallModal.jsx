import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";

export default function TownHallModal({ isVisible, setIsVisible }) {
  return (
    <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Town Hall</Text>
      </View>
    </SlidingModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 10,
  }
});
