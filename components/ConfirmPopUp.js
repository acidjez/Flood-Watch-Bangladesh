import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { GlobalStyles } from "../constants/GlobaleStyles";
import StandardButton from "./Buttons/standardButton";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
export default function ConfirmPopUp({
  postions,
  title,
  body,
  confirm,
  close,
  success,
}) {
  const { t } = useTranslation();

  function HandleConfirm() {
    confirm.onPress();
  }

  return (
    <View style={[styles.dimmer, postions]}>
      <View style={styles.popUpContainer}>
        {success && (
          <View style={styles.animationContainer}>
            <LottieView
              autoPlay
              style={{
                width: 150,
                height: 150,
              }}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={require("../assets/success.json")}
            />
          </View>
        )}
        {!success && (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            <View style={styles.btnContainer}>
              <StandardButton
                onPress={HandleConfirm}
                text={t(confirm.label)}
                btnStyle={{ backgroundColor: GlobalStyles.colors.primary }}
                textStyle={{
                  fontSize: 16,
                  color: GlobalStyles.colors.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
              <StandardButton
                onPress={close.onPress}
                text={t(close.label)}
                btnStyle={{ backgroundColor: GlobalStyles.colors.black }}
                textStyle={{
                  fontSize: 16,
                  color: GlobalStyles.colors.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    flex: 1,
  },
  dimmer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    zIndex: 1,

    alignItems: "center",
    justifyContent: "center",
  },
  animationContainer: { alignItems: "center", justifyContent: "center" },
  popUpContainer: {
    left: 0,
    top: 0,
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
