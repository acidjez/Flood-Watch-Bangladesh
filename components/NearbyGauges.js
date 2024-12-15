import React, { useEffect, useState, useContext } from "react";
import {
  Modal,
  View,
  Dimensions,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
} from "react-native";

import {
  GestureHandlerRootView,
  PanGestureHandler,
  NativeViewGestureHandler,
} from "react-native-gesture-handler";

import StandardButton from "./Buttons/standardButton";
import GaugeInfo from "./Buttons/GaugeInfo";
import "../utils/getUserLanguage"; // import translations
import { userLang } from "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { FloodDataContext } from "../contexts/FloodDataContext";
import { getDistanceFromLatLonInKm } from "../utils/getDistanceFromLatLonInKm";

const NearbyGauges = ({
  visible,
  longPressCoordinates,
  onClose,
  setCircleRadius,
  handleMarkerPress,
}) => {
  const { t } = useTranslation();
  const { stations } = useContext(FloodDataContext);
  const [nearestGauges, setNearestGauges] = useState([]);

  useEffect(() => {
    if (longPressCoordinates && stations) {
      //Find gauges within 50 km based on the long-pressed coordinates
      const nearest = Object.values(stations)
        .map((gauge) => ({
          ...gauge,
          distance: getDistanceFromLatLonInKm(
            longPressCoordinates.latitude,
            longPressCoordinates.longitude,
            gauge.lat,
            gauge.long
          ),
        }))
        .filter((gauge) => gauge.distance <= 50) // Only include gauges within 50 km
        .sort((a, b) => a.distance - b.distance); // Sort by distance (closest to furthest)

      setNearestGauges(nearest); // Update state with the nearest gauges
      if (nearest.length > 0) {
        setCircleRadius(50000); // Set the circle radius to the max distance + 1km
      } else {
        setCircleRadius(null);
      }
    }
  }, [longPressCoordinates, stations]);

  // Render individual gauge item using GaugeInfo component
  const renderGaugeItem = ({ item }) => (
    <GaugeInfo
      key={item.st_id} // unique key for each row
      gaugeData={item} // give gauge data to the GaugeInfo component
      onPress={onClose} // Handle pressing on a gauge
      getDistanceFromLatLonInKm={getDistanceFromLatLonInKm} // Function for calculating distance betwen two points
      longPressCoordinates={longPressCoordinates} // Pass long press coordinates to find the distance away to to display
      handleMarkerPress={handleMarkerPress}
    />
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Outer Pressable to capture taps outside the modal */}
      <Pressable style={styles.modalBackground} onPress={onClose}>
        {/* Inner View to prevent closing when tapping inside the modal */}
        <Pressable style={styles.modalView} onPress={() => {}}>
          <Text style={styles.heading}>{t("nearby_gauges")}</Text>

          <View style={styles.listContainer}>
            {nearestGauges.length > 0 ? (
              <FlatList
                data={nearestGauges} // Pass the nearest gauges array to FlatList
                renderItem={renderGaugeItem} // Render each gauge item using GaugeInfo
                keyExtractor={(item) => item.st_id.toString()} // Ensure unique key
                showsVerticalScrollIndicator={true} // Show the scroll indicator
              />
            ) : (
              // Display message when no gauges are found within 50km
              <Text style={styles.noGaugesText}>{t("no_gauges")}</Text>
            )}
          </View>

          <StandardButton
            onPress={onClose}
            text={t("close")}
            btnStyle={{ backgroundColor: "black", marginTop: 10 }}
            textStyle={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1, // Take the full screen
    justifyContent: "flex-end", // Align the modal to the bottom
    // backgroundColor: "rgba(0,0,0,0.5)", // Dim the background when the modal is open
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: "#000",
    elevation: 5,
    height: (Dimensions.get("window").width - 48) * 0.2 + 380, // This will be a little under half the screen height
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderWidth: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 15,
    textAlign: "center",
  },
  listContainer: {
    flex: 1, // Make the list take up available space
    maxHeight: Dimensions.get("window").height * 0.4, // Set a max height for the FlatList
  },
  noGaugesText: {
    fontSize: 16,
    color: "grey",
    textAlign: "center",
    marginTop: 20,
  },
});

export default NearbyGauges;
