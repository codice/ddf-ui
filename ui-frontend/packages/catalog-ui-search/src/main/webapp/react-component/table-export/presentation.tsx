/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import { hot } from 'react-hot-loader'
import * as React from 'react'
import Button from '@mui/material/Button'
import properties from '../../js/properties'
import GetAppIcon from '@mui/icons-material/GetApp'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
type Option = {
  label: string
  value: string
}
type Props = {
  exportSize: string
  exportFormat: string
  handleExportSizeChange: (value: any) => void
  handleExportFormatChange: (value: any) => void
  handleCustomExportCountChange: (value: any) => void
  exportSizeOptions: Option[]
  exportFormatOptions: Option[]
  onDownloadClick: () => void
  warning: string
  customExportCount: number
}
export default hot(module)((props: Props) => {
  const {
    exportSize,
    exportFormat,
    exportSizeOptions,
    exportFormatOptions,
    handleExportFormatChange,
    handleExportSizeChange,
    handleCustomExportCountChange,
    onDownloadClick,
    warning,
    customExportCount,
  } = props
  return (
    <div className="w-full h-full overflow-auto p-2">
      <div className="pt-2">
        <Autocomplete
          size="small"
          options={exportSizeOptions}
          onChange={(_e: any, newValue) => {
            handleExportSizeChange(newValue.value)
          }}
          isOptionEqualToValue={(option) => option.value === exportSize}
          getOptionLabel={(option) => {
            return option.label
          }}
          disableClearable
          value={exportSizeOptions.find(
            (choice) => choice.value === exportSize
          )}
          renderInput={(params) => (
            <TextField {...params} label="Export" variant="outlined" />
          )}
        />
      </div>
      {exportSize === 'custom' ? (
        <div className="pt-2">
          <TextField
            fullWidth
            size="small"
            type="number"
            label=""
            placeholder="Enter number of results you would like to export"
            name="customExport"
            value={customExportCount}
            onChange={(e) => {
              handleCustomExportCountChange(e.target.value)
            }}
            variant="outlined"
          />
        </div>
      ) : (
        <div />
      )}
      <div className="pt-2">
        <Autocomplete
          size="small"
          options={exportFormatOptions}
          onChange={(_e: any, newValue) => {
            handleExportFormatChange(newValue.value)
          }}
          isOptionEqualToValue={(option) => option.value === exportFormat}
          getOptionLabel={(option) => {
            return option.label
          }}
          disableClearable
          value={exportFormatOptions.find(
            (choice) => choice.value === exportFormat
          )}
          renderInput={(params) => (
            <TextField {...params} label="as" variant="outlined" />
          )}
        />
      </div>
      {warning && (
        <div className="warning text-center pt-1">
          <i className="fa fa-warning" />
          <span>{warning}</span>
        </div>
      )}
      <div className="pt-2">
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={
            exportSize === 'custom' &&
            customExportCount > (properties as any).exportResultLimit
          }
          onClick={onDownloadClick}
        >
          <GetAppIcon /> Download
        </Button>
      </div>
    </div>
  )
})
