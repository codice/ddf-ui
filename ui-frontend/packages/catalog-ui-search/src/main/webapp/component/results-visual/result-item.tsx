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
import { readableColor } from 'polished'
import LazyMetacardInteractions from './lazy-metacard-interactions'
const IconHelper = require('catalog-ui-search/src/main/webapp/js/IconHelper.js')
const properties = require('catalog-ui-search/src/main/webapp/js/properties.js')
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance.js')
const metacardDefinitions = require('catalog-ui-search/src/main/webapp/component/singletons/metacard-definitions.js')
const HandleBarsHelpers = require('catalog-ui-search/src/main/webapp/js/HandlebarsHelpers.js')
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import Button from '@material-ui/core/Button'
import LinkIcon from '@material-ui/icons/Link'
import GetAppIcon from '@material-ui/icons/GetApp'
import Grid from '@material-ui/core/Grid'
const Common = require('catalog-ui-search/src/main/webapp/js/Common.js')
import { hot } from 'react-hot-loader'
import { LazyQueryResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResult'
import { useSelectionOfLazyResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/hooks'
import { useTheme, Paper } from '@material-ui/core'
const LIST_DISPLAY_TYPE = 'List'
const GRID_DISPLAY_TYPE = 'Grid'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import styled from 'styled-components'
import MoreIcon from '@material-ui/icons/MoreVert'
import WarningIcon from '@material-ui/icons/Warning'
import { ThemeInterface } from '../../react-component/styles/styled-components/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
const getResultDisplayType = () =>
  (user &&
    user
      .get('user')
      .get('preferences')
      .get('resultDisplay')) ||
  LIST_DISPLAY_TYPE

type CustomDetailType = {
  label: string
  value: any
}

const getCustomDetails = ({
  lazyResult,
}: {
  lazyResult: ResultItemBasicProps['lazyResult']
}): CustomDetailType[] => {
  const customDetails = [] as CustomDetailType[]
  if (properties.resultShow) {
    properties.resultShow.forEach((additionProperty: any) => {
      if (additionProperty === 'source-id') {
        return
      }
      let value = lazyResult.plain.metacard.properties[additionProperty]
      if (value && metacardDefinitions.metacardTypes[additionProperty]) {
        switch (metacardDefinitions.metacardTypes[additionProperty].type) {
          case 'DATE':
            if (value.constructor === Array) {
              value = value.map((val: any) => Common.getMomentDate(val))
            } else {
              value = Common.getMomentDate(value)
            }
            break
        }
        customDetails.push({
          label: additionProperty,
          value,
        })
      }
    })
  }
  return customDetails
}

const checkResultDisplayType = () => {
  switch (getResultDisplayType()) {
    case LIST_DISPLAY_TYPE:
      return false
    case GRID_DISPLAY_TYPE:
      return true
  }
  return true
}

const PropertyComponent = (props: React.AllHTMLAttributes<HTMLDivElement>) => {
  return <div {...props} style={{ marginTop: '10px', opacity: '.7' }} />
}

type ResultItemBasicProps = {
  lazyResult: LazyQueryResult
}

type ResultItemFullProps = ResultItemBasicProps & {
  measure: () => void
  index: number
  width: number
}

const showSource = () => {
  return (
    properties.resultShow.find((additionalProperty: string) => {
      return additionalProperty === 'source-id'
    }) !== undefined
  )
}

const showRelevanceScore = ({
  lazyResult,
}: {
  lazyResult: ResultItemBasicProps['lazyResult']
}) => {
  return properties.showRelevanceScores && lazyResult.hasRelevance()
}

const getPaddingForTheme = ({ theme }: { theme: ThemeInterface }) => {
  switch (theme.spacingMode) {
    case 'comfortable':
      return 'padding: 8px 8px;'
    case 'cozy':
      return 'padding: 3px 6px;'
    case 'compact':
      return 'padding: 0px;'
  }
}

const SpecialButton = styled(Button)`
  && {
    height: 100%;
    .MuiButton-label {
      display: block;
    }
    text-transform: none;
    text-align: left;
    overflow: hidden;
    word-break: break-word;
    ${props => getPaddingForTheme({ theme: props.theme })};
  }
`

const SmallButton = styled(Button)`
  && {
    ${props => getPaddingForTheme({ theme: props.theme })};
  }
`

const IconSpan = styled.span`
  && {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  }
  /* stylelint-disable */
  &::before {
    font-family: 'FontAwesome';
    margin-right: 5px;
  }
`

const getIconClassName = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  if (lazyResult.isRevision()) {
    return 'fa fa-history'
  } else if (lazyResult.isResource()) {
    return IconHelper.getClassByMetacardObject(lazyResult.plain)
  } else if (lazyResult.isDeleted()) {
    return 'fa fa-trash'
  }
  return ''
}

export const ResultItem = ({
  lazyResult,
  measure,
  index,
}: ResultItemFullProps) => {
  // console.log(`rendered: ${index}`)
  const theme = useTheme()
  const isSelected = useSelectionOfLazyResult({ lazyResult })
  const [isGallery, setIsGallery] = React.useState(checkResultDisplayType())
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:resultDisplay',
      () => {
        setIsGallery(checkResultDisplayType())
      }
    )
  }, [])

  React.useEffect(() => {
    if (!renderThumbnail) {
      measure()
    }
  })

  const customDetails = getCustomDetails({ lazyResult })
  const renderThumbnail =
    isGallery && lazyResult.plain.metacard.properties.thumbnail
  const triggerDownload = (e: any) => {
    e.stopPropagation()
    window.open(lazyResult.plain.metacard.properties['resource-download-url'])
  }

  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const imgsrc = HandleBarsHelpers.getImageSrc(thumbnail)

  const DynamicActions = () => {
    return (
      <Grid item>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          style={{ height: '100%' }}
        >
          <Grid item style={{ height: '100%' }}>
            {lazyResult.hasErrors() ? (
              <SmallButton
                disabled
                style={{ height: '100%', pointerEvents: 'all' }}
                size="small"
                title="Has validation errors."
                data-help="Indicates the given result has a validation error.
                      See the 'Quality' tab of the result for more details."
              >
                <WarningIcon />
              </SmallButton>
            ) : (
              ''
            )}
          </Grid>
          <Grid item style={{ height: '100%' }}>
            {!lazyResult.hasErrors() && lazyResult.hasWarnings() ? (
              <SmallButton
                disabled
                style={{ height: '100%', pointerEvents: 'all' }}
                size="small"
                title="Has validation warnings."
                data-help="Indicates the given result has a validation warning.
                      See the 'Quality' tab of the result for more details."
              >
                <WarningIcon />
              </SmallButton>
            ) : (
              ''
            )}
          </Grid>
          <Grid item style={{ height: '100%' }}>
            {lazyResult.plain.metacard.properties['ext.link'] ? (
              <SmallButton
                title={lazyResult.plain.metacard.properties['ext.link']}
                onClick={e => {
                  e.stopPropagation()
                  window.open(lazyResult.plain.metacard.properties['ext.link'])
                }}
                style={{ height: '100%' }}
                size="small"
              >
                <LinkIcon />
              </SmallButton>
            ) : null}
          </Grid>
          <Grid item style={{ height: '100%' }}>
            {lazyResult.isDownloadable() ? (
              <SmallButton
                onClick={triggerDownload}
                style={{ height: '100%' }}
                size="small"
              >
                <GetAppIcon />
              </SmallButton>
            ) : null}
          </Grid>
          <Grid item style={{ height: '100%' }}>
            <Dropdown
              content={({ close }) => {
                return (
                  <BetterClickAwayListener onClickAway={close}>
                    <Paper>
                      <LazyMetacardInteractions
                        lazyResult={lazyResult}
                        onClose={() => {
                          close()
                        }}
                      />
                    </Paper>
                  </BetterClickAwayListener>
                )
              }}
            >
              {({ handleClick }) => {
                return (
                  <SmallButton
                    onClick={handleClick}
                    style={{ height: '100%' }}
                    size="small"
                  >
                    <MoreIcon />
                  </SmallButton>
                )
              }}
            </Dropdown>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      alignItems="stretch"
      alignContent="stretch"
      style={{
        border: '1px solid grey',
        background: isSelected
          ? theme.palette.type === 'dark'
            ? 'rgba(50,50,50,1)'
            : 'rgba(225, 225, 225, 1)'
          : theme.palette.background.paper,
      }}
    >
      <Grid item style={{ width: '100%' }}>
        <Grid
          container
          alignItems="stretch"
          alignContent="stretch"
          direction="row"
          justify="space-between"
          wrap="nowrap"
        >
          <Grid item style={{ width: '100%' }}>
            <SpecialButton
              fullWidth
              onClick={event => {
                if (event.shiftKey) {
                  lazyResult.shiftSelect()
                } else if (event.ctrlKey || event.metaKey) {
                  lazyResult.controlSelect()
                } else {
                  lazyResult.select()
                }
              }}
            >
              <div>
                <IconSpan
                  className={getIconClassName({ lazyResult })}
                  data-help={HandleBarsHelpers.getAlias('title')}
                  title={`${HandleBarsHelpers.getAlias('title')}: ${
                    lazyResult.plain.metacard.properties.title
                  }`}
                >
                  {lazyResult.plain.metacard.properties.title}
                </IconSpan>
              </div>
              <div>
                {renderThumbnail ? (
                  <img
                    src={imgsrc}
                    style={{ marginTop: '10px', maxWidth: '100%' }}
                    onLoad={() => {
                      measure()
                    }}
                    onError={() => {
                      measure()
                    }}
                  />
                ) : null}

                {customDetails.map(detail => {
                  return (
                    <PropertyComponent
                      key={detail.label}
                      data-help={HandleBarsHelpers.getAlias(detail.label)}
                      title={`${HandleBarsHelpers.getAlias(detail.label)}: ${
                        detail.value
                      }`}
                    >
                      <span>{detail.value}</span>
                    </PropertyComponent>
                  )
                })}
                {showRelevanceScore({ lazyResult }) ? (
                  <PropertyComponent
                    data-help={`Relevance: ${lazyResult.plain.relevance}`}
                    title={`Relevance: ${lazyResult.plain.relevance}`}
                  >
                    <span>{lazyResult.getRoundedRelevance()}</span>
                  </PropertyComponent>
                ) : (
                  ''
                )}
                {showSource() ? (
                  <PropertyComponent
                    title={`${HandleBarsHelpers.getAlias('source-id')}: ${
                      lazyResult.plain.metacard.properties['source-id']
                    }`}
                    data-help={HandleBarsHelpers.getAlias('source-id')}
                  >
                    {!lazyResult.isRemote() ? (
                      <React.Fragment>
                        <span className="fa fa-home" />
                        <span style={{ marginLeft: '5px' }}>local</span>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <span className="fa fa-cloud" />
                        <span style={{ marginLeft: '5px' }}>
                          {lazyResult.plain.metacard.properties['source-id']}
                        </span>
                      </React.Fragment>
                    )}
                  </PropertyComponent>
                ) : (
                  ''
                )}
              </div>
            </SpecialButton>
          </Grid>
          <DynamicActions />
        </Grid>
        <div>
          <Grid
            alignItems="center"
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
          />
        </div>
      </Grid>
    </Grid>
  )
}

export default hot(module)(ResultItem)
