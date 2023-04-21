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
import ResultsExport from '../results-export'
import { MetacardInteractionProps } from '.'
import { MetacardInteraction } from './metacard-interactions'
import { hot } from 'react-hot-loader'
import { getExportResults } from '../utils/export/export'
import { useDialogState } from '../../component/hooks/useDialogState'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import Divider from '@mui/material/Divider'

export const ExportActions = (props: MetacardInteractionProps) => {
  const exportDialogState = useDialogState()
  if (!props.model || props.model.length <= 0) {
    return null
  }
  if (!props.model[0].parent) {
    return null
  }
  return (
    <>
      <exportDialogState.MuiDialogComponents.Dialog
        {...exportDialogState.MuiDialogProps}
      >
        <exportDialogState.MuiDialogComponents.DialogTitle>
          <div className="flex flex-row items-center justify-between flex-nowrap w-full">
            Export Results
            <Button
              className="ml-auto"
              onClick={() => {
                exportDialogState.handleClose()
              }}
            >
              <CloseIcon />
            </Button>
          </div>
        </exportDialogState.MuiDialogComponents.DialogTitle>
        <Divider></Divider>
        <ResultsExport
          results={getExportResults(props.model)}
          lazyQueryResults={props.model[0].parent}
        />
      </exportDialogState.MuiDialogComponents.Dialog>
      <MetacardInteraction
        onClick={() => {
          props.onClose()
          exportDialogState.handleClick()
        }}
        icon="fa fa-share"
        text="Export as"
        help="Starts the export process for the selected results."
      />
    </>
  )
}

export default hot(module)(ExportActions)
