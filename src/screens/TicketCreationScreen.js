import { useEffect, useState, useContext } from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import GoBackToDashboard from '../Components/GoToDashboard';
import TicketCreationForm from '../Components/TicketCreationForm';
import { AuthContext } from '../context/AuthContext';

export default function TicketManagementScreen() {

    const { user } = useContext(AuthContext);
    const [allTickets, setAllTickets] = useState([]);
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState(null);

    const fetchAllTickets = async () => {
        try {
            const res = await api.get(`/api/tickets/createdby/${user._id}`);
            setAllTickets(res.data);
        } catch (err) {
            Alert.alert('Error', 'Unable to fetch all tickets');
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get(`/api/groups/`);
            setGroups(res.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to load groups');
        }
    };

    useEffect(() => {
        fetchAllTickets();
        fetchGroups();
    }, []);

    return (
        <LinearGradient colors={['#f9fbff', '#f1f4f9']} style={styles.gradient}>
            <GoBackToDashboard />
            <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.usersBox}>
                {!group && groups?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Select the Issue</Text>
                        {groups.map((group) => (
                            <TouchableOpacity
                                key={group._id}
                                style={styles.button}
                                onPress={() => setGroup(group)}
                            >
                                <Text style={styles.buttonText}>{group.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
                {group && (
                    <TicketCreationForm
                        group={group}
                        fetchAllTickets={fetchAllTickets}
                        setGroup={setGroup}
                    />
                )}
                <View style={styles.usersBox}>
                    {allTickets?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Your Tickets</Text>
                        {allTickets.map((ticket) => (
                            <View key={ticket._id} style={styles.ticketCard}>
                                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                                <Text style={styles.ticketInfo}>Comment: {ticket.comment}</Text>
                                <Text style={styles.ticketInfo}>Priority: {ticket.priority}</Text>
                                <Text style={styles.ticketInfo}>
                                    Group: {groups.find(group => group._id === ticket.assignedGroup)?.name || 'N/A'}
                                </Text>
                                <Text style={styles.ticketInfo}>
                                    Workers: {ticket.assignedWorker ? "Worker Assigned" : "No Workers Assigned Yet"}
                                </Text>
                                <Text style={styles.ticketInfo}>Created On: {ticket.createdDate}</Text>
                                <Text style={styles.statues}>Status: {ticket.status?.text}</Text>
                            </View>
                        ))}
                    </View>
                 )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    section: {
        marginTop: 30,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#0077cc',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    usersBox: {
        backgroundColor: '#f9fbfd',
        padding: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 30,
    },
    ticketCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    ticketTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    ticketInfo: {
        fontSize: 15,
        color: '#555',
        marginBottom: 6,
        
    },
    statues:{
        color: "#007bff",
    }
});
