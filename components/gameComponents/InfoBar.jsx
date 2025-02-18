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
  Button,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import SlidingModal from "./SlidingModal";

const initialNotifications = [
  { id: 1, title: "New Message", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
  { id: 2, title: "Order Update", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
  { id: 3, title: "Meeting Reminder", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false },
  { id: 4, title: "New Message", message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum", time: "10:30 AM", read: false },
  { id: 5, title: "Order Update", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
  { id: 6, title: "Meeting Reminder", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false }
];
const initialMails = [
  { id: 1, title: "Nothing here", sender: "Mark", message: "Sveiki atvykę! H1p5ter1s Tai nauji jūsų namai. Apsižvalgykite. Vešlūs laukai, auksiniai ūkio augalai ir geležies kalnai – jie visi priklauso tau. Galbūt jūsų kaimas kol kas nėra didelis, bet protu ir sunkiu darbu galite jį paversti imperija. Vis dėlto didžiam vadovui reikia daugiau nei dorybės – jam reikia išminties. Todėl paklausykite manęs: Pasaulis sukasi aplink resursus. Jie reikalingi jūsų pastatams, jūsų kariuomenė jais maitinasi ir dėl jų kariaujama karuose. Tačiau svarbu, kad suprastumėte: ištekliai yra priemonė, kuri gali pasibaigti. Visada juos išnaudokite. Jūsų pradedančiojo apsauga išnyks po 5 dienų, o užpuolikai ilgai nelauks. Dažnai žaiskite ir investuokite į slėptuvę bei kitus išteklių laukus, kad išlaikytumėte klestinčią ekonomiką.", time: "10:30 AM", read: false },
  { id: 2, title: "Party invite", sender: "David", message: "Your order #1234 has been shipped and will arrive soon.", time: "Yesterday", read: false },
  { id: 3, title: "Games begins", sender: "StrideLands", message: "Reminder: Team meeting at 3 PM. Don't be late!", time: "Monday", read: false }
];

export default function InfoBar() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [mailsModalVisible, setMailsModalVisible] = useState(false);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mails, setMails] = useState(initialMails);
  const [selectedMails, setSelectedMails] = useState(null);

  useEffect(() => {
    const fetchedUser = {
      name: "Player1",
      icon: require("../../assets/images/barbarian.jpg"),
      level: 14,
      health: 75,
      maxHealth: 100,
      experience: 300,
      maxExperience: 500,
      strength: 180
    };
    setUser(fetchedUser);

    const fetchedResources = [
      { name: "Gold", value: 200 },
      { name: "Wood", value: 100000 },
      { name: "Clay", value: 80000 },
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
            <TouchableOpacity
              onPress={() => setUserInfoModalVisible((prev) => !prev)}
            >
              <Image style={styles.userIcon} source={user.icon} />
            </TouchableOpacity>
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
              <Image style={styles.icons} source={require("../../assets/images/mailIcon.png")} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setNotificationsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/bellIcon.png")} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSettingsModalVisible((prev) => !prev)}
            >
              <Image style={styles.icons} source={require("../../assets/images/setting.png")} />
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
          <View style={styles.notificationDetailsContainer}>
            <View style={styles.notificationDetails}>
              <View style={{}}>
                <View style={{ flexDirection: "row", }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sender: </Text>
                  <Text style={styles.detailTitle}>{selectedMails.sender}</Text>
                </View>
                <View style={{ flexDirection: "row", }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Subject: </Text>
                  <Text style={styles.detailTitle}>{selectedMails.title}</Text>
                </View>
                <View style={{ flexDirection: "row", }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sent: </Text>
                  <Text style={styles.detailTime}>{selectedMails.time}</Text>
                </View>
              </View>
              <ScrollView style={styles.scrollViewContainer}>
                <Text style={styles.detailMessage}>{selectedMails.message}</Text>
              </ScrollView>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedMails(null)}
                >
                  <Text style={styles.modalButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.notificationsListContainer}>
            <FlatList
              style={styles.notificationsList}
              data={mails}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleMailPress(item)} style={[styles.notificationItem, !item.read && styles.unreadNotifications]}>
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.sender}</Text>
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
              <View style={{}}>
                <View style={{ flexDirection: "row", }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Subject: </Text>
                  <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
                </View>
                <View style={{ flexDirection: "row", }}>
                  <Text style={{ fontSize: 14, marginRight: 3 }}>Sent: </Text>
                  <Text style={styles.detailTime}>{selectedNotification.time}</Text>
                </View>
              </View>
              <ScrollView style={styles.scrollViewContainer}>
                <Text style={styles.detailMessage}>{selectedNotification.message}</Text>
              </ScrollView>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedNotification(null)}
                >
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
                <TouchableOpacity onPress={() => handleNotificationPress(item)} style={[styles.notificationItem, !item.read && styles.unreadNotifications]}>
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
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
        <Text style={styles.modalTitle}>
          Settings
        </Text>
        <View style={styles.buttonsMainContainer}>
          <View style={styles.buttonsContainer}>
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
          </View>
        </View>
      </SlidingModal>


      <SlidingModal isVisible={userInfoModalVisible} setIsVisible={setUserInfoModalVisible}>
        <Text style={styles.modalTitle}>
          Player1
        </Text>
        <View style={styles.userInfoDetailsContainer}>
          <View style={styles.userInfoDetails}>
            <View style={{ position: 'absolute', right: 75, top: 15 }}>
              <Image style={styles.soldierImage} source={require("../../assets/images/soldier.png")} />
              <Text style={styles.userLevelText}>{user.level}</Text>
              <Image style={styles.userLevel} source={require("../../assets/images/lvlIcon.png")} />
            </View>
            <View style={{display: 'absolute', top: 250, left: 10}}>
              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <Image style={styles.xpIcon} source={require("../../assets/images/xpIcon.png")} />
                <Text style={{ fontSize: 14, marginRight: 32, fontWeight: 'bold' }}>Experiance: </Text>
                {/*<Image style={styles.xpIcon} source={require("../../assets/images/xpIcon.png")} />*/}
                <View style={styles.userExperienceBarContainer}>
                  <View
                    style={[
                      styles.userExperienceBar,
                      { width: `${(user.experience / user.maxExperience) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", }}>
                <Image style={styles.xpIcon} source={require("../../assets/images/healthIcon.png")} />
                <Text style={{ fontSize: 14, marginRight: 85, fontWeight: 'bold' }}>Health:</Text>
                <View style={styles.userExperienceBarContainer}>
                  <View
                    style={[
                      styles.userExperienceBar,
                      { width: `${(user.health / user.maxHealth) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", }}>
                <Image style={styles.xpIcon} source={require("../../assets/images/swordIcon.png")} />
                <Text style={{ fontSize: 14, marginRight: 3, fontWeight: 'bold' }}>Strength: </Text>
                <Text style={styles.strengthText}>{user.strength}</Text>
              </View>
            </View>
          </View>
        </View>
      </SlidingModal>
    </SafeAreaView >
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
  icons: {
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
    paddingVertical: 3,
    paddingHorizontal: 30,
    marginTop: 80,
    fontWeight: 'bold',
  },
  settingsButtons: {
    marginTop: 50

  },
  buttonsMainContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonsContainer: {
    alignItems: 'center',
    borderWidth: 4,
    borderRadius: 10,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
  },
  modalButton: {
    backgroundColor: 'rgba(182, 135, 81, 0.52)',
    paddingVertical: 8,
    margin: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B4513",
    width: 250,
  },
  modalButtonText: {
    color: 'rgb(107, 57, 0)',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  logoutButton: {
    marginTop: 90,
    marginBottom: 10,
  },
  notificationsListContainer: {
    alignItems: 'center',
  },
  notificationsList: {
    marginTop: 20,
    paddingBottom: Platform.OS === "ios" ? 50 : 13,
    borderWidth: 4,
    borderRadius: 10,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
    height: '63%',
  },
  notificationItem: {
    marginTop: 5,
    padding: 7,
    width: '95%',
    marginLeft: 8,
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
  notificationDetailsContainer: {
    alignItems: 'center',
  },
  notificationDetails: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
    height: '73.4%',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(85, 60, 32)',
    marginBottom: 3,
  },
  scrollViewContainer: {
    marginBottom: 10,
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    flex: 1
  },
  detailMessage: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 25,

  },
  detailTime: {
    fontSize: 14,
    color: 'rgb(85, 60, 32)',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  unreadNotifications: {
    backgroundColor: 'rgba(182, 135, 81, 0.52)',
  },
  unreadText: {
    fontWeight: 'bold',
  },

  userInfoDetailsContainer: {
    alignItems: 'center',
  },
  userInfoDetails: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(107, 57, 0, 0.43)',
    width: '94%',
    height: '73.4%',
  },
  soldierImage: {
    width: 95,
    height: 250
  },
  userExperience: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(85, 60, 32)',
  },
  userHealth: {
    fontSize: 14,
    color: 'rgb(85, 60, 32)',
    fontWeight: 'bold'
  },
  userExperienceBarContainer: {
    width: 150,
    height: 10,
    backgroundColor: "#DDD",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 5,
    marginLeft: 10,
    position: 'absolute',
    right: 20,
    borderWidth: 2,
    borderColor: 'rgba(107, 57, 0, 0.90)',
  },
  userExperienceBar: {
    height: "100%",
    backgroundColor: "#8B4513",
  },
  xpIcon:{
    marginRight: 5,
    marginTop: -5,
    marginBottom: 10,
    height: 25,
    width: 25,
  },
  strengthText:{
    position: 'absolute',
    right: 145,
    fontWeight: 'bold',
  },
  userLevel:{
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    height: 60,
    width: 70,
    left: 80,
    top: 190,
  },
  userLevelText:{
    position: 'absolute',
    fontSize: 30,
    top: 198,
    left: 98,
    fontWeight: 'bold',
    color: 'rgba(107, 57, 0, 0.90)',
  },
});



