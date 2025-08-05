import React from "react";
import { BarChart } from "react-native-chart-kit";
import { Dimensions, Text, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ReusableBarChart({ title, labels, data }) {
  return (
    <View style={{ marginVertical: 10 }}>
      {title && (
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
            marginVertical: 10,
            color: "#34495E",
          }}
        >
          {title}
        </Text>
      )}

      <BarChart
        data={{
          labels: labels,
          datasets: [{ data }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        fromZero
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#f5f5f5",
          backgroundGradientTo: "#f5f5f5",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForBackgroundLines: {
            strokeDasharray: "", // solid lines
          },
        }}
        style={{
          borderRadius: 16,
          alignSelf: "center",
        }}
      />
    </View>
  );
}
