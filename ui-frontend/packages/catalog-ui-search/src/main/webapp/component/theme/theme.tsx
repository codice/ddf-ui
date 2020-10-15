import * as React from 'react'
import {
  createMuiTheme,
  MuiThemeProvider as ThemeProvider,
  darken,
  // @ts-ignore ts-migrate(6133) FIXME: 'getContrastRatio' is declared but its value is ne... Remove this comment to see the full error message
  getContrastRatio,
  Theme as ThemeInterface,
  createStyles,
  lighten,
  StylesProvider,
  fade,
} from '@material-ui/core/styles'
import { ThemeContext } from 'styled-components'
import { createGlobalStyle } from 'styled-components'
import {
  // @ts-ignore ts-migrate(6133) FIXME: 'polishedLighten' is declared but its value is nev... Remove this comment to see the full error message
  lighten as polishedLighten,
  meetsContrastGuidelines,
  // @ts-ignore ts-migrate(6133) FIXME: 'mix' is declared but its value is never read.
  mix,
  // @ts-ignore ts-migrate(6133) FIXME: 'rgba' is declared but its value is never read.
  rgba,
} from 'polished'

type Theme = {
  primary: string
  secondary: string
  background: string
  navbar: string
  panels: string
  overlays: string
  paper: string
  tabs: string
}

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

export const dark: Theme = {
  background: '#0B1821',
  navbar: darken('#365160', 0.2),
  panels: '#243540', // 243540
  overlays: darken('#365160', 0.1),
  paper: darken('#365160', 0.2),
  tabs: darken('#243540', 0.3),
  primary: '#69E1E8',
  secondary: '#2196f3',
}

export const light: Theme = {
  primary: '#3c6dd5',
  secondary: '#2196f3',
  background: '#E5E5E5', // elevation 0
  navbar: '#fafbfc', // elevation 8
  panels: '#FCFCFC', // elevation 6
  tabs: darken('#FCFCFC', 0.05),
  overlays: '#FCFCFC', // elevation 16
  paper: '#FCFCFC',
}

export const Elevations = {
  navbar: 8,
  background: 0,
  paper: 2,
  panels: 6,
  overlays: 16,
}

export const MuiOutlinedInputBorderClasses =
  'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline border'

