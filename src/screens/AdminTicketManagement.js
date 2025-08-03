import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import GoBackToDashboard from "../Components/GoToDashboard";

export default function AdminTicketManagement() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);

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
              return ticket;
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
    fetchTickets();
  }, []);

  return (
    <View style={styles.page}>
      <GoBackToDashboard />

      <ScrollView contentContainerStyle={styles.container}>
        {tickets?.length > 0 && (
          <>
            <Text style={styles.heading}>All Tickets</Text>

            {tickets.map((ticket) => (
              <TouchableOpacity key={ticket._id} style={styles.ticketCard}>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <Text style={styles.ticketInfo}>Comment: {ticket.comment}</Text>
                <Text style={styles.ticketInfo}>Priority: {ticket.priority}</Text>
                <Text style={styles.ticketInfo}>
                  Worker Assigned: {ticket.assignedWorkerName || "No Workers Assigned Yet"}
                </Text>
                <Text style={styles.ticketInfo}>Created On: {ticket.createdDate}</Text>
                <Text style={styles.ticketStatus}>
                  Status: {ticket.status?.text || "N/A"}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5faff',
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1e3c72',
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  ticketInfo: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
  },
  ticketStatus: {
    fontSize: 15,
    color: '#1e90ff',
    fontWeight: '600',
    marginTop: 6,
  },
});
