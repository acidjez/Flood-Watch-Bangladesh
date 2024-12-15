import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // You can use any icon library you prefer
import { useTranslation } from "react-i18next";
import { GlobalStyles } from "../../constants/GlobaleStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CollapsibleCard = ({
  header,
  description,
  iconType,
  iconName,
  image,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t } = useTranslation();

  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={styles.header}
        >
          {/* Conditionally render MaterialIcon or Image based on the iconType prop */}
          {iconType === "material" ? (
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={"#0188FF"}
              />
            </View>
          ) : (
            <Image source={image} style={styles.img} />
          )}
          <Text style={styles.headerText}>{header}</Text>
          <MaterialIcons
            name={isCollapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        {!isCollapsed && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    borderColor: GlobalStyles.colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    color: GlobalStyles.colors.black,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: "black",
    backgroundColor: GlobalStyles.colors.white,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  img: {
    width: 47,
    height: 42,
    marginRight: 12,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomEndRadius: 14,
    borderBottomStartRadius: 14,

    backgroundColor: "#f4f4f4",
    borderTopWidth: 1,
    borderColor: "#000000",
  },
  description: {
    fontSize: 14,
  },
});

export default CollapsibleCard;
