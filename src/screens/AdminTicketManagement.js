import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { Alert, View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import { AuthContext } from "../context/AuthContext";
import GoBackToDashboard from "../Components/GoToDashboard";


export default function AdminTicketManagement() {

    const { user } = useContext(AuthContext)
    const [tickets, setTickets] = useState([])


    const fetchTickets = async () => {
        try {
            const res = await api.get(`/api/tickets/group/${user.group}`);
            let tickets = res.data;

            const updatedTickets = await Promise.all(
                tickets.map(async (ticket) => {
                    if (ticket.assignedWorker) {
                        try {

                            const workerRes = await api.get(`/api/users/${ticket.assignedWorker}`);
                            return {
                                ...ticket,
                                assignedWorkerName: workerRes.data.name,
                            };
                        } catch (err) {
                            console.log("Error fetching worker:", err);
                            return ticket
                              
                        }
                    } else {
                        return ticket;
                    }
                })
            );

            setTickets(updatedTickets);
        } catch (err) {
            Alert.alert("Error fetching tickets");
        }
    };




    useEffect(() => {
        fetchTickets()
    }, [])




    return (
        <View>
            <GoBackToDashboard />

            {tickets?.length > 0 && (
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.heading}>All Tickets</Text>
                    {tickets.map((ticket) => (
                        <View key={ticket._id}>
                            <TouchableOpacity
                                style={styles.taskItem}
                            >
                                <Text style={styles.taskTitle}>{ticket.title}</Text>
                                <Text style={styles.taskStatus}>comment: {ticket.comment}</Text>
                                <Text style={styles.taskStatus}>Priority: {ticket.priority}</Text>

                                <Text style={styles.taskStatus}>
                                    Worker Assigned: {ticket.assignedWorker ? ticket.assignedWorkerName : "No Workers Assigned Yet"}
                                </Text>

                                <Text style={styles.taskStatus}>Created On: {ticket.createdDate}</Text>
                                <Text style={styles.taskStatus}>Status: {ticket.status?.text}</Text>

                            </TouchableOpacity>
                        </View>
                    ))}

                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#333',
    },
    taskItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
        color: '#222',
    },
    taskStatus: {
        color: '#666',
        marginBottom: 10,
    },
    updateButton: {
        backgroundColor: '#0077cc',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateText: {
        color: '#fff',
        fontWeight: '600',
    },
    updateSection: {
        marginTop: 30,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#f8f8f8',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#28a745',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    multiSelectWrapper: {
        marginBottom: 20,
    },

    // Additional styles for enhanced form UX
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
        color: '#444',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    multiSelectOption: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginBottom: 8,
    },
    selectedOption: {
        backgroundColor: '#cce5ff',
    },
    dateText: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
        fontSize: 16,
        marginBottom: 15,
        color: '#333',
    },
    button: {
        width: '80%',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
});