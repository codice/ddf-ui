
import { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Typography from '@mui/material/Typography'
import { TypedUserInstance } from '../../component/singletons/TypedUser'
import user from '../../component/singletons/user-instance'

const coordinateFormatOptions = [
  { label: 'Degrees, Minutes, Seconds (DMS) (Lat/Lon)', value: 'degrees' },
  { label: 'Decimal (Lat/Lon)', value: 'decimal' },
  { label: 'MGRS', value: 'mgrs' },
  { label: 'UTM/UPS (Lat/Lon)', value: 'utm' },
  { label: 'Well Known Text (Lon/Lat)', value: 'wkt' },
]

const CoordinateSettings = () => {
  const [coordFormat, setCoordFormat] = useState(
    TypedUserInstance.getCoordinateFormat()
  )

  const updateCoordFormat = (coordinateFormat: string) => {
    const preferences = user.get('user').get('preferences')
    setCoordFormat(coordinateFormat)
    preferences.set({ coordinateFormat })
    preferences.savePreferences()
  }

  return (
    <FormControl>
      <Typography variant="h6">Coordinate System (CS)</Typography>
      <RadioGroup
        value={coordFormat}
        onChange={(e) => updateCoordFormat(e.target.value)}
      >
        {coordinateFormatOptions.map((format) => (
          <FormControlLabel
            value={format.value}
            control={<Radio size="small" color="primary" />}
            label={<div className="text-sm">{format.label}</div>}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

export default CoordinateSettings
