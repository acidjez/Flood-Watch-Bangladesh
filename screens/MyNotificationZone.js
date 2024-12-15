import React, { useCallback, useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import { GlobalStyles } from "../constants/GlobaleStyles";
import { AntDesign } from "@expo/vector-icons";
import NotificationZoneContext from "../contexts/NotificationZoneContext";
import { useNavigation } from "@react-navigation/native";
import { FloodDataContext } from "../contexts/FloodDataContext";
import { useTranslation } from "react-i18next";
import StandardButton from "../components/Buttons/standardButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getDistanceFromLatLonInKm } from "../utils/getDistanceFromLatLonInKm";
import { CurrentLocationContext } from "../contexts/CurrentLocationContext";
import { getTimeDifference } from "../utils/getTimeDifference";
import "../utils/getUserLanguage";
import { userLang } from "../utils/getUserLanguage";
import FloodModal from "../components/FloodModal";
import { IconContext } from "../contexts/IconContext";

function MyNotificationZone() {
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);
  const { notificationZones } = useContext(NotificationZoneContext);
  const [modalData, setModalData] = useState(null);
  const { stations } = useContext(FloodDataContext);
  const { t } = useTranslation();
  const { currentLocation } = useContext(CurrentLocationContext);
  const [showModal, setShowModal] = useState(false);
  const [favoriteZones, setFavoriteZones] = useState([]);
  const [openFavourite, setOpenFavourite] = useState(false);
  const handleOpenModal = (st_id) => {
    setShowModal(true);
    setModalData(stations[st_id]);
  };
  const handleOpenFavourite = (st_id) => {
    setOpenFavourite(true);
    handleOpenModal(st_id);
  };
  const handleCloseFavourite = () => {
    setOpenFavourite(false);
  };
  useEffect(() => {
    const updatedFavoriteZones = notificationZones.map((zone) => {
      const matchedStation = stations[zone.st_id];

      // Get dangerlevel and the most recent waterlevel data (value and timestamp)
      const dangerlevel = matchedStation.dangerlevel;
      const mostRecentWaterLevel =
        matchedStation.waterlevels && matchedStation.waterlevels.length > 0
          ? {
              value:
                matchedStation.waterlevels[
                  matchedStation.waterlevels.length - 1
                ].value,
              timestamp:
                matchedStation.waterlevels[
                  matchedStation.waterlevels.length - 1
                ].timestamp,
            }
          : { value: null, timestamp: null };

      // Return a new object combining the zone data with dangerlevel and mostRecentWaterLevel
      return {
        ...zone,
        dangerlevel,
        mostRecentWaterLevel,
      };
    });

    // Update favoriteZones state with the enriched data
    setFavoriteZones(updatedFavoriteZones);
  }, [notificationZones, stations]);

  if (favoriteZones.length === 0) {
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("nothing_added")}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {showModal && (
          <FloodModal
            goBackFromMarkerLocation={() => setShowModal(false)}
            visible={true}
            gaugeData={modalData}
            currentLocation={currentLocation}
            favouriteOpen={openFavourite}
            handleCloseFavourite={handleCloseFavourite}
          />
        )}
        <FlatList
          style={styles.flatlist}
          data={favoriteZones}
          renderItem={({ item }) => (
            <View style={styles.zonesContainer}>
              <View style={styles.border}>
                <View style={styles.nameContainerOuter}>
                  <View style={styles.nameContainerInner}>
                    <Image
                      style={{ width: 36, height: 32 }}
                      source={
                        item.mostRecentWaterLevel.value > item.dangerlevel
                          ? dangerIcon
                          : item.mostRecentWaterLevel.value >
                            item.dangerlevel - 0.5
                          ? watchIcon
                          : safeIcon
                      }
                    />

                    <View style={styles.titleContainer}>
                      <Text style={styles.name}>
                        {item.customName
                          ? item.customName
                          : t(item.name.toLowerCase().replaceAll(" ", "_"))}
                      </Text>
                      {item.customName && (
                        <Text style={styles.locationName}>
                          {t(item.name.toLowerCase().replaceAll(" ", "_"))}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Pressable onPress={() => handleOpenFavourite(item.st_id)}>
                    {({ pressed }) => (
                      <AntDesign
                        style={[
                          styles.notifcationBell,
                          pressed && { opacity: 0.5 },
                        ]}
                        name={
                          notificationZones.find(
                            (gauge) => gauge.name === item.name
                          )
                            ? "star"
                            : "staro"
                        }
                        size={24}
                        color={
                          notificationZones.find(
                            (gauge) => gauge.name === item.name
                          )
                            ? "gold"
                            : "black"
                        }
                      />
                    )}
                  </Pressable>
                </View>
                <View style={styles.dataSnapshot}>
                  <View style={styles.dataSnapshotIconContainer}>
                    {currentLocation && (
                      <>
                        <MaterialCommunityIcons
                          name={"map-marker-distance"}
                          size={20}
                          color={GlobalStyles.colors.grey200}
                        />
                        <Text style={styles.dataSnapshotText}>
                          {t("distance_away", {
                            distance: new Intl.NumberFormat(userLang).format(
                              getDistanceFromLatLonInKm(
                                currentLocation.latitude,
                                currentLocation.longitude,
                                item.lat,
                                item.long
                              ).toFixed(1)
                            ),
                          })}
                        </Text>
                      </>
                    )}
                  </View>
                  {currentLocation && <View style={styles.line}></View>}
                  <View style={styles.dataSnapshotIconContainer}>
                    <MaterialCommunityIcons
                      name={"clock-time-four-outline"}
                      size={20}
                      color={GlobalStyles.colors.grey200}
                    />
                    <Text style={styles.dataSnapshotText}>
                      {t("hours_ago", {
                        hours: new Intl.NumberFormat(userLang).format(
                          getTimeDifference(item.mostRecentWaterLevel.timestamp)
                        ),
                      })}
                    </Text>
                  </View>
                </View>
                {(item.emergencyWarning || item.watchAndAct) && (
                  <View style={styles.iconsContainer}>
                    <Text style={styles.notificationText}>
                      {t("notifications")}:
                    </Text>
                    {item.emergencyWarning && (
                      <Image
                        style={{ width: 25, height: 20 }}
                        source={dangerIcon}
                        transition={1000}
                      />
                    )}
                    {item.watchAndAct && (
                      <Image
                        style={{ width: 25, height: 20 }}
                        source={watchIcon}
                        transition={1000}
                      />
                    )}
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <StandardButton
                    onPress={() => handleOpenModal(item.st_id)}
                    text={t("more_details")}
                    btnStyle={{ backgroundColor: GlobalStyles.colors.primary }}
                    textStyle={{
                      fontSize: 14,
                      color: GlobalStyles.colors.white,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  />
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.background,
    paddingBottom: 10,
    flex: 1,
  },
  flatlist: {
    height: "100%",
  },
  zonesContainer: {
    marginHorizontal: 24,
    marginTop: 12,
  },
  border: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 20,
    padding: 16,
    backgroundColor: GlobalStyles.colors.white,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  locationName: {
    fontSize: 14,
    color: GlobalStyles.colors.grey300,
  },
  dataSnapshot: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dataSnapshotIconContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  line: {
    backgroundColor: GlobalStyles.colors.grey300,
    height: "100%",
    width: 1,
  },
  nameContainerOuter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameContainerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationText: {
    fontSize: 14,
    color: GlobalStyles.colors.grey300,
  },
  iconsContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dataSnapshotText: {
    fontSize: 14,
    color: GlobalStyles.colors.grey300,
  },
  buttonContainer: {
    marginTop: 12,
  },
  titleContainer: {
    alignItems: "center",
  },

  title: {
    marginTop: 12,
    fontSize: 14,
    color: GlobalStyles.colors.grey300,
    fontWeight: "bold",
  },
});

export default MyNotificationZone;
