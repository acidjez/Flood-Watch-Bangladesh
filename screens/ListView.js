import React, { useEffect, useState, useContext, useMemo, memo } from "react";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { FloodDataContext } from "../contexts/FloodDataContext";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import MapViewToggle from "../components/MapViewToggle";
import { getDistanceFromLatLonInKm } from "../utils/getDistanceFromLatLonInKm";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GlobalStyles } from "../constants/GlobaleStyles";
import StandardButton from "../components/Buttons/standardButton";
import FloodModal from "../components/FloodModal";
import { useTranslation } from "react-i18next";
import { userLang } from "../utils/getUserLanguage";
import { getTimeDifference } from "../utils/getTimeDifference";
import { CurrentLocationContext } from "../contexts/CurrentLocationContext";
import NotificationZoneContext from "../contexts/NotificationZoneContext";
import "../utils/getUserLanguage";
import { IconContext } from "../contexts/IconContext";
import Modal from "react-native-modal";
function ListView() {
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);
  const [showModal, setShowModal] = useState(false);
  const { stations } = useContext(FloodDataContext);
  const { currentLocation } = useContext(CurrentLocationContext);
  const { notificationZones } = useContext(NotificationZoneContext);

  const { t } = useTranslation();
  const [modalData, setModalData] = useState(null);
  const [sort, SetSort] = useState(t("distance"));
  const [filterOpen, setFilterOpen] = useState(false);
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
    if (!currentLocation) {
      SetSort(t("favourites"));
    }
  }, []);

  const ListItem = memo(
    ({
      item,
      handleOpenFavourite,
      currentLocation,
      notificationZones,
      t,
      dangerIcon,
      watchIcon,
      safeIcon,
    }) => {
      const distance = currentLocation
        ? getDistanceFromLatLonInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            item.lat,
            item.long
          ).toFixed(1)
        : null;

      const lastUpdateHours = getTimeDifference(
        item.waterlevels[item.waterlevels.length - 1].timestamp
      );

      const iconSource =
        item.waterlevels[item.waterlevels.length - 1].value > item.dangerlevel
          ? dangerIcon
          : item.waterlevels[item.waterlevels.length - 1].value >
            item.dangerlevel - 0.5
          ? watchIcon
          : safeIcon;
      return (
        <View style={styles.zonesContainer}>
          <View style={styles.border}>
            <View style={styles.nameContainerOuter}>
              <View style={styles.nameContainerInner}>
                <Image style={{ width: 36, height: 32 }} source={iconSource} />

                <View>
                  <Text style={styles.name}>
                    {item.customName
                      ? item.customName
                      : t(item.name.toLowerCase().replaceAll(" ", "_"))}
                  </Text>
                  {item.customName && (
                    <Text style={styles.locationName}>
                      {t(item.name.toLowerCase().replaceAll(" ", "_"))}
                      {item.currentWaterLevel}
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
                          distance
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
                      lastUpdateHours
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
                btnStyle={{
                  backgroundColor: GlobalStyles.colors.primary,
                }}
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
      );
    }
  );

  const sortedZones = useMemo(() => {
    const zonesCopy = Object.values(stations);

    return zonesCopy.sort((a, b) => {
      if (sort === t("last_updated")) {
        const timeA = getTimeDifference(
          a.waterlevels[a.waterlevels.length - 1].timestamp
        );
        const timeB = getTimeDifference(
          b.waterlevels[b.waterlevels.length - 1].timestamp
        );

        if (timeA !== timeB) {
          return timeA - timeB;
        }

        const distanceA = getDistanceFromLatLonInKm(
          currentLocation.latitude,
          currentLocation.longitude,
          a.lat,
          a.long
        );
        const distanceB = getDistanceFromLatLonInKm(
          currentLocation.latitude,
          currentLocation.longitude,
          b.lat,
          b.long
        );
        return distanceA - distanceB;
      }

      if (sort === t("favourites")) {
        const aIsFavorite = notificationZones.find(
          (gauge) => gauge.name === a.name
        )
          ? 1
          : 0;
        const bIsFavorite = notificationZones.find(
          (gauge) => gauge.name === b.name
        )
          ? 1
          : 0;

        if (aIsFavorite !== bIsFavorite) {
          return bIsFavorite - aIsFavorite;
        }

        if (currentLocation) {
          const distanceA = getDistanceFromLatLonInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            a.lat,
            a.long
          );
          const distanceB = getDistanceFromLatLonInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            b.lat,
            b.long
          );
          return distanceA - distanceB;
        }
      }

      if (sort === t("distance")) {
        if (currentLocation) {
          const distanceA = getDistanceFromLatLonInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            a.lat,
            a.long
          );
          const distanceB = getDistanceFromLatLonInKm(
            currentLocation.latitude,
            currentLocation.longitude,
            b.lat,
            b.long
          );
          return distanceA - distanceB;
        }
      }

      return 0;
    });
  }, [stations, currentLocation, notificationZones, sort]);
  function handleSort(filter) {
    SetSort(filter);
    setFilterOpen(false);
  }
  return (
    <>
      <Modal
        propagateSwipe
        animationType="slide"
        transparent={true}
        isVisible={filterOpen}
        onBackdropPress={() => setFilterOpen(false)}
        backdropColor="black"
        backdropOpacity={0.25}
        style={styles.filterModal}
        onSwipeComplete={() => setFilterOpen(false)}
        swipeDirection={["down"]}
      >
        <View style={styles.modalContent}>
          <Text>{t("sort_by")}</Text>
          <Pressable onPress={() => handleSort(t("distance"))}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.filterText,
                  sort === t("distance") && { color: GlobalStyles.colors.blue },
                  pressed && { opacity: 0.75 },
                ]}
              >
                {t("distance")}
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => handleSort(t("favourites"))}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.filterText,
                  sort === t("favourites") && {
                    color: GlobalStyles.colors.blue,
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                {t("favourites")}
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => handleSort(t("last_updated"))}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.filterText,
                  sort === t("last_updated") && {
                    color: GlobalStyles.colors.blue,
                  },
                  pressed && { opacity: 0.5 },
                ]}
              >
                {t("last_updated")}
              </Text>
            )}
          </Pressable>
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <MapViewToggle />
          <Pressable onPress={() => setFilterOpen(true)}>
            {({ pressed }) => (
              <View
                style={[styles.filterContainer, pressed && { opacity: 0.5 }]}
              >
                <FontAwesome name="filter" size={20} />
                <Text>{sort}</Text>
              </View>
            )}
          </Pressable>
        </View>
        {showModal && (
          <FloodModal
            goBackFromMarkerLocation={() => {
              setShowModal(false);
            }}
            visible={true}
            gaugeData={modalData}
            currentLocation={currentLocation}
            favouriteOpen={openFavourite}
            handleCloseFavourite={handleCloseFavourite}
          />
        )}

        <FlatList
          style={styles.flatlist}
          data={sortedZones}
          initialNumToRender={7}
          maxToRenderPerBatch={7}
          windowSize={3}
          removeClippedSubviews={true}
          keyExtractor={(item) => (item.st_id ? item.st_id.toString() : null)} ///temp solution for missing station
          renderItem={({ item }) =>
            item.st_id && ( ///temp solution for missing station
              <ListItem
                item={item}
                handleOpenFavourite={handleOpenFavourite}
                currentLocation={currentLocation}
                notificationZones={notificationZones}
                t={t}
                dangerIcon={dangerIcon}
                watchIcon={watchIcon}
                safeIcon={safeIcon}
              />
            )
          }
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
  filterContainer: {
    flexDirection: "row",
    gap: 8,

    alignItems: "center",
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  filterModal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderWidth: 2,
    backgroundColor: GlobalStyles.colors.background,
    gap: 12,
  },
  headerContainer: {
    marginHorizontal: 24,
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flatlist: {
    height: "100%",
  },
  zonesContainer: {
    marginHorizontal: 24,
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
  headingLine: {
    width: "100%",
    height: 1,
    backgroundColor: "black",
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
  zonesContainer: {
    fontSize: 24,
    alignContent: "center",
    marginBottom: 12,
    marginHorizontal: 24,
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
});

export default ListView;
