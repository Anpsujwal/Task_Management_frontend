import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Button } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { Video, Audio } from "expo-av";
import GoBackToDashboard from "../Components/GoToDashboard";
import { AuthContext } from "../context/AuthContext";
import FilterByDate from "../Components/FilterTaskByDate";

export default function TaskDashboard({ navigation }) {
  const { user, type } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredTasksByDate, setFilteredTasksByDate] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (type === "tenant") {
          const res = await api.get(`api/tickets/createdby/${user._id}`);
          setTasks(res.data);
        }
        else if (user.adminType === "group") {
          const res = await api.get(`api/tasks/createdby/${user._id}`);
          setTasks(res.data);

        } else {
          const res = await api.get("/api/tasks");
          setTasks(res.data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        alert("Unable to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const now = new Date();

  const categorizedCounts = {
    pending:( !filterByDate?tasks:filteredTasksByDate)?.filter(t => t.status?.text === "pending").length,
    in_progress: ( !filterByDate?tasks:filteredTasksByDate)?.filter(t => t.status?.text === "in_progress").length,
    completed: ( !filterByDate?tasks:filteredTasksByDate)?.filter(t => t.status?.text === "completed").length,
    overdue: ( !filterByDate?tasks:filteredTasksByDate)?.filter(t => {
      return (
        (t.status?.text !== "completed") &&
        t.dueDate &&
        new Date(t.dueDate) < now
      );
    }).length,
  };

  const filteredTasks =( !filterByDate?tasks:filteredTasksByDate)?.filter(task => {
    if (!selectedCategory) return false;

    if (selectedCategory === "overdue") {
      return (
        task.status?.text !== "completed" &&
        task.dueDate &&
        new Date(task.dueDate) < now
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
      { uri: `${api.defaults.baseURL}api/${type === "tenant" ? "tickets" : "tasks"}/${id}/audio` },
      { shouldPlay: true }
    );

  }

  const handleDownload = () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const tasksOfThisMonth = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
    })

    navigation.navigate('ReportDownload', { tasks: tasksOfThisMonth })
  }

  return (
    <ScrollView style={styles.container}>
      <GoBackToDashboard />
      {type === "tenant" ? <Text style={styles.title}>Ticket Summary</Text> : <Text style={styles.title}>Task Summary</Text>}



      {!filterByDate && <TouchableOpacity style={styles.filterButton} onPress={() => setFilterByDate(true)}>
                          <Text style={styles.filterButtonText}>Filter Tasks By Date</Text>
                        </TouchableOpacity>
      }


      {filterByDate && <FilterByDate tasks={tasks} setFilteredTasks={setFilteredTasksByDate} setFilterByDate={setFilterByDate} />}

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

      {user?.isAdmin && <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                          <Text style={styles.downloadButtonText}>Download Summary of This Month</Text>
                        </TouchableOpacity>
      }
    <View style={styles.usersBox}>
      {selectedCategory && (
        <>
          <Text style={styles.subTitle}>{type === "tenant" ? "Tickets" : "Tasks"} {categories.find(c => c.key === selectedCategory)?.label}</Text>
          <FlatList
            data={filteredTasks}
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
                {type === "staff" && <Text>
                  Due Date : {" "}
                  {item.dueDate
                    ? item.dueDate
                    : "N/A"}
                </Text>}
                <Text>Created At: {item.createdDate}</Text>
                {item.status.image?.hasImage &&
                  <Image
                    source={{ uri: `${api.defaults.baseURL}api/${type === "tenant" ? "tickets" : "tasks"}/${item._id}/image` }}
                    style={{ width: 200, height: 200 }}
                  />
                }


                {item.status.video?.hasVideo &&
                  <Video
                    source={{ uri: `${api.defaults.baseURL}api/${type === "tenant" ? "tickets" : "tasks"}/${item._id}/video` }}
                    style={{ width: 600, height: 600 }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                  />}


                {item.status.audio?.hasAudio &&
                  <Button title="Play Audio" onPress={() => { playAudio(item._id) }} />
                }

              </View>

            )}

          />
        </>
      )}
    </View>
    </ScrollView>
  );
}


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2D3436",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 20,
    textAlign: "center",
    color: "#34495E",
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
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
  card: {
    flexGrow: 1,
    padding: 18,
    margin: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  cardCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  filterButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  downloadButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2c3e50",
  },
  status: {
    fontWeight: "600",
    color: "#007bff",
  },
  mediaImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  mediaVideo: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginTop: 10,
  },
  audioButton: {
    backgroundColor: "#6C5CE7",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  audioButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});


