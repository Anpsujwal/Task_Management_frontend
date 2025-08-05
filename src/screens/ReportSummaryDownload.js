import { View, Text, ScrollView, Button, StyleSheet } from "react-native";
import RenderTasks from "../Components/RenderTasks";
import ViewShot from "react-native-view-shot";
import RNPrint from "react-native-print";
import { useRef } from "react";
import * as Print from 'expo-print';
import ReusableBarChart from "../Components/ReusableBarChart";

export default function ReportSummaryDownload({ navigation, route }) {
    const { tasks } = route.params;
    const now = new Date();
    const viewShotRef = useRef();

    const categories = {
        pending: tasks?.filter((t) => t.status?.text === "pending"),
        in_progress: tasks?.filter((t) => t.status?.text === "in_progress"),
        completed: tasks?.filter((t) => t.status?.text === "completed"),
        overdue: tasks?.filter((t) => {
            return (
                t.status?.text !== "completed" &&
                t.dueDate &&
                new Date(t.dueDate) < now
            );
        }),
    };

    const captureToPDF = async () => {
        try {
            const base64Image = await viewShotRef.current.capture();
            await Print.printAsync({
                html: `<img src="data:image/png;base64,${base64Image}" style="width:100%;" />`,
            });
        } catch (err) {
            console.log("Error in captureToPDF:", err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonBox}>
                <Text style={styles.boxTitle}></Text>
                <View style={styles.buttonRow}>
                    <Button title="Go Back" onPress={() => navigation.goBack()} />
                    <Button title="Download PDF" onPress={captureToPDF} />
                </View>
            </View>

            <ScrollView>
                <ViewShot
                    ref={viewShotRef}
                    style={styles.viewShot}
                    options={{ format: 'png', quality: 0.9, result: 'base64' }}
                >
                    {tasks.length > 0 ? (
                        <Text style={styles.title}>Tasks Summary for this Month</Text>
                    ) : (
                        <Text style={styles.title}>No tasks found for this month</Text>
                    )}

                    {categories.pending.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>Pending Tasks</Text>
                            <RenderTasks tasks={categories.pending} />
                        </View>
                    )}

                    {categories.in_progress.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>In Progress Tasks</Text>
                            <RenderTasks tasks={categories.in_progress} />
                        </View>
                    )}

                    {categories.completed.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>Completed Tasks</Text>
                            <RenderTasks tasks={categories.completed} />
                        </View>
                    )}

                    {categories.overdue.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>Overdue Tasks</Text>
                            <RenderTasks tasks={categories.overdue} />
                        </View>
                    )}
                </ViewShot>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    buttonBox: {
        padding: 15,
        backgroundColor: "#fff",
        elevation: 4,
        marginBottom: 10,
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    viewShot: {
        backgroundColor: "white",
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 10,
        textAlign: "center",
    },
    subTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 15,
    },
});
