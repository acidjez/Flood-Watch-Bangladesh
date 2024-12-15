import React from "react";
import "react-native-gesture-handler";
import { IconProvider } from "./contexts/IconContext";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import StandardButton from "./components/Buttons/standardButton";
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import Home from "./screens/Home";
import MapLegend from "./screens/MapLegend";
import MyNotificationZone from "./screens/MyNotificationZone";
import "./utils/getUserLanguage";
import { useTranslation } from "react-i18next";
import Settings from "./screens/Settings";
import { NotificationZoneProvider } from "./contexts/NotificationZoneContext";
import {
  FloodDataProvider,
  FloodDataContext,
} from "./contexts/FloodDataContext";
import * as SplashScreen from "expo-splash-screen";
import {
  FontAwesome6,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { GlobalStyles } from "./constants/GlobaleStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import ListView from "./screens/ListView";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { CurrentLocationProvider } from "./contexts/CurrentLocationContext";
import { MapTypeProvider } from "./contexts/MapTypeContext";
import AppJSON from "./app.json";
import { getTimeDifference } from "./utils/getTimeDifference";

const Drawer = createDrawerNavigator();

const HomeStack = createStackNavigator();

function HomeStackScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name={t("homeStack")}
        component={Home}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name={t("listView")}
        component={ListView}
        options={{
          title: t("home"),
          headerStyle: {
            backgroundColor: GlobalStyles.colors.primary,
          },
          headerTintColor: GlobalStyles.colors.white,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <FontAwesome6
                name="bars"
                size={24}
                color={GlobalStyles.colors.white}
                style={{ marginLeft: 15 }}
              />
            </TouchableOpacity>
          ),
          animationTypeForReplace: "push", // This is the default behavior
          gestureDirection: "vertical", // Slide from bottom
        }}
      />
    </HomeStack.Navigator>
  );
}

function DrawBanner(props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.drawerContent}>
      <View style={[styles.banner, { paddingTop: insets.top + 20 }]}>
        <Image
          source={require("./assets/drawerBannerLogo.png")}
          style={styles.logo}
        />
        <View>
          <Text style={styles.bannerText}>{t("app_name")}</Text>
          <Text style={styles.versionText}>
            {t("version", { versionNum: AppJSON.expo.version })}
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </View>
  );
}
function MyDrawer() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: GlobalStyles.colors.white, // Active item color
        drawerInactiveTintColor: GlobalStyles.colors.black, // Inactive item color
        drawerActiveBackgroundColor: GlobalStyles.colors.primary, // Active item background color
        drawerLabelStyle: {
          marginLeft: -12, // Adjust space between icon and label
        },
        headerStyle: {
          backgroundColor: GlobalStyles.colors.primary,
        },
        headerTintColor: GlobalStyles.colors.white,
        headerLeftContainerStyle: {
          paddingLeft: 4,
        },
        headerRightContainerStyle: {
          paddingRight: 4,
        },
      }}
      drawerContent={(props) => <DrawBanner {...props} />}
    >
      <Drawer.Screen
        name={t("home")}
        component={HomeStackScreen} // Use the stack navigator here
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <FontAwesome6 name="house" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name={t("favourites")}
        component={MyNotificationZone}
        options={{
          drawerIcon: ({ color, size }) => (
            <AntDesign name="star" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t("map_legend")}
        component={MapLegend}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-legend"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={t("settings")}
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesome6 name="gear" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t("listView")}
        component={ListView}
        options={{
          drawerLabel: () => null,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <IconProvider>
      <CurrentLocationProvider>
        <MapTypeProvider>
          <FloodDataProvider>
            <NotificationZoneProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppContent />
              </NavigationContainer>
            </NotificationZoneProvider>
          </FloodDataProvider>
        </MapTypeProvider>
      </CurrentLocationProvider>
    </IconProvider>
  );
}
const handleRestart = async () => {
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.error("Error restarting app:", error);
  }
};

