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
import LazyMetacardInteractions from './lazy-metacard-interactions'
const IconHelper = require('../../js/IconHelper.js')
const properties = require('../../js/properties.js')
const user = require('../singletons/user-instance.js')
const metacardDefinitions = require('../singletons/metacard-definitions.js')
import TypedMetacardDefs from '../tabs/metacard/metacardDefinitions'

import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import Button from '@material-ui/core/Button'
import LinkIcon from '@material-ui/icons/Link'
import GetAppIcon from '@material-ui/icons/GetApp'
import Grid from '@material-ui/core/Grid'
const Common = require('../../js/Common.js')
import { hot } from 'react-hot-loader'
import { useTheme, Paper, Divider, Box } from '@material-ui/core'
const LIST_DISPLAY_TYPE = 'List'
const GRID_DISPLAY_TYPE = 'Grid'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import styled from 'styled-components'
import MoreIcon from '@material-ui/icons/MoreVert'
import WarningIcon from '@material-ui/icons/Warning'
import { ThemeInterface } from '../../react-component/styles/styled-components/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useSelectionOfLazyResult } from '../../js/model/LazyQueryResult/hooks'
import Extensions from '../../extension-points'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckIcon from '@material-ui/icons/Check'
import DoneOutlineIcon from '@material-ui/icons/DoneOutline'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { Elevations } from '../theme/theme'
import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple'
import { clearSelection, hasSelection } from './result-item-row'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks'
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
  lazyResults: LazyQueryResult[]
  lazyResult: LazyQueryResult
  selectionInterface: any
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

const SmallButton = styled(Button)`
  && {
    ${props => getPaddingForTheme({ theme: props.theme })};
  }
`

