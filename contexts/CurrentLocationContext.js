import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";

const CurrentLocationContext = createContext();

const CurrentLocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  return (
    <CurrentLocationContext.Provider
      value={{
        currentLocation,
      }}
    >
      {children}
    </CurrentLocationContext.Provider>
  );
};

export { CurrentLocationContext, CurrentLocationProvider };
