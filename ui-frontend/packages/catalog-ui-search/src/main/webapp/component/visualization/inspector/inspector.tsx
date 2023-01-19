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

import Button from '@material-ui/core/Button'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import { getIconClassName } from '../results-visual/result-item'
import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useMenuState } from '../../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../../theme/theme'
import OverflowTooltip from '../../overflow-tooltip/overflow-tooltip'
import Tabs from '@material-ui/core/Tabs'
import MaterialTab, {
  TabProps as MaterialTabProps,
} from '@material-ui/core/Tab'
import MetacardTabs, { TabNames } from '../../tabs/metacard/tabs-metacard'
import { TypedProperties } from '../../singletons/TypedProperties'
import { TypedUserInstance } from '../../singletons/TypedUser'
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks'

type TabType = Omit<MaterialTabProps, 'label'> & {
  children: MaterialTabProps['label']
}

const Tab = (props: TabType) => {
  const { children, ...otherProps } = props
  return <MaterialTab label={children} {...otherProps}></MaterialTab>
}

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
    <div className="flex flex-row items-center justify-center flex-no-wrap p-2">
      <span
        className={`${getIconClassName({ lazyResult })} font-awesome-span`}
      ></span>
      <OverflowTooltip className={'truncate'}>
        {lazyResult.plain.metacard.properties.title}
      </OverflowTooltip>
      <Button {...menuState.MuiButtonProps}>
        <MoreVertIcon />
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
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
  const [possibleMetacardTabs, setPossibleMetacardTabs] = React.useState(
    MetacardTabs
  )

  React.useEffect(() => {
    if (result) {
      let copyOfMetacardTabs = { ...MetacardTabs }
      if (result.isRevision()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Actions]
        delete copyOfMetacardTabs[TabNames.Overwrite]
        delete copyOfMetacardTabs[TabNames.Delete]
      }
      if (result.isDeleted()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Actions]
        delete copyOfMetacardTabs[TabNames.Overwrite]
      }
      if (result.isRemote()) {
        delete copyOfMetacardTabs[TabNames.History]
        delete copyOfMetacardTabs[TabNames.Overwrite]
        delete copyOfMetacardTabs[TabNames.Delete]
        delete copyOfMetacardTabs[TabNames.Quality]
      }
      if (!result.hasPreview()) {
        delete copyOfMetacardTabs[TabNames.Preview]
      }
      if (!TypedProperties.isMetacardPreviewEnabled()) {
        delete copyOfMetacardTabs[TabNames.Preview]
      }
      if (!TypedUserInstance.canWrite(result)) {
        delete copyOfMetacardTabs[TabNames.Delete]
        delete copyOfMetacardTabs[TabNames.Overwrite]
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
    TabContent: possibleMetacardTabs[activeTab] || (() => null),
  }
}

const Inspector = ({ selectionInterface }: InspectorType) => {
  const selectedResults = useSelectedResultsArrayFromSelectionInterface({
    selectionInterface,
  })
  const [index, setIndex] = useIndexForSelectedResults(selectedResults)

  const amountSelected = selectedResults.length

  const currentResult = selectedResults[index]
  const {
    possibleMetacardTabs,
    activeTab,
    setActiveTab,
    TabContent,
  } = useMetacardTabs({ result: currentResult })

  return (
    <>
      <div className="flex flex-col flex-no-wrap h-full overflow-hidden">
        {amountSelected > 1 ? (
          <div className="flex flex-row items-center justify-center flex-no-wrap flex-shrink-0 flex-grow-0">
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
            <div className="flex flex-col flex-no-wrap flex-shrink overflow-hidden h-full">
              <Tabs
                value={activeTab}
                onChange={(_e, newValue) => {
                  setActiveTab(newValue)
                }}
                className="flex-shrink-0 w-full"
                scrollButtons="auto"
                variant="scrollable"
              >
                {Object.keys(possibleMetacardTabs).map((tabName) => {
                  return (
                    <Tab key={tabName} value={tabName}>
                      {tabName}
                    </Tab>
                  )
                })}
              </Tabs>

              <div className="h-full w-full flex-shrink overflow-hidden">
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

export default hot(module)(Inspector)
