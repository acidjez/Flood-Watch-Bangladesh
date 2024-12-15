import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View, Pressable } from "react-native";
import { GlobalStyles } from "../../constants/GlobaleStyles";

function MapButton({ position, onPress, iconName, iconSize, iconColor }) {
  return (
    <Pressable style={[styles.pressable, position]} onPress={onPress}>
      {({ pressed }) => (
        <MaterialCommunityIcons
          style={pressed && { opacity: 0.75 }}
          name={iconName}
          size={iconSize}
          color={iconColor}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    position: "absolute",
    width: 50,
    height: 50,
    zIndex: 4,
    borderRadius: 50,
    borderColor: "black",
    backgroundColor: GlobalStyles.colors.white,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MapButton;
