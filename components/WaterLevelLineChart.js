import React, { useEffect, useState } from "react";
import { Dimensions, View, Text, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { userLang } from "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";

const WaterLevelChartComponent = ({ waterlevels, dangerlevel }) => {
  const [newFormattedDates, setNewFormattedDates] = useState([]);
  const [newDangerLevelArray, setNewDangerLevelArray] = useState([]);
  const [newWarningLevelArray, setNewWarningLevelArray] = useState([]);
  const [newMinShownLevelArray, setNewMinShownLevelArray] = useState([]);
  const [waterlevelsValues, setWaterlevelsValues] = useState([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const { i18n } = useTranslation();
  useEffect(() => {
    if (!waterlevels) {
      setLoading(false);
      setDataAvailable(false);
      return;
    }

    const formattedDates = waterlevels.map((item) => {
      if (!item.timestamp) return ""; // Safety check for undefined timestamp

      // Convert timestamp to UTC-based Date
      const date = new Date(item.timestamp.seconds * 1000);
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );

      // Format date based on language, with an optional hour component if needed
      const formattedDate = utcDate
        .toLocaleDateString(i18n.language === "bn" ? "bn-BD" : "en-GB", {
          day: "2-digit",
          month: "2-digit",
        })
        .replace("/", "-"); // Replace slash with a dash

      return formattedDate;
    });

    // Calculate danger level, warning level, and other arrays
    const warningLevel = dangerlevel - 0.5;
    const waterlevelsVals = waterlevels.map((item) => item.value);
    const length = waterlevelsVals.length;

    const dangerLevelArray = new Array(length).fill(dangerlevel);
    const warningLevelArray = new Array(length).fill(warningLevel);
    const minShownLevelValue =
      Math.min(...waterlevelsVals, ...warningLevelArray) - 0.2;
    const minShownLevelArray = new Array(length).fill(minShownLevelValue);

    // Set the state with the newly calculated values
    setNewFormattedDates(formattedDates);
    setNewDangerLevelArray(dangerLevelArray);
    setNewWarningLevelArray(warningLevelArray);
    setNewMinShownLevelArray(minShownLevelArray);
    setWaterlevelsValues(waterlevelsVals);
    setLoading(false); // Data is loaded
    setDataAvailable(true);
  }, [waterlevels, dangerlevel]);

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

  if (!dataAvailable) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
        }}
      >
        <Text>{t("no_water_level_data")}</Text>
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
      {/* LineChart for Water Levels */}
      <LineChart
        data={{
          labels: newFormattedDates, // Dates
          legend: ["Water", "Danger", "Warning"],

          datasets: [
            {
              data: waterlevelsValues, // Water level data for each date
              color: (opacity = 0) => `rgba(0, 122, 255, 1)`, // Blue line for water levels
              strokeWidth: 4,
              legendFontSize: 1,
            },
            {
              data: newDangerLevelArray, // Danger level data (constant)
              color: (opacity = 1) => `rgba(255, 0, 0, 1)`, // Red line for danger level
              withDots: false,
              strokeWidth: 1,
            },
            {
              data: newWarningLevelArray, // Warning level data (constant)
              color: (opacity = 1) => `rgba(255, 204, 0, 1)`, // Yellow line for warning level
              withDots: false,
              strokeWidth: 1,
            },
            {
              data: newMinShownLevelArray, // Padding data  (constant)
              color: (opacity = 0) => `rgba(255, 0, 0, 0)`, // Green line for danger level
              withDots: false,
            },
          ],
        }}
        width={Dimensions.get("window").width - 48} // Full width minus some padding
        height={192}
        yAxisLabel=""
        yAxisSuffix="m" // Water levels in meters
        chartConfig={{
          backgroundGradientFrom: "#000000",
          backgroundGradientTo: "#77D0D4",
          decimalPlaces: 2, // optional, specifies decimal places in y-axis values
          color: (opacity = 1) => `rgba(77, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: "2",
            strokeWidth: "1",
            stroke: "#77D0D4",
          },
          propsForBackgroundLines: {
            strokeWidth: 1, // Make the grid lines invisible
          },
        }}
        bezier
        style={{
          borderRadius: 15,
          alignItems: "center",
        }}
      />
    </View>
  );
};

export default WaterLevelChartComponent;