const IconSpan = styled.span`
  && {
    font-size: 1.4rem;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  }
  /* stylelint-disable */
  &::before {
    font-family: 'FontAwesome';
    margin-left: 2px;
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

const MultiSelectActions = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResultsArray = Object.values(selectedResults)
  return (
    <Dropdown
      content={({ close }) => {
        return (
          <BetterClickAwayListener onClickAway={close}>
            <Paper>
              <LazyMetacardInteractions
                lazyResults={selectedResultsArray}
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
          <Button
            className={
              selectedResultsArray.length === 0 ? 'relative' : 'relative'
            }
            color="primary"
            disabled={selectedResultsArray.length === 0}
            onClick={e => {
              e.stopPropagation()
              handleClick(e)
            }}
            style={{ height: '100%' }}
            size="small"
          >
            {selectedResultsArray.length} selected
            <Box
              color={selectedResultsArray.length === 0 ? '' : 'text.primary'}
            >
              <MoreIcon />
            </Box>
          </Button>
        )
      }}
    </Dropdown>
  )
}

// fake event to pass ripple.stop
const fakeEvent = {
  type: '',
} as any

export const ResultItem = ({
  lazyResult,
  measure,
  index,
  selectionInterface,
  lazyResults,
}: ResultItemFullProps) => {
  // console.log(`rendered: ${index}`)

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
  const imgsrc = Common.getImageSrc(thumbnail)

  const DynamicActions = () => {
    return (
      <Grid container direction="column" alignItems="flex-end">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item className="ml-auto">
              <Grid container direction="row" wrap="nowrap" alignItems="center">
                <Grid item style={{ height: '100%' }}>
                  {lazyResult.hasErrors() ? (
                    <div
                      data-id="validation-errors-icon"
                      className="h-full"
                      title="Has validation errors."
                      data-help="Indicates the given result has a validation error.
                      See the 'Quality' tab of the result for more details."
                    >
                      <WarningIcon />
                    </div>
                  ) : (
                    ''
                  )}
                </Grid>
                <Grid item style={{ height: '100%' }}>
                  {!lazyResult.hasErrors() && lazyResult.hasWarnings() ? (
                    <div
                      data-id="validation-warnings-icon"
                      className="h-full"
                      title="Has validation warnings."
                      data-help="Indicates the given result has a validation warning.
                      See the 'Quality' tab of the result for more details."
                    >
                      <WarningIcon />
                    </div>
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
                        window.open(
                          lazyResult.plain.metacard.properties['ext.link']
                        )
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
                      data-id="download-button"
                      onClick={e => {
                        e.stopPropagation()
                        triggerDownload(e)
                      }}
                      style={{ height: '100%' }}
                      size="small"
                    >
                      <GetAppIcon />
                    </SmallButton>
                  ) : null}
                </Grid>
                <Extensions.resultItemTitleAddOn lazyResult={lazyResult} />
                <Grid item style={{ height: '100%' }}>
                  <Dropdown
                    content={({ close }) => {
                      return (
                        <BetterClickAwayListener onClickAway={close}>
                          <Paper>
                            <LazyMetacardInteractions
                              lazyResults={[lazyResult]}
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
                          data-id="result-item-more-vert-button"
                          onClick={e => {
                            e.stopPropagation()
                            handleClick(e)
                          }}
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
          </Grid>
        </Grid>
        {/* <Grid item className="py-2 w-full">
          <Divider className="w-full h-1" />
        </Grid>
        <Grid item className="pt-2">
          <MultiSelectActions selectionInterface={selectionInterface} />
        </Grid> */}
      </Grid>
    )
  }
  const [isHovering, setIsHovering] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const rippleRef = React.useRef<{
    pulsate: () => void
    stop: (e: any) => void
    start: (e: any) => void
  }>(null)
  return (
    <Button
      data-id={`result-item-${index}`}
      component="div" // we have to use a div since there are buttons inside this (invalid to nest buttons)
      onMouseEnter={() => {
        setIsHovering(true)
      }}
      onMouseOver={() => {
        setIsHovering(true)
      }}
      onMouseLeave={() => {
        setIsHovering(false)
      }}
      onMouseOut={() => {
        setIsHovering(false)
      }}
      onMouseDown={event => {
        /**
         * Shift key can cause selections since we set the class to allow text selection,
         * so the only scenario we want to prevent that in is when shift clicking
         */
        if (event.shiftKey) {
          clearSelection()
        }
        /**
         * Stop the ripple that starts on focus, that's only for navigating by keyboard
         */
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.stop(fakeEvent)
          }
        }, 0)
      }}
      onClick={event => {
        if (hasSelection()) {
          return
        }
        if (event.shiftKey) {
          lazyResult.shiftSelect()
        } else if (event.ctrlKey || event.metaKey) {
          lazyResult.controlSelect()
        } else {
          lazyResult.select()
        }
        if (rippleRef.current) {
          rippleRef.current.start(event)
        }
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.stop(fakeEvent)
          }
        }, 200)
      }}
      onFocus={e => {
        if (e.target === e.currentTarget && rippleRef.current) {
          rippleRef.current.pulsate()
        }
      }}
      onBlur={e => {
        if (rippleRef.current) {
          rippleRef.current.stop(e)
        }
      }}
      fullWidth
      className={`select-text outline-none px-6 text-left break-words`}
      disableFocusRipple
      disableTouchRipple
      disableRipple
    >
      <div className="w-full">
        <TouchRipple ref={rippleRef} />
        <Box
          className="absolute left-0 top-0 z-0 w-full h-full"
          bgcolor="secondary.main"
          style={{
            opacity: isSelected ? 0.05 : 0,
          }}
        />
        <div className="w-full pb-2 relative z-0">
          <Grid
            className="w-full"
            container
            direction="row"
            wrap="nowrap"
            alignItems="center"
          >
            <Grid item>
              <Button
                data-id="result-item-checkbox"
                onClick={event => {
                  event.stopPropagation()
                  if (event.shiftKey) {
                    lazyResult.shiftSelect()
                  } else {
                    lazyResult.controlSelect()
                  }
                  event.currentTarget.blur()
                }}
                className="relative p-2 min-w-0 outline-none h-full"
                onFocus={e => {
                  setIsFocused(true)
                }}
                onBlur={e => {
                  setIsFocused(false)
                }}
              >
                {(() => {
                  if (isSelected) {
                    return (
                      <Box
                        color="secondary.main"
                        className={`transform transition duration-200 ease-in-out ${
                          isHovering || isFocused ? '' : '-translate-x-full'
                        }`}
                      >
                        {isHovering || isFocused ? (
                          <CheckBoxIcon />
                        ) : (
                          <CheckIcon />
                        )}
                      </Box>
                    )
                  } else if (!isSelected) {
                    return (
                      <Box color="secondary.main" className="transform ">
                        <CheckBoxOutlineBlankIcon
                          className={`${
                            isHovering || isFocused ? '' : ' invisible'
                          }`}
                        />
                      </Box>
                    )
                  }
                  return null
                })()}
                <IconSpan
                  className={`${getIconClassName({
                    lazyResult,
                  })} ${
                    isHovering || isFocused ? 'invisible' : ''
                  } absolute z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
                  data-help={TypedMetacardDefs.getAlias({
                    attr: 'title',
                  })}
                  title={`${TypedMetacardDefs.getAlias({
                    attr: 'title',
                  })}: ${lazyResult.plain.metacard.properties.title}`}
                />
              </Button>
            </Grid>
            <Grid item>
              <div data-id="result-item-title-label" className="">
                {lazyResult.plain.metacard.properties.title}
              </div>
            </Grid>
          </Grid>
          <div className="pl-3">
            <div>
              <Extensions.resultItemRowAddOn lazyResult={lazyResult} />
            </div>
            <div>
              {renderThumbnail ? (
                <img
                  data-id="result-item-thumbnail"
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
                    data-help={TypedMetacardDefs.getAlias({
                      attr: detail.label,
                    })}
                    title={`${TypedMetacardDefs.getAlias({
                      attr: detail.label,
                    })}: ${detail.value}`}
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
                  title={`${TypedMetacardDefs.getAlias({
                    attr: 'source-id',
                  })}: ${lazyResult.plain.metacard.properties['source-id']}`}
                  data-help={TypedMetacardDefs.getAlias({
                    attr: 'source-id',
                  })}
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
          </div>
        </div>
        <Paper
          onClick={e => {
            e.stopPropagation()
          }}
          elevation={Elevations.overlays}
          className={`absolute z-50 right-0 bottom-0 focus-within:opacity-100 hover:opacity-100 p-2 cursor-auto ${
            isHovering ? 'opacity-100' : 'opacity-0'
          } focus-within:opacity-100 transform translate-y-3/4`}
        >
          <DynamicActions />
        </Paper>
      </div>
    </Button>
  )
}

export default hot(module)(ResultItem)
