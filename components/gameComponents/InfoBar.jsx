import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Modal,
  Animated,
  Easing,
  ImageBackground,
  Alert,
  FlatList,
  Button,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import SlidingModal from "./SlidingModal";
import { UserContext } from "../../context/UserContext";
import { GameContext } from "../../context/GameContext";
import { VillageContext } from "../../context/VillageContext"; // <-- New import
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InfoBar() {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [mailsModalVisible, setMailsModalVisible] = useState(false);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedMails, setSelectedMails] = useState(null);
  const [currentView, setCurrentView] = useState("info");
  const [allocated, setAllocated] = useState({
    strength: 0,
    resources: 0,
    defense: 0
  });

  const { user, logout } = useContext(UserContext);
  const {
    level,
    experience,
    maxExperience,
    resources,
    buildMaterialsTotal,
    mails,
    notifications, // Use directly from context
    health,
    maxHealth,
    strength,
    levelUpStats,
    credits,
    setCredits,
    setNotifications
  } = useContext(GameContext);

  const { buildMaterialsMax } = useContext(VillageContext);
  const [mail, setMail] = useState(mails);
  const [tempCredits, setTempCredits] = useState(credits); // Temporary credits for allocation

  const handleNotificationPress = async (notification) => {
    // Update the notification as read
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notification.id ? { ...notif, read: true } : notif
    );

    setNotifications(updatedNotifications);

    // Persist the updated notifications in AsyncStorage
    if (user) {
      try {
        await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error("Error saving updated notifications:", error);
      }
    }

    setSelectedNotification(notification);
  };


  const handleMailPress = (mail) => {
    setMail((prevMails) =>
      prevMails.map((notif) =>
        notif.id === mail.id ? { ...notif, read: true } : notif
      )
    );
    setSelectedMails(mail);
  };

  const handleLevelUp = () => {
    setCurrentView("levelUp");
  };

  const handleBackToInfo = () => {
    setCurrentView("info");
    setAllocated({
      strength: 0,
      defense: 0,
      resources: 0
    });
    resetAllocation();
  };

  const increaseAllocation = (field) => {
    if (tempCredits > 0) {
      setAllocated((prev) => ({
        ...prev,
        [field]: prev[field] + 1
      }));
      setTempCredits((prev) => prev - 1); // Update only tempCredits, not global credits
    }
  };

  const decreaseAllocation = (field) => {
    if (allocated[field] > 0) {
      setAllocated((prev) => ({
        ...prev,
        [field]: prev[field] - 1
      }));
      setTempCredits((prev) => prev + 1); // Return points back to tempCredits
    }
  };

  const confirmLevelUp = () => {
    if (allocated.strength > 0 || allocated.defense > 0 || allocated.resources > 0) {
      levelUpStats(allocated);
      setCredits(tempCredits); // Now credits update correctly
      setAllocated({
        strength: 0,
        defense: 0,
        resources: 0
      });
    }
  };

  const resetAllocation = () => {
    setTempCredits(credits); // Restore the initial credits amount
    setAllocated({
      strength: 0,
      defense: 0,
      resources: 0
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.userAndActionsSection}>
          <View style={styles.userSection}>
            <TouchableOpacity onPress={() => setUserInfoModalVisible((prev) => !prev)}>
              <Image style={styles.userIcon} source={{ uri: user.avatar }} />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      position: "absolute",
                      top: 4,
                      fontWeight: "bold",
                      fontSize: 18,
                      color: "rgba(107, 57, 0, 0.90)"
                    }}
                  >
                    {level}
                  </Text>
                  <Image
                    style={{ width: 45, height: 35, marginBottom: 2 }}
                    source={require("../../assets/images/lvlIcon.png")}
                  />
                </View>
                <Text style={{ fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)", fontSize: 12, marginTop: 20 }}>
                  {maxExperience}/{experience}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${(experience / maxExperience) * 100}%` }]} />
              </View>
            </View>
          </View>
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setMailsModalVisible((prev) => !prev)}>
              <Image style={styles.icons} source={require("../../assets/images/mailIcon.png")} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setNotificationsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/bellIcon.png")} />

              {/* Show badge only if there are unread notifications */}
              {notifications.some((notif) => !notif.read) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notifications.filter((notif) => !notif.read).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSettingsModalVisible((prev) => !prev)}>
              <Image style={styles.icons} source={require("../../assets/images/setting.png")} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.barnSection}>
          <Text style={styles.barnText}>
            🏚️{buildMaterialsMax} / {buildMaterialsTotal}
          </Text>
        </View>
        <View style={styles.resourcesSection}>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/woodIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{resources.wood}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/bricksIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{resources.clay}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/ironIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{resources.iron}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/cropIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{resources.crop}</Text>
          </View>
        </View>
      </View>
      <SlidingModal isVisible={mailsModalVisible} setIsVisible={setMailsModalVisible}>
        <Text style={styles.modalTitle}>Mails</Text>
        {selectedMails ? (
          <View style={styles.notificationDetailsContainer}>
            <View style={styles.notificationDetails}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sender: </Text>
                  <Text style={styles.detailTitle}>{mails.sender}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Subject: </Text>
                  <Text style={styles.detailTitle}>{selectedMails.title}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sent: </Text>
                  <Text style={styles.detailTime}>{selectedMails.time}</Text>
                </View>
              </View>
              <ScrollView style={styles.scrollViewContainer}>
                <Text style={styles.detailMessage}>{selectedMails.message}</Text>
              </ScrollView>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedMails(null)}>
                  <Text style={styles.modalButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.notificationsListContainer}>
            <FlatList
              style={styles.notificationsList}
              data={mail}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleMailPress(item)}
                  style={[styles.notificationItem, !item.read && styles.unreadNotifications]}
                >
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                    {item.sender}
                  </Text>
                  <Text style={styles.notificationText}>
                    {item.title.length > 30 ? item.title.substring(0, 30) + "..." : item.title}
                  </Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </SlidingModal>
      <SlidingModal isVisible={notificationsModalVisible} setIsVisible={setNotificationsModalVisible}>
        <Text style={styles.modalTitle}>Reports</Text>
        {selectedNotification ? (
          <View style={styles.notificationDetailsContainer}>
            <View style={styles.notificationDetails}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Subject: </Text>
                  <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sent: </Text>
                  <Text style={styles.detailTime}>{selectedNotification.time}</Text>
                </View>
              </View>
              <ScrollView style={styles.scrollViewContainer}>
                <Text style={styles.detailMessage}>{selectedNotification.message}</Text>
              </ScrollView>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedNotification(null)}>
                  <Text style={styles.modalButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.notificationsListContainer}>
            <FlatList
              style={styles.notificationsList}
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleNotificationPress(item)}
                  style={[styles.notificationItem, !item.read && styles.unreadNotifications]}
                >
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationText}>
                    {item.message.length > 30 ? item.message.substring(0, 30) + "..." : item.message}
                  </Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </SlidingModal>
      <SlidingModal isVisible={settingsModalVisible} setIsVisible={setSettingsModalVisible}>
        <Text style={styles.modalTitle}>Settings</Text>
        <View style={styles.buttonsMainContainer}>
          <View style={styles.buttonsContainer}>
            <View style={styles.settingsButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Contact Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Agreement</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.logoutButton}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSettingsModalVisible(false);
                  logout();
                }}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SlidingModal>

      <SlidingModal isVisible={userInfoModalVisible} setIsVisible={setUserInfoModalVisible}>
        {currentView === "info" && (
          <>
            <Text style={styles.modalTitle}>{user.name}</Text>
            <View style={styles.userInfoDetailsContainer}>
              <View style={styles.userInfoDetails}>
                <View style={{ position: "absolute", right: 55, top: 15 }}>
                  <Image style={styles.soldierImage} source={require("../../assets/images/soldier.png")} />
                </View>
                <View style={{ position: "absolute", top: 20, left: 35 }}>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        position: "absolute",
                        top: 12,
                        fontWeight: "bold",
                        fontSize: 35,
                        color: "rgba(107, 57, 0, 0.90)"
                      }}
                    >
                      {level}
                    </Text>
                    <Image style={{ width: 100, height: 80 }} source={require("../../assets/images/lvlIcon.png")} />
                  </View>
                </View>
                <View style={{ display: "absolute", top: 230, left: 10 }}>
                  <View style={{ flexDirection: "row", marginTop: 15 }}>
                    <Image style={styles.xpIcon} source={require("../../assets/images/xpIcon.png")} />
                    <Text style={{ fontSize: 14, marginRight: 32, fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)" }}>
                      Experiance:
                    </Text>
                    <Text style={{ marginLeft: 20, marginTop: 15, fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)", fontSize: 12 }}>
                      {maxExperience}/{experience}
                    </Text>
                    <View style={styles.userExperienceBarContainer}>
                      <View style={[styles.userExperienceBar, { width: `${(experience / maxExperience) * 100}%` }]} />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    <Image style={styles.xpIcon} source={require("../../assets/images/healthIcon.png")} />
                    <Text style={{ fontSize: 14, marginRight: 85, fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)" }}>
                      Health:
                    </Text>
                    <Text style={{ marginLeft: 0, fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)", fontSize: 12, marginTop: 15 }}>
                      {maxHealth}/{health}
                    </Text>
                    <View style={styles.userExperienceBarContainer}>
                      <View style={[styles.userExperienceBar, { width: `${(health / maxHealth) * 100}%` }]} />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    <Image style={styles.xpIcon} source={require("../../assets/images/swordIcon.png")} />
                    <Text style={{ fontSize: 14, marginRight: 3, fontWeight: "bold", color: "rgba(107, 57, 0, 0.90)" }}>
                      Strength:
                    </Text>
                    <Text style={styles.strengthText}>{strength}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.attributesButton} onPress={handleLevelUp}>
                  <Text style={styles.attributesButtonText}>Attributes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {currentView === "levelUp" && (
          <>
            <Text style={styles.modalTitle}>Attributes</Text>
            <View style={{ alignItems: "center" }}>
              <View style={styles.attributesContainer}>
                <Text style={styles.creditsText}>Points available: {credits}</Text>
                <View style={styles.levelUpOptions}>
                  <View style={styles.allocationRow}>
                    <Text style={styles.allocationLabel}>Strength</Text>
                    <View style={styles.allocationControls}>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => decreaseAllocation("strength")}
                        disabled={allocated["strength"] === 0}
                      >
                        <Text style={styles.controlButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.allocationValue}>{allocated["strength"]}</Text>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => increaseAllocation("strength")}
                        disabled={credits === 0}
                      >
                        <Text style={styles.controlButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.allocationRow}>
                    <Text style={styles.allocationLabel}>Defense</Text>
                    <View style={styles.allocationControls}>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => decreaseAllocation("defense")}
                        disabled={allocated["defense"] === 0}
                      >
                        <Text style={styles.controlButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.allocationValue}>{allocated["defense"]}</Text>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => increaseAllocation("defense")}
                        disabled={credits === 0}
                      >
                        <Text style={styles.controlButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.allocationRow}>
                    <Text style={styles.allocationLabel}>Resources</Text>
                    <View style={styles.allocationControls}>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => decreaseAllocation("resources")}
                        disabled={allocated["resources"] === 0}
                      >
                        <Text style={styles.controlButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.allocationValue}>{allocated["resources"]}</Text>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => increaseAllocation("resources")}
                        disabled={credits === 0}
                      >
                        <Text style={styles.controlButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={styles.resetButton} onPress={resetAllocation}>
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmLevelUp}>
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackToInfo}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </SlidingModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "#F4E2C8"
  },
  container: {
    backgroundColor: "#F4E2C8",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    borderBottomWidth: 2,
    borderColor: "#8B4513",
    width: "100%",
    zIndex: 999
  },
  userAndActionsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center"
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513"
  },
  userInfo: {
    marginLeft: 5
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513"
  },
  progressBarContainer: {
    width: 140,
    height: 10,
    backgroundColor: "#DDD",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(107, 57, 0, 0.90)"
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#8B4513"
  },
  actionsSection: {
    flexDirection: "row"
  },
  actionButton: {
    marginHorizontal: 8,
    borderRadius: 5
  },
  icons: {
    width: 32,
    height: 32,
    opacity: 0.8
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  resourcesSection: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5
  },
  resourceIcon: {
    width: 25,
    height: 25,
    marginRight: 5
  },
  resourceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8B4513"
  },
  barnSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#DCC7A1",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(107, 57, 0, 0.90)",
    marginTop: 4
  },
  barnText: {
    fontSize: 14,
    color: "#6B3900",
    fontWeight: "bold"
  },
  modalTitle: {
    fontSize: 30,
    color: "rgb(107, 57, 0)",
    paddingVertical: 3,
    paddingHorizontal: 30,
    marginTop: 35,
    fontWeight: "bold"
  },
  settingsButtons: {
    marginTop: 50
  },
  buttonsMainContainer: {
    alignItems: "center",
    marginTop: 20
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "84%"
  },
  modalButton: {
    backgroundColor: "rgba(182, 135, 81, 0.52)",
    paddingVertical: 8,
    margin: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 250
  },
  modalButtonText: {
    color: "rgb(107, 57, 0)",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center"
  },
  logoutButton: {
    marginTop: 90,
    marginBottom: 10
  },
  notificationsListContainer: {
    alignItems: "center"
  },
  notificationsList: {
    marginTop: 20,
    paddingBottom: Platform.OS === "ios" ? 50 : 13,
    borderWidth: 4,
    borderRadius: 10,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "78%"
  },
  notificationItem: {
    marginTop: 5,
    padding: 7,
    width: "95%",
    marginLeft: 8,
    borderWidth: 2,
    borderColor: "#8B4513",
    borderTopWidth: 2,
    borderRadius: 8,
    backgroundColor: "rgba(182, 135, 81, 0.20)"
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "rgb(107, 57, 0)"
  },
  notificationText: {
    fontSize: 14,
    color: "#555"
  },
  notificationTime: {
    fontSize: 12,
    color: "rgb(107, 57, 0)",
    marginTop: 5
  },
  notificationDetailsContainer: {
    alignItems: "center"
  },
  notificationDetails: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "84%"
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgb(85, 60, 32)",
    marginBottom: 3
  },
  scrollViewContainer: {
    marginBottom: 10,
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    borderColor: "rgba(107, 57, 0, 0.43)",
    flex: 1
  },
  detailMessage: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 25
  },
  detailTime: {
    fontSize: 14,
    color: "rgb(85, 60, 32)",
    marginBottom: 20,
    fontWeight: "bold"
  },
  unreadNotifications: {
    backgroundColor: "rgba(182, 135, 81, 0.52)"
  },
  unreadText: {
    fontWeight: "bold"
  },
  userInfoDetailsContainer: {
    alignItems: "center"
  },
  userInfoDetails: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "84%"
  },
  soldierImage: {
    width: 85,
    height: 230
  },
  userExperience: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgb(85, 60, 32)"
  },
  userHealth: {
    fontSize: 14,
    color: "rgb(85, 60, 32)",
    fontWeight: "bold"
  },
  userExperienceBarContainer: {
    width: 150,
    height: 10,
    backgroundColor: "#DDD",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 5,
    marginLeft: 10,
    position: "absolute",
    right: 20,
    borderWidth: 2,
    borderColor: "rgba(107, 57, 0, 0.90)"
  },
  userExperienceBar: {
    height: "100%",
    backgroundColor: "#8B4513"
  },
  xpIcon: {
    marginRight: 5,
    marginTop: -5,
    marginBottom: 10,
    height: 25,
    width: 25
  },
  strengthText: {
    position: "absolute",
    right: 145,
    fontWeight: "bold",
    color: "rgba(107, 57, 0, 0.90)"
  },
  userLevel: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    height: 80,
    width: 100,
    left: 35,
    top: 20
  },
  userLevelText: {
    position: "absolute",
    fontSize: 35,
    top: 30,
    left: 63,
    fontWeight: "bold",
    color: "rgba(107, 57, 0, 0.90)"
  },
  attributesButton: {
    backgroundColor: "rgba(182, 135, 81, 0.52)",
    paddingVertical: 2,
    marginTop: 80,
    marginLeft: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 130
  },
  attributesButtonText: {
    color: "rgb(107, 57, 0)",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center"
  },
  attributesContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "rgba(107, 57, 0, 0.43)",
    width: "94%",
    height: "84%"
  },
  creditsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
    color: "rgba(107, 57, 0, 0.90)",
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(107, 57, 0, 0.43)",
    paddingVertical: 3
  },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 30
  },
  allocationLabel: {
    fontSize: 16,
    color: "rgba(107, 57, 0, 0.90)",
    fontWeight: "bold"
  },
  allocationControls: {
    flexDirection: "row",
    alignItems: "center"
  },
  allocationValue: {
    fontSize: 16,
    marginHorizontal: 10
  },
  controlButton: {
    backgroundColor: "rgba(107, 57, 0, 0.90)",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  controlButtonText: {
    color: "white",
    fontSize: 16
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: "rgba(182, 135, 81, 0.52)",
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 150
  },
  confirmButtonText: {
    color: "rgb(107, 57, 0)",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  resetButton: {
    marginRight: 20,
    marginTop: 10,
    backgroundColor: "rgba(182, 135, 81, 0.52)",
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 150
  },
  resetButtonText: {
    color: "rgb(107, 57, 0)",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "rgba(182, 135, 81, 0.52)",
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 300
  },
  backButtonText: {
    color: "rgb(107, 57, 0)",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  }
});



