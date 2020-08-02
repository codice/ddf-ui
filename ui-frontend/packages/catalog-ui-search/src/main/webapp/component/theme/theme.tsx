import * as React from 'react'
import {
  createMuiTheme,
  MuiThemeProvider as ThemeProvider,
  darken,
  Theme as ThemeInterface,
  createStyles,
  lighten,
  StylesProvider,
} from '@material-ui/core/styles'
import { ThemeContext } from 'styled-components'
import { createGlobalStyle } from 'styled-components'
import { lighten as polishedLighten } from 'polished'

type Theme = {
  primary: string
  secondary?: string
}

const dark: Theme = {
  primary: '#69E1E8',
}

const light: Theme = {
  primary: '#3c6dd5',
}

export const MuiOutlinedInputBorderClasses =
  'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-notchedOutline border'

const GlobalStyles = createGlobalStyle<ThemeInterface>`
      a {
        color: ${props => props.palette.primary.dark};
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
      .lm_header {
        z-index: 0 !important;
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
      // for whatever reason they have a height of 0 sometimes, maybe MUI will fix this in v5
      textarea.MuiInputBase-input {
        min-height: 21px;
      }
    `

export const Provider = ({ children }: { children: any }) => {
  const styledTheme = React.useContext(ThemeContext)
  const paperColor = polishedLighten(0.1, styledTheme.backgroundContent)
  const theme = createMuiTheme({
    palette: {
      type: styledTheme.theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: styledTheme.theme === 'dark' ? dark.primary : light.primary,
      },
      background: {
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
      MuiButton: createStyles({
        root: {
          lineHeight: 'inherit', // maybe open a ticket on MUI, seems like the default they use doesn't center text quite right with icons
        },
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
