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

import Button from '@material-ui/core/Button'
import LinkIcon from '@material-ui/icons/Link'
import GetAppIcon from '@material-ui/icons/GetApp'
import Grid from '@material-ui/core/Grid'
const Common = require('../../js/Common.js')
import { hot } from 'react-hot-loader'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import MoreIcon from '@material-ui/icons/MoreVert'
import WarningIcon from '@material-ui/icons/Warning'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import {
  useRerenderOnBackboneSync,
  useSelectionOfLazyResult,
} from '../../js/model/LazyQueryResult/hooks'
import Extensions from '../../extension-points'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckIcon from '@material-ui/icons/Check'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { Elevations } from '../theme/theme'
import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple'
import { clearSelection, hasSelection } from './result-item-row'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks'
import { TypedUserInstance } from '../singletons/TypedUser'
import useCoordinateFormat from '../tabs/metacard/useCoordinateFormat'
import EditIcon from '@material-ui/icons/Edit'
import { Link } from '../link/link'
import { useMenuState } from '../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'

const PropertyComponent = (props: React.AllHTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className="overflow-auto"
      style={{
        marginTop: '10px',
        opacity: '.7',
        maxHeight: '200px',
        minHeight: '21px', // firefox will show scroll bars all the time unless we do this minHeight :S
      }}
    />
  )
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
  return IconHelper.getClassByMetacardObject(lazyResult.plain)
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
  const metacardInteractionMenuState = useMenuState()

  return (
    <>
      <Button
        className={selectedResultsArray.length === 0 ? 'relative' : 'relative'}
        color="primary"
        disabled={selectedResultsArray.length === 0}
        onClick={(e) => {
          e.stopPropagation()
          metacardInteractionMenuState.handleClick()
        }}
        innerRef={metacardInteractionMenuState.anchorRef}
        style={{ height: '100%' }}
        size="small"
      >
        {selectedResultsArray.length} selected
        <MoreIcon className="Mui-text-text-primary" />
      </Button>
      <Popover {...metacardInteractionMenuState.MuiPopoverProps}>
        <Paper>
          <LazyMetacardInteractions
            lazyResults={selectedResultsArray}
            onClose={metacardInteractionMenuState.handleClose}
          />
        </Paper>
      </Popover>
    </>
  )
}

