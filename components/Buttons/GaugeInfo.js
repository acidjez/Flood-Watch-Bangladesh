import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { userLang } from "../../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { GlobalStyles } from "../../constants/GlobaleStyles";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { CurrentLocationContext } from "../../contexts/CurrentLocationContext";
import { use } from "i18next";
import { IconContext } from "../../contexts/IconContext";

// const warningImages = {
//   danger: require("../../assets/EmergencyWarningIcon.png"),
//   watch: require("../../assets/WatchWarningIcon.png"),
//   safe: require("../../assets/SafeWarningIcon.png"),
// };

// button takes in gauge info and displays it
function GaugeInfo({
  gaugeData,
  onPress, // Parent's onClose function
  getDistanceFromLatLonInKm,
  longPressCoordinates,
  handleMarkerPress,
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentLocation } = useContext(CurrentLocationContext);
  const [dangerState, setDangerState] = useState("safe");
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);

  useEffect(() => {
    const currentWaterLevel =
      gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value;
    const stationDangerLevel = gaugeData.dangerlevel;
    let dangerLevel =
      currentWaterLevel > stationDangerLevel
        ? "danger"
        : currentWaterLevel > stationDangerLevel - 0.5
        ? "watch"
        : "safe";
    setDangerState(dangerLevel);

    // console.log("dangerLevel", dangerLevel);
  }, [gaugeData]);

  return (
    <Pressable
      style={styles.Pressable}
      onPress={() => {
        //call the parent's onClose function
        // onPress();
        onPress();
        handleMarkerPress(gaugeData.st_id, gaugeData.lat, gaugeData.long);
        // navigate to the 'home' screen
        navigation.navigate(t("home"), {
          st_id: gaugeData.st_id,
          lat: gaugeData.lat,
          long: gaugeData.long,
          from: "MyNotificationZone",
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          style={{ width: 48, height: 40 }}
          source={
            dangerState === "danger"
              ? dangerIcon
              : dangerState === "watch"
              ? watchIcon
              : safeIcon
          }
          transition={1000}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.gaugeName}>
          {t(gaugeData.name.toLowerCase().replaceAll(" ", "_"))}
        </Text>

        {/* Wrap icon and distance in a View with row layout */}
        <View style={styles.iconAndTextRow}>
          <MaterialCommunityIcons
            name={"map-marker-distance"}
            size={20}
            color={GlobalStyles.colors.grey200}
          />
          <Text style={styles.text}>
            {t("distance_away", {
              // translate with properties
              distance: new Intl.NumberFormat(userLang).format(
                getDistanceFromLatLonInKm(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  gaugeData.lat,
                  gaugeData.long
                ).toFixed(2)
              ),
            })}
          </Text>
        </View>
      </View>

      <View style={styles.arrow}>
        <AntDesign name="right" size={16} color="black" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  Pressable: {
    width: "98%",
    display: "flex",
    flexDirection: "row", // Horizontal layout for the elements
    justifyContent: "space-between", // Spread out the elements
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    height: ((Dimensions.get("window").width - 48) * 0.2 + 280) / 5,
    marginBottom: 10,
    backgroundColor: GlobalStyles.colors.white,
    paddingRight: 16, // Add some padding to the right
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flexGrow: 1, // Allow the text container to take the remaining space
  },
  gaugeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
  },
  iconAndTextRow: {
    flexDirection: "row", // Aligns the icon and text in row
    alignItems: "center", // centers the icon and text
  },
  text: {
    fontSize: 14,
    marginLeft: 5, // Add space between the icon and the text
    color: GlobalStyles.colors.grey800,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: 16,
  },
  arrow: {
    justifyContent: "center",
  },
});

export default GaugeInfo;