function AppContent() {
  const { t } = useTranslation();
  const {
    loading,
    fetchError,
    lastLoaded,
    lastLoadedTimeStamp,
    noConnectionNoDataSaved,
    noInternetSavedData,
  } = React.useContext(FloodDataContext);
  const [useOldData, setUseOldData] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !useOldData) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (noConnectionNoDataSaved) {
    return (
      <View style={styles.dimmer}>
        <View style={styles.popUpContainer}>
          <Text style={styles.title}>{t("failed_download")}</Text>
          <Text>{t("no_data_try_again")}</Text>
          <StandardButton
            onPress={handleRestart}
            text={"Restart"}
            btnStyle={{ backgroundColor: GlobalStyles.colors.black }}
            textStyle={{
              fontSize: 16,
              color: GlobalStyles.colors.white,
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
        </View>
      </View>
    );
  }
  // noInternetSavedData && !useOldData

  if (noInternetSavedData && !useOldData) {
    return (
      <View style={styles.dimmer}>
        <View style={styles.popUpContainer}>
          <Text style={styles.title}>{t("failed_download")}</Text>

          <Text style={styles.body}>
            last updated {getTimeDifference(lastLoadedTimeStamp)} hours ago
          </Text>
          <Text>{t("offline_dialog")}</Text>
          <View style={styles.btnContainer}>
            <StandardButton
              onPress={() => setUseOldData(true)}
              text={"Offline mode"}
              btnStyle={{ backgroundColor: GlobalStyles.colors.primary }}
              textStyle={{
                fontSize: 16,
                color: GlobalStyles.colors.white,
                textAlign: "center",
                fontWeight: "bold",
              }}
            />

            <StandardButton
              onPress={handleRestart}
              text={"Restart"}
              btnStyle={{ backgroundColor: GlobalStyles.colors.black }}
              textStyle={{
                fontSize: 16,
                color: GlobalStyles.colors.white,
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  if (loading && !useOldData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          style={{ width: 200, height: 200 }}
          source={require("./assets/boatLoading.gif")}
        />
        <Text>{t("loading_data")}</Text>
      </View>
    );
  }
  if (fetchError && !useOldData) {
    return (
      <View style={styles.dimmer}>
        <View style={styles.popUpContainer}>
          <Text style={styles.title}>{t("failed_download")}</Text>

          <Text style={styles.body}>
            {!lastLoaded && t("no_data_try_again")}
            {lastLoadedTimeStamp !== null &&
              lastLoaded &&
              t("updated_hours", {
                hours: new Intl.NumberFormat(userLang).format(lastUpdatedInHrs),
              })}

            {lastLoaded && t("offline_dialog")}
          </Text>
          <View style={styles.btnContainer}>
            {lastLoaded && (
              <StandardButton
                onPress={handleContinue}
                text={"Offline mode"}
                btnStyle={{ backgroundColor: GlobalStyles.colors.primary }}
                textStyle={{
                  fontSize: 16,
                  color: GlobalStyles.colors.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            )}

            <StandardButton
              onPress={handleRestart}
              text={"Restart"}
              btnStyle={{ backgroundColor: GlobalStyles.colors.black }}
              textStyle={{
                fontSize: 16,
                color: GlobalStyles.colors.white,
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  return <MyDrawer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerContent: {
    flex: 1,
  },
  logo: {
    height: 45,
    width: 50,
  },
  banner: {
    backgroundColor: GlobalStyles.colors.primary,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBottom: 20,
    padding: 20,
    marginBottom: 4,
  },

  bannerText: {
    color: GlobalStyles.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    fontSize: 12,
    color: GlobalStyles.colors.white,
  },

  dimmer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  popUpContainer: {
    left: 0,
    top: 0,
    zIndex: 2,
    backgroundColor: GlobalStyles.colors.white,
    width: Dimensions.get("window").width - 48,
    borderWidth: 2,
    padding: 12,
    borderColor: GlobalStyles.colors.black,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    marginBottom: 8,
  },
  btnContainer: {
    gap: 8,
  },
});
