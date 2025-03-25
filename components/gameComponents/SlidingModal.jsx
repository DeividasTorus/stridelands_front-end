import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";

const { height, width } = Dimensions.get("window");

const SlidingModal = ({ isVisible, setIsVisible, children }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  
  useEffect(() => {
    if (isVisible) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={() => setIsVisible(false)}
    >
      {/* Full-screen background with fade-in animation */}
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        {/* Safe area padding for Android notch */}
        <View style={styles.safeAreaFix} />

        {/* Modal Content */}
        <Animated.View style={[styles.modalContainer, { opacity: opacityAnim }]}>
          <ImageBackground
            source={require('../../assets/images/modalFrame.png')}
            style={styles.backgroundImage}
            resizeMode="stretch"
          >
            <View style={styles.modalContent}>
              {/* Exit Button */}
              <TouchableOpacity
                style={styles.exitButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.exitButtonText}>X</Text>
              </TouchableOpacity>

              {children}
            </View>
          </ImageBackground>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject, // Fullscreen background
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // safeAreaFix: {
  //   width: "100%",
  //   height: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0, // Fixes safe area issue on Android
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)', // Matches overlay
  // },
  modalContainer: {
    width: width,
    height: '70%',
  },
  backgroundImage: {
    width: width,
    height: '100%',
    marginTop: 50
  },
  modalContent: {
    padding: 20,
  },
  exitButton: {
    position: "absolute",
    top: 60,
    right: 50,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(100, 54, 1, 0.55)",
    borderWidth: 2,
    borderColor: "rgba(100, 54, 1, 0.55)",
    zIndex: 99999,
  },
  exitButtonText: {
    color: "rgb(201, 171, 136)",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SlidingModal;


