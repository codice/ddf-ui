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
import IconHelper from '../../../js/IconHelper'
import user from '../../singletons/user-instance'
import Button from '@mui/material/Button'

import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import MoreIcon from '@mui/icons-material/MoreVert'
import WarningIcon from '@mui/icons-material/Warning'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import {
  useRerenderOnBackboneSync,
  useSelectionOfLazyResult,
} from '../../../js/model/LazyQueryResult/hooks'
import Extensions from '../../../extension-points'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckIcon from '@mui/icons-material/Check'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { Elevations } from '../../theme/theme'
import TouchRipple from '@mui/material/ButtonBase/TouchRipple'
import { clearSelection, hasSelection } from './result-item-row'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { TypedUserInstance } from '../../singletons/TypedUser'
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat'
import EditIcon from '@mui/icons-material/Edit'
import { Link } from '../../link/link'
import { useMenuState } from '../../menu-state/menu-state'
import Popover from '@mui/material/Popover'
import Common from '../../../js/Common'
import ExtensionPoints from '../../../extension-points/extension-points'
import { StartupDataStore } from '../../../js/model/Startup/startup'
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks'
import wreqr from '../../../js/wreqr'
import { LayoutContext } from '../../golden-layout/visual-settings.provider'
import {
  RESULTS_ATTRIBUTES_LIST,
  getDefaultResultsShownList,
} from '../settings-helpers'
import { Grid2 } from '@mui/material'
import { LinkButton } from '../../button/link-button'
import { DownloadButton } from '../../button/download-button'

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
/**
 * Defines the basic properties for a ResultItem component.
 * 
 * @property lazyResults - An array of LazyQueryResult objects representing multiple query results.
 * @property lazyResult - A single LazyQueryResult object representing an individual result.
 * @property selectionInterface - An object providing selection functionality for results.
 */
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
    StartupDataStore.Configuration.getResultShow().find(
      (additionalProperty: string) => {
        return additionalProperty === 'source-id'
      }
    ) !== undefined
  )
}
const showRelevanceScore = ({
  lazyResult,
}: {
  lazyResult: ResultItemBasicProps['lazyResult']
}) => {
  return (
    StartupDataStore.Configuration.getShowRelevanceScores() &&
    lazyResult.hasRelevance()
  )
}
export const getIconClassName = ({
  lazyResult,
}: {
  lazyResult: LazyQueryResult
}) => {
  if (lazyResult.isRevision()) {
    return 'fa fa-history'
  } else if (lazyResult.isResource()) {
    return IconHelper.getClassByMetacardObject(lazyResult.plain)
  } else if (lazyResult.isDeleted()) {
    return 'fa fa-trash'
  }
  return IconHelper.getClassByMetacardObject(lazyResult.plain)
}

/**
 * A React component that provides multi-select actions for managing a collection of selected results.
 *
 * @param {Object} props - The component properties.
 * @param {any} props.selectionInterface - An interface for managing the selection of results.
 *
 * The component displays the number of selected results and provides access
 * to actions for the selected items via a contextual menu.
 * 
 * - Disables actions if no results are selected.
 * - Allows interaction with selected results through a popover menu.
 * - Uses `LazyMetacardInteractions` to display actions for the selected results.
 */
// @ts-ignore
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
        component="div"
        className={selectedResultsArray.length === 0 ? 'relative' : 'relative'}
        color="primary"
        disabled={selectedResultsArray.length === 0}
        onClick={(e) => {
          e.stopPropagation()
          metacardInteractionMenuState.handleClick()
        }}
        ref={metacardInteractionMenuState.anchorRef}
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
/**
 * A CSS class string for setting the height of a component to fill its container.
 * Used to ensure consistent full-height styling across dynamic action elements.
 */
const dynamicActionClasses = 'h-full'

