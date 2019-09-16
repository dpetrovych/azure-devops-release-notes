import { loadTheme } from 'office-ui-fabric-react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

export function applyFabricUITheme() {
    var style = getComputedStyle(document.documentElement);
    const color = (variable: string) => {
        const value = style.getPropertyValue(variable);
        return "#" + value.split(", ").map(x => parseInt(x).toString(16)).map(x => x.length === 1 ? "0" + x : x).join("");
    };

    const palette = {
        themePrimary: color('--palette-primary'),
        themeLighterAlt: color('--palette-primary-tint-40'),
        themeLighter: color('--palette-primary-tint-30'),
        themeLight: color('--palette-primary-tint-20'),
        themeTertiary: color('--palette-primary-tint-10'),
        themeSecondary: color('--palette-primary'),
        themeDarkAlt: color('--palette-primary-shade-10'),
        themeDark: color('--palette-primary-shade-20'),
        themeDarker: color('--palette-primary-shade-30'),
        neutralLighterAlt: color('--palette-neutral-2'),
        neutralLighter: color('--palette-neutral-4'),
        neutralLight: color('--palette-neutral-6'),
        neutralQuaternaryAlt: color('--palette-neutral-8'),
        neutralQuaternary: color('--palette-neutral-10'),
        neutralTertiaryAlt: color('--palette-neutral-20'),
        neutralTertiary: color('--palette-neutral-30'),
        neutralSecondary: color('--palette-neutral-60'),
        neutralPrimaryAlt: color('--palette-neutral-70'),
        neutralPrimary: color('--palette-neutral-80'),
        neutralDark: color('--palette-neutral-100'),
        black: color('--palette-neutral-100'),
        white: color('--palette-neutral-0'),
    };

    initializeIcons();
    loadTheme({palette: palette});
}
