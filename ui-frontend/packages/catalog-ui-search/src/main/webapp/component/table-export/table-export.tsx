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
import { useEffect, useState } from 'react'
import { useDialog } from '../../component/dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Autocomplete from '@material-ui/lab/Autocomplete'
import ProgressButton from '../../react-component/progress-button'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import properties from '../../js/properties'
import useSnack from '../hooks/useSnack'
import {
  getExportOptions,
  Transformer,
  DownloadInfo,
  Option,
  ExportResponse,
  getWarning,
  generateOnDownloadClick,
} from '../../react-component/utils/export'

type Props = {
  selectionInterface: any
  filteredAttributes: string[]
}

const TableExport = ({ selectionInterface, filteredAttributes }: Props) => {
  const [formatOptions, setFormatOptions] = useState<Option[]>([])
  const [exportFormat, setExportFormat] = useState<string>('csv')
  const [exportSize, setExportSize] = useState<string>('all')
  const [customExportCount, setCustomExportCount] = useState<any>(null)
  const [downloading, setDownloading] = useState<boolean>(false)
  const addSnack = useSnack()
  const dialogContext = useDialog()

  const exportSizes = [
    {
      label: 'Current Page',
      value: 'currentPage',
    },
    {
      label: 'All Results',
      value: 'all',
    },
    {
      label: 'Specific Number of Results',
      value: 'custom',
    },
  ]

  const onDownloadClick = (downloadInfo: DownloadInfo) =>
    generateOnDownloadClick({ addSnack })(downloadInfo)

  const warning = () =>
    getWarning({
      exportSize,
      selectionInterface,
      customExportCount,
    })

  useEffect(() => {
    const fetchFormats = async () => {
      const exportFormats = await getExportOptions(Transformer.Query)
      const sortedExportFormats = exportFormats.sort(
        (format1: ExportResponse, format2: ExportResponse) => {
          return format1.displayName.localeCompare(format2.displayName)
        }
      )
      setFormatOptions(
        sortedExportFormats.map((exportFormat: ExportResponse) => ({
          label: exportFormat.displayName,
          value: exportFormat.id,
        }))
      )
    }
    fetchFormats()
  }, [])

  return formatOptions.length === 0 ? null : (
    <div className="w-medium">
      <DialogTitle disableTypography>
        <Typography align={'center'} variant={'h5'}>
          Export
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div className="py-2">
          <Autocomplete
            size="small"
            options={exportSizes}
            onChange={(_e: any, newValue) => {
              setExportSize(newValue.value)
            }}
            getOptionSelected={(option) => option.value === exportSize}
            getOptionLabel={(option) => option.label}
            disableClearable
            value={exportSizes.find((choice) => choice.value === exportSize)}
            renderInput={(params) => (
              <TextField {...params} label="Export" variant="outlined" />
            )}
          />
        </div>
        {exportSize === 'custom' ? (
          <div className="py-2">
            <TextField
              fullWidth
              size="small"
              type="number"
              label=""
              placeholder="Enter number of results you would like to export"
              name="customExport"
              value={customExportCount}
              onChange={(e) => {
                let value: any = Number(e.target.value)
                if (value === 0) value = null
                setCustomExportCount(value)
              }}
              variant="outlined"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="py-2">
          <Autocomplete
            size="small"
            options={formatOptions}
            onChange={(_e: any, newValue) => {
              setExportFormat(newValue.value)
            }}
            getOptionSelected={(option) => option.value === exportFormat}
            getOptionLabel={(option) => option.label}
            disableClearable
            value={formatOptions.find((choice) => choice.value == exportFormat)}
            renderInput={(params) => (
              <TextField {...params} label="as" variant="outlined" />
            )}
          />
        </div>
        <DialogContentText>
          {warning() && (
            <div className="warning pt-1">
              <i className="fa fa-warning" />
              {warning()}
            </div>
          )}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            dialogContext.setProps({ open: false })
          }}
        >
          Cancel
        </Button>

        <ProgressButton
          variant="contained"
          color="primary"
          disabled={
            exportSize === 'custom' &&
            customExportCount > (properties as any).exportResultLimit
          }
          onClick={async () => {
            setDownloading(true)
            await onDownloadClick({
              exportFormat,
              exportSize,
              selectionInterface,
              customExportCount,
              filteredAttributes,
            })
            dialogContext.setProps({ open: false })
          }}
          loading={downloading}
        >
          Export
        </ProgressButton>
      </DialogActions>
    </div>
  )
}
export default TableExport
