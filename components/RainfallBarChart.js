import { useState, useEffect } from "react";
import { Dimensions, View, Text, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-chart-kit";
import "../utils/getUserLanguage";
import { userLang } from "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";

const RainfallChartComponent = ({ rainfall }) => {
  const { t } = useTranslation();
  const [newFormattedDates, setNewFormattedDates] = useState([]);
  const [newRainfallData, setNewRainfallData] = useState({});
  const [dataAvailable, setDataAvailable] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const { i18n } = useTranslation();

  if (rainfall.length == 0) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
        }}
      >
        <Text>{t("no_rain_data")}</Text>
      </View>
    );
  }

  useEffect(() => {
    if (!rainfall) {
      setLoading(false);
      setDataAvailable(false);
      return;
    }

    const formattedDates = rainfall.map((item) => {
      if (!item.timestamp) return ""; // Safety check for undefined timestamp

      // Convert timestamp to UTC-based Date
      const date = new Date(item.timestamp.seconds * 1000);
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );

      // Format date based on language, without hour for consistent day/month output
      const formattedDate = utcDate
        .toLocaleDateString(i18n.language === "bn" ? "bn-BD" : "en-GB", {
          day: "2-digit",
          month: "2-digit",
        })
        .replace("/", "-"); // Replace slash with a dash

      return formattedDate;
    });

    let rainfallVals = rainfall.map((item) => item.value);

    setNewFormattedDates(formattedDates);
    setNewRainfallData(rainfallVals);
    setDataAvailable(true);
    setLoading(false);
  }, [rainfall]);

  if (loading) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading water level data...</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: "black",
        borderWidth: 1,
      }}
    >
      {/* BarChart for Rainfall */}

      <BarChart
        data={{
          labels: newFormattedDates, // Dates
          datasets: [
            {
              data: newRainfallData, // Rainfall data for each date
            },
          ],
        }}
        width={Dimensions.get("window").width - 48} // full width minus some padding
        height={220}
        yAxisLabel=""
        yAxisSuffix="mm" // Rainfall in mm
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#000000",
          backgroundGradientTo: "#77D0D4",
          decimalPlaces: 2, // optional, specifies decimal places in y-axis values
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue bars for rainfall
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          borderRadius: 15,
          alignItems: "center",
        }}
      />
    </View>
  );
};

export default RainfallChartComponent;
