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
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
const LIST_DISPLAY_TYPE = 'List'
const GRID_DISPLAY_TYPE = 'Grid'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import MoreIcon from '@material-ui/icons/MoreVert'
import WarningIcon from '@material-ui/icons/Warning'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useSelectionOfLazyResult } from '../../js/model/LazyQueryResult/hooks'
import Extensions from '../../extension-points'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckIcon from '@material-ui/icons/Check'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { Elevations } from '../theme/theme'
import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple'
import { clearSelection, hasSelection } from './result-item-row'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks'
import Skeleton from '@material-ui/lab/Skeleton'

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

// @ts-ignore ts-migrate(6133) FIXME: 'MultiSelectActions' is declared but its value is ... Remove this comment to see the full error message
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
      popperProps={{
        disablePortal: true,
      }}
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
            <MoreIcon className="Mui-text-text-primary" />
          </Button>
        )
      }}
    </Dropdown>
  )
}

const DynamicActions = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const triggerDownload = (e: any) => {
    e.stopPropagation()
    window.open(lazyResult.plain.metacard.properties['resource-download-url'])
  }
  return (
    <Grid container direction="row" wrap="nowrap" alignItems="center">
      <Grid item className="h-full">
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
      <Grid item className="h-full">
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
      <Grid item className="h-full">
        {lazyResult.plain.metacard.properties['ext.link'] ? (
          <Button
            title={lazyResult.plain.metacard.properties['ext.link']}
            onClick={e => {
              e.stopPropagation()
              window.open(lazyResult.plain.metacard.properties['ext.link'])
            }}
            style={{ height: '100%' }}
            size="small"
          >
            <LinkIcon />
          </Button>
        ) : null}
      </Grid>
      <Grid item className="h-full">
        {lazyResult.isDownloadable() ? (
          <Button
            data-id="download-button"
            onClick={e => {
              e.stopPropagation()
              triggerDownload(e)
            }}
            style={{ height: '100%' }}
            size="small"
          >
            <GetAppIcon />
          </Button>
        ) : null}
      </Grid>
      <Extensions.resultItemTitleAddOn lazyResult={lazyResult} />
      <Grid item className="h-full">
        <Dropdown
          popperProps={{
            disablePortal: true,
          }}
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
              <Button
                data-id="result-item-more-vert-button"
                onClick={e => {
                  e.stopPropagation()
                  handleClick(e)
                }}
                style={{ height: '100%' }}
                size="small"
              >
                <MoreIcon />
              </Button>
            )
          }}
        </Dropdown>
      </Grid>
    </Grid>
  )
}

export const SelectionBackground = ({
  lazyResult,
}: {
  lazyResult: LazyQueryResult
}) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })

  return (
    <div
      className="absolute left-0 top-0 z-0 w-full h-full Mui-bg-secondary"
      style={{
        opacity: isSelected ? 0.05 : 0,
      }}
    />
  )
}

