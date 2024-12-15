import React, { useState } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../constants/GlobaleStyles";
import { Dimensions } from "react-native";

const GooglePlacesInput = ({ onPlaceSelect }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false); // State to manage focus

  // Function to dismiss the keyboard and unfocus input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsFocused(false); // Reset focus state manually when clicking outside
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View
        style={[
          styles.outerContainer,
          { width: Dimensions.get("window").width - 24 * 2 },
        ]}
      >
        <View style={styles.innerContainer}>
          <Ionicons
            style={styles.leftIcon}
            name="location"
            size={24}
            color={GlobalStyles.colors.blue}
          />
          {/* Conditionally render the search icon based on focus */}
          {!isFocused && (
            <Ionicons
              style={styles.rightIcon}
              name="search-outline"
              size={24}
              color={GlobalStyles.colors.blue}
            />
          )}
          <GooglePlacesAutocomplete
            GooglePlacesDetailsQuery={{ fields: "geometry" }}
            fetchDetails={true} // you need this to fetch the details object onPress
            styles={{
              textInput: styles.input,
              poweredContainer: styles.poweredContainer,
              row: styles.row,
            }}
            placeholder={t("search")}
            onPress={(data, details = null) => {
              // console.log("Place Data: ", data); // Log the place data
              // console.log("Place Details: ", details); // Log the place details
              if (details) {
                onPlaceSelect(data, details); // Call the passed down function to update the state in HomePage
              } else {
                // console.error("Error fetching place details: Details are null");
              }
            }}
            // query={{
            //   key: "", // Replace with your valid API key
            //   language: "en",
            // }}
            query={{
              key: "", // Replace with your valid API key
              language: "en",
            }}
            textInputProps={{
              onFocus: () => setIsFocused(true), // Hide the search icon when focused
              onBlur: () => setIsFocused(false), // Show the search icon when unfocused
            }}
            onFail={(error) =>
              console.error("Google Places API error: ", error)
            } // Log API errors
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: GlobalStyles.colors.white,
    borderRadius: 26,
    top: 50,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.black,
    zIndex: 1,
    overflow: "hidden",
  },
  innerContainer: {
    position: "relative",
  },
  leftIcon: {
    position: "absolute",
    left: 20,
    top: 13,
    zIndex: 2,
  },
  rightIcon: {
    position: "absolute",
    right: 20,
    top: 13,
    zIndex: 2,
  },
  input: {
    paddingHorizontal: 48,
    top: 2,
  },
  poweredContainer: {
    display: "none", // Hide the "Powered by Google" branding at the bottom
  },
  row: {
    borderBottomColor: "transparent", // Adjust color to your preference
    borderTopWidth: 0.5,
    borderTopColor: "#ddd", // Adjust color to your preference
  },
});

export default GooglePlacesInput;
