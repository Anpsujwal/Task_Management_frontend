import { View, Text, FlatList, StyleSheet } from "react-native";

export default function RenderTasks({ tasks }) {
  return (
    <View style={styles.taskContainer}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Status: </Text>
              <View style={[styles.statusDot, getStatusStyle(item.status?.text)]} />
              <Text style={styles.statusText}>{item.status?.text}</Text>
            </View>

            <Text style={styles.text}>
              Assigned To:{" "}
              {item.assignedWorkers?.length > 0
                ? `${item.assignedWorkers.length} worker(s)`
                : item.assignedGroup?.name || "Unassigned"}
            </Text>

            <Text style={styles.text}>
              Days from creation:{" "}
              {Math.floor(
                (new Date() - new Date(item.createdDate)) / (1000 * 60 * 60 * 24)
              )}
            </Text>

            <Text style={styles.text}>
              Due Date: {item.dueDate ? formatDate(item.dueDate) : "N/A"}
            </Text>

            <Text style={styles.text}>Created At: {formatDate(item.createdDate)}</Text>
          </View>
        )}
      />
    </View>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "pending":
      return { backgroundColor: "#f0ad4e" };
    case "in_progress":
      return { backgroundColor: "#5bc0de" };
    case "completed":
      return { backgroundColor: "#5cb85c" };
    case "overdue":
      return { backgroundColor: "#d9534f" };
    default:
      return { backgroundColor: "#999" };
  }
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  taskContainer: {
    paddingHorizontal: 10,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontWeight: "500",
    fontSize: 15,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  statusText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    marginVertical: 1,
    color: "#444",
  },
});
