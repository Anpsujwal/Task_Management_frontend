import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import RenderTickets from "../Components/RenderTickets";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";
import * as Print from 'expo-print';

export default function TicketSummaryDownload({ navigation, route }) {
    const { tickets } = route.params;
    const viewShotRef = useRef();

    const categories = {
        pending: tickets?.filter((t) => t.status?.text === "pending"),
        in_progress: tickets?.filter((t) => t.status?.text === "in_progress"),
        completed: tickets?.filter((t) => t.status?.text === "completed"),
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
                    <TouchableOpacity style={styles.roundedButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.roundedButton} onPress={captureToPDF}>
                        <Text style={styles.buttonText}>Download PDF</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView>
                <ViewShot
                    style={styles.viewShot}
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 0.9, result: 'base64' }}
                >
                    {tickets.length > 0 ? (
                        <Text style={styles.title}>Tickets Summary for this Month</Text>
                    ) : (
                        <Text style={styles.title}>No tickets found for this month</Text>
                    )}

                    {categories.pending?.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>Pending Tickets</Text>
                            <RenderTickets tickets={categories.pending} />
                        </View>
                    )}

                    {categories.in_progress?.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>In Progress Tickets</Text>
                            <RenderTickets tickets={categories.in_progress} />
                        </View>
                    )}

                    {categories.completed?.length > 0 && (
                        <View>
                            <Text style={styles.subTitle}>Completed Tickets</Text>
                            <RenderTickets tickets={categories.completed} />
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
        backgroundColor: "#fff",
    },
    buttonBox: {
        padding: 15,
        backgroundColor: "#f0f0f0",
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    roundedButton: {
        backgroundColor: "#0077cc",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginVertical: 10,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    viewShot: {
        padding: 15,
        backgroundColor: "#fff",
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
        marginBottom: 5,
    },
});
