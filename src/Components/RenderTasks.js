import {
    View
    , Text, FlatList, StyleSheet, ScrollView, Button
} from "react-native";

export default function RenderTasks({ tasks }){
    return (
        <View>
            
            <FlatList
                data={tasks}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        <Text>Status : <Text style={styles.status}>{item.status?.text}</Text></Text>
                        {<Text>
                            Assigned To : {" "}
                            {item.assignedWorkers?.length > 0
                                ? `${item.assignedWorkers.length} worker(s)`
                                : item.assignedGroup?.name || "Unassigned"}
                        </Text>}
                        <Text>
                            days from creation : {Math.floor((new Date() - new Date(item.createdDate)) / (1000 * 60 * 60 * 24))}
                        </Text>
                        <Text>
                            Due Date : {" "}
                            {item.dueDate
                                ? item.dueDate
                                : "N/A"}
                        </Text>
                        <Text>Created At: {item.createdDate}</Text>

                    </View>

                )}

            />
            </View>
    )
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
