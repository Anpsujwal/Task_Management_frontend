import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { Alert, View, Text, TouchableOpacity, StyleSheet, Button, Modal,ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import GoBackToDashboard from "../Components/GoToDashboard";
import StatusUpdateForm from "../Components/StatusUpdateComponent";


export default function WorkerTicketManagement() {

    const { user } = useContext(AuthContext)
    const [assignedTickets, setAssignedTickets] = useState([])
    const [unAssignedTickets, setUnAssignedTickets] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)

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
            console.log(updatedTickets)
            setAssignedTickets(updatedTickets.filter(ticket => ticket.assignedWorker!==undefined ))
            setUnAssignedTickets(updatedTickets.filter(ticket =>  ticket.assignedWorker===undefined ))
            console.log(unAssignedTickets)
            console.log(assignedTickets)
        } catch (err) {
            Alert.alert("Error fetching tickets");
        }
    };

    const handleStatusUpdate = async () => {
        setSelectedTicket(null);
        fetchTickets();
    };



    useEffect(() => {
        fetchTickets()
    }, [])


    const freezeTask = async (taskId) => {
        try {
            const res = await api.patch(`/api/tickets/freeze/${taskId}`, { userId: user._id });
            if (res.status === 200) {
                alert('Ticket frozen successfully');
                fetchTickets();
            }
        } catch (err) {
            console.error('Error freezing ticket:', err);
            alert('Failed to freeze ticket');
        }
    }
    const unfreezeTask = async (taskId) => {
        try {
            const res = await api.patch(`/api/tickets/unfreeze/${taskId}`, { userId: user._id });
            if (res.status === 200) {
                alert('Ticket unFrozen successfully');
                fetchTickets();
            }
        } catch (err) {
            console.error('Error unFreezing ticket:', err);
            alert('Failed to unFreeze ticket');
        }
    }




    return (
        <ScrollView>
            <GoBackToDashboard />

            {unAssignedTickets?.length > 0 && (
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.heading}>Available Tickets</Text>
                    {unAssignedTickets.map((ticket) => (
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


                                <Button title='Freeze Task' onPress={() => { freezeTask(ticket._id) }}></Button>



                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {assignedTickets?.length > 0 && (
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.heading}>frozen Tickets</Text>
                    {assignedTickets.map((ticket) => (
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

                                {(ticket.assignedWorker === user?._id) &&
                                    <View>
                                        <Text style={styles.selectedTask}>You Frooze the Task</Text>
                                        <Button title='UnFreeze Task' onPress={() => { unfreezeTask(ticket._id) }}></Button>

                                        <Button title="Update Status" onPress={() => { setSelectedTicket(ticket) }}></Button>
                                    </View>
                                }



                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {selectedTicket && (
                <Modal visible animationType="slide">
                    <StatusUpdateForm
                        task={selectedTicket}
                        user={user}
                        onClose={() => setSelectedTicket(null)}
                        onSuccess={handleStatusUpdate}
                        type={"ticket"}
                    />
                </Modal>
            )}
        </ScrollView>
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