const HorizontalFixedActions = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  return (
    <Grid2 container direction="row" wrap="nowrap" data-id="row-actions-container">
        <LinkButton lazyResult={lazyResult} />
        <DownloadButton lazyResult={lazyResult} />
        <Grid2 className="h-full">
          <Button
            component="div"
            data-id="result-item-more-vert-button"
            style={{ height: '100%' }}
            size="small"
          >
            <MoreIcon />
          </Button>
        </Grid2>
      </Grid2>
  )
}

/**
 * A component that displays a set of dynamic action buttons for a given result (lazyResult).
 * Includes options for more actions, download, validation errors/warnings, external links, and editing search results.
 * 
 * - Utilizes a popover menu for extended interactions through `LazyMetacardInteractions`.
 * - Displays visual indicators for validation errors or warnings.
 * - Provides buttons for result-specific actions such as opening external links, downloading resources,
 *   and editing search-based results.
 * 
 * Props:
 * - `lazyResult` (LazyQueryResult): The result object for which actions are displayed.
 */
const VerticalDynamicActions = ({ lazyResult }: { lazyResult: LazyQueryResult }) => {
  const metacardInteractionMenuState = useMenuState()
  return (
    <Grid2 container direction="column" wrap="nowrap" alignItems="center" data-id="column-actions-container">
      <Grid2 className="h-full">
        <Button
          component="div"
          data-id="result-item-more-vert-button"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation()
            metacardInteractionMenuState.handleClick()
          }}
          style={{ height: '100%' }}
          size="small"
          ref={metacardInteractionMenuState.anchorRef}
        >
          <MoreIcon />
        </Button>
        <Popover
          {...metacardInteractionMenuState.MuiPopoverProps}
          keepMounted={true}
        >
          <Paper>
            <LazyMetacardInteractions
              lazyResults={[lazyResult]}
              onClose={metacardInteractionMenuState.handleClose}
            />
          </Paper>
        </Popover>
      </Grid2>
      <Grid2 className={dynamicActionClasses}>
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
      </Grid2>
      <Grid2 className={dynamicActionClasses}>
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
      </Grid2>
      <LinkButton lazyResult={lazyResult} />
      <DownloadButton lazyResult={lazyResult} />
      <Extensions.resultItemTitleAddOn lazyResult={lazyResult} />
      <Grid2 className={dynamicActionClasses}>
        {lazyResult.isSearch() ? (
          <Button
            component={Link}
            data-id="edit-button"
            to={`/search/${lazyResult.plain.id}`}
            style={{ height: '100%' }}
            size="small"
          >
            <EditIcon />
          </Button>
        ) : null}
      </Grid2>
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
    </Grid2>
  )
}
export const SelectionBackground = ({
  lazyResult,
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
      }}
    />
  )
}
const IconButton = ({
  lazyResult,
  selectionInterface,
  itemContentRef,
}: {
  lazyResult: LazyQueryResult
  selectionInterface: any
  itemContentRef: React.RefObject<HTMLElement | null>
}) => {
  const MetacardDefinitions = useMetacardDefinitions()
  const isSelected = useSelectionOfLazyResult({ lazyResult })
  const ResultItemAction = ExtensionPoints.resultItemAction({
    lazyResult,
    selectionInterface,
    itemContentRef,
    className:
      'scale-0 absolute z-10 left-0 -translate-x-full ml-[3px] group-hover:scale-100 transition pt-1',
  })
  const extraClasses = ResultItemAction
    ? 'group-hover:scale-50 group-hover:-translate-x-[85%]'
    : ''
  return (
    <>
      {ResultItemAction && (
        <ResultItemAction
          lazyResult={lazyResult}
          selectionInterface={selectionInterface}
          itemContentRef={itemContentRef}
        />
      )}
      <Button
        component="div"
        data-id="select-checkbox"
        onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          event.stopPropagation() // this button takes precedence over the enclosing button, and is always additive / subtractive (no deselect of other results)
          if (event.shiftKey) {
            lazyResult.shiftSelect()
          } else {
            lazyResult.controlSelect()
          }
        }}
        focusVisibleClassName="focus-visible"
        className="relative p-2 min-w-0 outline-none h-full group/checkbox shrink-0"
      >
        {(() => {
          if (isSelected) {
            return (
              <>
                <div
                  className={`${extraClasses} absolute w-full h-full left-0 top-0 opacity-0 transform transition duration-200 ease-in-out -translate-x-full group-hover/checkbox:scale-100`}
                >
                  <CheckBoxIcon className="group-hover/checkbox:block group-focus-visible/checkbox:block hidden" />
                  <CheckIcon className="group-hover/checkbox:hidden group-focus-visible/checkbox:hidden block" />
                </div>
                <div
                  className={`${extraClasses} transform transition duration-200 ease-in-out -translate-x-full group-focus-visible/checkbox:!translate-x-0 group-hover/checkbox:!translate-x-0 group-hover/checkbox:scale-100`}
                >
                  <CheckBoxIcon className="group-hover/checkbox:block group-focus-visible/checkbox:block hidden" />
                  <CheckIcon className="group-hover/checkbox:hidden group-focus-visible/checkbox:hidden block" />
                </div>
              </>
            )
          } else if (!isSelected) {
            return (
              <div className="transform ">
                <CheckBoxOutlineBlankIcon
                  className={`group-hover/checkbox:visible group-focus-visible/checkbox:visible invisible`}
                />
              </div>
            )
          }
          return null
        })()}
        <span
          className={`${getIconClassName({
            lazyResult,
          })} font-awesome-span group-focus-visible/checkbox:invisible group-hover/checkbox:invisible absolute z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
          data-help={MetacardDefinitions.getAlias('title')}
          title={`${MetacardDefinitions.getAlias('title')}: ${
            lazyResult.plain.metacard.properties.title
          }`}
        />
      </Button>
    </>
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
  measure: originalMeasure,
  selectionInterface,
}: ResultItemFullProps) => {
  const { getValue, onStateChanged } = React.useContext(LayoutContext)
  const MetacardDefinitions = useMetacardDefinitions()
  const rippleRef = React.useRef<{
    pulsate: () => void
    stop: (e: any) => void
    start: (e: any) => void
  }>(null)
  const { listenTo } = useBackbone()
  const convertToPrecision = (value: any) => {
    return value && decimalPrecision
      ? Number(value).toFixed(decimalPrecision)
      : value
  }
  const convertToFormat = useCoordinateFormat()
  const [renderExtras, setRenderExtras] = React.useState(false) // dynamic actions are a significant part of rendering time, so delay until necessary
  const [decimalPrecision, setDecimalPrecision] = React.useState(
    TypedUserInstance.getDecimalPrecision()
  )
  const [shownAttributes, setShownAttributes] = React.useState(
    getValue(RESULTS_ATTRIBUTES_LIST, getDefaultResultsShownList()) as string[]
  )
  useRerenderOnBackboneSync({ lazyResult })

  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:decimalPrecision',
      () => {
        setDecimalPrecision(TypedUserInstance.getDecimalPrecision())
      }
    )
    onStateChanged(() => {
      const shownList = getValue(
        RESULTS_ATTRIBUTES_LIST,
        getDefaultResultsShownList()
      )
      setShownAttributes(shownList)
    })
  }, [])

  /**
   * Unfocused (hidden) tab sets the container height to 0
   * Run the measure function when the height is 0 could cause items inside the tab to be unreadable
   */
  const measure = () => {
    if (
      buttonRef.current?.clientHeight &&
      buttonRef.current?.clientHeight > 0
    ) {
      originalMeasure()
    }
  }
  React.useEffect(() => {
    measure()
  }, [shownAttributes, convertToFormat])
  listenTo(wreqr.vent, 'activeContentItemChanged', () => {
    measure()
  })
  const thumbnail = lazyResult.plain.metacard.properties.thumbnail
  const imgsrc = Common.getImageSrc(thumbnail)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const itemContentRef = React.useRef<HTMLDivElement>(null)

  const ResultItemAddOnInstance = Extensions.resultItemRowAddOn({
    lazyResult,
    isTableView: false,
  })
  const ResultTitleIconAddOnInstance = Extensions.resultTitleIconAddOn({
    lazyResult,
  })

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
    if (value && MetacardDefinitions.getAttributeMap()[detail]) {
      switch (MetacardDefinitions.getAttributeMap()[detail].type) {
        case 'DATE':
          if (Array.isArray(value)) {
            value = value.map((val: any) =>
              TypedUserInstance.getMomentDate(val)
            )
          } else {
            value = TypedUserInstance.getMomentDate(value)
          }
          break
        case 'GEOMETRY':
          if (value.constructor === Array) {
            value = value.map((val: any) => convertToFormat(val))
          } else {
            value = convertToFormat(value)
          }
          break
        case 'LONG':
        case 'DOUBLE':
        case 'FLOAT':
          if (value.constructor === Array) {
            value = value.map((val: any) => convertToPrecision(val))
          } else {
            value = convertToPrecision(value)
          }
          break
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
          setRenderExtras(false)
          if (
            document.activeElement &&
            buttonRef.current &&
            buttonRef.current.contains(document.activeElement)
          ) {
            ;(document.activeElement as any).blur()
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
        <div className="w-full relative z-0" ref={itemContentRef}>
          <div className="w-full flex items-start">
            <IconButton
              lazyResult={lazyResult}
              selectionInterface={selectionInterface}
              itemContentRef={itemContentRef}
            />
            {ResultTitleIconAddOnInstance && (
              <div className="pt-2 pr-1">{ResultTitleIconAddOnInstance}</div>
            )}
            <div
              data-id={`result-item-${shownAttributes[0]}-label`}
              title={`${MetacardDefinitions.getAlias(shownAttributes[0])}`}
              className="shrink-1 w-full overflow-auto self-center"
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
                      key={detail.attribute}
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
                    data-help={MetacardDefinitions.getAlias(detail.attribute)}
                    title={`${MetacardDefinitions.getAlias(
                      detail.attribute
                    )}: ${detail.value}`}
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
                    data-help={MetacardDefinitions.getAlias(
                      relevantHighlight.attribute
                    )}
                  >
                    <Tooltip
                      title={MetacardDefinitions.getAlias(
                        relevantHighlight.attribute
                      )}
                    >
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
                  title={`${MetacardDefinitions.getAlias('source-id')}: ${
                    lazyResult.plain.metacard.properties['source-id']
                  }`}
                  data-help={MetacardDefinitions.getAlias('source-id')}
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
      {renderExtras ? 
        null :
        (
          <>
            {' '}
            <div
              className={`absolute z-40 
                group-hover:z-50 
                focus-within:z-50 
                right-0 
                top-0 
                focus-within:opacity-100 
                group-hover:opacity-100 
                hover:opacity-100 
                opacity-100 
                cursor-auto transform 
                focus-within:scale-100 
                transition-all 
                hover:scale-100 
                ease-in-out 
                duration-200 
                hover:translate-x-0 
                hover:scale-x-100`}
            >
              <Paper
                onClick={(e) => {
                  e.stopPropagation()
                }}
                elevation={Elevations.overlays}
                className="p-2"
              >
                <HorizontalFixedActions lazyResult={lazyResult} />
              </Paper>
            </div>
          </>
        ) 
      }
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
            className={`absolute z-40 
              group-hover:z-50 
              focus-within:z-50 
              right-0 
              top-0 
              focus-within:opacity-100 
              group-hover:opacity-100 
              hover:opacity-100 
              opacity-0 
              cursor-auto transform 
              focus-within:scale-100 
              transition-all 
              hover:scale-100 
              ease-in-out 
              duration-200 
              hover:translate-x-0 
              hover:scale-x-100`}
          >
            <Paper
              onClick={(e) => {
                e.stopPropagation()
              }}
              elevation={Elevations.overlays}
              className="p-2"
            >
              <VerticalDynamicActions lazyResult={lazyResult} />
            </Paper>
          </div>
        </>
        ) : null}
      </div>
    </button>
  )
}
export default ResultItem
