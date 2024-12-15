import React, { useRef, useEffect } from "react";
import { Pressable, StyleSheet, Text, Animated, View } from "react-native";
import { GlobalStyles } from "../constants/GlobaleStyles";
import "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

function MapViewToggle({ postion }) {
  const route = useRoute();
  const currentRouteName = route.name;
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={[postion && postion, styles.container]}>
      <Pressable onPress={() => navigation.navigate(t("homeStack"))}>
        <View
          style={[
            styles.homeView,
            currentRouteName === t("homeStack")
              ? styles.homeViewSelected
              : styles.homeViewUnselected,
          ]}
        >
          <Text
            style={[
              styles.text,
              currentRouteName === t("homeStack") && styles.homeTextSelected,
            ]}
          >
            {t("map")}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={() => navigation.navigate(t("listView"))}>
        <View
          style={[
            styles.listView,
            currentRouteName === t("listView")
              ? styles.listViewSelected
              : styles.listViewUnselected,
          ]}
        >
          <Text
            style={[
              styles.text,
              currentRouteName === t("listView") && styles.listViewTextSelected,
            ]}
          >
            {t("list")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,

    flexDirection: "row",
  },
  text: {
    width: 80,
    fontSize: 12,
    paddingVertical: 6,
    fontWeight: "medium",
    textAlign: "center",
    color: "black",
  },
  homeView: {
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderWidth: 1,
    backgroundColor: GlobalStyles.colors.white,
  },

  homeViewSelected: {
    color: "#0188FF",
    borderColor: "#0188ff",
  },
  homeTextSelected: {
    color: "#0188ff",
  },
  homeViewUnselected: {
    borderColor: "black",
    borderRightWidth: 0,
  },
  listView: {
    borderTopEndRadius: 50,
    borderBottomEndRadius: 50,
    borderWidth: 1,
    backgroundColor: GlobalStyles.colors.white,
  },
  listViewSelected: {
    color: "#0188FF",
    borderColor: "#0188ff",
  },
  listViewTextSelected: {
    color: "#0188FF",
    borderLeftWidth: 0,
  },
  listViewUnselected: {
    borderLeftWidth: 0,
    borderColor: "black",
  },
});

export default MapViewToggle;
