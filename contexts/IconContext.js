import React, { createContext, memo } from "react";

// Import icons once in the context
const icons = {
  dangerIcon: require("../assets/EmergencyWarningIcon.png"),
  watchIcon: require("../assets/WatchWarningIcon.png"),
  safeIcon: require("../assets/SafeWarningIcon.png"),
};

// Create context
const IconContext = createContext(icons);

// Custom hook for consuming context
const IconProvider = memo(({ children }) => {
  // console.log("IconProvider is rendering"); // Debug messa
  return <IconContext.Provider value={icons}>{children}</IconContext.Provider>;
});

// Export the context and provider
export { IconContext, IconProvider };