const dynamicActionClasses = 'h-full'
const DynamicActions = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const triggerDownload = (e: any) => {
    e.stopPropagation()
    window.open(lazyResult.plain.metacard.properties['resource-download-url'])
  }
  const metacardInteractionMenuState = useMenuState()

  return (
    <Grid container direction="column" wrap="nowrap" alignItems="center">
      <Grid item className="h-full">
        <Button
          data-id="result-item-more-vert-button"
          onClick={(e) => {
            e.stopPropagation()
            metacardInteractionMenuState.handleClick()
          }}
          style={{ height: '100%' }}
          size="small"
          innerRef={metacardInteractionMenuState.anchorRef}
        >
          <MoreIcon />
        </Button>
        <Popover {...metacardInteractionMenuState.MuiPopoverProps}>
          <Paper>
            <LazyMetacardInteractions
              lazyResults={[lazyResult]}
              onClose={metacardInteractionMenuState.handleClose}
            />
          </Paper>
        </Popover>
      </Grid>
      <Grid item className={dynamicActionClasses}>
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
      <Grid item className={dynamicActionClasses}>
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
      <Grid item className={dynamicActionClasses}>
        {lazyResult.plain.metacard.properties['ext.link'] ? (
          <Button
            title={lazyResult.plain.metacard.properties['ext.link']}
            onClick={(e) => {
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
      <Grid item className={dynamicActionClasses}>
        {lazyResult.isDownloadable() ? (
          <Button
            data-id="download-button"
            onClick={(e) => {
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
      <Grid item className={dynamicActionClasses}>
        {lazyResult.isSearch() ? (
          <Link
            component={Button}
            data-id="edit-button"
            to={`/search/${lazyResult.plain.id}`}
            style={{ height: '100%' }}
          >
            <EditIcon />
          </Link>
        ) : null}
      </Grid>
      {/** add inline editing later */}
      {/* <Grid item className="h-full">
         {lazyResult.isSearch() ? (
           <Button
             data-id="edit-button"
             onClick={(e) => {
               setEdit(lazyResult)
             }}
             style={{ height: '100%' }}
             size="small"
           >
             <EditIcon />
           </Button>
         ) : null}
       </Grid> */}
    </Grid>
  )
}

export const SelectionBackground = ({
  lazyResult,
  style,
}: {
  lazyResult: LazyQueryResult
  style?: React.CSSProperties
}) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })

  return (
    <div
      className="absolute left-0 top-0 z-0 w-full h-full Mui-bg-secondary"
      style={{
        opacity: isSelected ? 0.05 : 0,
        ...style,
      }}
    />
  )
}

const IconButton = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const isSelected = useSelectionOfLazyResult({ lazyResult })

  return (
    <Button
      data-id="select-checkbox"
      onClick={(event) => {
        event.stopPropagation() // this button takes precedence over the enclosing button, and is always additive / subtractive (no deselect of other results)
        if (event.shiftKey) {
          lazyResult.shiftSelect()
        } else {
          lazyResult.controlSelect()
        }
      }}
      focusVisibleClassName="focus-visible"
      className="relative p-2 min-w-0 outline-none h-full group-1 flex-shrink-0"
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

export const ResultItem = ({ lazyResult, measure }: ResultItemFullProps) => {
  const rippleRef = React.useRef<{
    pulsate: () => void
    stop: (e: any) => void
    start: (e: any) => void
  }>(null)
  const { listenTo } = useBackbone()
  const convertToFormat = useCoordinateFormat()
  const [renderExtras, setRenderExtras] = React.useState(false) // dynamic actions are a significant part of rendering time, so delay until necessary
  const [shownAttributes, setShownAttributes] = React.useState(
    TypedUserInstance.getResultsAttributesShownList()
  )
  useRerenderOnBackboneSync({ lazyResult })

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:results-attributesShownList',
      () => {
        setShownAttributes(TypedUserInstance.getResultsAttributesShownList())
      }
    )
  }, [])

  React.useEffect(() => {
    measure()
  }, [shownAttributes, convertToFormat])

  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const imgsrc = Common.getImageSrc(thumbnail)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const ResultItemAddOnInstance = Extensions.resultItemRowAddOn({ lazyResult })
  const shouldShowRelevance = showRelevanceScore({ lazyResult })
  const shouldShowSource = showSource()
  const extraHighlights = Object.keys(lazyResult.highlights).filter(
    (attr) => !shownAttributes.find((shownAttribute) => shownAttribute === attr)
  )

  const getDisplayValue = ({
    detail,
    lazyResult,
  }: {
    detail: string
    lazyResult: LazyQueryResult
  }) => {
    let value = lazyResult.plain.metacard.properties[detail]
    if (value && metacardDefinitions.metacardTypes[detail]) {
      switch (metacardDefinitions.metacardTypes[detail].type) {
        case 'DATE':
          if (value.constructor === Array) {
            value = value.map((val: any) => Common.getMomentDate(val))
          } else {
            value = Common.getMomentDate(value)
          }
          break
        case 'GEOMETRY':
          value = convertToFormat(value)
      }
    }

    if (Array.isArray(value)) {
      value = value.join(', ')
    }

    return value
  }

  const detailsMap = shownAttributes
    .slice(1) // remove top one since that's special
    .map((detail) => {
      return {
        attribute: detail,
        value: getDisplayValue({ detail, lazyResult }),
      }
    })
    .filter((detail) => {
      // this is special and is handled differently, see show source
      if (detail.attribute === 'source-id') {
        return false
      }
      return detail.value
    })
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
        /**
         * This is to prevent weirdness with the dynamic actions, where clicking a menu option there adds focus,
         * thus making the dynamic actions stay visible when the user starts to mouse away.
         */
        try {
          if (
            document.activeElement &&
            buttonRef.current &&
            buttonRef.current.contains(document.activeElement)
          ) {
            // @ts-ignore ts-migrate(2339) FIXME: Property 'blur' does not exist on type 'Element'.
            document.activeElement.blur()
          }
        } catch (err) {
          console.error(err)
        }
      }}
      onMouseEnter={() => {
        setRenderExtras(true)
      }}
      onFocus={(e: any) => {
        setRenderExtras(true)
        if (e.target === e.currentTarget && rippleRef.current) {
          rippleRef.current.pulsate()
        }
      }}
      onBlur={(e: any) => {
        if (rippleRef.current) {
          rippleRef.current.stop(e)
        }
      }}
      ref={buttonRef}
      className={`select-text outline-none px-6 pr-12 p-2 text-left break-words group w-full Mui-bg-button`}
    >
      <div className="w-full">
        <TouchRipple ref={rippleRef} />
        <SelectionBackground lazyResult={lazyResult} />
        <div className="w-full relative z-0">
          <div className="w-full flex items-start">
            <IconButton lazyResult={lazyResult} />
            <div
              data-id={`result-item-${shownAttributes[0]}-label`}
              title={`${TypedMetacardDefs.getAlias({
                attr: shownAttributes[0],
              })}`}
              className="flex-shrink-1 w-full overflow-auto self-center"
              style={{ maxHeight: '200px', minHeight: '21px' }} // firefox will show scrollbars always without this minHeight :S
            >
              {shownAttributes[0] === 'thumbnail' && thumbnail ? (
                <img
                  data-id="result-item-thumbnail"
                  src={imgsrc}
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  onLoad={() => {
                    measure()
                  }}
                  onError={() => {
                    measure()
                  }}
                />
              ) : lazyResult.highlights[shownAttributes[0]] ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      lazyResult.highlights[shownAttributes[0]][0].highlight,
                  }}
                />
              ) : (
                getDisplayValue({ detail: shownAttributes[0], lazyResult })
              )}
            </div>
          </div>
          <div
            className={`pl-3 ${
              ResultItemAddOnInstance !== null ||
              detailsMap.length > 0 ||
              extraHighlights.length > 0 ||
              shouldShowRelevance ||
              shouldShowSource
                ? 'pb-2'
                : ''
            }`}
          >
            <div>{ResultItemAddOnInstance}</div>
            <div>
              {detailsMap.map((detail) => {
                if (detail.attribute === 'thumbnail') {
                  return (
                    <img
                      data-id="result-item-thumbnail"
                      src={imgsrc}
                      style={{
                        marginTop: '10px',
                        maxWidth: '100%',
                        maxHeight: '200px',
                      }}
                      onLoad={() => {
                        measure()
                      }}
                      onError={() => {
                        measure()
                      }}
                    />
                  )
                }
                return (
                  <PropertyComponent
                    key={detail.attribute}
                    data-help={TypedMetacardDefs.getAlias({
                      attr: detail.attribute,
                    })}
                    title={`${TypedMetacardDefs.getAlias({
                      attr: detail.attribute,
                    })}: ${detail.value}`}
                  >
                    <span>
                      {/* It's okay to use the first one here since we only ever want to display one, normally you'd want to map over this list */}
                      {lazyResult.highlights[detail.attribute] ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              lazyResult.highlights[detail.attribute][0]
                                .highlight,
                          }}
                        />
                      ) : (
                        getDisplayValue({
                          detail: detail.attribute,
                          lazyResult,
                        })
                      )}
                    </span>
                  </PropertyComponent>
                )
              })}
              {extraHighlights.map((extraHighlight) => {
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
              className={`absolute z-40 group-hover:z-50 focus-within:z-50 right-0 top-0 focus-within:opacity-100 group-hover:opacity-100 hover:opacity-100 opacity-0 cursor-auto transform focus-within:scale-100 transition-all hover:scale-100 ease-in-out duration-200 hover:translate-x-0 hover:scale-x-100`}
            >
              <Paper
                onClick={(e) => {
                  e.stopPropagation()
                }}
                elevation={Elevations.overlays}
                className="p-2 group-1"
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
