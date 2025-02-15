// components/SlidingModal.js
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
} from "react-native";

const SlidingModal = ({ isVisible, setIsVisible, children }) => {
  const slideAnim = useRef(new Animated.Value(-1000)).current;

  // Animate the modal from top when it's opened
  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(-1000);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
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
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ImageBackground
            source={require('../../assets/images/modalFrame.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.modalContent}>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    marginTop: 160,
  },
  backgroundImage: {
    width: '100%',
    height: '86%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitButton: {
    position: 'absolute',
    top: 150,
    right: 80,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 54, 1, 0.55)',
    borderWidth: 2,
    borderColor: "rgba(100, 54, 1, 0.55)",
  },
  exitButtonText: {
    color: 'rgb(201, 171, 136)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SlidingModal;

