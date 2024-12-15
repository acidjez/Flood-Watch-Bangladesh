// import { Image } from "expo-image";

// import "../utils/getUserLanguage";

// import { View } from "react-native";

// import { IconContext } from "../contexts/IconContext";

// function FloodInfoMarker({ gaugeData }) {
//   let dangerLevel =
//     gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value >
//     gaugeData.dangerlevel
//       ? "danger"
//       : gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value >
//         gaugeData.dangerlevel - 0.5
//       ? "watch"
//       : "safe";

//   let warningIcon =
//     dangerLevel === "danger"
//       ? require("../assets/EmergencyWarningIcon.png")
//       : dangerLevel === "watch"
//       ? (warningIcon = require("../assets/WatchWarningIcon.png"))
//       : require("../assets/SafeWarningIcon.png");

//   //console.log("rendering icon", Date.now());

//   return (
//     <View>
//       <Image
//         style={{ width: 57, height: 50 }}
//         source={warningIcon}
//         transition={1000}
//       />
//     </View>
//     // </Marker>
//   );
// }

// export default FloodInfoMarker;

// import { Image } from "expo-image";
// import { View } from "react-native";

// function FloodInfoMarker({ gaugeData }) {
//   let dangerLevel =
//     gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value >
//     gaugeData.dangerlevel
//       ? "danger"
//       : gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value >
//         gaugeData.dangerlevel - 0.5
//       ? "watch"
//       : "safe";

//   const warningIcon =
//     dangerLevel === "danger"
//       ? require("../assets/EmergencyWarningIcon.png")
//       : dangerLevel === "watch"
//       ? require("../assets/WatchWarningIcon.png")
//       : require("../assets/SafeWarningIcon.png");

//   console.log("rendering icon", Date.now());

//   return (
//     <View>
//       <Image
//         style={{ width: 57, height: 50 }}
//         source={warningIcon}
//         contentFit="contain" // Similar to resizeMode
//         transition={1000}
//       />
//     </View>
//   );
// }

// export default FloodInfoMarker;

// import { Image } from "expo-image";
// import { View } from "react-native";
// import React, { useMemo } from "react";
// import "../utils/getUserLanguage";

// Cache icons outside the component
// const dangerIcon = require("../assets/EmergencyWarningIconSmall.png");
// const watchIcon = require("../assets/WatchWarningIconSmall.png");
// const safeIcon = require("../assets/SafeWarningIconSmall.png");

// function FloodInfoMarker({ gaugeData }) {
//   const dangerLevel = useMemo(() => {
//     const latestWaterLevel =
//       gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value;
//     return latestWaterLevel > gaugeData.dangerlevel
//       ? "danger"
//       : latestWaterLevel > gaugeData.dangerlevel - 0.5
//       ? "watch"
//       : "safe";
//   }, [gaugeData]);

//   const warningIcon = useMemo(() => {
//     switch (dangerLevel) {
//       case "danger":
//         return dangerIcon;
//       case "watch":
//         return watchIcon;
//       default:
//         return safeIcon;
//     }
//   }, [dangerLevel]);
//   console.log("rendering icon", Date.now());
//   return (
//     <View>
//       <Image
//         style={{ width: 57, height: 50 }}
//         source={warningIcon}
//         contentFit="contain"
//         transition={1000}
//       />
//     </View>
//   );
// }

// export default FloodInfoMarker;

/////////////////////////////////////////
import { Image } from "expo-image";
import { View } from "react-native";
import React, { useMemo, memo, useContext } from "react";
import { IconContext } from "../contexts/IconContext";

const FloodInfoMarker = memo(({ gaugeData }) => {
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);
  const dangerLevel = useMemo(() => {
    const latestWaterLevel =
      gaugeData.waterlevels[gaugeData.waterlevels.length - 1].value;

    return latestWaterLevel > gaugeData.dangerlevel
      ? "danger"
      : latestWaterLevel > gaugeData.dangerlevel - 0.5
      ? "watch"
      : "safe";
  }, [gaugeData]);

  const warningIcon = useMemo(() => {
    switch (dangerLevel) {
      case "danger":
        return dangerIcon;
      case "watch":
        return watchIcon;
      default:
        return safeIcon;
    }
  }, [dangerLevel]);

  //console.log("rendering icon", Date.now());

  return (
    <View>
      <Image
        style={{ width: 60, height: 60 }} // Adjusted to optimized image size
        source={warningIcon}
        contentFit="contain"
        transition={1000}
      />
    </View>
  );
});

export default FloodInfoMarker;
