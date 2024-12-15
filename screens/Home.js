import React, { useRef, useEffect, useState, useContext, useMemo } from "react";
import MapView from "react-native-map-clustering";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import MapButton from "../components/Buttons/MapButtons";
import * as Location from "expo-location";
import { FloodDataContext } from "../contexts/FloodDataContext";
import { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import GooglePlacesInput from "../components/GoogleSearchBar";
import FloodInfoMarker from "../components/FloodInfoMarker";
import MapViewToggle from "../components/MapViewToggle";
import { getDistanceFromLatLonInKm } from "../utils/getDistanceFromLatLonInKm";
import { useRoute } from "@react-navigation/native";
import NearbyGauges from "../components/NearbyGauges";
import { Feather } from "@expo/vector-icons";
import MapTypeContext from "../contexts/MapTypeContext";
import { GlobalStyles } from "../constants/GlobaleStyles";
import FloodModal from "../components/FloodModal";
import { CurrentLocationContext } from "../contexts/CurrentLocationContext";
import { useWindowDimensions } from "react-native";
import { PROVIDER_GOOGLE } from "react-native-maps";

function Home({ navigation }) {
  const mapRef = useRef(null); // Create a ref for the MapView
  const route = useRoute();
  const [region, setRegion] = useState({
    latitude: 23.6943,
    longitude: 90.3444,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });

  const { width } = useWindowDimensions();

  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { stations } = useContext(FloodDataContext);
  const { currentLocation } = useContext(CurrentLocationContext);
  const [modalVisibleId, setModalVisibleId] = useState(null);
  const [locationSearch, setLocationSearch] = useState(null);

  const [circleRadius, setCircleRadius] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [longPressCoordinates, setLongPressCoordinates] = useState(null);
  const { MapType } = useContext(MapTypeContext);

  const memoizedMarkers = useMemo(() => {
    // console.log("Memoized markers");
    return Object.keys(stations).map(
      (key) =>
        stations[key].st_id && (
          <Marker
            key={stations[key].st_id}
            coordinate={{
              latitude: stations[key].lat,
              longitude: stations[key].long,
            }}
            tracksViewChanges={true}
            calloutAnchor={{ x: 0.5, y: 0.5 }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={stations[key].st_id}
            onPress={() =>
              handleMarkerPress(
                stations[key].st_id,
                stations[key].lat,
                stations[key].long
              )
            }
          >
            <FloodInfoMarker gaugeData={stations[key]} />
          </Marker>
        )
    );
  }, [stations]); // Only recalculate if `stations` changes

  useEffect(() => {
    if (route.params?.st_id) {
      goToMarkerLocation(
        route.params.lat,
        route.params.long,
        parseInt(route.params.st_id)
      );
    }
  }, [route.params]);

  useEffect(() => {
    // Find and animate to the nearest marker when a place is selected

    if (locationSearch) {
      //log that the place is selected
      const { lat, lng } = locationSearch.details.geometry.location;
      let nearestMarker = null;
      let minDistance = Infinity;
      // Iterate through stations to find the nearest gauge
      Object.values(stations).forEach((item) => {
        const distance = getDistanceFromLatLonInKm(
          lat,
          lng,
          item.lat,
          item.long
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestMarker = item;
        }
      });

      // If a nearest marker is found, animate the map to that region
      if (nearestMarker) {
        const newRegion = {
          latitude: nearestMarker.lat,
          longitude: nearestMarker.long,
          latitudeDelta: 0.05, // Zoom in to the location
          longitudeDelta: 0.05,
        };
        mapRef.current.animateToRegion(newRegion, 300); // Animate to the nearest gauge
        setRegion(newRegion);
      }
    }
  }, [locationSearch]);

  useEffect(() => {
    if (currentLocation && !initialLocationSet) {
      goToCurrentLocation();
      setInitialLocationSet(true); // Mark initial location as set
    }
  }, [currentLocation, initialLocationSet]);

  const handleLocationSearch = (data, details) => {
    setLocationSearch({ data, details }); // Set the selected location search result
  };

  const zoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    mapRef.current.animateToRegion(newRegion, 300);
    setRegion(newRegion);
  };

  const zoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    mapRef.current.animateToRegion(newRegion, 300);
    setRegion(newRegion);
  };

  const goBackFromMarkerLocation = (latitude, longitude) => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 1,
      longitudeDelta: 1,
    };
    mapRef.current.animateToRegion(newRegion, 1000);
    setRegion(newRegion);
    setShowModal(null);
  };

  const goToCurrentLocation = () => {
    if (currentLocation) {
      const newRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
    }
  };

  const handleLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newRegion = {
      latitude: latitude - 0.55, //0.06 to move the maker into view
      longitude: longitude,
      latitudeDelta: 1.5,
      longitudeDelta: 1.5,
    };
    mapRef.current.animateToRegion(newRegion, 1000);
    setRegion(newRegion);
    setLongPressCoordinates({ latitude, longitude });
    setModalVisible(true); // Show the modal with nearby gauges
  };

  const handleMarkerPress = (key, lat, long) => {
    const newRegion = {
      latitude: lat - 0.055, //0.06 to move the maker into view
      longitude: long,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    mapRef.current.animateToRegion(newRegion, 1000);
    setRegion(newRegion);
    setShowModal(true);
    setModalVisibleId(key);
  };
  const handleMapPress = (event) => {
    // Check if the click is on a POI
    const poi = event.nativeEvent.poi;
    if (poi) {
      // Prevent the default POI click behavior
      event.preventDefault();
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <MapView
          ref={mapRef} // Attach the ref to the MapView
          style={[styles.map]}
          mapType={MapType}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          //onRegionChangeComplete={setRegion}
          radius={width * 0.15}
          showsUserLocation={true}
          showsMyLocationButton={false}
          clusterColor="#77D0D4"
          clusterTextColor="#FFFFFF"
          onLongPress={handleLongPress}
          showsCompass={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          onPress={handleMapPress}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
        >
          {memoizedMarkers}
          {/* Marker at long press location */}
          {modalVisible && longPressCoordinates && (
            <>
              <Marker coordinate={longPressCoordinates}>
                <Feather name="map-pin" size={32} color="black" />
              </Marker>
              {circleRadius && (
                <Circle
                  center={longPressCoordinates}
                  radius={circleRadius} // Use the radius from NearbyGauges
                  strokeWidth={3}
                  strokeColor={GlobalStyles.colors.primary}
                  fillColor={GlobalStyles.colors.primaryTransparent}
                />
              )}
            </>
          )}
        </MapView>

        {showModal && modalVisibleId !== null && stations[modalVisibleId] && (
          <FloodModal
            goBackFromMarkerLocation={() => {
              goBackFromMarkerLocation(
                stations[modalVisibleId].lat,
                stations[modalVisibleId].long
              );
            }}
            visible={true}
            gaugeData={stations[modalVisibleId]}
            currentLocation={currentLocation}
          />
        )}

        <GooglePlacesInput onPlaceSelect={handleLocationSearch} />
        <MapViewToggle
          postion={{ top: 112, position: "absolute", alignSelf: "center" }}
        />
        <MapButton
          position={{ left: 24, bottom: 24 }}
          onPress={navigation.openDrawer}
          iconColor="#0188FF"
          iconName="menu"
          iconSize={24}
        />

        {currentLocation && (
          <MapButton
            position={{ right: 24, bottom: 128 }}
            onPress={goToCurrentLocation}
            iconColor="#0188FF"
            iconName="crosshairs"
            iconSize={24}
          />
        )}
        <MapButton
          position={{ right: 24, bottom: 76 }}
          onPress={zoomIn}
          iconColor="#0188FF"
          iconName="magnify-plus-outline"
          iconSize={24}
        />
        <MapButton
          position={{ right: 24, bottom: 24 }}
          onPress={zoomOut}
          iconColor="#0188FF"
          iconName="magnify-minus-outline"
          iconSize={24}
        />
        {/* NearbyGauges Component */}
        <NearbyGauges
          visible={modalVisible}
          longPressCoordinates={longPressCoordinates}
          onClose={() => setModalVisible(false)}
          setCircleRadius={setCircleRadius}
          handleMarkerPress={handleMarkerPress}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Home;