const GlobalStyles = createGlobalStyle<ThemeInterface>`
      a {
        color: inherit !important;
      }
      *.outline-none, a.outline-none, a, button{
        outline: none !important; 
      }
      span.highlight {
        font-weight: bolder;
      }
      .MuiToolbar-root a,
      .MuiToolbar-root .MuiBreadcrumbs-separator {
        color: ${props =>
          props.palette.getContrastText(props.palette.primary.main)};
      }
      .MuiDrawer-root a {
        color: ${props =>
          props.palette.getContrastText(props.palette.background.paper)};
      }
      .MuiTooltip-tooltip {
        max-width: 50vw;
        padding: 0px;
        background-color: none;
      }
      .MuiFormControlLabel-labelPlacementStart {
        margin-left: 0px;
      }
      @media (min-width: 600px) {
        .MuiListItemIcon-root {
          margin-left: 8px;
        }
      }
      .lm_splitter  {
        background: ${props =>
          props.palette.type === 'dark'
            ? dark.background
            : light.background} !important;
      }
      .lm_stack{
        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
        background: ${props =>
          props.palette.type === 'dark'
            ? dark.panels
            : light.panels} !important;
        border-radius: 4px;
        transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
      .lm_header {
        z-index: 0 !important;
        background: ${props =>
          props.palette.type === 'dark'
            ? dark.background
            : light.background} !important;
      }
      .lm_tab.lm_active {
        background: ${props =>
          props.palette.type === 'dark'
            ? dark.panels
            : light.panels} !important;
            box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12) !important;
      }
      .lm_tab, lm_tabs {
        border-radius: 4px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
      }
      .lm_tab:not(.lm_active) {
        color: ${props =>
          props.palette.type === 'dark'
            ? props.palette.text.secondary
            : props.palette.text.secondary} !important;
        background: ${props =>
          props.palette.type === 'dark' ? dark.tabs : light.tabs} !important;
        button {
          visibility: hidden;
        }
      }
      .lm_tabs .lm_tab {
        border: 1px solid fade(@contrastColor, 10%);
        margin-right: 8px !important;
        box-shadow: none !important;
      }
      .lm_tabs .lm_tab:hover {
        color: ${props => props.palette.text.primary} !important;
      }
      .lm_header,
      .lm_tabs .lm_tab,
      .lm_tabdropdown:before {
        color: ${props => props.palette.text.primary} !important;
      }
      .is-drawing [role="tooltip"] {
        display: none!important;
      }
      [role="tooltip"] {
        z-index: 101 !important;
        pointer-events: all !important;
      }
      .bp3-portal {
        z-index: 101 !important;
      }
      .bp3-popover-wrapper,.bp3-popover-target, .bp3-control-group {
        width: 100%;
      }
      .bp3-control-group {
        flex-wrap: wrap;
      }
      .bp3-control-group > div:first-of-type::after {
        content: 'and';
        display:block;
        position: absolute;
        left: 14px;
        bottom: -25px;
      }
      .bp3-control-group > div:nth-of-type(2) {
        margin-top: 30px;
      }
      .bp3-input-group input {
        background: transparent !important; 
        box-shadow: none !important;
        font-size: 1.1428571428571428rem !important;
        padding: 0px !important;
        height: 1.3125rem !important;
        line-height: 1.15 !important;
      }
      .bp3-popover .bp3-popover-content, .bp3-popover .bp3-popover-content, .bp3-datepicker, .bp3-menu{
        background: ${props => props.palette.background.paper} !important;
      }
      .bp3-popover-arrow {
        display: none !important;
      }
      .bp3-datepicker .DayPicker-Day.DayPicker-Day--selected, .bp3-active {
        background-color: ${props => props.palette.primary.dark} !important;
      }
      .bp3-table-quadrant, .bp3-table-cell-client, .bp3-table-row-headers {
        background: inherit !important;
      }
      // for whatever reason they have a height of 0 sometimes, maybe MUI will fix this in v5
      textarea.MuiInputBase-input {
        min-height: 21px;
      }
      .MuiPaper-elevation0 {
        background-color: ${props =>
          props.palette.type === 'dark' ? dark.background : light.background};
      }
      .MuiPaper-elevation8 {
        background-color: ${props =>
          props.palette.type === 'dark' ? dark.navbar : light.navbar};
      }
      .MuiPaper-elevation6 {
        background-color: ${props =>
          props.palette.type === 'dark' ? dark.panels : light.panels};
      }
      .MuiPaper-elevation16 {
        background-color: ${props =>
          props.palette.type === 'dark' ? dark.overlays : light.overlays};
      }
      .MuiPaper-elevation2 {
        border-width: 1px;
        border-style: solid;
        border-color: ${props =>
          props.palette.type === 'dark'
            ? props.palette.divider
            : props.palette.divider};
          background-color: ${props =>
            props.palette.type === 'dark' ? dark.paper : light.paper};
      }
      [data-behavior-dropdown] {
        background-color: ${props =>
          props.palette.type === 'dark' ? dark.overlays : light.overlays};
      }
      .font-awesome-span {
        && {
          font-size: 1.4rem;
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        }
        /* stylelint-disable */
        &::before {
          font-family: 'FontAwesome';
          margin-left: 2px;
          margin-right: 5px;
        }
      }
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${props =>
          props.palette.type === 'dark'
            ? 'rgb(30, 44, 53)'
            : 'rgb(229, 229, 229)'};
      }
      ::-webkit-scrollbar-thumb {
        background: ${props =>
          props.palette.type === 'dark'
            ? 'linear-gradient(-180deg, rgb(229, 229, 229) 0%, rgb(206, 206, 206) 100%)'
            : 'linear-gradient(-180deg, rgb(153, 153, 153) 0%, rgb(187, 187, 187) 100%)'};
            border-radius: 4px;
      }
      // Mui tailwind style
      .Mui-text-text-primary {
        color: ${props => props.palette.text.primary};
      }
      .Mui-text-primary {
        color: ${props => props.palette.primary.main};
      }
      .Mui-text-secondary {
        color: ${props => props.palette.secondary.main};
      }
      .Mui-text-warning {
        color: ${props => props.palette.warning.main};
      }
      .Mui-bg-default {
        background-color: ${props => props.palette.background.default};
      }
      .Mui-bg-primary {
        background-color: ${props => props.palette.primary.main};
      }
      .Mui-bg-secondary {
        background-color: ${props => props.palette.secondary.main};
      }
      .Mui-bg-divider {
        background-color: ${props => props.palette.divider};
      }
      .Mui-border-divider {
        border-color: ${props => props.palette.divider};
      }
      .children-h-full {
        > * {
          height: 100%;
        }
      }
      .children-block {
        > * {
          display: block;
        }
      }
    `

