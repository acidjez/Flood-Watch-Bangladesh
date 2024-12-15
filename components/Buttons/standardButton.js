import React from "react";

import { StyleSheet, View, Pressable, Text } from "react-native";

function StandardButton({ onPress, btnStyle, textStyle, text }) {
  return (
    <Pressable
      style={[styles.pressable, ({ pressed }) => pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.btnContainer, btnStyle && btnStyle]}>
        <Text style={([styles.text], textStyle && textStyle)}>{text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  btnContainer: {
    width: "100%",

    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 50,
    // backgroundColor: "#77D0D4",
  },

  pressed: {
    opacity: 0.75,
  },
});

export default StandardButton;
