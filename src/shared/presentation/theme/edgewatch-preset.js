import {definePreset} from "@primeuix/themes";
import Material from "@primeuix/themes/material";

/**
 * EdgeWatch brand preset on top of the PrimeVue Material theme:
 * industrial orange as primary, navy for the shell, soft surfaces for the content.
 */
export const EdgeWatchPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: "{orange.50}", 100: "#ffede3", 200: "#ffdcc3", 300: "#ffb77e", 400: "#f69338", 500: "#d4781c",
            600: "#b56100", 700: "#914d00", 800: "#6e3900", 900: "#4d2600", 950: "#2f1500"
        },
        colorScheme: {
            light: {
                primary: {color: "#d4781c", contrastColor: "#ffffff", hoverColor: "#b56100", activeColor: "#914d00"},
                highlight: {background: "#ffede3", focusBackground: "#ffdcc3", color: "#6e3900", focusColor: "#4d2600"},
                surface: {
                    0: "#ffffff", 50: "#f6f7fa", 100: "#eef0f4", 200: "#e1e5ec", 300: "#c9d1dc", 400: "#a0acc2",
                    500: "#7d8a9c", 600: "#5b6878", 700: "#3c475a", 800: "#253143", 900: "#101c2d", 950: "#0e1a2b"
                }
            },
            dark: {
                primary: {color: "#f69338", contrastColor: "#2f1500", hoverColor: "#ffb77e", activeColor: "#ffdcc3"},
                highlight: {background: "rgba(246,147,56,.16)", focusBackground: "rgba(246,147,56,.24)", color: "#ffdcc3", focusColor: "#ffede3"},
                surface: {
                    0: "#ffffff", 50: "#f6f7fa", 100: "#eef0f4", 200: "#e1e5ec", 300: "#c9d1dc", 400: "#a0acc2",
                    500: "#7d8a9c", 600: "#5b6878", 700: "#3c475a", 800: "#253143", 900: "#101c2d", 950: "#0e1a2b"
                }
            }
        }
    }
});
