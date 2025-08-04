import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function RenderTickets({ tickets }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>
              Comment: <Text style={styles.status}>{item.comment}</Text>
            </Text>
            <Text>
              Status: <Text style={styles.status}>{item.status?.text}</Text>
            </Text>
            <Text>
              Assigned To:{" "}
              <Text style={styles.assigned}>
                {item.assignedWorker ? "Worker assigned" : "Worker not assigned"}
              </Text>
            </Text>
            <Text>
              Days from creation:{" "}
              {Math.floor(
                (new Date() - new Date(item.createdDate)) / (1000 * 60 * 60 * 24)
              )}
            </Text>
            <Text>Created At: {new Date(item.createdDate).toDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4ff", // light blue background
  },
  flatListContent: {
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff", // blue highlight stripe
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  status: {
    fontWeight: "600",
    color: "#007bff",
  },
  assigned: {
    fontWeight: "600",
    color: "#333",
  },
});
