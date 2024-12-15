import React from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import SafeIcon from "../assets/SafeWarningIcon.png";
import WatchIcon from "../assets/WatchWarningIcon.png";
import EmergencyIcon from "../assets/EmergencyWarningIcon.png";
import CollapsibleCard from "../components/Buttons/MapLegendCollapsable";
import { useTranslation } from "react-i18next";
import { GlobalStyles } from "../constants/GlobaleStyles";

function MapLegend() {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("flood_icons")}</Text>
      <View style={styles.cardContainer}>
        <CollapsibleCard
          header={t("safe_level")}
          description={t("safe_level_desc")}
          iconType="image"
          image={SafeIcon}
        />
        <CollapsibleCard
          header={t("warning_level")}
          description={t("warning_level_desc")}
          iconType="image"
          image={WatchIcon}
        />
        <CollapsibleCard
          header={t("extremely_dangerous")}
          description={t("extremely_dangerous_desc")}
          iconType="image"
          image={EmergencyIcon}
        />
      </View>

      <Text style={styles.title}>{t("map_nav_icons")}</Text>
      <View style={styles.cardContainer}>
        <CollapsibleCard
          header={t("current_location")}
          description={t("current_location_desc")}
          iconType="material"
          iconName="crosshairs"
        />
        <CollapsibleCard
          header={t("zoom_in")}
          description={t("zoom_in_desc")}
          iconType="material"
          iconName="plus"
        />
        <CollapsibleCard
          header={t("zoom_out")}
          description={t("zoom_out_desc")}
          iconType="material"
          iconName="minus"
        />
        <CollapsibleCard
          header={t("menu")}
          description={t("menu_desc")}
          iconType="material"
          iconName="menu"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20, // Add some padding at the bottom for scroll space
    marginHorizontal: 20,
  },
  cardContainer: { gap: 8 },
  title: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 12,
    marginVertical: 5,
    color: GlobalStyles.colors.black,
    fontWeight: "700",
  },
});

export default MapLegend;
