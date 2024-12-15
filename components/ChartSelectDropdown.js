import {
  StyleSheet,
  Modal,
  Dimensions,
  View,
  Text,
  Image,
  Pressable,
} from "react-native";
import { useState } from "react";
import "../utils/getUserLanguage";
import { userLang } from "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { GlobalStyles } from "../constants/GlobaleStyles";

function ChartSelectDropdown({ setDropdown, current }) {
  const [open, setOpen] = useState(false);
  function select(option) {
    setOpen(false);
    setDropdown(option);
  }

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.textContainer,
          styles.textContainerLeft,
          current === "waterlevel" && styles.textContainerLeftSelected,
        ]}
        onPress={() => setDropdown("waterlevel")}
      >
        <Text
          style={[styles.text, current === "waterlevel" && styles.textSelected]}
        >
          {t("toggle_water_level")}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.textContainer,
          styles.textContainerRight,
          current === "rainfall" && styles.textContainerRightSelected,
        ]}
        onPress={() => setDropdown("rainfall")}
      >
        <Text
          style={[styles.text, current === "rainfall" && styles.textSelected]}
        >
          {t("toggle_rainfall")}
        </Text>
      </Pressable>
    </View>
  );
}

export default ChartSelectDropdown;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",

    // justifyContent: "space-between",
  },
  text: {
    fontSize: 14,

    textAlign: "center",
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "black",
  },
  textContainerLeft: {
    borderTopStartRadius: 50,
    borderBottomStartRadius: 50,
    borderRightWidth: 0,
  },
  textContainerRight: {
    borderTopEndRadius: 50,
    borderBottomEndRadius: 50,
  },
  textContainerLeftSelected: {
    borderColor: GlobalStyles.colors.blue,
  },
  textContainerRightSelected: {
    borderColor: GlobalStyles.colors.blue,
  },
  textSelected: {
    color: GlobalStyles.colors.blue,
  },
});
