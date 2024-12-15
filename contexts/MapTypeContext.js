import React, { createContext, useState } from "react";

const MapTypeContext = createContext();

export const MapTypeProvider = ({ children }) => {
  const [MapType, setMapType] = useState("standard");

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
  };

  return (
    <MapTypeContext.Provider value={{ MapType, toggleMapType }}>
      {children}
    </MapTypeContext.Provider>
  );
};

export default MapTypeContext;
