import { __assign, __makeTemplateObject } from "tslib";
import * as React from 'react';
import { createTheme, ThemeProvider, StyledEngineProvider, darken, lighten, alpha, } from '@mui/material/styles';
import { ThemeContext } from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import { meetsContrastGuidelines } from 'polished';
import { useRemoveFocusStyle } from '../app/blueprint.adjust';
// // octo colors
// export const dark: Theme = {
//   background: '#F38832',
//   navbar: '#2B3A49',
//   panels: '#3A4A54',
//   overlays: '#475A66',
//   paper: '#213137',
//   primary: '#589dd5',
//   secondary: '#589dd5',
// }
export var dark = {
    background: '#0B1821',
    navbar: darken('#365160', 0.2),
    panels: '#243540',
    overlays: darken('#365160', 0.1),
    paper: darken('#365160', 0.2),
    tabs: darken('#243540', 0.3),
    primary: '#69E1E8',
    secondary: '#2196f3',
};
export var light = {
    primary: '#3c6dd5',
    secondary: '#2196f3',
    background: '#E5E5E5',
    navbar: '#fafbfc',
    panels: '#FCFCFC',
    tabs: darken('#FCFCFC', 0.05),
    overlays: '#FCFCFC',
    paper: '#FCFCFC',
};
export var Elevations = {
    navbar: 8,
    background: 0,
    paper: 2,
    panels: 6,
    overlays: 16,
};
export var MuiOutlinedInputBorderClasses = 'px-[14px] py-[8.5px] border rounded dark:border-white/20 border-black/20 dark:hover:border-white hover:border-black';
var GlobalStyles = createGlobalStyle(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      .ol-overlaycontainer-stopevent {\n        display: none;\n      }\n      a {\n        color: inherit !important;\n      }\n      *.outline-none, a.outline-none, a, button{\n        outline: none !important; \n      }\n      span.highlight {\n        background-color: rgba(66, 110, 203, 0.40);\n      }\n      .MuiToolbar-root a,\n      .MuiToolbar-root .MuiBreadcrumbs-separator {\n        color: ", ";\n      }\n      .MuiDrawer-root a {\n        color: ", ";\n      }\n      .MuiTooltip-tooltip {\n        max-width: 50vw;\n        padding: 0px;\n        background-color: none;\n      }\n      .MuiFormControlLabel-labelPlacementStart {\n        margin-left: 0px;\n      }\n      @media (min-width: 600px) {\n        .MuiListItemIcon-root {\n          margin-left: 8px;\n        }\n      }\n      .lm_goldenlayout, .lm_content {\n        background: inherit;\n      }\n      .lm_splitter  {\n        background: ", ";\n        opacity: 1;\n      }\n      .lm_splitter:hover  {\n        background: ", " !important;\n      }\n      .lm_stack{\n        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);\n        background: ", " !important;\n        border-radius: 4px;\n        transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n      }\n      .lm_header {\n        z-index: 0 !important;\n        background: ", " !important;\n      }\n      .lm_tab.lm_active {\n        background: ", " !important;\n            box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12) !important;\n      }\n      .lm_tab, lm_tabs {\n        border-radius: 4px !important;\n        border-bottom-left-radius: 0px !important;\n        border-bottom-right-radius: 0px !important;\n      }\n      .lm_tab:not(.lm_active) {\n        color: ", " !important;\n        background: ", " !important;\n        button {\n          visibility: hidden;\n        }\n      }\n      .lm_tabs .lm_tab {\n        border: 1px solid fade(@contrastColor, 10%);\n        margin-right: 8px !important;\n        box-shadow: none !important;\n        padding: 0px !important;\n        height: 44px !important;\n        minWidth: 44px !important;\n      }\n      .lm_tabs .lm_tab:hover {\n        color: ", " !important;\n      }\n      .lm_header,\n      .lm_tabs .lm_tab,\n      .lm_tabdropdown:before {\n        color: ", " !important;\n      }\n      .is-drawing [role=\"tooltip\"], .is-drawing .MuiPopover-root {\n        display: none!important;\n      }\n      [role=\"tooltip\"] {\n        z-index: 101 !important;\n        pointer-events: all !important;\n      }\n      .bp3-portal {\n        z-index: 101 !important;\n      }\n      .bp3-popover-wrapper,.bp3-popover-target, .bp3-control-group {\n        width: 100%;\n      }\n      .bp3-control-group {\n        flex-wrap: wrap;\n      }\n      .bp3-control-group > div:first-of-type::after {\n        content: 'and';\n        display:block;\n        position: absolute;\n        left: 14px;\n        bottom: -25px;\n      }\n      .bp3-control-group > div:nth-of-type(2) {\n        margin-top: 30px;\n      }\n      .bp3-input-group input {\n        background: transparent !important; \n        box-shadow: none !important;\n        font-size: 1.1428571428571428rem !important;\n        padding: 0px !important;\n        height: 1.3125rem !important;\n        line-height: 1.15 !important;\n      }\n      .bp3-popover .bp3-popover-content, .bp3-popover .bp3-popover-content, .bp3-datepicker, .bp3-menu{\n        background: ", " !important;\n      }\n      .bp3-popover-arrow {\n        display: none !important;\n      }\n      .bp3-datepicker .DayPicker-Day.DayPicker-Day--selected, .bp3-active {\n        background-color: ", " !important;\n      }\n      .bp3-table-quadrant, .bp3-table-cell-client, .bp3-table-row-headers {\n        background: inherit !important;\n      }\n      // for whatever reason they have a height of 0 sometimes, maybe MUI will fix this in v5\n      textarea.MuiInputBase-input {\n        min-height: 21px;\n      }\n      .MuiPaper-box-shadow {\n        box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12);\n      }\n      .MuiPaper-elevation0 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation8 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation6 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation16 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation2 {\n        border-width: 1px;\n        border-style: solid;\n        border-color: ", ";\n          background-color: ", ";\n      }\n      [data-behavior-dropdown] {\n        background-color: ", ";\n      }\n      .font-awesome-span {\n        && {\n          font-size: 1.4rem;\n          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;\n        }\n        /* stylelint-disable */\n        &::before {\n          font-family: 'FontAwesome';\n          margin-left: 2px;\n          margin-right: 5px;\n        }\n      }\n      ::-webkit-scrollbar {\n        width: 8px;\n        height: 8px;\n      }\n      ::-webkit-scrollbar-track {\n        background: ", ";\n      }\n      ::-webkit-scrollbar-thumb {\n        background: ", ";\n            border-radius: 4px;\n      }\n      // fix an issue where focus is applied because of blueprint to popover papers\n      .MuiPaper-root:focus { \n        outline: none;\n      }\n      // Fix Mui styles \n      .MuiButton-endIcon {\n        margin-left: 0px;\n        margin-right: 0px;\n      }\n      .MuiButton-iconSizeSmall > svg {\n        font-size: 18px;\n        margin-top: 1px;\n      }\n      // Mui tailwind style\n      .Mui-icon-size-small {\n        font-size: 18px;\n      }\n      [disabled] .Mui-text-text-primary,\n      [disabled] .Mui-text-primary,\n      [disabled] .Mui-text-secondary {\n        color: ", ";\n      }\n      .Mui-text-text-primary {\n        color: ", ";\n      }\n      .Mui-text-primary {\n        color: ", ";\n      }\n      .Mui-text-secondary {\n        color: ", ";\n      }\n      .Mui-text-warning {\n        color: ", ";\n      }\n      .Mui-bg-default {\n        background-color: ", ";\n      }\n      .Mui-bg-primary {\n        background-color: ", ";\n      }\n      .Mui-bg-secondary {\n        background-color: ", ";\n      }\n      .Mui-bg-divider {\n        background-color: ", ";\n      }\n      .Mui-border-divider {\n        border-color: ", ";\n      }\n      .Mui-bg-button:hover,\n      .Mui-bg-button:focus-within {\n        background: ", ";\n      }\n      .theme-bg-overlays {\n        background: ", ";\n      }\n      .children-max-h-full {\n        > * {\n          max-height: 100%;\n        }\n      }\n      .children-h-full {\n        > * {\n          height: 100%;\n        }\n      }\n      .children-block {\n        > * {\n          display: block;\n        }\n      }\n      .children-p-0 {\n        > * {\n          padding: 0px;\n        }\n      }\n      // idea is to have this track with subtracting margin / padding\n      .max-w-full-1 {\n        max-width: calc(100% - 2*0.25rem);\n      }\n      .max-w-full-2 {\n        max-width: calc(100% - 2*0.5rem);\n      }\n      .max-w-full-3 {\n        max-width: calc(100% - 2*0.75rem);\n      }\n      .max-w-full-4 {\n        max-width: calc(100% - 2*1rem);\n      }\n      .min-w-32 {\n        min-width: 8rem;\n      }\n      .min-w-16\t{\n        min-width: 4rem;\n      }\n    "], ["\n      .ol-overlaycontainer-stopevent {\n        display: none;\n      }\n      a {\n        color: inherit !important;\n      }\n      *.outline-none, a.outline-none, a, button{\n        outline: none !important; \n      }\n      span.highlight {\n        background-color: rgba(66, 110, 203, 0.40);\n      }\n      .MuiToolbar-root a,\n      .MuiToolbar-root .MuiBreadcrumbs-separator {\n        color: ", ";\n      }\n      .MuiDrawer-root a {\n        color: ", ";\n      }\n      .MuiTooltip-tooltip {\n        max-width: 50vw;\n        padding: 0px;\n        background-color: none;\n      }\n      .MuiFormControlLabel-labelPlacementStart {\n        margin-left: 0px;\n      }\n      @media (min-width: 600px) {\n        .MuiListItemIcon-root {\n          margin-left: 8px;\n        }\n      }\n      .lm_goldenlayout, .lm_content {\n        background: inherit;\n      }\n      .lm_splitter  {\n        background: ", ";\n        opacity: 1;\n      }\n      .lm_splitter:hover  {\n        background: ", " !important;\n      }\n      .lm_stack{\n        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);\n        background: ", " !important;\n        border-radius: 4px;\n        transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n      }\n      .lm_header {\n        z-index: 0 !important;\n        background: ", " !important;\n      }\n      .lm_tab.lm_active {\n        background: ", " !important;\n            box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12) !important;\n      }\n      .lm_tab, lm_tabs {\n        border-radius: 4px !important;\n        border-bottom-left-radius: 0px !important;\n        border-bottom-right-radius: 0px !important;\n      }\n      .lm_tab:not(.lm_active) {\n        color: ", " !important;\n        background: ", " !important;\n        button {\n          visibility: hidden;\n        }\n      }\n      .lm_tabs .lm_tab {\n        border: 1px solid fade(@contrastColor, 10%);\n        margin-right: 8px !important;\n        box-shadow: none !important;\n        padding: 0px !important;\n        height: 44px !important;\n        minWidth: 44px !important;\n      }\n      .lm_tabs .lm_tab:hover {\n        color: ", " !important;\n      }\n      .lm_header,\n      .lm_tabs .lm_tab,\n      .lm_tabdropdown:before {\n        color: ", " !important;\n      }\n      .is-drawing [role=\"tooltip\"], .is-drawing .MuiPopover-root {\n        display: none!important;\n      }\n      [role=\"tooltip\"] {\n        z-index: 101 !important;\n        pointer-events: all !important;\n      }\n      .bp3-portal {\n        z-index: 101 !important;\n      }\n      .bp3-popover-wrapper,.bp3-popover-target, .bp3-control-group {\n        width: 100%;\n      }\n      .bp3-control-group {\n        flex-wrap: wrap;\n      }\n      .bp3-control-group > div:first-of-type::after {\n        content: 'and';\n        display:block;\n        position: absolute;\n        left: 14px;\n        bottom: -25px;\n      }\n      .bp3-control-group > div:nth-of-type(2) {\n        margin-top: 30px;\n      }\n      .bp3-input-group input {\n        background: transparent !important; \n        box-shadow: none !important;\n        font-size: 1.1428571428571428rem !important;\n        padding: 0px !important;\n        height: 1.3125rem !important;\n        line-height: 1.15 !important;\n      }\n      .bp3-popover .bp3-popover-content, .bp3-popover .bp3-popover-content, .bp3-datepicker, .bp3-menu{\n        background: ", " !important;\n      }\n      .bp3-popover-arrow {\n        display: none !important;\n      }\n      .bp3-datepicker .DayPicker-Day.DayPicker-Day--selected, .bp3-active {\n        background-color: ", " !important;\n      }\n      .bp3-table-quadrant, .bp3-table-cell-client, .bp3-table-row-headers {\n        background: inherit !important;\n      }\n      // for whatever reason they have a height of 0 sometimes, maybe MUI will fix this in v5\n      textarea.MuiInputBase-input {\n        min-height: 21px;\n      }\n      .MuiPaper-box-shadow {\n        box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12);\n      }\n      .MuiPaper-elevation0 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation8 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation6 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation16 {\n        background-color: ", ";\n      }\n      .MuiPaper-elevation2 {\n        border-width: 1px;\n        border-style: solid;\n        border-color: ", ";\n          background-color: ", ";\n      }\n      [data-behavior-dropdown] {\n        background-color: ", ";\n      }\n      .font-awesome-span {\n        && {\n          font-size: 1.4rem;\n          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;\n        }\n        /* stylelint-disable */\n        &::before {\n          font-family: 'FontAwesome';\n          margin-left: 2px;\n          margin-right: 5px;\n        }\n      }\n      ::-webkit-scrollbar {\n        width: 8px;\n        height: 8px;\n      }\n      ::-webkit-scrollbar-track {\n        background: ", ";\n      }\n      ::-webkit-scrollbar-thumb {\n        background: ", ";\n            border-radius: 4px;\n      }\n      // fix an issue where focus is applied because of blueprint to popover papers\n      .MuiPaper-root:focus { \n        outline: none;\n      }\n      // Fix Mui styles \n      .MuiButton-endIcon {\n        margin-left: 0px;\n        margin-right: 0px;\n      }\n      .MuiButton-iconSizeSmall > svg {\n        font-size: 18px;\n        margin-top: 1px;\n      }\n      // Mui tailwind style\n      .Mui-icon-size-small {\n        font-size: 18px;\n      }\n      [disabled] .Mui-text-text-primary,\n      [disabled] .Mui-text-primary,\n      [disabled] .Mui-text-secondary {\n        color: ", ";\n      }\n      .Mui-text-text-primary {\n        color: ", ";\n      }\n      .Mui-text-primary {\n        color: ", ";\n      }\n      .Mui-text-secondary {\n        color: ", ";\n      }\n      .Mui-text-warning {\n        color: ", ";\n      }\n      .Mui-bg-default {\n        background-color: ", ";\n      }\n      .Mui-bg-primary {\n        background-color: ", ";\n      }\n      .Mui-bg-secondary {\n        background-color: ", ";\n      }\n      .Mui-bg-divider {\n        background-color: ", ";\n      }\n      .Mui-border-divider {\n        border-color: ", ";\n      }\n      .Mui-bg-button:hover,\n      .Mui-bg-button:focus-within {\n        background: ", ";\n      }\n      .theme-bg-overlays {\n        background: ", ";\n      }\n      .children-max-h-full {\n        > * {\n          max-height: 100%;\n        }\n      }\n      .children-h-full {\n        > * {\n          height: 100%;\n        }\n      }\n      .children-block {\n        > * {\n          display: block;\n        }\n      }\n      .children-p-0 {\n        > * {\n          padding: 0px;\n        }\n      }\n      // idea is to have this track with subtracting margin / padding\n      .max-w-full-1 {\n        max-width: calc(100% - 2*0.25rem);\n      }\n      .max-w-full-2 {\n        max-width: calc(100% - 2*0.5rem);\n      }\n      .max-w-full-3 {\n        max-width: calc(100% - 2*0.75rem);\n      }\n      .max-w-full-4 {\n        max-width: calc(100% - 2*1rem);\n      }\n      .min-w-32 {\n        min-width: 8rem;\n      }\n      .min-w-16\t{\n        min-width: 4rem;\n      }\n    "])), function (props) {
    return props.palette.getContrastText(props.palette.primary.main);
}, function (props) {
    return props.palette.getContrastText(props.palette.background.paper);
}, function (props) { return props.palette.background.default; }, function (props) { return props.palette.primary.main; }, function (props) {
    return props.palette.mode === 'dark'
        ? dark.panels
        : light.panels;
}, function (props) {
    return props.palette.mode === 'dark'
        ? dark.background
        : light.background;
}, function (props) {
    return props.palette.mode === 'dark'
        ? dark.panels
        : light.panels;
}, function (props) {
    return props.palette.mode === 'dark'
        ? props.palette.text.secondary
        : props.palette.text.secondary;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.tabs : light.tabs;
}, function (props) { return props.palette.text.primary; }, function (props) { return props.palette.text.primary; }, function (props) { return props.palette.background.paper; }, function (props) { return props.palette.primary.dark; }, function (props) {
    return props.palette.mode === 'dark' ? dark.background : light.background;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.navbar : light.navbar;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.panels : light.panels;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.overlays : light.overlays;
}, function (props) {
    return props.palette.mode === 'dark'
        ? props.palette.divider
        : props.palette.divider;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.paper : light.paper;
}, function (props) {
    return props.palette.mode === 'dark' ? dark.overlays : light.overlays;
}, function (props) {
    return props.palette.mode === 'dark'
        ? 'rgb(30, 44, 53)'
        : 'rgb(229, 229, 229)';
}, function (props) {
    return props.palette.mode === 'dark'
        ? 'linear-gradient(-180deg, rgb(229, 229, 229) 0%, rgb(206, 206, 206) 100%)'
        : 'linear-gradient(-180deg, rgb(153, 153, 153) 0%, rgb(187, 187, 187) 100%)';
}, function (props) {
    return props.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(0, 0, 0, 0.26)';
}, function (props) { return props.palette.text.primary; }, function (props) { return props.palette.primary.main; }, function (props) { return props.palette.secondary.main; }, function (props) { return props.palette.warning.main; }, function (props) { return props.palette.background.default; }, function (props) { return props.palette.primary.main; }, function (props) { return props.palette.secondary.main; }, function (props) { return props.palette.divider; }, function (props) { return props.palette.divider; }, function (props) {
    return props.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)';
}, function (props) {
    return props.palette.mode === 'dark' ? dark.overlays : light.overlays;
});
var lightenUntilContrasting = function (color, background) {
    var passes = meetsContrastGuidelines(color, background);
    if (passes.AA) {
        return color;
    }
    return lightenUntilContrasting(lighten(color, 0.1), background);
};
var darkenUntilContrasting = function (color, background) {
    var passes = meetsContrastGuidelines(color, background);
    if (passes.AA) {
        return color;
    }
    return darkenUntilContrasting(darken(color, 0.1), background);
};
export var Provider = function (_a) {
    var children = _a.children;
    var styledTheme = React.useContext(ThemeContext);
    var darkMode = styledTheme.theme === 'dark';
    var paperColor = darkMode ? dark.paper : light.paper;
    var backgroundColor = darkMode ? dark.background : light.background;
    var customPalette = styledTheme.palette === 'custom' &&
        styledTheme.primary &&
        styledTheme.secondary;
    var primaryMain = customPalette
        ? styledTheme.primary
        : darkMode
            ? dark.primary
            : light.primary;
    var secondaryMain = customPalette
        ? styledTheme.secondary
        : darkMode
            ? dark.secondary
            : light.secondary;
    var primaryContrastScores = meetsContrastGuidelines(paperColor, primaryMain);
    var secondaryContrastScores = meetsContrastGuidelines(paperColor, secondaryMain);
    var failedContrastPrimaryReplacement = darkMode
        ? lightenUntilContrasting(primaryMain, paperColor)
        : darkenUntilContrasting(primaryMain, paperColor);
    var failedContrastSecondaryReplacement = darkMode
        ? lightenUntilContrasting(secondaryMain, paperColor)
        : darkenUntilContrasting(secondaryMain, paperColor);
    var initialTheme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: primaryMain,
            },
            secondary: {
                main: secondaryMain,
            },
            background: {
                default: backgroundColor,
                paper: paperColor,
            },
            grey: {
                // We do this to emulate v4 MUI behavior for default button color
                // @ts-ignore
                main: '#fff',
            },
        },
    });
    /**
     *  We split these out to so that we can access theme variables within our custom theme
     */
    var themeBasedTheme = {
        typography: {
            fontFamily: "'Open Sans', arial, sans-serif",
            h6: {
                fontSize: '1.2rem',
            },
            fontSize: 16,
            button: {
                textTransform: 'none',
            },
        },
        components: {
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontSize: '1rem',
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    size: 'small',
                    color: 'grey',
                },
                variants: [
                    {
                        props: { variant: 'contained', color: 'grey' },
                        style: {
                            color: initialTheme.palette.getContrastText(initialTheme.palette.grey[300]),
                        },
                    },
                    {
                        props: { variant: 'outlined', color: 'grey' },
                        style: {
                            color: initialTheme.palette.text.primary,
                            borderColor: initialTheme.palette.mode === 'light'
                                ? 'rgba(0, 0, 0, 0.23)'
                                : 'rgba(255, 255, 255, 0.23)',
                            '&.Mui-disabled': {
                                border: "1px solid ".concat(initialTheme.palette.action.disabledBackground),
                            },
                            '&:hover': {
                                borderColor: initialTheme.palette.mode === 'light'
                                    ? 'rgba(0, 0, 0, 0.23)'
                                    : 'rgba(255, 255, 255, 0.23)',
                                backgroundColor: alpha(initialTheme.palette.text.primary, initialTheme.palette.action.hoverOpacity),
                            },
                        },
                    },
                    {
                        props: { color: 'grey', variant: 'text' },
                        style: {
                            color: initialTheme.palette.text.primary,
                            '&:hover': {
                                backgroundColor: alpha(initialTheme.palette.text.primary, initialTheme.palette.action.hoverOpacity),
                            },
                        },
                    },
                ],
                styleOverrides: __assign(__assign({ root: {
                        lineHeight: 'inherit',
                        minWidth: '0px', // usually more annoying than not
                    } }, (primaryContrastScores.AA
                    ? { textPrimary: {} } // weird requirement due to types, need textPrimary here but empty
                    : {
                        textPrimary: {
                            color: failedContrastPrimaryReplacement,
                            '&:hover': {
                                backgroundColor: alpha(failedContrastPrimaryReplacement, 0.1),
                                // Reset on touch devices, it doesn't add specificity
                                '@media (hover: none)': {
                                    backgroundColor: 'transparent',
                                },
                            },
                        },
                    })), (secondaryContrastScores.AA
                    ? { textSecondary: {} } // weird requirement due to types, need textPrimary here but empty
                    : {
                        textSecondary: {
                            color: failedContrastSecondaryReplacement,
                            '&:hover': {
                                backgroundColor: alpha(failedContrastSecondaryReplacement, 0.1),
                                // Reset on touch devices, it doesn't add specificity
                                '@media (hover: none)': {
                                    backgroundColor: 'transparent',
                                },
                            },
                        },
                    })),
            },
            MuiCardActionArea: {
                styleOverrides: {
                    root: {
                        height: 'auto',
                    },
                },
            },
            MuiCardHeader: {
                styleOverrides: {
                    content: {
                        minWidth: '0px',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'unset' },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        fontSize: '1rem',
                    },
                },
            },
        },
        zIndex: {
            mobileStepper: 101,
            appBar: 101,
            drawer: 101,
            modal: 101,
            snackbar: 101,
            tooltip: 101,
        },
    };
    var theme = createTheme(initialTheme, themeBasedTheme);
    React.useEffect(function () {
        var htmlElement = document.querySelector('html');
        if (styledTheme.theme === 'dark') {
            htmlElement.classList.add('bp3-dark');
            htmlElement.classList.add('theme-dark');
            htmlElement.classList.add('dark');
        }
        else {
            htmlElement.classList.remove('bp3-dark');
            htmlElement.classList.remove('theme-dark');
            htmlElement.classList.remove('dark');
        }
    }, [styledTheme.theme]);
    useRemoveFocusStyle();
    return (React.createElement(React.Fragment, null,
        React.createElement(GlobalStyles, __assign({}, theme)),
        React.createElement(StyledEngineProvider, { injectFirst: true },
            React.createElement(ThemeProvider, { theme: theme }, children))));
};
var templateObject_1;
//# sourceMappingURL=theme.js.map