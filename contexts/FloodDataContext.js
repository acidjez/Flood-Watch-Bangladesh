import React, { createContext, useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTimeDifference } from "../utils/getTimeDifference";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const FloodDataContext = createContext();

const FloodDataProvider = ({ children }) => {
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [lastLoadedTimeStamp, setLastLoadedTimeStamp] = useState(null);
  const [noConnectionNoDataSaved, setNoConnectionNoDataSaved] = useState(false);
  const [noInternetSavedData, setNoInternetSavedData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      // await AsyncStorage.clear();
      let fetchNewData = null;
      let hasInternet = null;

      let last_updatedFirebaseQuerySnapshot;
      let last_updatedFirebaseData;
      try {
        last_updatedFirebaseQuerySnapshot = await getDocs(
          collection(db, "details")
        );
        last_updatedFirebaseData =
          last_updatedFirebaseQuerySnapshot.docs[0].data().last_updated;
        hasInternet = true;
        login();
      } catch (error) {
        hasInternet = false;
      }

      const jsonValue = await AsyncStorage.getItem("last_updated");
      const last_updatedAsyncStorageData =
        jsonValue != null ? JSON.parse(jsonValue) : null;

      if (last_updatedAsyncStorageData !== null) {
        setLastLoadedTimeStamp(last_updatedAsyncStorageData);
      }

      if (last_updatedAsyncStorageData == null && hasInternet) {
        //first time opening app
        fetchNewData = true;
      } else if (last_updatedAsyncStorageData == null && !hasInternet) {
        setNoConnectionNoDataSaved(true);
        return;
      } else if (last_updatedAsyncStorageData && !hasInternet) {
        setNoInternetSavedData(true);
        fetchNewData = false;
      }

      if (fetchNewData === null && hasInternet) {
        if (
          JSON.stringify(last_updatedFirebaseData) ===
          JSON.stringify(last_updatedAsyncStorageData)
        ) {
          fetchNewData = false;
        } else {
          fetchNewData = true;
        }
      }

      // console.log(fetchNewData);

      let stationsDataWithId;

      if (fetchNewData) {
        const stationsQuerySnapshot = await getDocs(collection(db, "stations"));

        let stationsData = stationsQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        stationsData.forEach((station) => {
          station.waterlevels.sort((a, b) => {
            const timeA = a.timestamp.toMillis(); // Convert Firestore timestamp to milliseconds
            const timeB = b.timestamp.toMillis();
            return timeA - timeB; // Sort in descending order (most recent first)
          });

          station.rainfall.sort((a, b) => {
            const timeA = a.timestamp.toMillis(); // Convert Firestore timestamp to milliseconds
            const timeB = b.timestamp.toMillis();
            return timeA - timeB; // Sort in descending order (most recent first)
          });
        });

        // Converting the array into an object with station ids as keys
        stationsDataWithId = stationsData.reduce((acc, station) => {
          acc[station.id] = station;
          return acc;
        }, {});

        if (stationsData.length === 0) {
          setFetchError(true);
        }
        await AsyncStorage.setItem(
          "stationData",
          JSON.stringify(stationsDataWithId)
        );

        // console.log("setting local stoage");
        await AsyncStorage.setItem(
          "last_updated",
          JSON.stringify(last_updatedFirebaseData)
        );
      } else {
        const jsonValue = await AsyncStorage.getItem("stationData");
        stationsDataWithId = JSON.parse(jsonValue);
      }

      setStations(stationsDataWithId);
      setLoading(false);
    };

    async function sendTokenToDatabase(token, userId) {
      try {
        // Reference to the user document in the user_watchlist collection
        const userDocRef = doc(db, "user_watchlist", userId);

        // Set the token in the document. Merge ensures we don't overwrite other fields.
        await setDoc(userDocRef, { fcmToken: token }, { merge: true });

        // console.log("FCM token saved to Firestore successfully");
      } catch (error) {
        // console.error("Error saving FCM token to Firestore:", error);
      }
    }

    async function registerForPushNotificationsAsync(userId) {
      let storedToken = await AsyncStorage.getItem("devicePushToken");

      if (Constants.isDevice || true) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notifications!");
          return;
        }

        // Get the Expo push token for this device
        const token = (await Notifications.getDevicePushTokenAsync()).data;

        // Check if the token has changed before sending it to the server
        if (storedToken !== token) {
          // Store the new token
          await AsyncStorage.setItem("devicePushToken", token);
          sendTokenToDatabase(token, userId);

          // console.log("New token registered and sent to backend:", token);
        } else {
          // console.log("Token is unchanged:", storedToken);
        }
      } else {
        alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    //   // Use a promise to wait for the auth state to resolve before taking further action
    //   const authStatePromise = new Promise((resolve) => {
    //     onAuthStateChanged(auth, (user) => {
    //       resolve(user); // Resolve with the user object
    //     });
    //   });

    //   const user = await authStatePromise; // Await the result of onAuthStateChanged

    //   if (user) {
    //     // User is already signed in (persisted session)
    //     console.log("User is already signed in", user.uid);
    //     registerForPushNotificationsAsync(user.uid);
    //   } else {
    //     // No user is signed in, so sign in anonymously
    //     try {
    //       const userCredential = await signInAnonymously(auth);
    //       console.log("User signed in anonymously", userCredential.user.uid);
    //       registerForPushNotificationsAsync(userCredential.user.uid);
    //     } catch (error) {
    //       if (error.code === "auth/operation-not-allowed") {
    //         console.log(
    //           "Anonymous auth is not enabled in the Firebase console."
    //         );
    //       } else {
    //         console.error("Error signing in anonymously:", error);
    //       }
    //     }
    //   }
    // };

    // const login = async () => {
    //   return new Promise((resolve, reject) => {
    //     // Set up the listener for auth state changes
    //     const unsubscribe = onAuthStateChanged(
    //       auth,
    //       async (user) => {
    //         unsubscribe(); // Clean up the listener to avoid memory leaks

    //         if (user) {
    //           // User is already signed in (persisted session)
    //           console.log("User is already signed in", user.uid);
    //           await registerForPushNotificationsAsync(user.uid);
    //           resolve(user);
    //         } else {
    //           // No user is signed in, so sign in anonymously
    //           try {
    //             const userCredential = await signInAnonymously(auth);
    //             console.log(
    //               "User signed in anonymously",
    //               userCredential.user.uid
    //             );
    //             await registerForPushNotificationsAsync(
    //               userCredential.user.uid
    //             );
    //             resolve(userCredential.user);
    //           } catch (error) {
    //             if (error.code === "auth/operation-not-allowed") {
    //               console.log(
    //                 "Anonymous auth is not enabled in the Firebase console."
    //               );
    //             } else {
    //               console.error("Error signing in anonymously:", error);
    //             }
    //             reject(error);
    //           }
    //         }
    //       },
    //       reject
    //     );
    //   });
    // };

    const login = async () => {
      try {
        // Check if there's a currently signed-in user
        const currentUser = auth.currentUser;

        if (currentUser) {
          // console.log("User is already signed in", currentUser.uid);
          await registerForPushNotificationsAsync(currentUser.uid);
          return currentUser;
        } else {
          // No user is signed in, so sign in anonymously
          const userCredential = await signInAnonymously(auth);
          // console.log("User signed in anonymously", userCredential.user.uid);
          await registerForPushNotificationsAsync(userCredential.user.uid);
          return userCredential.user;
        }
      } catch (error) {
        if (error.code === "auth/operation-not-allowed") {
          // console.log("Anonymous auth is not enabled in the Firebase console.");
        } else {
          // console.error("Error signing in anonymously:", error);
        }
        throw error; // Re-throw the error if needed for error handling
      }
    };

    fetchData();
  }, []);

  return (
    <FloodDataContext.Provider
      value={{
        stations,
        loading,
        fetchError,

        lastLoadedTimeStamp,
        noConnectionNoDataSaved,
        noInternetSavedData,
      }}
    >
      {children}
    </FloodDataContext.Provider>
  );
};

export { FloodDataContext, FloodDataProvider };
