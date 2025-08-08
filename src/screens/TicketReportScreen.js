import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Button,
  ScrollView,
  LogBox
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { Video, Audio } from "expo-av";
import GoBackToDashboard from "../Components/GoToDashboard";
import { AuthContext } from "../context/AuthContext";
import FilterTicketsByDate from "../Components/FilterTicketsByDate";
import ReusableBarChart from "../Components/ReusableBarChart";
import { Picker } from "@react-native-picker/picker";

export default function TicketReportScreen({ navigation }) {
  const { user, type } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredtickets, setFilteredTickets] = useState([]);

  const [filterByGroup, setFilterByGroup] = useState(false)
  const [groups, setGroups] = useState([])
  const [groupFilter, setGroupFilter] = useState("")

  const fetchGroups = async () => {
    const res = await api.get(`/api/groups/`);
    setGroups(res.data);
  }

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested', // Ignore this warning
    ]);
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
    fetchGroups();
  }, []);

  const handleFilterChange = () => {
    setFilteredTickets(tickets.filter(t => t.assignedGroup === groupFilter))
  }

  const now = new Date();

  const categorizedCounts = {
    pending: ((!filterByDate && !filterByGroup) ? tickets : filteredtickets)?.filter(t => t.status?.text === "pending").length,
    in_progress: ((!filterByDate && !filterByGroup) ? tickets : filteredtickets)?.filter(t => t.status?.text === "in_progress").length,
    completed: ((!filterByDate && !filterByGroup) ? tickets : filteredtickets)?.filter(t => t.status?.text === "completed").length,
    overdue: ((!filterByDate && !filterByGroup) ? tickets : filteredtickets)?.filter(t => {
      return (
        (t.status?.text !== "completed") &&
        t.completeBy?.dueDate &&
        new Date(t.completeBy.dueDate) < now
      );
    }).length,
  };

  const filteredTickets = ((!filterByDate && !filterByGroup) ? tickets : filteredtickets)?.filter(task => {
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

  const playAudio = async (id) => {
    await Audio.Sound.createAsync(
      { uri: `${api.defaults.baseURL}api/tickets/${id}/audio` },
      { shouldPlay: true }
    );
  };

  const handleDownload = () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const ticketsOfThisMonth = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdDate);
      return ticketDate >= startOfMonth && ticketDate <= endOfMonth;
    });

    navigation.navigate("TicketSummaryDownload", { tickets: ticketsOfThisMonth });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <GoBackToDashboard />
      <Text style={styles.title}>Ticket Summary</Text>

      {!filterByDate && (
        <TouchableOpacity style={styles.button} onPress={() => { setFilterByDate(true); setFilterByGroup(false) }}>
          <Text style={styles.buttonText}>Filter Tickets By Date</Text>
        </TouchableOpacity>
      )}

      {filterByDate && (
        <FilterTicketsByDate
          tickets={tickets}
          setFilteredTickets={setFilteredTickets}
          setFilterByDate={setFilterByDate}
        />
      )}

      {(user?.isAdmin && user.adminType === "root") &&
        (filterByGroup ?
          <View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={groupFilter}
                onValueChange={setGroupFilter}
                style={styles.picker}
                mode="dropdown"
              >
                {groups.map(group => {
                  return <Picker.Item key={group._id} label={group.name} value={group._id} />
                })}


              </Picker>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.applyButton} onPress={handleFilterChange}>
                <Text style={styles.buttonText}>Apply Filter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setFilterByGroup(false);
                  setFilteredTickets([]);
                }}
              >
                <Text style={styles.buttonText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
          :
          <TouchableOpacity style={styles.button} onPress={() => { setFilterByGroup(true); setFilterByDate(false) }}>
            <Text style={styles.filterButtonText}>Filter Tickets By Group</Text>
          </TouchableOpacity>
        )
      }

      <View style={styles.cardRow}>
        {categories.map(cat => (
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

      <ReusableBarChart
        title="Tickets Summary Graph"
        labels={["Pending", "In Progress", "Completed", "Overdue"]}
        data={[
          categorizedCounts.pending || 0,
          categorizedCounts.in_progress || 0,
          categorizedCounts.completed || 0,
          categorizedCounts.overdue || 0,
        ]}
      />



      {user?.isAdmin && (
        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Text style={styles.buttonText}>Download Summary of this Month</Text>
        </TouchableOpacity>
      )}

      {selectedCategory && (
        <>
          <Text style={styles.subTitle}>
            Tickets {categories.find(c => c.key === selectedCategory)?.label}
          </Text>

          <FlatList
            data={filteredTickets}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text>Comment: <Text style={styles.status}>{item.comment}</Text></Text>
                <Text>Status: <Text style={styles.status}>{item.status?.text}</Text></Text>

                <Text>
                  Assigned To:{groups.find(g => g._id === item.assignedGroup).name}
                </Text>

                <Text>
                  Worker Assigned:{item.assignedWorker? "Yes" :"No"}
                </Text>

                <Text>
                  Days from creation:{" "}
                  {Math.floor(
                    (new Date() - new Date(item.createdDate)) /
                    (1000 * 60 * 60 * 24)
                  )}
                </Text>
                <Text>Created At: {item.createdDate}</Text>

                {item.status?.image?.hasImage && (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}api/tickets/${item._id}/image`,
                    }}
                    style={{ width: 200, height: 200 }}
                  />
                )}

                {item.status?.video?.hasVideo && (
                  <Video
                    source={{
                      uri: `${api.defaults.baseURL}api/tickets/${item._id}/video`,
                    }}
                    style={{ width: 600, height: 600 }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                  />
                )}

                {item.status?.audio?.hasAudio && (
                  <Button title="Play Audio" onPress={() => playAudio(item._id)} />
                )}
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginVertical: 10,
  },
  card: {
    flex: 1,
    padding: 20,
    margin: 5,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
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
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  flatListContent: {
    paddingBottom: 150,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonGroup: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    marginRight: 5,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
