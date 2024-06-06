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
import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import SummaryManageAttributes from '../summary-manage-attributes/summary-manage-attributes'
import ProgressButton from '../progress-button'
import { DialogActions, DialogContent, LinearProgress } from '@mui/material'
import useSnack from '../../component/hooks/useSnack'
import { AddSnack } from '../../component/snack/snack.provider'

type ExportFormat = {
  id: string
  displayName: string
}

export type Props = {
  selectedFormat: string
  exportFormats: ExportFormat[]
  exportDisabled: boolean
  onExportClick: (addSnack: AddSnack) => void
  handleExportOptionChange: (val: string) => void
  loading?: boolean
  setLoading?: any
  onClose?: any
  exportSuccessful?: boolean
  setExportSuccessful?: any
}

const ResultsExportComponent = ({
  selectedFormat,
  exportFormats,
  exportDisabled,
  onExportClick,
  handleExportOptionChange,
  exportSuccessful,
  onClose,
  loading,
}: Props) => {
  const addSnack = useSnack()
  React.useEffect(() => {
    handleExportOptionChange(exportFormats[0]?.displayName)
  }, [exportFormats])

  if (exportSuccessful) {
    onClose()
  }

  return exportFormats.length === 0 ? (
    <LinearProgress className="w-full h-2" />
  ) : (
    <>
      <DialogContent>
        <div className="p-4" style={{ minWidth: '400px' }}>
          <div data-id="export-format-select" className="export-option">
            <Autocomplete
              key={JSON.stringify(exportFormats)}
              data-id="filter-type-autocomplete"
              fullWidth
              size="small"
              options={exportFormats}
              getOptionLabel={(option) => option.displayName}
              isOptionEqualToValue={(option, value) =>
                option.displayName === value.displayName
              }
              onChange={(_e, newValue) => {
                handleExportOptionChange(newValue.displayName)
              }}
              disableClearable
              value={
                exportFormats.find(
                  (format) => format.displayName === selectedFormat
                ) || exportFormats[0]
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
          </div>

          {['CSV', 'RTF', 'XLSX'].includes(selectedFormat) ? (
            <SummaryManageAttributes isExport={true} />
          ) : null}
        </div>
      </DialogContent>
      <DialogActions>
        <div
          className="pt-2"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            className="mr-2"
            disabled={loading}
            variant="text"
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </Button>
          <ProgressButton
            variant="contained"
            color="primary"
            data-id="export-button"
            disabled={exportDisabled}
            onClick={() => {
              onExportClick(addSnack)
            }}
            loading={loading}
          >
            Export
          </ProgressButton>
        </div>
      </DialogActions>
    </>
  )
}

export default hot(module)(ResultsExportComponent)
