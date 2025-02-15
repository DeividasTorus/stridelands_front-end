import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SlidingModal from '../../components/gameComponents/SlidingModal';

const gridSize = 10;
const mapData = Array.from({ length: gridSize * gridSize }, (_, index) => {
    const x = index % gridSize;
    const y = Math.floor(index / gridSize);
    let type = 'grass';

    if ((x === 3 && y === 2) || (x === 7 && y === 5) || (x === 4 && y === 4)) {
        type = 'village';
    } else if ((x + y) % 5 === 0) {
        type = 'forest';
    }

    return { id: `${x}-${y}`, x, y, type };
});

const tileColors = {
    grass: '#a0d468',
    village: '#f6bb42',
    forest: '#3aaf85',
};

const hardcodedVillages = [
    {
        id: '1',
        name: 'Dragonstone',
        x: 3,
        y: 2,
        level: 5,
        resources: { gold: 1000, wood: 500 },
        health: 100,
    },
    {
        id: '2',
        name: 'Winterfell',
        x: 7,
        y: 5,
        level: 3,
        resources: { gold: 800, wood: 300 },
        health: 85,
    },
    {
        id: '3',
        name: "Storm's End",
        x: 4,
        y: 4,
        level: 4,
        resources: { gold: 900, wood: 400 },
        health: 90,
    },
];

export default function App() {
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = (item) => {
        const village = hardcodedVillages.find((v) => v.x === item.x && v.y === item.y);
        if (village) {
            setSelectedVillage(village);
            setModalVisible(true)
        } else {
            setSelectedVillage(null);
        }
    };

    const renderTile = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: tileColors[item.type] }]}
                onPress={() => handlePress(item)}
            >
                <Text style={styles.tileText}>{item.type}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={mapData}
                renderItem={renderTile}
                keyExtractor={(item) => item.id}
                numColumns={gridSize}
                contentContainerStyle={styles.map}
            />
            {selectedVillage && (
                <SlidingModal isVisible={modalVisible} setIsVisible={setModalVisible}>
                    <Text style={styles.modalTitle}>
                        <View style={styles.villageInfo}>
                            <Text style={styles.infoText}>Name: {selectedVillage.name}</Text>
                            <Text style={styles.infoText}>Level: {selectedVillage.level}</Text>
                            <Text style={styles.infoText}>Gold: {selectedVillage.resources.gold}</Text>
                            <Text style={styles.infoText}>Wood: {selectedVillage.resources.wood}</Text>
                            <Text style={styles.infoText}>Health: {selectedVillage.health}</Text>
                        </View>
                    </Text>
                </SlidingModal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    tile: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    tileText: {
        fontSize: 10,
        color: '#fff',
        textAlign: 'center',
    },
    villageInfo: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 6,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
    },
});



