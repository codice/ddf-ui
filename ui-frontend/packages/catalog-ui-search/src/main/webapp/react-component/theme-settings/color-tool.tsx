/**
 * Adapted from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/customization/color/ColorTool.js
 */
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { rgbToHex, useTheme } from '@mui/material/styles'
import colors from './typed-colors'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import Radio from '@mui/material/Radio'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import _ from 'lodash'
import CheckIcon from '@mui/icons-material/Check'
import Slider from '@mui/material/Slider'
import user from '../../component/singletons/user-instance'
import { capitalize } from '@mui/material/utils'

const shades = [
  900,
  800,
  700,
  600,
  500,
  400,
  300,
  200,
  100,
  50,
  'A700',
  'A400',
  'A200',
  'A100',
]
const containsShades = (
  color: any,
  shades: Array<string | number>
): boolean => {
  return shades.every((shade) => Object.keys(color).includes(shade.toString()))
}
const getHues = () => {
  const hues = Object.keys(colors).filter((hue) =>
    containsShades(colors[hue], shades)
  )
  return hues.slice(1, 17)
}

const hues = getHues()

/**
 * Costly to update, so let them settle on a color first
 */
const updateTheme = _.debounce((state: any) => {
  user.get('user').get('preferences').get('theme').set({
    primary: state.primary,
    secondary: state.secondary,
  })
}, 0)

const getDefaults = () => {
  return {
    primary: '#2196f3',
    secondary: '#f50057',
    ...user.get('user').get('preferences').get('theme').toJSON(),
  }
}

function ColorTool(props: any) {
  const { classes } = props
  const theme = useTheme()
  const defaults = getDefaults() as { primary: string; secondary: string }
  const [state, setState] = React.useState({
    primary: defaults.primary,
    secondary: defaults.secondary,
    primaryInput: defaults.primary,
    secondaryInput: defaults.secondary,
    primaryHue: 'blue',
    secondaryHue: 'pink',
    primaryShade: 4,
    secondaryShade: 11,
  })

  const handleChangeColor = (name: string) => (event: any) => {
    const isRgb = (string: string) =>
      /rgb\([0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\)/i.test(string)

    const isHex = (string: string) =>
      /^#?([0-9a-f]{3})$|^#?([0-9a-f]){6}$/i.test(string)

    let {
      target: { value: color },
    } = event

    setState((prevState) => ({
      ...prevState,
      [`${name}Input`]: color,
    }))

    let isValidColor = false

    if (isRgb(color)) {
      isValidColor = true
    } else if (isHex(color)) {
      isValidColor = true
      if (color.indexOf('#') === -1) {
        color = `#${color}`
      }
    }

    if (isValidColor) {
      setState((prevState) => ({
        ...prevState,
        [name]: color,
      }))
    }
  }

  const handleChangeHue = (name: string) => (event: any) => {
    const hue = event.target.value
    const shade = state[`${name}Shade` as 'primaryShade']

    // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
    const color = colors[hue][shades[shade]]

    if (color) {
      setState({
        ...state,
        [`${name}Hue`]: hue,
        [name]: color,
        [`${name}Input`]: color,
      })
    }
  }

  const handleChangeShade =
    (name: string) => (_event: any, shade: string | number) => {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      const color = colors[state[`${name}Hue`]][shades[shade]]
      setState({
        ...state,
        [`${name}Shade`]: shade,
        [name]: color,
        [`${name}Input`]: color,
      })
    }

  React.useEffect(() => {
    updateTheme(state)
  }, [state])

  const colorBar = (color: any, intent: string) => {
    const background = theme.palette.augmentColor({
      color: {
        main: color,
      },
    })

    return (
      <Grid container sx={{ marginTop: theme.spacing(2) }}>
        {['dark', 'main', 'light'].map((key) => {
          const backgroundColor = background[key as 'light'] as string
          return (
            <Tooltip
              placement="right"
              title={(() => {
                switch (key) {
                  case 'dark':
                    return 'Go darker'
                  case 'light':
                    return 'Go lighter'
                  default:
                    return 'Current shade'
                }
              })()}
              key={key}
            >
              <Button
                sx={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor,
                }}
                onClick={() => {
                  setState({
                    ...state,
                    [intent]: rgbToHex(backgroundColor),
                    [`${intent}Input`]: rgbToHex(backgroundColor),
                  })
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: theme.palette.getContrastText(backgroundColor),
                  }}
                >
                  {rgbToHex(backgroundColor)}
                </Typography>
              </Button>
            </Tooltip>
          )
        })}
      </Grid>
    )
  }

  const colorPicker = (intent: 'primary' | 'secondary') => {
    const intentInput = state[`${intent}Input` as 'primaryInput']
    const intentShade = state[`${intent}Shade` as 'primaryShade']
    const color = state[`${intent}` as 'primary']

    return (
      <Grid item xs={12} sm={6} md={4} className="min-w-104">
        <Typography
          component="label"
          gutterBottom
          htmlFor={intent}
          variant="h6"
        >
          {capitalize(intent)}
        </Typography>
        <Input
          id={intent}
          value={intentInput}
          onChange={handleChangeColor(intent)}
          fullWidth
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
        >
          <Typography id={`${intent}ShadeSliderLabel`}>Shade:</Typography>
          <Slider
            sx={{
              width: 'calc(100% - 80px)',
              marginLeft: theme.spacing(3),
              marginRight: theme.spacing(3),
            }}
            value={intentShade}
            min={0}
            max={13}
            step={1}
            onChange={handleChangeShade(intent) as any}
            aria-labelledby={`${intent}ShadeSliderLabel`}
          />
          <Typography>{shades[intentShade]}</Typography>
        </div>
        <div style={{ width: 192 }}>
          {hues.map((hue) => {
            const shade =
              intent === 'primary'
                ? shades[state.primaryShade]
                : shades[state.secondaryShade]

            // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
            const backgroundColor = colors[hue][shade] as string

            return (
              <Tooltip placement="right" title={hue} key={hue}>
                <Radio
                  sx={{ padding: 0 }}
                  color="default"
                  checked={state[intent] === backgroundColor}
                  onChange={handleChangeHue(intent)}
                  value={hue}
                  name={intent}
                  aria-labelledby={`tooltip-${intent}-${hue}`}
                  icon={
                    <div
                      style={{
                        backgroundColor,
                        width: 48,
                        height: 48,
                      }}
                    />
                  }
                  checkedIcon={
                    <div
                      style={{
                        backgroundColor,
                        width: 48,
                        height: 48,
                        border: '1px solid white',
                        color: theme.palette.common.white,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <CheckIcon style={{ fontSize: 30 }} />
                    </div>
                  }
                />
              </Tooltip>
            )
          })}
        </div>
        {colorBar(color, intent)}
      </Grid>
    )
  }

  return (
    <Grid container spacing={5} className={classes?.root}>
      {colorPicker('primary')}
      {colorPicker('secondary')}
    </Grid>
  )
}

export default hot(module)(ColorTool)
