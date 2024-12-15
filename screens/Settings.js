import React, { useContext, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { GlobalStyles } from "../constants/GlobaleStyles";
import MapTypeContext from "../contexts/MapTypeContext";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState("");
  const { MapType, toggleMapType } = useContext(MapTypeContext);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n]);
  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <View style={styles.optionsContainer}>
          <Text style={styles.title}>{t("change_lang")}</Text>
        </View>

        <Pressable onPress={() => changeLanguage("en")}>
          <View
            style={[
              styles.optionsContainer,
              currentLanguage.slice(0, 2) === "en" && {
                backgroundColor: GlobalStyles.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.optionsText,
                currentLanguage.slice(0, 2) === "en" && {
                  color: GlobalStyles.colors.white,
                  fontWeight: "500",
                },
              ]}
              // DO NOT TRANSLATE!
            > 
              English
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => changeLanguage("bn")}>
          <View
            style={[
              styles.optionsContainer,
              currentLanguage === "bn" && {
                backgroundColor: GlobalStyles.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.optionsText,
                currentLanguage === "bn" && {
                  color: GlobalStyles.colors.white,
                  fontWeight: "500",
                },
              ]}
              // DO NOT TRANSLATE!
            >
              বাংলা
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
        <View style={styles.optionsContainer}>
          <Text style={styles.title}>{t("map_type")}</Text>
        </View>

        <Pressable onPress={toggleMapType}>
          <View
            style={[
              styles.optionsContainer,
              MapType === "standard" && {
                backgroundColor: GlobalStyles.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.optionsText,
                MapType === "standard" && {
                  color: GlobalStyles.colors.white,
                  fontWeight: "500",
                },
              ]}
            >
              {t("standard")}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={toggleMapType}>
          <View
            style={[
              styles.optionsContainer,
              MapType === "satellite" && {
                backgroundColor: GlobalStyles.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.optionsText,
                MapType === "satellite" && {
                  color: GlobalStyles.colors.white,
                  fontWeight: "500",
                },
              ]}
            >
              {t("satellite")}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {},
  settingContainer: {},
  optionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomColor: GlobalStyles.colors.grey100,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionsText: {
    fontSize: 14,
    color: GlobalStyles.colors.black,
  },
});