const lightenUntilContrasting = (color: string, background: string): string => {
  const passes = meetsContrastGuidelines(color, background)
  if (passes.AA) {
    return color
  }
  return lightenUntilContrasting(lighten(color, 0.1), background)
}

const darkenUntilContrasting = (color: string, background: string): string => {
  const passes = meetsContrastGuidelines(color, background)
  if (passes.AA) {
    return color
  }
  return darkenUntilContrasting(darken(color, 0.1), background)
}

export const Provider = ({ children }: { children: any }) => {
  const styledTheme = React.useContext(ThemeContext)
  const darkMode = styledTheme.theme === 'dark'
  const paperColor = darkMode ? dark.paper : light.paper
  const backgroundColor = darkMode ? dark.background : light.background
  const customPalette = styledTheme.palette === 'custom'
  const primaryMain = customPalette
    ? styledTheme.primary
    : darkMode
      ? dark.primary
      : light.primary
  const secondaryMain = customPalette
    ? styledTheme.secondary
    : darkMode
      ? dark.secondary
      : light.secondary
  const primaryContrastScores = meetsContrastGuidelines(
    paperColor,
    primaryMain!
  )
  const secondaryContrastScores = meetsContrastGuidelines(
    paperColor,
    secondaryMain
  )
  const failedContrastPrimaryReplacement = darkMode
    ? lightenUntilContrasting(primaryMain, paperColor)
    : darkenUntilContrasting(primaryMain, paperColor)
  const failedContrastSecondaryReplacement = darkMode
    ? lightenUntilContrasting(secondaryMain, paperColor)
    : darkenUntilContrasting(secondaryMain, paperColor)

  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
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
    },
    typography: {
      fontFamily: `'Open Sans', arial, sans-serif`,
      h6: {
        fontSize: '1.2rem',
      },
      fontSize: 16,
      button: {
        textTransform: 'none',
      },
    },
    overrides: {
      MuiChip: createStyles({
        root: {
          fontSize: '1rem',
        },
      }),
      MuiButton: createStyles({
        root: {
          lineHeight: 'inherit', // maybe open a ticket on MUI, seems like the default they use doesn't center text quite right with icons
          minWidth: '0px', // usually more annoying than not
        },
        ...(primaryContrastScores.AA
          ? { textPrimary: {} } // weird requirement due to types, need textPrimary here but empty
          : {
              textPrimary: {
                color: failedContrastPrimaryReplacement,
                '&:hover': {
                  backgroundColor: fade(failedContrastPrimaryReplacement, 0.1),
                  // Reset on touch devices, it doesn't add specificity
                  '@media (hover: none)': {
                    backgroundColor: 'transparent',
                  },
                },
              },
            }),
        ...(secondaryContrastScores.AA
          ? { textSecondary: {} } // weird requirement due to types, need textPrimary here but empty
          : {
              textSecondary: {
                color: failedContrastSecondaryReplacement,
                '&:hover': {
                  backgroundColor: fade(
                    failedContrastSecondaryReplacement,
                    0.1
                  ),
                  // Reset on touch devices, it doesn't add specificity
                  '@media (hover: none)': {
                    backgroundColor: 'transparent',
                  },
                },
              },
            }),
      }),
      MuiCardActionArea: createStyles({
        root: {
          height: 'auto',
        },
      }),
      MuiCardHeader: createStyles({
        content: {
          minWidth: '0px',
        },
      }),
      MuiTooltip: createStyles({
        tooltip: {
          fontSize: '1rem',
        },
      }),
    },
    zIndex: {
      mobileStepper: 101,
      appBar: 101,
      drawer: 101,
      modal: 101,
      snackbar: 101,
      tooltip: 101,
    },
  })

  React.useEffect(
    () => {
      const htmlElement = document.querySelector('html') as HTMLElement
      if (styledTheme.theme === 'dark') {
        htmlElement.classList.add('bp3-dark')
      } else {
        htmlElement.classList.remove('bp3-dark')
      }
    },
    [styledTheme.theme]
  )
  return (
    <>
      <StylesProvider injectFirst>
        <GlobalStyles {...theme} />
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </StylesProvider>
    </>
  )
}
