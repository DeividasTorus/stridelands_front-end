import React, { useState, useEffect, useRef } from "react";
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
    Button
} from "react-native";
import { useRouter } from "expo-router";
import SlidingModal from "./SlidingModal";

const initialNotifications = [
  { id: 1, title: "New Message", message: "You have a new message from John! Click to read more.", time: "10:30 AM", read: false },
  { id: 2, title: "Order Update", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
  { id: 3, title: "Meeting Reminder", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false }
];
const initialMails = [
  { id: 1, title: "Mark", message: "You have a new message from John! Click to read more.", time: "10:30 AM", read: false },
  { id: 2, title: "David", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
  { id: 3, title: "SideRide", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false }
];

export default function InfoBar() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [mailsModalVisible, setMailsModalVisible] = useState(false);
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mails, setMails] = useState(initialMails);
  const [selectedMails, setSelectedMails] = useState(null);

  useEffect(() => {
    const fetchedUser = {
      name: "Player1",
      icon: require("../../assets/images/barbarian.jpg"),
      experience: 300,
      maxExperience: 500,
    };
    setUser(fetchedUser);

    const fetchedResources = [
      { name: "Gold", value: 200 },
      { name: "Wood", value: 100000 },
      { name: "Clay", value: 80000},
      { name: "Iron", value: 600000 },
      { name: "Crop", value: 20000 },
    ];
    setResources(fetchedResources);
  }, []);

  if (!user || resources.length === 0) return null;

  const wood = resources.find(r => r.name === "Wood")?.value || 0;
  const clay = resources.find(r => r.name === "Clay")?.value || 0;
  const iron = resources.find(r => r.name === "Iron")?.value || 0;
  const crop = resources.find(r => r.name === "Crop")?.value || 0;

  const buildMaterialsTotal = wood + clay + iron;
  const buildMaterialsMax = 5000;
  const cropMax = 3000;

  const handleNotificationPress = (notification) => {
    setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
            notif.id === notification.id ? { ...notif, read: true } : notif
        )
    );
    setSelectedNotification(notification);
  };

  const handleMailPress = (mail) => {
    setMails((prevMails) =>
        prevMails.map((notif) =>
            notif.id === mail.id ? { ...notif, read: true } : notif
        )
    );
    setSelectedMails(mail);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.userAndActionsSection}>
          <View style={styles.userSection}>
            <Image source={user.icon} style={styles.userIcon} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.name}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(user.experience / user.maxExperience) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.actionsSection}>
            <TouchableOpacity
                style={styles.actionButton}
                  onPress={() => setMailsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/mailIcon.png")}/>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setNotificationsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/bellIcon.png")}/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSettingsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/setting.png")}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.barnSection}>
          <Text style={styles.barnText}>🏚️ {buildMaterialsMax}/{buildMaterialsTotal}</Text>
        </View>
        <View style={styles.resourcesSection}>
          {/* <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/goldIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{resources.find(r => r.name === "Gold")?.value || 0}</Text>
          </View> */}
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/woodIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{wood}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/bricksIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{clay}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/ironIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{iron}</Text>
          </View>
          <View style={styles.resourceItem}>
            <Image source={require("../../assets/images/cropIcon.png")} style={styles.resourceIcon} />
            <Text style={styles.resourceText}>{crop}</Text>
          </View>
        </View>
      </View>
      <SlidingModal isVisible={mailsModalVisible} setIsVisible={setMailsModalVisible}>
        <Text style={styles.modalTitle}>Mails</Text>

        {selectedMails ? (
            // Show Full Notification Details
            <View style={styles.notificationDetails}>
              <Text style={styles.detailTitle}>{selectedMails.title}</Text>
              <Text style={styles.detailMessage}>{selectedMails.message}</Text>
              <Text style={styles.detailTime}>{selectedMails.time}</Text>
              <Button title="Back to Notifications" onPress={() => setSelectedMails(null)} />
            </View>
        ) : (
            // Show Notification List with Read/Unread Indicator
            <FlatList
                style={styles.notificationsList}
                data={mails}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleMailPress(item)} style={[styles.notificationItem, !item.read && styles.unreadNotifications]}>
                      <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
                      <Text style={styles.notificationText}>
                        {item.message.length > 30 ? item.message.substring(0, 30) + "..." : item.message}
                      </Text>
                      <Text style={styles.notificationTime}>{item.time}</Text>
                    </TouchableOpacity>
                )}
            />
        )}
      </SlidingModal>
      <SlidingModal isVisible={notificationsModalVisible} setIsVisible={setNotificationsModalVisible}>
        <Text style={styles.modalTitle}>Notifications</Text>

        {selectedNotification ? (
            // Show Full Notification Details
            <View style={styles.notificationDetails}>
              <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
              <Text style={styles.detailMessage}>{selectedNotification.message}</Text>
              <Text style={styles.detailTime}>{selectedNotification.time}</Text>
              <Button title="Back to Notifications" onPress={() => setSelectedNotification(null)} />
            </View>
        ) : (
            // Show Notification List with Read/Unread Indicator
            <FlatList
                style={styles.notificationsList}
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleNotificationPress(item)} style={[styles.notificationItem, !item.read && styles.unreadNotifications]}>
                      <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
                      <Text style={styles.notificationText}>
                        {item.message.length > 30 ? item.message.substring(0, 30) + "..." : item.message}
                      </Text>
                      <Text style={styles.notificationTime}>{item.time}</Text>
                    </TouchableOpacity>
                )}
            />
        )}
      </SlidingModal>
      <SlidingModal isVisible={settingsModalVisible} setIsVisible={setSettingsModalVisible}>
        <Text style={styles.modalTitle}>
          Settings
        </Text>
        <View style={styles.settingsButtons}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setSettingsModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setSettingsModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setSettingsModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Agreement</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logoutButton}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setSettingsModalVisible(false);
              router.push('auth/login');
            }}
          >
            <Text style={styles.modalButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SlidingModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "#F4E2C8",
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
    alignItems: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
  },
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  progressBarContainer: {
    width: 100,
    height: 10,
    backgroundColor: "#DDD",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#8B4513",
  },
  actionsSection: {
    flexDirection: "row",
  },
  actionButton: {
    marginHorizontal: 8,
    borderRadius: 5,
  },
  icons:{
    width: 32,
    height: 32,
    opacity: 0.8
  },
  resourcesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  resourceIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8B4513",
  },
  barnSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#DCC7A1",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'black',
    marginTop: 4
  },
  barnText: {
    fontSize: 14,
    color: "#6B3900",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 30,
    color: 'rgb(107, 57, 0)',
    marginTop: 170,
    fontWeight: 'bold'
  },
  settingsButtons: {
    marginTop: 10
  },
  modalButton: {
    backgroundColor: 'rgba(182, 135, 81, 0.52)',
    paddingVertical: 8,
    paddingHorizontal: 40,
    margin: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
  },
  modalButtonText: {
    color: 'rgb(107, 57, 0)',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  logoutButton: {
    marginTop: 30
  },
  notificationsList:{
    marginTop: 8,
    paddingBottom: 20
  },
  notificationItem: {
    marginTop: 5,
    padding: 7,
    width: '89%',
    marginLeft: 14,
    borderWidth: 2,
    borderColor: '#8B4513',
    borderTopWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(182, 135, 81, 0.20)',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: 'rgb(107, 57, 0)',
  },
  notificationText: {
    fontSize: 14,
    color: '#555',
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgb(107, 57, 0)',
    marginTop: 5,
  },
  notificationDetails: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailMessage: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  detailTime: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  unreadNotifications:{
    backgroundColor: 'rgba(182, 135, 81, 0.52)',
  },
  unreadText: {
    fontWeight: 'bold',
  },
});



