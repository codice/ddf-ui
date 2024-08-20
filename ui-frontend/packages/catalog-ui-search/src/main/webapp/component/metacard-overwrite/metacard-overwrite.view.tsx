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

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'drop... Remove this comment to see the full error message
import Dropzone from 'dropzone'
import OverwritesInstance from '../singletons/overwrites-instance'
import React from 'react'
import styled from 'styled-components'
import { readableColor } from 'polished'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useDialog } from '../dialog'

const Root = styled.div`
  overflow: auto;
  white-space: nowrap;
  height: 100%;
`

const OverwriteStatus = styled.div`
  display: inline-block;
  white-space: normal;
  vertical-align: top !important;
  width: 100%;
  transform: translateX(0%);
  transition: transform ${(props) => props.theme.coreTransitionTime} linear;
  text-align: center;
  position: relative;
  padding: 10px;
`

const OverwriteProgress = styled(OverwriteStatus)`
  line-height: ${(props) => props.theme.minimumButtonSize};
`

const ProgressText = styled.div`
  padding: 10px;
  top: 0px;
  left: 0px;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  font-size: ${(props) => props.theme.largeFontSize};
  color: ${(props) => readableColor(props.theme.backgroundContent)};
`

const ProgressTextUnder = styled.div`
  font-size: ${(props) => props.theme.largeFontSize};
  visibility: hidden;
`

const ProgressInfo = styled.div`
  font-size: ${(props) => props.theme.mediumFontSize};
  color: ${(props) => readableColor(props.theme.backgroundContent)};
`

const ProgressBar = styled.div`
  z-index: 0;
  top: 0px;
  left: 0px;
  position: absolute;
  width: 0%;
  height: 100%;
  background: ${(props) => props.theme.positiveColor};
  transition: width ${(props) => props.theme.coreTransitionTime} linear;
`

const OverwriteSuccess = styled(OverwriteStatus)`
  color: ${(props) => readableColor(props.theme.positiveColor)};
  background: ${(props) => props.theme.positiveColor};
  font-size: ${(props) => props.theme.mediumFontSize};
  overflow-wrap: break-word;
  width: 50em;
`

const OverwriteError = styled(OverwriteStatus)`
  color: ${(props) => readableColor(props.theme.negativeColor)};
  background: ${(props) => props.theme.negativeColor};
  font-size: ${(props) => props.theme.mediumFontSize};
  overflow-wrap: break-word;
  width: 50em;
`

const ResultMessage = styled.div`
  font-size: ${(props) => props.theme.largeFontSize};
  margin-left: ${(props) => props.theme.minimumButtonSize};
`

const Sending = (props: any) => (
  <OverwriteProgress>
    <ProgressTextUnder>
      Uploading File
      <div>{props.percentage}%</div>
      <ProgressInfo>
        If you leave this view, the overwrite will still continue.
      </ProgressInfo>
    </ProgressTextUnder>
    <ProgressText>
      Uploading File
      <div>{Math.floor(props.percentage)}%</div>
      <ProgressInfo>
        If you leave this view, the overwrite will still continue.
      </ProgressInfo>
    </ProgressText>
    <ProgressBar style={{ width: `${props.percentage}%` }} />
  </OverwriteProgress>
)

const Success = (props: any) => (
  <OverwriteSuccess>
    <ResultMessage>{props.message}</ResultMessage>
  </OverwriteSuccess>
)

const Error = (props: any) => (
  <OverwriteError>
    <ResultMessage>{props.message}</ResultMessage>
  </OverwriteError>
)

const Stages = {
  Sending,
  Success,
  Error,
} as {
  [key: string]: any
}

const defaultState = {
  stage: '',
  percentage: 0,
  message: '',
}

const mapOverwriteModelToState = (overwriteModel: any) => {
  const currentState = {} as any
  if (overwriteModel.get('success')) {
    currentState.stage = 'Success'
  } else if (overwriteModel.get('error')) {
    currentState.stage = 'Error'
  } else if (overwriteModel.get('sending')) {
    currentState.stage = 'Sending'
  } else {
    currentState.stage = ''
  }
  currentState.percentage = overwriteModel.get('percentage')
  currentState.message = overwriteModel.escape('message')

  return currentState
}

