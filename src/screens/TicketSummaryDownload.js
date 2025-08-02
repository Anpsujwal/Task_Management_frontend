import { View, Text, Button, StyleSheet } from "react-native";
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
        <View style={{ flex: 1 }}>
            
            <Button title="Go Back" onPress={() => navigation.goBack()} />
            <Button title="Download PDF" onPress={captureToPDF} />

            <ViewShot
                style={{ backgroundColor: "white" }}
                ref={viewShotRef}
                options={{ format: 'png', quality: 0.9, result: 'base64' }}
            >
                {tickets.length > 0 && (
                    <Text style={styles.title}>Tickets Summary for this Month</Text>
                )}

                {categories.pending?.length > 0 && (
                    <View>
                        <Text style={styles.subTitle}>Pending Tickets</Text>
                        <RenderTickets tickets={categories.pending}></RenderTickets>
                    </View>
                )}

                {categories.in_progress?.length > 0 && (
                    <View>
                        <Text style={styles.subTitle}>In Progress Tickets</Text>
                        <RenderTickets tickets={categories.in_progress}></RenderTickets>
                    </View>
                )}

                {categories.completed?.length > 0 && (
                    <View>
                        <Text style={styles.subTitle}>Completed Tickets</Text>
                        <RenderTickets tickets={categories.completed}></RenderTickets>
                    </View>
                )}

            </ViewShot>
        </View>
    );
}

const styles = StyleSheet.create({
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
