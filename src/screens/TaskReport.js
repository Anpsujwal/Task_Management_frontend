import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView,Button} from "react-native";
import React, { useEffect, useState ,useContext} from "react";
import api from "../api/api";
import {Video, Audio } from "expo-av";
import GoBackToDashboard from "../Components/GoToDashboard";
import { AuthContext } from "../context/AuthContext";
import FilterByDate from "../Components/FilterTaskByDate";

export default function TaskDashboard({navigation}) {
  const {user,type}=useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredTasksByDate, setFilteredTasksByDate] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if(type==="tenant"){
          const res=await api.get(`api/tickets/createdby/${user._id}`);
          setTasks(res.data);
        }
        else if (user.adminType === "group") {
          const res=await api.get(`api/tasks/createdby/${user._id}`);
          setTasks(res.data);
          
        }else{
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
    pending: tasks?.filter(t => t.status?.text === "pending").length,
    in_progress: tasks?.filter(t => t.status?.text === "in_progress").length,
    completed: tasks?.filter(t => t.status?.text === "completed").length,
    overdue: tasks?.filter(t => {
      return (
        (t.status?.text !== "completed") &&
        t.dueDate &&
        new Date(t.dueDate) < now
      );
    }).length,
  };

  const filteredTasks = tasks?.filter(task => {
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
      { uri: `${api.defaults.baseURL}api/${type==="tenant" ?"tickets":"tasks"}/${id}/audio` },
      { shouldPlay: true }
    );
  
  }

  const handleDownload=()=>{
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
   
    const tasksOfThisMonth=tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startOfMonth && taskDate <= endOfMonth;
    })
    
    navigation.navigate('ReportDownload',{tasks:tasksOfThisMonth})
  }

  return (
    <View style={styles.container}>
      <GoBackToDashboard/>
      {type==="tenant" ?<Text style={styles.title}>Ticket Summary</Text>:<Text style={styles.title}>Task Summary</Text>}

      <FilterByDate ></FilterByDate>

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

      {user?.isAdmin && <Button title="Download Summary of this month" onPress={()=>{handleDownload()}}></Button>}

      {selectedCategory && (
        <>
          <Text style={styles.subTitle}>{type==="tenant" ?"Tickets":"Tasks"} {categories.find(c => c.key === selectedCategory)?.label}</Text>
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text>Comment : <Text style={styles.status}>{item.comment}</Text></Text>
                <Text>Status : <Text style={styles.status}>{item.status?.text}</Text></Text>
                {(selectedCategory==="pending" || selectedCategory==="overdue") && <Text>
                  Assigned To : {" "}
                  {type==="tenant" ? (item.assignedWorkers?.length > 0 ?'Worker(s) assigned' :'Workers not assigned') :
                   (item.assignedWorkers?.length > 0
                    ? `${item.assignedWorkers.length} worker(s)`
                    : "Assigned to group")}
                </Text>}
                <Text>
                  days from creation : {Math.floor((new Date() - new Date(item.createdDate)) / (1000 * 60 * 60 * 24))}
                </Text>
                {type==="staff" && <Text>
                  Due Date : {" "}
                  {item.dueDate
                    ? item.dueDate
                    : "N/A"}
                </Text>}
                <Text>Created At: {item.createdDate}</Text>
                {item.status.image?.hasImage &&
                <Image
                  source={{ uri: `${api.defaults.baseURL}api/${type==="tenant" ?"tickets":"tasks"}/${item._id}/image` }}
                  style={{ width: 200, height: 200 }}
                />
                }
            
                
                {item.status.video?.hasVideo &&
                <Video
                  source={{ uri: `${api.defaults.baseURL}api/${type==="tenant" ?"tickets":"tasks"}/${item._id}/video` }}
                  style={{ width: 600, height: 600 }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />}
                
            
                {item.status.audio?.hasAudio &&
                <Button title="Play Audio" onPress={()=>{playAudio(item._id)}} />
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
