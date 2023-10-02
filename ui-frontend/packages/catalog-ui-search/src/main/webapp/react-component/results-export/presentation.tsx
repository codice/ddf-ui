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
import GetAppIcon from '@mui/icons-material/GetApp'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import user from '../../component/singletons/user-instance'
import TransferList from '../../component/tabs/metacard/transfer-list'
import { Elevations } from '../../component/theme/theme'
import { useDialog } from '../../component/dialog'
import { TypedUserInstance } from '../../component/singletons/TypedUser'

type ExportFormat = {
  id: string
  displayName: string
}

type Props = {
  selectedFormat: string
  exportFormats: ExportFormat[]
  downloadDisabled: boolean
  onDownloadClick: () => void
  handleExportOptionChange: (val: string) => void
}

const ResultsExportComponent = (props: Props) => {
  const dialogContext = useDialog()

  const {
    selectedFormat,
    exportFormats,
    downloadDisabled,
    onDownloadClick,
    handleExportOptionChange,
  } = props

  React.useEffect(() => {
    handleExportOptionChange(exportFormats[0]?.displayName)
  }, [exportFormats])

  return (
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
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
      </div>
      {['CSV', 'RTF', 'XLSX'].includes(selectedFormat) ? (
        <Button
          data-id="manage-attributes-button"
          onClick={() => {
            dialogContext.setProps({
              PaperProps: {
                style: {
                  minWidth: 'none',
                },
                elevation: Elevations.panels,
              },
              open: true,
              disableEnforceFocus: true,
              children: (
                <div
                  style={{
                    minHeight: '60vh',
                  }}
                >
                  <TransferList
                    startingLeft={user
                      .get('user')
                      .get('preferences')
                      .get('inspector-summaryShown')}
                    startingRight={TypedUserInstance.getResultsAttributesPossibleTable()}
                    startingHideEmpty={user
                      .get('user')
                      .get('preferences')
                      .get('inspector-hideEmpty')}
                    onSave={async (active: any, newHideEmpty: any) => {
                      user.get('user').get('preferences').set({
                        'inspector-summaryShown': active,
                        'inspector-hideEmpty': newHideEmpty,
                      })
                      user.savePreferences()
                    }}
                  />
                </div>
              ),
            })
          }}
          color="primary"
          size="small"
          style={{ height: 'auto' }}
        >
          Manage Attributes
        </Button>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        data-id="download-export-button"
        disabled={downloadDisabled}
        onClick={onDownloadClick}
        className="mt-3"
        fullWidth
      >
        <GetAppIcon /> Download
      </Button>
    </div>
  )
}

export default hot(module)(ResultsExportComponent)
