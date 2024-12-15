import { React, useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Modal,
  View,
  Text,
  Pressable,
  Animated,
} from "react-native";
import "../utils/getUserLanguage"; // import translations

import { useTranslation } from "react-i18next";

import StandardButton from "./Buttons/standardButton";
import { ScrollView } from "react-native-gesture-handler";

function MoreInformationModal({ floodData, handleClose, visible }) {
  const { t } = useTranslation();
  const [stationData, setStationData] = useState([]);
  const [rainfallData, setRainfallData] = useState(null);
  const [waterLevelsData, setWaterLevelsData] = useState(null);

  useEffect(() => {
    // Destructure the data object to remove unnecessary properties
    const {
      basin_order,
      rainfall,
      rainfallRef,
      st_id,
      waterlevelRef,
      waterlevels,
      lat,
      long,
      ...stationDetails
    } = floodData;

    // Combine lat and long into a single entry
    const stationArray = [
      { key: "coordinates", value: `Lat: ${lat}, Long: ${long}` },
      ...Object.keys(stationDetails).map((key) => ({
        key: key,
        value: stationDetails[key],
      })),
    ];

    // Set the station data without the excluded properties
    setStationData(stationArray);

    // Transform rainfall data (if any) into a readable format
    const transformedRainfall =
      rainfall && rainfall.length > 0
        ? rainfall.map((item) => ({
            timestamp: item.timestamp?.seconds
              ? new Date(item.timestamp.seconds * 1000).toLocaleString()
              : "No timestamp",
            value: item.value,
          }))
        : null;

    // Transform waterlevels data (if any) into a readable format
    const transformedWaterLevels =
      waterlevels && waterlevels.length > 0
        ? waterlevels.map((item) => ({
            timestamp: item.timestamp?.seconds
              ? new Date(item.timestamp.seconds * 1000).toLocaleString()
              : "No timestamp",
            value: item.value,
          }))
        : null;

    // Set the transformed rainfall and water level data
    setRainfallData(transformedRainfall);
    setWaterLevelsData(transformedWaterLevels);
  }, [floodData]); // Runs every time `data` changes

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        handleClose();
      }}
      style={styles.modal}
    >
      <View style={styles.closeBtnContainer}>
        <View style={styles.closeBtnInnerContainer}>
          <StandardButton
            onPress={handleClose}
            text={t("close")}
            btnStyle={{ backgroundColor: "black" }}
            textStyle={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
        </View>
      </View>

      <ScrollView alwaysBounceVertical={false} bounces={false}>
        <View style={styles.modalView}>
          <Text style={styles.heading}>{t("view_more_information")}</Text>
          {stationData.map((item) => {
            return (
              <View style={styles.row} key={item.key}>
                <Text style={styles.col}>{item.key}</Text>
                <Text style={styles.col}>{item.value}</Text>
              </View>
            );
          })}
          {rainfallData && (
            <Text style={styles.heading}>
              {t("three_day_observation_rainfall")}
            </Text>
          )}
          {rainfallData &&
            rainfallData.map((item) => {
              return (
                <View style={styles.row} key={item.timestamp}>
                  <Text style={styles.col}>{item.timestamp}</Text>
                  <Text style={styles.col}>{item.value}</Text>
                </View>
              );
            })}
          {waterLevelsData && (
            <Text style={styles.heading}>{t("three_day_observation")}</Text>
          )}
          {waterLevelsData &&
            waterLevelsData.map((item, index) => {
              return (
                <View style={styles.row} key={index}>
                  <Text style={styles.col}>{item.timestamp}</Text>
                  <Text style={styles.col}>{item.value}</Text>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </Modal>
  );
}

export default MoreInformationModal;

const styles = StyleSheet.create({
  closeBtnContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 24,
    left: 0,
    width: "100%",
    backgroundColor: "white",
    zIndex: 6,
  },
  closeBtnInnerContainer: {
    marginHorizontal: 24,
  },
  modalView: {
    paddingTop: 50,
    backgroundColor: "white",
    padding: 24,
    paddingBottom: 100,
    height: "100%",
  },
  heading: {
    textAlign: "center",
    margin: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  flatList: {
    backgroundColor: "#F3F4F8",
  },
  row: {
    flexDirection: "row",
  },
  col: {
    borderColor: "#DADCE0",
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  table: {
    flex: 4,
    backgroundColor: "red",
  },
  exitButton: { backgroundColor: "black" },
  exitButtonContainer: {
    alignSelf: "stretch",
  },
});
