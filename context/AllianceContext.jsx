import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext';

export const AllianceContext = createContext();

export const AllianceProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const [alliances, setAlliances] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load alliances, invitations, and notifications when user changes
    useEffect(() => {
        const fetchAllianceData = async () => {
            if (!user) {
                // Reset state when no user is logged in
                setAlliances([]);
                setInvitations([]);
                setNotifications([]);
                return;
            }

            try {
                setIsLoading(true);
                const storedAlliances = await AsyncStorage.getItem(`alliances_${user.id}`);
                const storedInvitations = await AsyncStorage.getItem(`invitations_${user.id}`);

                if (storedAlliances) setAlliances(JSON.parse(storedAlliances));
                if (storedInvitations) setInvitations(JSON.parse(storedInvitations));
            } catch (error) {
                console.error('Error loading alliance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllianceData();
    }, [user]);

    // Save alliances to AsyncStorage per user
    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(`alliances_${user.id}`, JSON.stringify(alliances));
        }
    }, [alliances, user]);

    // Save invitations to AsyncStorage per user
    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(`invitations_${user.id}`, JSON.stringify(invitations));
        }
    }, [invitations, user]);

    // Create a new alliance
    const createAlliance = (name, tag, flag, description) => {
        if (!user) {
            alert("User not logged in!");
            return;
        }

        const newAlliance = {
            id: Date.now().toString(),
            name,
            tag,
            flag,
            description,
            leader: user.name,
            leaderId: user.id,
            points: 5000,
            warWon: 34,
            members: [user.id],
        };

        setAlliances((prev) => [...prev, newAlliance]);
    };
    // const createAlliance = (name, tag, flag, description) => {
    //     if (!user) {
    //         alert("User not logged in!");
    //         return;
    //     }

    //     const newAlliance = {
    //         id: Date.now().toString(),
    //         name, // Alliance name
    //         tag, // Alliance short tag
    //         flag, // Alliance flag/icon
    //         leaderId: user.id, // Leader's ID
    //         leaderName: user.username, // Leader's name (assuming username is in UserContext)
    //         maxMembers: 50, // Max members allowed in the alliance
    //         description, // Alliance description
    //         totalPower: 0, // Initial power of the alliance
    //         members: [{ id: user.id, name: user.username, power: 0 }], // Leader as the first member
    //     };

    //     setAlliances((prev) => [...prev, newAlliance]);
    // };

    // Invite a player to an alliance
    const invitePlayer = (allianceId, playerId) => {
        const newInvitation = { allianceId, playerId };
        setInvitations((prev) => [...prev, newInvitation]);

    };

    // Accept an invitation
    const acceptInvitation = (playerId, allianceId) => {
        setAlliances((prevAlliances) =>
            prevAlliances.map((alliance) =>
                alliance.id === allianceId
                    ? { ...alliance, members: [...alliance.members, playerId] }
                    : alliance
            )
        );

        // Remove the accepted invitation
        setInvitations((prev) => prev.filter(invite => invite.playerId !== playerId || invite.allianceId !== allianceId));
    }

    // Get the alliance of a specific player
    const getPlayerAlliance = (playerId) => {
        return alliances.find(alliance => alliance.members.includes(playerId)) || null;
    };

    return (
        <AllianceContext.Provider value={{
            alliances,
            invitations,
            isLoading,
            createAlliance,
            invitePlayer,
            acceptInvitation,
            getPlayerAlliance
        }}>
            {children}
        </AllianceContext.Provider>
    );
};

