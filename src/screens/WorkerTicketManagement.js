import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import GoBackToDashboard from "../Components/GoToDashboard";
import StatusUpdateForm from "../Components/StatusUpdateComponent";

export default function WorkerTicketManagement() {
  const { user } = useContext(AuthContext);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [unAssignedTickets, setUnAssignedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/api/tickets/group/${user.group}`);
      let tickets = res.data;

      const updatedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          if (ticket.assignedWorker) {
            try {
              const workerRes = await api.get(
                `/api/users/${ticket.assignedWorker}`
              );
              return {
                ...ticket,
                assignedWorkerName: workerRes.data.name,
              };
            } catch (err) {
              console.log("Error fetching worker:", err);
              return ticket;
            }
          } else {
            return ticket;
          }
        })
      );

      setAssignedTickets(
        updatedTickets.filter((ticket) => ticket.assignedWorker !== undefined)
      );
      setUnAssignedTickets(
        updatedTickets.filter((ticket) => ticket.assignedWorker === undefined)
      );
    } catch (err) {
      Alert.alert("Error fetching tickets");
    }
  };

  const handleStatusUpdate = () => {
    setSelectedTicket(null);
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const freezeTask = async (taskId) => {
    try {
      const res = await api.patch(`/api/tickets/freeze/${taskId}`, {
        userId: user._id,
      });
      if (res.status === 200) {
        Alert.alert("Ticket frozen successfully");
        fetchTickets();
      }
    } catch (err) {
      console.error("Error freezing ticket:", err);
      Alert.alert("Failed to freeze ticket");
    }
  };

  const unfreezeTask = async (taskId) => {
    try {
      const res = await api.patch(`/api/tickets/unfreeze/${taskId}`, {
        userId: user._id,
      });
      if (res.status === 200) {
        Alert.alert("Ticket unfrozen successfully");
        fetchTickets();
      }
    } catch (err) {
      console.error("Error unfreezing ticket:", err);
      Alert.alert("Failed to unfreeze ticket");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <GoBackToDashboard />

      {unAssignedTickets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Available Tickets</Text>
          {unAssignedTickets.map((ticket) => (
            <View key={ticket._id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{ticket.title}</Text>
              <Text style={styles.taskStatus}>Comment: {ticket.comment}</Text>
              <Text style={styles.taskStatus}>Priority: {ticket.priority}</Text>
              <Text style={styles.taskStatus}>
                Worker Assigned:{" "}
                {ticket.assignedWorkerName || "No Workers Assigned Yet"}
              </Text>
              <Text style={styles.taskStatus}>
                Created On: {ticket.createdDate}
              </Text>
              <Text style={styles.taskStatus}>
                Status: {ticket.status?.text}
              </Text>

              <Pressable
                style={styles.buttonBlue}
                onPress={() => freezeTask(ticket._id)}
              >
                <Text style={styles.buttonText}>Freeze Task</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {assignedTickets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Frozen Tickets</Text>
          {assignedTickets.map((ticket) => (
            <View key={ticket._id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{ticket.title}</Text>
              <Text style={styles.taskStatus}>Comment: {ticket.comment}</Text>
              <Text style={styles.taskStatus}>Priority: {ticket.priority}</Text>
              <Text style={styles.taskStatus}>
                Worker Assigned:{" "}
                {ticket.assignedWorkerName || "No Workers Assigned Yet"}
              </Text>
              <Text style={styles.taskStatus}>
                Created On: {ticket.createdDate}
              </Text>
              <Text style={styles.taskStatus}>
                Status: {ticket.status?.text}
              </Text>

              {ticket.assignedWorker === user?._id && (
                <View>
                  <Text style={styles.highlightText}>
                    You froze this task
                  </Text>

                  <Pressable
                    style={styles.buttonGreen}
                    onPress={() => unfreezeTask(ticket._id)}
                  >
                    <Text style={styles.buttonText}>Unfreeze Task</Text>
                  </Pressable>

                  <Pressable
                    style={styles.buttonBlue}
                    onPress={() => setSelectedTicket(ticket)}
                  >
                    <Text style={styles.buttonText}>Update Status</Text>
                  </Pressable>
                </View>
              )}
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5faff",
  },
  section: {
    marginTop: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 20,
  },

  taskItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', 
  },
 
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1e1e1e",
  },
  taskStatus: {
    color: "#666",
    marginBottom: 6,
    fontSize: 14,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0077cc",
    marginBottom: 10,
  },
  buttonBlue: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonGreen: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
