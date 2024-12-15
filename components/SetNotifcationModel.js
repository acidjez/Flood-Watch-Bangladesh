import React, { useEffect, useState, useContext, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { GlobalStyles } from "../constants/GlobaleStyles";
import StandardButton from "./Buttons/standardButton";
import "../utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Switch, TextInput } from "react-native-gesture-handler";
import NotificationZoneContext from "../contexts/NotificationZoneContext";
import ConfirmPopUp from "./ConfirmPopUp";
import { IconContext } from "../contexts/IconContext";

function SetNotificationModel({
  floodData,
  warningIcon,
  handleClose,
  notifications,
}) {
  const { dangerIcon, watchIcon, safeIcon } = useContext(IconContext);
  const { t } = useTranslation();
  const [notificationName, setNotificationName] = useState(floodData.name);
  const [emergencyWarning, setEmergencyWarning] = useState(false);
  const [notificationData, setNotificationData] = useState();
  const [watchAndAct, setWatchAndAct] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const { notificationZones, addNotificationZone, removeNotificationZone } =
    useContext(NotificationZoneContext);
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [dimmerOpen, setDimmerOpen] = useState(false);
  const [dimmerOptions, setDimmerOptions] = useState({
    title: <Text></Text>,
    body: <Text></Text>,
    confirm: {
      onPress: () => handleSave(false),
      label: t("confirm"),
    },
    close: {
      onPress: () => setDimmerOpen(false),
      label: t("close"),
    },
  });

  const toggleFocus = () => {
    if (isFocused) {
      inputRef.current.blur();
    } else {
      inputRef.current.focus();
    }
    setIsFocused(!isFocused);
  };

  useEffect(() => {
    const notificationSettings = notificationZones.find(
      (zone) => zone.st_id === floodData.st_id.toString()
    );
    if (notificationSettings) {
      setNotificationData(notificationSettings);
      setEmergencyWarning(notificationSettings.emergencyWarning);
      setWatchAndAct(notificationSettings.watchAndAct);
      notificationSettings.customName &&
        setNotificationName(notificationSettings.customName);
    }
  }, [notificationZones, floodData.st_id]);

  const handleSave = () => {
    addNotificationZone(
      floodData,
      notificationName,
      emergencyWarning,
      watchAndAct
    );

    if (notificationName === "") {
      setNotificationName(floodData.name);
    }
    setActionConfirmed(true);
    setTimeout(() => {
      setActionConfirmed(false);
      setDimmerOpen(false);
    }, 1300);
  };

  function handleOpenDimmer(purpose) {
    if (purpose === "save") {
      setDimmerOptions((prev) => {
        return {
          ...prev,
          title: t("favourites_summary", {
            location: t(floodData.name.toLowerCase().replaceAll(" ", "_")),
          }),
          body: (
            <>
              {floodData.name !== notificationName && (
                <Text>
                  {t("name")}{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {notificationName === "" ? "removed" : notificationName}
                    {"\n\n"}
                  </Text>
                </Text>
              )}
              <Text style={{ fontWeight: "bold" }}>
                {t("notifications")}
                {"\n"}
              </Text>
              <Text>
                {"  "}-{emergencyWarning ? t("allowed") : t("disabled")}:{" "}
                {t("emergency_warning")}
                {"\n"}
              </Text>
              <Text>
                {"  "}-{watchAndAct ? t("allowed") : t("disabled")}:{" "}
                {t("watch_and_act")}
              </Text>
            </>
          ),
          confirm: {
            onPress: handleSave,
            label: t("confirm"),
          },
        };
      });
    }
    if (purpose === "delete") {
      setDimmerOptions((prev) => {
        return {
          ...prev,
          title: t("remove_from_favourites"),
          body: (
            <>
              <Text>
                {t("delete_confirmation", { location: notificationName })}
              </Text>
            </>
          ),
          confirm: {
            onPress: handleDelete,
            label: t("confirm"),
          },
        };
      });
    }
    setDimmerOpen(true);
  }
  const handleDelete = () => {
    removeNotificationZone(floodData.st_id);
    setEmergencyWarning(false);
    setNotificationName(floodData.name);
    setWatchAndAct(false);
    setActionConfirmed(true);
    setTimeout(() => {
      setActionConfirmed(false);
      setDimmerOpen(false);
    }, 1300);
  };

  function toggleEmergencyWarning() {
    setEmergencyWarning((prev) => !prev);
  }

  function toggleWatchAndAct() {
    setWatchAndAct((prev) => !prev);
  }

  return (
    <>
      {dimmerOpen && (
        <ConfirmPopUp
          success={actionConfirmed}
          postions={{
            top:
              (Dimensions.get("window").width - 48) * 0.57 +
              378 -
              Dimensions.get("window").height,
            left: -2,
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
          }}
          title={dimmerOptions.title}
          body={dimmerOptions.body}
          confirm={{
            onPress: dimmerOptions.confirm.onPress,
            label: dimmerOptions.confirm.label,
          }}
          close={{
            onPress: dimmerOptions.close.onPress,
            label: dimmerOptions.close.label,
          }}
        />
      )}

      <View style={styles.container}>
        <View style={styles.notificationNameContainer}>
          <Text style={styles.nameLabel}>{t("change_name")}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.notificationNameInput}
              ref={inputRef}
              onChangeText={setNotificationName}
              value={notificationName}
            />
            <MaterialCommunityIcons
              onPress={toggleFocus}
              style={styles.editPen}
              name={"pencil"}
              size={24}
              color={"black"}
            />
          </View>
        </View>
        <View style={styles.currentAlertsContainer}>
          <Text style={styles.alertTitle}>{t("add_notifications")}</Text>
          <View style={styles.line}></View>
          <View style={styles.toggleAlertContainer}>
            <View style={styles.toggleAlertTextContiner}>
              <Image
                style={{ width: 54, height: 45 }}
                source={dangerIcon}
                transition={1000}
              />
              <Text style={styles.notificationLabel}>
                {t("emergency_warning")}
              </Text>
            </View>

            <Switch
              trackColor={{
                false: "#767577",
                true: GlobalStyles.colors.primary,
              }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleEmergencyWarning}
              value={emergencyWarning}
            />
          </View>
          <View style={styles.toggleAlertContainer}>
            <View style={styles.toggleAlertTextContiner}>
              <Image
                style={{ width: 54, height: 45 }}
                source={watchIcon}
                transition={1000}
              />
              <Text style={styles.notificationLabel}>{t("watch_and_act")}</Text>
            </View>

            <Switch
              trackColor={{
                false: "#767577",
                true: GlobalStyles.colors.primary,
              }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleWatchAndAct}
              value={watchAndAct}
            />
          </View>
        </View>
      </View>
      <View style={styles.exitButtonContainer}>
        <StandardButton
          onPress={() => handleOpenDimmer("save")}
          text={notifications ? t("save") : t("save")} // Previously "Save changes" or "Add to favourites"
          btnStyle={{ backgroundColor: "#77D0D4" }}
          textStyle={{
            fontSize: 16,
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        />
        <StandardButton
          onPress={handleClose}
          text={t("back")}
          btnStyle={{ backgroundColor: "black" }}
          textStyle={{
            fontSize: 16,
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        />
        <Pressable onPress={() => handleOpenDimmer("delete")}>
          <Text style={styles.turnOff}>{t("remove_from_favourites")}</Text>
        </Pressable>
      </View>
    </>
  );
}

export default SetNotificationModel;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    flex: 1,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  notificationNameContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  notificationNameInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
  },
  inputContainer: {
    marginTop: 8,
  },
  editPen: {
    position: "absolute",
    right: 12,
    top: 11,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  line: {
    borderWidth: 1,
    marginTop: 8,
  },
  toggleAlertContainer: {
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleAlertTextContiner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationLabel: {
    fontSize: 16,
    color: GlobalStyles.colors.grey300,
  },

  exitButtonContainer: {
    marginBottom: 20,
    marginHorizontal: 24,
    gap: 8,
  },
  turnOff: {
    fontSize: 14,
    color: GlobalStyles.colors.red,
    textAlign: "center",
  },
});
