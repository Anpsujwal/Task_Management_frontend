import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Button } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { Video, Audio } from "expo-av";
import GoBackToDashboard from "../Components/GoToDashboard";
import { AuthContext } from "../context/AuthContext";
import FilterTicketsByDate from "../Components/FilterTicketByDate";

export default function TicketReportScreen({ navigation }) {
  const { user, type } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredTicketsByDate, setFilteredTicketsByDate] = useState([]);


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!user.isAdmin) {
          const res = await api.get(`api/tickets/user/${user._id}`);
          setTickets(res.data);
        } else if (user.adminType === "group") {
          const res = await api.get(`api/tickets/group/${user.group}`);
          setTickets(res.data);
        } else {
          const res = await api.get(`api/tickets/`);
          setTickets(res.data);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        alert("Unable to fetch tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const now = new Date();

  const categorizedCounts = {
    pending: (!filterByDate ? tickets : filteredTicketsByDate)?.filter(t => t.status?.text === "pending").length,
    in_progress: (!filterByDate ? tickets : filteredTicketsByDate)?.filter(t => t.status?.text === "in_progress").length,
    completed: (!filterByDate ? tickets : filteredTicketsByDate)?.filter(t => t.status?.text === "completed").length,
    overdue: (!filterByDate ? tickets : filteredTicketsByDate)?.filter(t => {
      return (
        (t.status?.text !== "completed") &&
        t.completeBy?.dueDate &&
        new Date(t.completeBy.dueDate) < now
      );
    }).length,
  };

  const filteredTickets = (!filterByDate ? tickets : filteredTicketsByDate)?.filter(task => {
    if (!selectedCategory) return false;

    if (selectedCategory === "overdue") {
      return (
        task.status?.text !== "completed" &&
        task.completeBy?.dueDate &&
        new Date(task.completeBy.dueDate) < now
      );
    }

    return task.status?.text === selectedCategory;
  });

  const categories = [
    { key: "pending", label: "Pending", color: "#ffc107" },
    { key: "in_progress", label: "In Progress", color: "#17a2b8" },
    { key: "completed", label: "Completed", color: "#28a745" },
    { key: "overdue", label: "Overdue", color: "#dc3545" },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  async function playAudio(id) {
    await Audio.Sound.createAsync(
      { uri: `${api.defaults.baseURL}api/tickets/${id}/audio` },
      { shouldPlay: true }
    );

  }

  const handleDownload = () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const ticketsOfThisMonth = tickets.filter(ticket=> {
      const ticketDate = new Date(ticket.createdDate);
      return ticketDate >= startOfMonth && ticketDate <= endOfMonth;
    })

    navigation.navigate('TicketSummaryDownload', { tickets: ticketsOfThisMonth })
  }

  return (
    <View style={styles.container}>
      <GoBackToDashboard />
      <Text style={styles.title}>Ticket Summary</Text>

      {!filterByDate && <Button title="Filter Tickets By Date" onPress={() => { setFilterByDate(true) }}></Button>}


      {filterByDate && <FilterTicketsByDate tickets={tickets} setFilteredTickets={setFilteredTicketsByDate} setFilterByDate={setFilterByDate} />}

      <View style={styles.cardRow}>
        {categories?.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.card, { backgroundColor: cat.color }]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={styles.cardTitle}>{cat.label}</Text>
            <Text style={styles.cardCount}>{categorizedCounts[cat.key]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {user?.isAdmin && <Button title="Download Summary of this month" onPress={() => { handleDownload() }}></Button>}

      {selectedCategory && (
        <>
          <Text style={styles.subTitle}>Tickets {categories?.find(c => c.key === selectedCategory)?.label}</Text>


          <FlatList
            data={filteredTickets}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text>Comment : <Text style={styles.status}>{item.comment}</Text></Text>
                <Text>Status : <Text style={styles.status}>{item.status?.text}</Text></Text>
                {(selectedCategory === "pending" || selectedCategory === "overdue") && <Text>
                  Assigned To : {" "}
                  {type === "tenant" ? (item.assignedWorkers?.length > 0 ? 'Worker(s) assigned' : 'Workers not assigned') :
                    (item.assignedWorkers?.length > 0
                      ? `${item.assignedWorkers.length} worker(s)`
                      : "Assigned to group")}
                </Text>}
                <Text>
                  days from creation : {Math.floor((new Date() - new Date(item.createdDate)) / (1000 * 60 * 60 * 24))}
                </Text>
                <Text>Created At: {item.createdDate}</Text>
                {item.status?.image?.hasImage &&
                  <Image
                    source={{ uri: `${api.defaults.baseURL}api/tickets/${item._id}/image` }}
                    style={{ width: 200, height: 200 }}
                  />
                }


                {item.status?.video?.hasVideo &&
                  <Video
                    source={{ uri: `${api.defaults.baseURL}api/tickets/${item._id}/video` }}
                    style={{ width: 600, height: 600 }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                  />}


                {item.status?.audio?.hasAudio &&
                  <Button title="Play Audio" onPress={() => { playAudio(item._id) }} />
                }

              </View>

            )}

          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 20,
    margin: 5,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  status: {
    fontWeight: "600",
    color: "#007bff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  flatListContent: {
    paddingBottom: 150, // extra space to avoid clipping at the bottom
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  status: {
    fontWeight: "600",
    color: "#007bff",
  },

});
