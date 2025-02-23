import React, { useContext } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import SlidingModal from "../../components/gameComponents/SlidingModal";
import { GameContext } from "../../context/GameContext";
import {UserContext} from "../../context/UserContext";

export default function WarehouseModal({ isVisible, setIsVisible }) {
    const { buildings, updateBuildings, resources, buildMaterialsMax, buildMaterialsTotal } = useContext(GameContext);
    const { user, } = useContext(UserContext);

    const wareHouse = buildings.find((b) => b.name === "Warehouse"); // ✅ Find Town Hall data
    if (!wareHouse) return null;

    const upgradeCost = {
        wood: Math.floor(wareHouse.resourceCost.wood * 1.2), // 20% increase
        clay: Math.floor(wareHouse.resourceCost.clay * 1.2),
        iron: Math.floor(wareHouse.resourceCost.iron * 1.2),
    };

    const canUpgrade =
        resources.wood >= upgradeCost.wood &&
        resources.clay >= upgradeCost.clay &&
        resources.iron >= upgradeCost.iron;

    return (
        <SlidingModal isVisible={isVisible} setIsVisible={setIsVisible}>
            <View style={styles.modalContent}>
                <View style={{flexDirection: "row"}}>
                    <Image source={require("../../assets/images/wareHouseIcon.png")} style={styles.buildingIcon} />
                    <View>
                        <Text style={styles.modalTitle}>Warehouse</Text>
                        <Text style={styles.levelText}>Level: {wareHouse.level}</Text>
                    </View>
                </View>
                <View style={{alignItems: "center"}}>
                    <View style={styles.infoContainer}>
                        <View style={styles.storageContainer}>
                            <Text style={styles.storageText}>Storage </Text>
                            <Text style={styles.storageNumbers}>{buildMaterialsMax} / {buildMaterialsTotal}</Text>
                        </View>
                        <View style={{alignItems: "center"}}>
                        <View style={styles.resourcesContainer}>
                            <View style={styles.resourceItem}>
                                <View style={{flexDirection: "row"}}>
                                <Image source={require("../../assets/images/woodIcon.png")} style={styles.resourceIcon} />
                                    <Text style={styles.resourceName}>Wood:</Text>
                                </View>
                                <Text style={styles.resourceText}>{resources.wood}</Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <View style={{flexDirection: "row"}}>
                                    <Image source={require("../../assets/images/bricksIcon.png")} style={styles.resourceIcon} />
                                    <Text style={styles.resourceName}>Clay:</Text>
                                </View>
                                <Text style={styles.resourceText}>{resources.clay}</Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <View style={{flexDirection: "row"}}>
                                <Image source={require("../../assets/images/ironIcon.png")} style={styles.resourceIcon} />
                                    <Text style={styles.resourceName}>Iron:</Text>
                                </View>
                                <Text style={styles.resourceText}>{resources.iron}</Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <View style={{flexDirection: "row"}}>
                                <Image source={require("../../assets/images/cropIcon.png")} style={styles.resourceIcon} />
                                    <Text style={styles.resourceName}>Crops:</Text>
                                </View>
                                <Text style={styles.resourceText}>{resources.crop}</Text>
                            </View>
                        </View>
                        </View>
                        {wareHouse.level < 10 ? (
                            <>
                                <View style={{alignItems: "center"}}>
                                <View style={{flexDirection: "row", justifyContent: "space-between", width: "99%"}}>
                                <Text style={styles.upgradeTitle}>Upgrade:</Text>
                                <Text style={styles.levelUpCapacityText}>Storage Capacity +20%</Text>
                                </View>
                                </View>
                                <View style={{alignItems: "center"}}>
                                    <View style={{width:'99%',}}>
                                <Text style={styles.upgradeText}>Costs:</Text>
                                        <View style={{alignItems: "center"}}>
                                        <View style={{flexDirection: 'row', justifyContent: "space-between", width: "90%" }}>
                                        <View style={styles.resourcesCostContainer}>
                                            <Image source={require("../../assets/images/woodIcon.png")} style={{height: 25, width: 25}} />
                                            <Text style={styles.resourceCost}>{upgradeCost.wood}</Text>
                                        </View>
                                        <View style={styles.resourcesCostContainer}>
                                            <Image source={require("../../assets/images/bricksIcon.png")} style={{height: 25, width: 25}} />
                                            <Text style={styles.resourceCost}>{upgradeCost.clay}</Text>
                                        </View>
                                        <View style={styles.resourcesCostContainer}>
                                            <Image source={require("../../assets/images/ironIcon.png")} style={{height: 25, width: 25}}  />
                                            <Text style={styles.resourceCost}>{upgradeCost.iron}</Text>
                                        </View>
                                        </View>
                                        </View>
                                <TouchableOpacity
                                    style={[styles.upgradeButton, !canUpgrade && styles.disabledButton]}
                                    onPress={() => {
                                        if (canUpgrade) {
                                            updateBuildings("Warehouse"); // ✅ Upgrade Town Hall
                                            setIsVisible(false); // ✅ Close modal after upgrade
                                        }
                                    }}
                                    disabled={!canUpgrade}
                                >
                                    <View style={styles.upgradebuttonContainer}>
                                    <Text style={styles.upgradeButtonText}>
                                        {canUpgrade ? "Upgrade" : "Not Enough Resources"}
                                    </Text>
                                    </View>
                                </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.maxLevelText}>🏛 Warehouse is at Max Level</Text>
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
    buildingIcon:{
        height: 80,
        width: 80,
        marginTop: 75,
        marginLeft: 15,
    },
    modalTitle: {
        fontSize: 30,
        color: 'rgb(107, 57, 0)',
        paddingVertical: 3,
        marginTop: 80,
        fontWeight: 'bold',
    },
    levelText:{
        fontSize: 18,
        marginLeft: 5,
        fontWeight: 'bold',
        color: 'rgba(107, 57, 0, 0.70)',
    },
    infoContainer:{
        marginTop: 7,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '94%',
        height: '72%',
    },
    storageContainer:{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5
    },
    storageText:{
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    storageNumbers:{
        fontSize: 16,
        color: 'rgba(107, 57, 0, 0.70)',
        fontWeight: 'bold',
    },
    resourcesContainer:{
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(107, 57, 0, 0.43)',
        width: '90%',
        marginTop: 10
    },
    resourceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 10,
        marginVertical: 5,
    },
    resourceIcon: {
        width: 30,
        height: 30,
    },
    resourceName:{
        fontSize: 14,
        fontWeight: 'bold',
        color: "#8B4513",
        marginTop: 7,
        marginLeft: 5
    },
    resourceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8B4513",
    },
    upgradeTitle:{
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        paddingHorizontal: 5,
        color: 'rgba(107, 57, 0, 0.70)',
    },
    levelUpCapacityText:{
        fontSize: 14,
        fontWeight: "bold",
        color: 'rgba(107, 57, 0, 0.70)',
        marginTop: 12,
    },
    upgradeText: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
        paddingHorizontal: 5,
        color: 'rgba(107, 57, 0, 0.70)',
    },
    resourcesCostContainer:{
        flexDirection: "row",
    },
    resourceCost: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 6,
        marginLeft: 3,
        color: 'rgb(107, 57, 0)',
    },
    upgradebuttonContainer:{
        backgroundColor: 'rgba(182, 135, 81, 0.52)',
        paddingVertical: 8,
        marginTop: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#8B4513",
    },
    upgradeButtonText: {
        color: "#8B4513",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },

});