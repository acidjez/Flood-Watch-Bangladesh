import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import en from "../data/translations/en.json"
import bn from "../data/translations/bn.json"

function getUserLanguage() {
    const deviceLanguage =
            Platform.OS === 'ios'
                ? NativeModules.SettingsManager.settings.AppleLocale ||
                NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
                : NativeModules.I18nManager.localeIdentifier;

    return deviceLanguage
}

const resources = {
    en,
    bn
}

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: getUserLanguage(),
    fallbackLng: "en"
})

export default i18n

export const userLang = (getUserLanguage().includes("en")) ? "en" : "bn"