const IconButton = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })

  return (
    <Button
      data-id="select-checkbox"
      onClick={event => {
        event.stopPropagation() // this button takes precedence over the enclosing button, and is always additive / subtractive (no deselect of other results)
        if (event.shiftKey) {
          lazyResult.shiftSelect()
        } else {
          lazyResult.controlSelect()
        }
      }}
      focusVisibleClassName="focus-visible"
      className="relative p-2 min-w-0 outline-none h-full group-1"
    >
      {(() => {
        if (isSelected) {
          return (
            <>
              <div
                className={`absolute w-full h-full left-0 top-0 opacity-0 transform transition duration-200 ease-in-out -translate-x-full`}
              >
                <CheckBoxIcon className="group-1-hover:block group-1-focus-visible:block hidden" />
                <CheckIcon className="group-1-hover:hidden group-1-focus-visible:hidden block" />
              </div>
              <div
                className={`transform transition duration-200 ease-in-out -translate-x-full group-1-focus-visible:translate-x-0 group-1-hover:translate-x-0`}
              >
                <CheckBoxIcon className="group-1-hover:block group-1-focus-visible:block hidden" />
                <CheckIcon className="group-1-hover:hidden group-1-focus-visible:hidden block" />
              </div>
            </>
          )
        } else if (!isSelected) {
          return (
            <div className="transform ">
              <CheckBoxOutlineBlankIcon
                className={`group-1-hover:visible group-1-focus-visible:visible invisible`}
              />
            </div>
          )
        }
        return null
      })()}
      <span
        className={`${getIconClassName({
          lazyResult,
        })} font-awesome-span group-1-focus-visible:invisible group-1-hover:invisible absolute z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
        data-help={TypedMetacardDefs.getAlias({
          attr: 'title',
        })}
        title={`${TypedMetacardDefs.getAlias({
          attr: 'title',
        })}: ${lazyResult.plain.metacard.properties.title}`}
      />
    </Button>
  )
}

// factored out for easy debugging (can add bg-gray-400 to see trail)
const diagonalHoverClasses =
  'absolute z-50 right-0 bottom-100 h-4 transform scale-0 group-hover:scale-100 transition-all absolute z-50 right-0 bottom-100'

// fake event to pass ripple.stop
const fakeEvent = {
  type: '',
} as any

export const ResultItem = ({
  lazyResult,
  measure,
  // @ts-ignore ts-migrate(6133) FIXME: 'index' is declared but its value is never read.
  index,
}: ResultItemFullProps) => {
  // console.log(`rendered: ${index}`)
  const rippleRef = React.useRef<{
    pulsate: () => void
    stop: (e: any) => void
    start: (e: any) => void
  }>(null)
  const [isGallery, setIsGallery] = React.useState(checkResultDisplayType())
  const renderThumbnail =
    isGallery && lazyResult.plain.metacard.properties.thumbnail
  const { listenTo } = useBackbone()
  const [renderExtras, setRenderExtras] = React.useState(false)
  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:resultDisplay',
      () => {
        setIsGallery(checkResultDisplayType())
      }
    )
  }, [])

  React.useEffect(
    () => {
      // only measure immediately after render if no thumbnail is loading, otherwise let it do the measure
      if (!renderThumbnail) {
        measure()
      }
    },
    [renderThumbnail]
  )

  const customDetails = getCustomDetails({ lazyResult })

  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const imgsrc = Common.getImageSrc(thumbnail)

  const ResultItemAddOnInstance = Extensions.resultItemRowAddOn({ lazyResult })
  const shouldShowRelevance = showRelevanceScore({ lazyResult })
  const shouldShowSource = showSource()
  return (
    <button
      data-id="result-item-container-button"
      onMouseDown={(event: any) => {
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
      onClick={(event: any) => {
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
      onMouseLeave={() => {
        try {
          // @ts-ignore ts-migrate(2339) FIXME: Property 'blur' does not exist on type 'Element'.
          if (document.activeElement) document.activeElement.blur()
        } catch (err) {
          console.log(err)
        }
      }}
      onMouseEnter={() => {
        // dynamic actions are a significant part of rendering time, so delay until necessary
        setRenderExtras(true)
      }}
      onFocus={(e: any) => {
        if (e.target === e.currentTarget && rippleRef.current) {
          rippleRef.current.pulsate()
        }
      }}
      onBlur={(e: any) => {
        if (rippleRef.current) {
          rippleRef.current.stop(e)
        }
      }}
      className={`select-text outline-none px-6 p-2 text-left break-words group w-full`}
    >
      <div className="w-full">
        <TouchRipple ref={rippleRef} />
        <SelectionBackground lazyResult={lazyResult} />
        <div className="w-full relative z-0">
          <div className="w-full flex items-center">
            <IconButton lazyResult={lazyResult} />
            <div data-id="result-item-title-label" className="">
              {lazyResult.highlights['title'] ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: lazyResult.highlights['title'][0].highlight,
                  }}
                />
              ) : (
                lazyResult.plain.metacard.properties.title
              )}
            </div>
          </div>
          <div
            className={`pl-3 ${
              ResultItemAddOnInstance !== null ||
              renderThumbnail ||
              customDetails.length > 0 ||
              shouldShowRelevance ||
              shouldShowSource
                ? 'pb-2'
                : ''
            }`}
          >
            <div>{ResultItemAddOnInstance}</div>
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
                    <span>
                      {/* It's okay to use the first one here since we only ever want to display one, normally you'd want to map over this list */}
                      {lazyResult.highlights[detail.label] ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              lazyResult.highlights[detail.label][0].highlight,
                          }}
                        />
                      ) : (
                        detail.value
                      )}
                    </span>
                  </PropertyComponent>
                )
              })}
              {Object.keys(lazyResult.highlights)
                .filter(
                  attr =>
                    attr !== 'title' &&
                    !customDetails.find(
                      customDetail => customDetail.label === attr
                    )
                )
                .map(extraHighlight => {
                  const relevantHighlight =
                    lazyResult.highlights[extraHighlight][0]
                  return (
                    <PropertyComponent
                      key={relevantHighlight.attribute}
                      data-help={TypedMetacardDefs.getAlias({
                        attr: relevantHighlight.attribute,
                      })}
                    >
                      <Tooltip title={relevantHighlight.attribute}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: relevantHighlight.highlight,
                          }}
                        />
                      </Tooltip>
                    </PropertyComponent>
                  )
                })}
              {shouldShowRelevance ? (
                <PropertyComponent
                  data-help={`Relevance: ${lazyResult.plain.relevance}`}
                  title={`Relevance: ${lazyResult.plain.relevance}`}
                >
                  <span>{lazyResult.getRoundedRelevance()}</span>
                </PropertyComponent>
              ) : (
                ''
              )}
              {shouldShowSource ? (
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
        {renderExtras ? (
          <>
            {' '}
            {/* trick to keep the dropdown visible over an arc of the cursor, so users have some leeway if going diagonal to the actions dropdowns **/}
            <div
              className={`${diagonalHoverClasses} w-full transform translate-y-1`}
            />
            <div
              className={`${diagonalHoverClasses} w-9/12 transform translate-y-2 `}
            />
            <div
              className={`${diagonalHoverClasses} w-6/12 transform translate-y-3`}
            />
            <div
              className={`${diagonalHoverClasses} w-5/12 transform translate-y-4`}
            />
            <div
              className={`${diagonalHoverClasses} w-4/12 transform translate-y-5`}
            />
            <div
              className={`${diagonalHoverClasses} w-3/12 transform translate-y-6`}
            />
            <div
              className={`${diagonalHoverClasses} w-2/12 transform translate-y-8`}
            />
            <div
              className={`absolute z-50 right-0 bottom-0 focus-within:opacity-100 group-hover:opacity-100 hover:opacity-100 opacity-0 cursor-auto transform translate-y-3/4 scale-0 group-hover:scale-100 focus-within:scale-100 transition-all`}
            >
              <Paper
                onClick={e => {
                  e.stopPropagation()
                }}
                elevation={Elevations.overlays}
                className="p-2"
              >
                <DynamicActions lazyResult={lazyResult} />
              </Paper>
            </div>
          </>
        ) : null}
      </div>
    </button>
  )
}

export default hot(module)(ResultItem)
