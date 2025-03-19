import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, FlatList } from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import Countdown from "../gameComponents/Countdown";
import { VillageContext } from "../../context/VillageContext";
import { AllianceContext } from "../../context/AllianceContext"
import { UserContext } from "../../context/UserContext";

const flags = [
    { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/3909/3909383.png' },
    { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/11654/11654463.png' },
    { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/197/197374.png' }
];

export default function AllianceHallModal({ isVisible, setIsVisible }) {
    const { buildings, } = useContext(VillageContext);
    const { createAlliance, invitePlayer, acceptInvitation, getPlayerAlliance, alliances } = useContext(AllianceContext);
    const { user } = useContext(UserContext);
    // Find the Warehouse building
    const allianceHall = buildings.find((b) => b.name === "Alliance Hall");
    if (!allianceHall) return null;

    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const userAlliance = alliances.find(alliance => alliance.members.includes(user?.id));

    const handleCreate = () => {
        if (!name || !tag || !selectedFlag || !description) {
            alert('Please fill in all fields');
            return;
        }
        createAlliance(name, tag, selectedFlag, description);
    };


    const [selectedAlliance, setSelectedAlliance] = useState(null);
    const [currentView, setCurrentView] = useState("alliances");


    // Filter alliances based on the search query
    const filteredAlliance = alliances.find(alliance =>
        alliance.name.toLowerCase().includes(searchQuery.toLowerCase())
    );




    return (
        <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
            <View style={styles.modalContent}>
                <View style={{ flexDirection: "row" }}>
                    <Image
                        source={require("../../assets/images/AllianceHall.png")}
                        style={styles.buildingIcon}
                    />
                    <View>
                        <Text style={styles.modalTitle}>Alliance Hall</Text>
                        <Text style={styles.levelText}>Level: {allianceHall.level}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.infoContainer}>
                        <View style={{ alignItems: 'center' }}>
                            <View style={styles.storageContainer}>
                                <TouchableOpacity title="Back to Troops" style={styles.alliancesButton} onPress={() => setCurrentView("alliances")}>
                                    <Text style={styles.allianceButtonText}>Alliance's</Text>
                                </TouchableOpacity>
                                <TouchableOpacity title="Back to Troops" style={styles.alliancesButton} onPress={() => setCurrentView("myAlliance")} >
                                    <Text style={styles.allianceButtonText}>My Alliance</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {currentView === "alliances" && (
                            <View style={{ alignItems: "center" }}>
                                {/* Search Input for Live Filtering */}
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search Alliance by Name..."
                                    placeholderTextColor="#888" // Adjust the color to make it visible
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />

                                <View style={styles.resourcesContainer}>
                                    {alliances.length === 0 ? (
                                        <View style={styles.noResultsContainer}>
                                            <Text style={styles.noResultsText}>No Alliances Created Yet.</Text>
                                        </View>
                                    ) : (
                                        <>
                                            {/* Filter alliances only if they START with the search query */}
                                            {alliances.filter(alliance =>
                                                alliance.name.toLowerCase().startsWith(searchQuery.toLowerCase()) // Only match from the beginning
                                            ).length === 0 ? (
                                                <View style={styles.noResultsContainer}>
                                                    <Text style={styles.noResultsText}>No Alliances found</Text>
                                                </View>
                                            ) : (
                                                <FlatList
                                                    data={alliances.filter(alliance =>
                                                        alliance.name.toLowerCase().startsWith(searchQuery.toLowerCase()) // Apply startsWith
                                                    )}
                                                    keyExtractor={(item) => item.id}
                                                    renderItem={({ item }) => (
                                                        <View key={item.id}>
                                                            <TouchableOpacity
                                                                key={item.id}
                                                                onPress={() => { setSelectedAlliance(item); setCurrentView("allianceInfo"); }}
                                                                style={styles.troopsButtonContainer}
                                                            >
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                                                                    {item.flag && <Image source={{ uri: item.flag }} style={{ width: 45, height: 45, marginRight: 10 }} />}
                                                                    <View>
                                                                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name} [{item.tag}]</Text>
                                                                        <View style={{ flexDirection: 'row' }}>
                                                                            <Text style={styles.aliancesInfoText}>Members: {item.members.length}</Text>
                                                                            <Text style={styles.aliancesInfoText}>Points: {item.points}</Text>
                                                                        </View>
                                                                        <Text style={styles.aliancesInfoText}>War's Won: {item.warWon}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                />
                                            )}
                                        </>
                                    )}
                                </View>
                            </View>
                        )}
                        {currentView === "allianceInfo" && selectedAlliance && (
                            <View>
                                <View style={styles.myAllianceContainer}>
                                    <View style={{ flexDirection: 'row', justifyContent: "space-between", }}>
                                        <View>
                                            <Text style={styles.allianceTitle}>{selectedAlliance.name} [{selectedAlliance.tag}]</Text>
                                            <Text style={styles.myAllianceDescription}>{selectedAlliance.description}</Text>
                                            <View style={{ alignItems: 'center', marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '95%' }}>
                                                    <Text style={styles.myAllianceInfoText}>Members: {selectedAlliance.members.length}</Text>
                                                    <Text style={styles.myAllianceInfoText}>War's Won: {selectedAlliance.warWon}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        {selectedAlliance.flag && <Image source={{ uri: selectedAlliance.flag }} style={styles.myAllianceImage} />}
                                    </View>
                                    <Text style={styles.myMembersTitle}>Members</Text>
                                    <View style={styles.membersContainer}>

                                    </View>
                                </View>
                            </View>
                        )}
                        {currentView === "myAlliance" && (
                            <View>
                                {userAlliance ? (
                                    <View style={styles.myAllianceContainer}>
                                        <View style={{ flexDirection: 'row', justifyContent: "space-between", }}>
                                            <View>
                                                <Text style={styles.allianceTitle}>{userAlliance.name} [{userAlliance.tag}]</Text>
                                                <Text style={styles.myAllianceDescription}>{userAlliance.description}</Text>
                                                <View style={{ alignItems: 'center', marginTop: 10 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '95%' }}>
                                                        <Text style={styles.myAllianceInfoText}>Members: {userAlliance.members.length}</Text>
                                                        <Text style={styles.myAllianceInfoText}>War's Won: {userAlliance.warWon}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {userAlliance.flag && <Image source={{ uri: userAlliance.flag }} style={styles.myAllianceImage} />}
                                        </View>
                                        <Text style={styles.myMembersTitle}>Members</Text>
                                        <View style={styles.membersContainer}>

                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Create Alliance</Text>
                                        <Text>Name:</Text>
                                        <TextInput
                                            style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Enter alliance name"
                                            maxLength={12}
                                        />
                                        <Text>Tag:</Text>
                                        <TextInput
                                            style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
                                            value={tag}
                                            onChangeText={(text) => setTag(text.toUpperCase())}
                                            placeholder="Enter alliance tag"
                                            maxLength={3}
                                        />
                                        <TextInput
                                            style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Enter Alliance description"
                                            maxLength={80}
                                        />
                                        <Text>Choose Flag:</Text>
                                        <FlatList
                                            horizontal
                                            data={flags}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => setSelectedFlag(item.uri)}>
                                                    <Image source={{ uri: item.uri }} style={{ width: 50, height: 50, margin: 5, borderWidth: selectedFlag === item.uri ? 2 : 0, borderColor: 'blue' }} />
                                                </TouchableOpacity>
                                            )}
                                        />
                                        <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: 'blue', padding: 10, marginTop: 20 }}>
                                            <Text style={{ color: 'white', textAlign: 'center' }}>Create Alliance</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </SlidingModal>
    );
}

const styles = StyleSheet.create({
    modalContent: {

    },
    scrollContainer: {
        flexGrow: 1,
    },
    buildingIcon: {
        height: 80,
        width: 80,
        marginTop: 25,
        marginLeft: 15,
    },
    modalTitle: {
        fontSize: 30,
        color: "rgb(107, 57, 0)",
        paddingVertical: 3,
        marginLeft: 5,
        marginTop: 30,
        fontWeight: "bold",
    },
    levelText: {
        fontSize: 18,
        marginLeft: 6,
        fontWeight: "bold",
        color: "rgba(107, 57, 0, 0.70)",
    },
    infoContainer: {
        marginTop: 7,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: "rgba(107, 57, 0, 0.43)",
        width: "94%",
        height: "83%",
    },
    searchInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        marginTop: 8,
        width: '100%',
        paddingVertical: 6,
        paddingLeft: 8
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noResultsText: {
        fontSize: 20,
        color: "rgb(107, 57, 0)",
        paddingVertical: 3,
        fontWeight: "bold",

    },
    resourcesContainer: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '100%',
        height: '80%',
        marginTop: 10
    },
    storageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5,
        width: '90%',
        textAlign: 'center'
    },
    troopsButtonContainer: {
        borderWidth: 3,
        margin: 5,
        borderRadius: 8,
        borderColor: 'rgba(107, 57, 0, 0.43)',
    },
    alliancesButton: {
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
        paddingHorizontal: 25,
    },
    allianceButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: 'rgba(107, 57, 0, 0.70)',
        textAlign: 'center'
    },
    myAllianceContainer: {
        marginTop: 15
    },
    myAllianceImage: {
        width: 70,
        height: 70,
        position: 'absolute',
        right: 5
    },
    allianceTitle: {
        fontSize: 20,
        color: "rgb(107, 57, 0)",
        paddingVertical: 3,
        fontWeight: "bold",
    },
    myAllianceDescription: {
        fontSize: 15,
        fontWeight: "bold",
        color: "rgba(107, 57, 0, 0.70)",
        maxWidth: '82%'
    },
    myAllianceInfoText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "rgb(107, 57, 0)",
    },
    myMembersTitle: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: "bold",
        color: "rgb(107, 57, 0)",
        marginTop: 10
    },
    membersContainer: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '100%',
        height: '53%',
        marginTop: 5
    },
    aliancesInfoText: {
        marginRight: 10
    },
});