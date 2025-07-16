import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator ,Image} from "react-native";
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); // null shows none initially

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/api/tasks");
        setTasks(res.data);
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
    pending: tasks.filter(t => t.status?.text === "pending").length,
    in_progress: tasks.filter(t => t.status?.text === "in_progress").length,
    completed: tasks.filter(t => t.status?.text === "completed").length,
    overdue: tasks.filter(t => {
      return (
        (t.status?.text !== "completed") &&
        t.completeBy?.dueDate &&
        new Date(t.completeBy.dueDate) < now
      );
    }).length,
  };

  const filteredTasks = tasks.filter(task => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Summary</Text>

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

      {selectedCategory && (
        <>
          <Text style={styles.subTitle}>Tasks: {categories.find(c => c.key === selectedCategory)?.label}</Text>
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text>Status: <Text style={styles.status}>{item.status?.text}</Text></Text>
                <Text>
                  Assigned To:{" "}
                  {item.assignedWorkers?.length > 0
                    ? `${item.assignedWorkers.length} worker(s)`
                    : item.assignedGroup?.name || "Unassigned"}
                </Text>
                <Text>
                  Due Date:{" "}
                  {item.completeBy?.dueDate
                    ? new Date(item.completeBy.dueDate).toLocaleString()
                    : "N/A"}
                </Text>
                <Text>Created At: {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Image
                  source={{ uri: `${api.defaults.baseURL}/api/tasks/${item._id}/image` }}
                  style={{ width: 200, height: 200 }}
                />
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
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
});
