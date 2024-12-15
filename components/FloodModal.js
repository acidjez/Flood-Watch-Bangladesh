import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { React, useEffect, useState, useContext, useRef } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  Image,
  Pressable,
} from "react-native";

import { GlobalStyles } from "../constants/GlobaleStyles";
import { getDistanceFromLatLonInKm } from "../utils/getDistanceFromLatLonInKm";
import StandardButton from "./Buttons/standardButton";
import MoreInformationModal from "./MoreInformationModal";
import WaterLevelChartComponent from "./WaterLevelLineChart";
import RainfallChartComponent from "./RainfallBarChart";
import "../utils/getUserLanguage"; // import translations
import { userLang } from "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import ChartSelectDropdown from "./ChartSelectDropdown";
import { AntDesign } from "@expo/vector-icons";
import SetNotifcationModel from "./SetNotifcationModel";
import NotificationZoneContext from "../contexts/NotificationZoneContext";
import { getTimeDifference } from "../utils/getTimeDifference";
import Modal from "react-native-modal";

import { IconContext } from "../contexts/IconContext";
// const warningImages = {
//   danger: require("../assets/EmergencyWarningIcon.png"),
//   watch: require("../assets/WatchWarningIcon.png"),
//   safe: require("../assets/SafeWarningIcon.png"),
// };
function FloodModal({
  visible,
  gaugeData,
  currentLocation,
  goBackFromMarkerLocation,
  favouriteOpen,
  handleCloseFavourite,
}) {
  const [lastUpdatedInHrs, setLastUpdateInHrs] = useState();
  const [distanceFromLatLonInKm, setDistanceFromLatLonInKm] = useState(0);
  const [ShowMoreInformationModal, setShowMoreInformationModal] =
    useState(false);
  const [currentChart, setCurrentChart] = useState("waterlevel");
  const [notificationPressed, setNotificationPressed] = useState(false);
  const { notificationZones } = useContext(NotificationZoneContext);

  const [notifications, setNotifications] = useState(false);
  const { t } = useTranslation(); // use translations
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);

  useEffect(() => {
    const notificationData = notificationZones.find(
      (zone) => zone.name === gaugeData.name
    );
    setNotifications(notificationData);
  }, [notificationZones, gaugeData.name]);

  useEffect(() => {
    if (favouriteOpen === true) {
      handleBellPress();
    }
  }, [favouriteOpen]);

  useEffect(() => {
    setLastUpdateInHrs(
      getTimeDifference(
        gaugeData.waterlevels[gaugeData.waterlevels.length - 1].timestamp
      )
    );
  }, [gaugeData.waterlevel]);

  useEffect(() => {
    if (currentLocation) {
      setDistanceFromLatLonInKm(
        getDistanceFromLatLonInKm(
          currentLocation.latitude,
          currentLocation.longitude,
          gaugeData.lat,
          gaugeData.long
        ).toFixed(1)
      );
    }
  }, [gaugeData.lat, gaugeData.long, currentLocation]);
  function closeFavourite() {
    if (handleCloseFavourite) {
      handleCloseFavourite();
    }
    setNotificationPressed(false);
  }

  function ToggleMoreInformation() {
    setShowMoreInformationModal((current) => !current);
  }

  function handleClose() {
    if (!ShowMoreInformationModal) {
      setNotificationPressed(false);
      goBackFromMarkerLocation(gaugeData.lat, gaugeData.long);
    }
  }
  // let warningIcon = require("../assets/EmergencyWarningIcon.png");

  function handleBellPress() {
    setNotificationPressed(true);
  }

  return (
    <Modal
      propagateSwipe
      animationType="slide"
      transparent={true}
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropColor="black"
      backdropOpacity={0.25}
      style={styles.bottomModal}
      onSwipeComplete={handleClose}
      swipeDirection={["down"]}
    >
      <View style={styles.modalContent}>
        {visible && (
          <>
            <MoreInformationModal
              floodData={gaugeData}
              visible={ShowMoreInformationModal}
              handleClose={ToggleMoreInformation}
              threeDayObservedRainfall={null}
            />

            <View style={styles.modalView}>
              <View style={styles.headerContainer}>
                <Image
                  style={{ width: 50, height: 45 }}
                  source={
                    gaugeData.waterlevels[gaugeData.waterlevels.length - 1]
                      .value > gaugeData.dangerlevel
                      ? dangerIcon
                      : gaugeData.waterlevels[gaugeData.waterlevels.length - 1]
                          .value >
                        gaugeData.dangerlevel - 0.5
                      ? watchIcon
                      : safeIcon
                  }
                  transition={1000}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>
                    {t(gaugeData.name.toLowerCase().replaceAll(" ", "_"))}
                  </Text>
                  <Text style={styles.distanceAway}>
                    {distanceFromLatLonInKm &&
                      t("distance_away", {
                        // translate with properties
                        distance: new Intl.NumberFormat(userLang).format(
                          distanceFromLatLonInKm
                        ),
                      })}
                  </Text>
                </View>
                <Pressable
                  onPress={handleBellPress}
                  style={styles.notifcationBell}
                >
                  <AntDesign
                    name={notifications ? "star" : "staro"}
                    size={24}
                    color={notifications ? "gold" : "black"}
                  />
                </Pressable>
              </View>
              {notificationPressed && (
                <SetNotifcationModel
                  warningIcon={
                    gaugeData.waterlevels[gaugeData.waterlevels.length - 1]
                      .value > gaugeData.dangerlevel
                      ? dangerIcon
                      : gaugeData.waterlevels[gaugeData.waterlevels.length - 1]
                          .value >
                        gaugeData.dangerlevel - 0.5
                      ? watchIcon
                      : safeIcon
                  }
                  floodData={gaugeData}
                  handleClose={closeFavourite}
                  notifications={notifications}
                />
              )}
              {!notificationPressed && (
                <>
                  <View style={styles.container}>
                    <View
                      style={[
                        styles.warningMessageContainer,
                        {
                          backgroundColor:
                            gaugeData.waterlevels[
                              gaugeData.waterlevels.length - 1
                            ].value > gaugeData.dangerlevel
                              ? GlobalStyles.colors.red
                              : gaugeData.waterlevels[
                                  gaugeData.waterlevels.length - 1
                                ].value >
                                gaugeData.dangerlevel - 0.5
                              ? GlobalStyles.colors.orange
                              : GlobalStyles.colors.green,
                        },
                      ]}
                    >
                      <Text style={styles.warningMessage}>
                        {gaugeData.waterlevels[gaugeData.waterlevels.length - 1]
                          .value > gaugeData.dangerlevel
                          ? t("danger_message") // translate without property
                          : gaugeData.waterlevels[
                              gaugeData.waterlevels.length - 1
                            ].value >
                            gaugeData.dangerlevel - 0.5
                          ? t("watch_message")
                          : t("safe_message")}
                      </Text>
                    </View>
                    <View style={styles.ChartSelectDropdownContainer}>
                      <ChartSelectDropdown
                        current={currentChart}
                        setDropdown={setCurrentChart}
                      />
                    </View>
                    <View style={styles.chartContainer}>
                      {currentChart === "waterlevel" && (
                        <WaterLevelChartComponent
                          waterlevels={gaugeData.waterlevels}
                          dangerlevel={gaugeData.dangerlevel}
                        />
                      )}
                      {currentChart === "rainfall" && (
                        <RainfallChartComponent rainfall={gaugeData.rainfall} />
                      )}
                    </View>
                  </View>
                  <View style={styles.exitButtonContainer}>
                    <StandardButton
                      onPress={ToggleMoreInformation}
                      text={t("view_more_information")}
                      btnStyle={{ backgroundColor: "#77D0D4" }}
                      textStyle={{
                        fontSize: 16,
                        color: "white",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    />
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
                    <Text style={styles.lastUpdated}>
                      {t("updated_hours", {
                        hours: new Intl.NumberFormat(userLang).format(
                          lastUpdatedInHrs
                        ),
                      })}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </>
        )}
        <Pressable onPress={handleClose} />
      </View>
    </Modal>
  );
}

export default FloodModal;

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: "flex-end", // Align modal to the bottom of the screen
    margin: 0, // Remove default margin
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%", // Full width
    height: (Dimensions.get("window").width - 48) * 0.57 + 380, // Cover half the screen

    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
  },
  container: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 24,
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  headerTextContainer: {},
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  distanceAway: {
    fontSize: 12,
  },
  notifcationBell: {
    position: "absolute",
    top: 0,
    right: 24,
  },
  warningMessageContainer: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.black,
    borderRadius: 14,
    marginBottom: 16,
  },
  warningMessage: {
    fontSize: 16,
    textAlign: "center",
    color: GlobalStyles.colors.white,
    fontWeight: "bold",
  },
  ChartSelectDropdownContainer: {
    marginBottom: 8,
  },
  chartContainer: {
    height: 220,
    justifyContent: "center",
  },
  modalView: {
    width: "100%",
    height: "100%",
  },

  exitButtonContainer: {
    marginBottom: 20,
    marginHorizontal: 24,

    gap: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: GlobalStyles.colors.grey200,
    textAlign: "center",
  },
});
