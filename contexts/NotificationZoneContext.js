import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { auth } from "../firebaseConfig";

const NotificationZoneContext = createContext();

export const NotificationZoneProvider = ({ children }) => {
  const [notificationZones, setNotificationZones] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchNotificationZones = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("favourites");
        const data = jsonValue != null ? JSON.parse(jsonValue) : [];
        setNotificationZones(data);
      } catch (e) {
        console.error(
          "Failed to fetch notification zones from AsyncStorage",
          e
        );
      }
    };

    fetchNotificationZones();
  }, []);

  const addNotificationZone = async (
    floodData,
    notificationName,
    emergencyWarning,
    watchAndAct
  ) => {
    const gagueName = floodData.name;
    const st_id = floodData.st_id.toString();
    const lat = floodData.lat;
    const long = floodData.long;

    try {
      const newFloodData = {
        st_id: st_id,
        lat: lat,
        long: long,
        name: gagueName,
        customName: gagueName !== notificationName ? notificationName : null,
        emergencyWarning: emergencyWarning,
        watchAndAct: watchAndAct,
      };

      const jsonValue = await AsyncStorage.getItem("favourites");
      const favourites = jsonValue != null ? JSON.parse(jsonValue) : [];

      const index = favourites.findIndex((zone) => zone.st_id === st_id);
      if (index !== -1) {
        favourites[index] = {
          ...favourites[index],
          ...newFloodData,
        };
      } else {
        favourites.push(newFloodData);
      }

      await AsyncStorage.setItem("favourites", JSON.stringify(favourites));
      setNotificationZones(favourites);

      const user = auth.currentUser;
      if (user) {
        const token = await AsyncStorage.getItem("devicePushToken");
        const userDocRef = doc(db, "user_watchlist", user.uid);
        await setDoc(userDocRef, { gauges: favourites, fcmToken: token }); // Replace the entire document with favourites
      }
    } catch (e) {
      console.error("Error saving data", e);
    }
  };

  const removeNotificationZone = async (st_id) => {
    try {
      const jsonValue = await AsyncStorage.getItem("favourites");
      const favourites = jsonValue != null ? JSON.parse(jsonValue) : [];

      const updatedFavourites = favourites.filter(
        (zone) => zone.st_id !== st_id.toString()
      );

      await AsyncStorage.setItem(
        "favourites",
        JSON.stringify(updatedFavourites)
      );
      setNotificationZones(updatedFavourites);

      // Sync the updated favourites array to Firestore
      const user = auth.currentUser;
      if (user) {
        const token = await AsyncStorage.getItem("devicePushToken");
        const userDocRef = doc(db, "user_watchlist", user.uid);
        await setDoc(userDocRef, {
          gauges: updatedFavourites,
          fcmToken: token,
        }); // Replace the entire document with updated favourites
      }
    } catch (e) {
      console.error("Failed to remove notification zone", e);
    }
  };

  return (
    <NotificationZoneContext.Provider
      value={{ notificationZones, addNotificationZone, removeNotificationZone }}
    >
      {children}
    </NotificationZoneContext.Provider>
  );
};

export default NotificationZoneContext;
