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

import Button from '@mui/material/Button'
import * as React from 'react'

import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { getIconClassName } from '../results-visual/result-item'
import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useMenuState } from '../../menu-state/menu-state'
import Popover from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import { Elevations } from '../../theme/theme'
import OverflowTooltip from '../../overflow-tooltip/overflow-tooltip'
import Tabs from '@mui/material/Tabs'
import MaterialTab from '@mui/material/Tab'
import MetacardTabs, { TabNames } from '../../tabs/metacard/tabs-metacard'
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks'
import Extensions from '../../../extension-points'
import { LinkButton } from '../../button/link-button'
import { DownloadButton } from '../../button/download-button'

type InspectorType = {
  selectionInterface: any
}

const useSelectedResultsArrayFromSelectionInterface = ({
  selectionInterface,
}: InspectorType) => {
  const [selectedResultsArray, setSelectedResultsArray] = React.useState(
    [] as LazyQueryResult[]
  )
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  React.useEffect(() => {
    setSelectedResultsArray(Object.values(selectedResults))
  }, [selectedResults])
  return selectedResultsArray
}

type TitleViewType = {
  lazyResult: LazyQueryResult
}

export const TitleView = ({ lazyResult }: TitleViewType) => {
  const menuState = useMenuState()
  useRerenderOnBackboneSync({ lazyResult })
  return (
    <div className="flex flex-row items-center justify-center flex-nowrap p-2">
      <span
        className={`${getIconClassName({ lazyResult })} font-awesome-span`}
      ></span>
      <Extensions.resultTitleIconAddOn lazyResult={lazyResult} />
      <OverflowTooltip className={'truncate'}>
        {lazyResult.plain.metacard.properties.title}
      </OverflowTooltip>
      <LinkButton lazyResult={lazyResult} />
      <DownloadButton lazyResult={lazyResult} />
      <Button {...menuState.MuiButtonProps}>
        <MoreVertIcon />
      </Button>
      <Popover {...menuState.MuiPopoverProps} keepMounted={true}>
        <Paper elevation={Elevations.overlays}>
          <LazyMetacardInteractions
            lazyResults={[lazyResult]}
            onClose={menuState.handleClose}
          />
        </Paper>
      </Popover>
    </div>
  )
}

let defaultActiveTab = 'Details'

const useLastAsDefaultActiveTab = (tabIndex: string) => {
  React.useEffect(() => {
    defaultActiveTab = tabIndex
  }, [tabIndex])
}

const useIndexForSelectedResults = (
  selectedResults: LazyQueryResult[]
): [number, (index: number) => void] => {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    setIndex(0)
  }, [selectedResults])
  return [index, setIndex]
}

const usePossibleMetacardTabs = ({ result }: { result: LazyQueryResult }) => {
  const [possibleMetacardTabs, setPossibleMetacardTabs] =
    React.useState(MetacardTabs)

  React.useEffect(() => {
    if (result) {
      let copyOfMetacardTabs = { ...MetacardTabs }
      if (result.isRevision()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Actions]
      }
      if (result.isDeleted()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Actions]
      }
      if (result.isRemote()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Quality]
      }
      if (!result.hasPreview()) {
        delete copyOfMetacardTabs[TabNames.Preview]
      }
      setPossibleMetacardTabs(copyOfMetacardTabs)
    } else {
      setPossibleMetacardTabs({})
    }
  }, [result])

  return possibleMetacardTabs
}

const useMetacardTabs = ({ result }: { result: LazyQueryResult }) => {
  const possibleMetacardTabs = usePossibleMetacardTabs({ result })
  const [activeTab, setActiveTab] = React.useState(defaultActiveTab)
  useLastAsDefaultActiveTab(activeTab)

  React.useEffect(() => {
    if (
      Object.keys(possibleMetacardTabs).length > 0 &&
      !possibleMetacardTabs[activeTab]
    ) {
      setActiveTab(TabNames.Details)
    }
  }, [possibleMetacardTabs])
  return {
    possibleMetacardTabs,
    activeTab,
    setActiveTab,
    TabContent: possibleMetacardTabs[activeTab]?.content || (() => null),
  }
}

const Inspector = ({ selectionInterface }: InspectorType) => {
  const selectedResults = useSelectedResultsArrayFromSelectionInterface({
    selectionInterface,
  })
  const [index, setIndex] = useIndexForSelectedResults(selectedResults)

  const amountSelected = selectedResults.length

  const currentResult = selectedResults[index]
  const { possibleMetacardTabs, activeTab, setActiveTab, TabContent } =
    useMetacardTabs({ result: currentResult })

  return (
    <>
      <div className="flex flex-col flex-nowrap h-full overflow-hidden">
        {amountSelected > 1 ? (
          <div className="flex flex-row items-center justify-center flex-nowrap shrink-0 grow-0">
            <Button
              onClick={() => {
                setIndex(index - 1)
              }}
              disabled={index === 0}
            >
              <KeyboardArrowLeftIcon
                color="inherit"
                className="Mui-text-text-primary Mui-icon-size-small"
              />
              <KeyboardArrowLeftIcon
                color="inherit"
                className="-ml-3 Mui-text-text-primary Mui-icon-size-small"
              />
            </Button>
            Item {index + 1} / {amountSelected}
            <Button
              onClick={() => {
                setIndex(index + 1)
              }}
              disabled={index === amountSelected - 1}
            >
              <KeyboardArrowRightIcon
                color="inherit"
                className="Mui-text-text-primary"
              />
              <KeyboardArrowRightIcon
                color="inherit"
                className="-ml-5 Mui-text-text-primary"
              />
            </Button>
          </div>
        ) : null}
        {currentResult ? (
          <>
            <TitleView lazyResult={currentResult} />
            <div className="flex flex-col flex-nowrap shrink overflow-hidden h-full">
              <Tabs
                value={activeTab}
                onChange={(_e, newValue) => {
                  setActiveTab(newValue)
                }}
                className="shrink-0 w-full"
                scrollButtons="auto"
                variant="scrollable"
              >
                {Object.entries(possibleMetacardTabs).map(
                  ([tabName, tabDefinition]) => {
                    return (
                      <MaterialTab
                        key={tabName}
                        value={tabName}
                        label={
                          tabDefinition.header?.({ result: currentResult }) ||
                          tabName
                        }
                      />
                    )
                  }
                )}
              </Tabs>

              <div className="h-full w-full shrink overflow-hidden">
                <TabContent
                  result={currentResult}
                  selectionInterface={selectionInterface}
                  key={currentResult.plain.id}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="p-2 text-center">
            Please select result(s) to display in the inspector.
          </div>
        )}
      </div>
    </>
  )
}

export default Inspector