const getOverwriteModel = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  if (!lazyResult) {
    return
  }
  return OverwritesInstance.get(lazyResult.plain.id)
}

export const MetacardOverwrite = ({
  title,
  lazyResult,
  overwriteUrl,
}: {
  title: string
  lazyResult: LazyQueryResult,
  overwriteUrl?: string
}) => {
  const dialogContext = useDialog()
  const [overwriteModel, setOverwriteModel] = React.useState<any>(null)
  const [dropzone, setDropzone] = React.useState<any>(null)
  const [dropzoneElement, setDropdownElement] =
    React.useState<HTMLDivElement | null>(null)
  const { listenTo, stopListening } = useBackbone()
  const [state, setState] = React.useState(defaultState)

  React.useEffect(() => {
    return () => {
      OverwritesInstance.removeIfUnused(lazyResult?.plain.id)
    }
  }, [])

  React.useEffect(() => {
    if (lazyResult && dropzoneElement) {
      const overrides = {
        'security.access-administrators':
          lazyResult.plain.metacard.properties[
            'security.access-administrators'
          ] || [],
        'security.access-groups':
          lazyResult.plain.metacard.properties['security.access-groups'] || [],
        'security.access-groups-read':
          lazyResult.plain.metacard.properties['security.access-groups-read'] ||
          [],
        'security.access-individuals':
          lazyResult.plain.metacard.properties['security.access-individuals'] ||
          [],
        'security.access-individuals-read':
          lazyResult.plain.metacard.properties[
            'security.access-individuals-read'
          ] || [],
      } as {
        [key: string]: any
      }
      setDropzone(
        new Dropzone(dropzoneElement, {
          paramName: 'parse.resource', //required to parse multipart body
          url: (overwriteUrl ? overwriteUrl : './internal/catalog/') + lazyResult.plain.id,
          maxFilesize: 5000000, //MB
          method: 'put',
          sending(_file: any, _xhr: any, formData: any) {
            Object.keys(overrides).forEach((attribute) => {
              overrides[attribute].forEach((value: any) => {
                formData.append('parse.' + attribute, value)
              })
            })
          },
        })
      )
    }
  }, [dropzoneElement, lazyResult])

  React.useEffect(() => {
    if (dropzone && lazyResult) {
      if (!getOverwriteModel({ lazyResult })) {
        OverwritesInstance.add({
          id: lazyResult?.plain.id,
          dropzone: dropzone,
          result: lazyResult,
        })
      }
      setOverwriteModel(getOverwriteModel({ lazyResult }))
    }
  }, [dropzone, lazyResult])

  React.useEffect(() => {
    if (overwriteModel) {
      setState(mapOverwriteModelToState(overwriteModel))
      const callback = () => {
        setState(mapOverwriteModelToState(overwriteModel))
      }
      const eventString =
        'change:percentage change:sending change:error change:success'
      listenTo(overwriteModel, eventString, callback)
      return () => {
        if (overwriteModel) {
          stopListening(overwriteModel, eventString, callback)
        }
      }
    }
    return () => {}
  }, [overwriteModel])

  const startOver = () => {
    OverwritesInstance.remove(lazyResult?.plain.id)
    OverwritesInstance.add({
      id: lazyResult?.plain.id,
      dropzone: dropzone,
      result: lazyResult,
    })
    setOverwriteModel(getOverwriteModel({ lazyResult }))
    setState(defaultState)
  }
  const Component = Stages[state.stage]
  return (
    <Root>
      <div style={{ display: 'none' }} ref={setDropdownElement} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{ width: '50em' }}>
        Are you sure you want to overwrite the content?
        <br />
        WARNING: This will completely overwrite the current content and
        metadata.
      </DialogContent>

      {Component && <Component {...state} />}

      <DialogActions>
        <Button
          onClick={() => {
            dialogContext.setProps({ open: false })
            startOver()
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            dropzoneElement?.click()
            startOver()
          }}
        >
          Overwrite
        </Button>
      </DialogActions>
    </Root>
  )
}
