import WithListenTo, {
  WithBackboneProps,
} from './../../../react-component/backbone-container'
import * as React from 'react'

import styled from 'styled-components'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks'
import Timeline from '../../timeline'
import { TimelineItem } from '../../timeline/timeline'
import moment, { Moment } from 'moment-timezone'
import useTimePrefs from '../../fields/useTimePrefs'
import IconHelper from '../../../js/IconHelper'
import useSnack from '../../hooks/useSnack'
import wreqr from '../../../js/wreqr'
import user from '../../singletons/user-instance'
import Extensions from '../../../extension-points'
import _ from 'lodash'
import { useConfiguration } from '../../../js/model/Startup/configuration.hooks'
import { StartupDataStore } from '../../../js/model/Startup/startup'
const maxDate = moment().tz(user.getTimeZone())
type Props = {
  selectionInterface: any
} & WithBackboneProps
const TimelineWrapper = styled.div`
  padding: 40px 40px 60px 40px;
  height: 100%;

  .MuiButton-label {
    font-size: 0.875rem !important;
  }
`
const getDateAttributes = (results: any) => {
  const availableAttributes = Object.keys(results)
    .reduce((currentAvailable, key) => {
      const result = results[key]
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'string[]' is not assignable to type 'never[]... Remove this comment to see the full error message
      currentAvailable = _.union(
        currentAvailable,
        Object.keys(result.plain.metacard.properties)
      )
      return currentAvailable
    }, [])
    .sort()
  let dateAttributes = availableAttributes.reduce(
    (list: any, attribute: any) => {
      if (
        StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute]
          ?.type == 'DATE'
      ) {
        list.push(attribute)
      }
      return list
    },
    []
  )
  return dateAttributes
}
const renderTooltip = (timelineItems: TimelineItem[]) => {
  const itemsToExpand = 5
  const uniqueMetacards = timelineItems.filter(
    (item, index) => timelineItems.indexOf(item) === index
  )
  const results = uniqueMetacards.slice(0, itemsToExpand).map((item) => {
    const data = item.data as LazyQueryResult
    const icon = IconHelper.getFullByMetacardObject(data.plain)
    const metacard = data.plain.metacard.properties
    const ItemAddOn = Extensions.timelineItemAddOn({
      results: [data],
      isSingleItem: true,
    })
    const valCount = timelineItems.filter((i) => i.id === item.id).length
    return (
      <React.Fragment key={metacard.id}>
        <span className={icon.class} />
        &nbsp;
        {ItemAddOn && (
          <>
            {ItemAddOn}
            &nbsp;
          </>
        )}
        <span>{`${metacard.title || metacard.id}${
          valCount > 1 ? ` (${valCount})` : ''
        }`}</span>
        <br />
      </React.Fragment>
    )
  })

  let OtherItemsAddOn = null
  if (uniqueMetacards.length > itemsToExpand) {
    OtherItemsAddOn = Extensions.timelineItemAddOn({
      results: uniqueMetacards
        .slice(itemsToExpand)
        .map((item) => item.data as LazyQueryResult),
      isSingleItem: false,
    })
  }

  const otherResults = (
    <React.Fragment>
      <br />
      {`+${uniqueMetacards.length - itemsToExpand} other results`}
      {OtherItemsAddOn && (
        <>
          &nbsp;
          {OtherItemsAddOn}
        </>
      )}
    </React.Fragment>
  )
  return (
    <React.Fragment>
      {results}
      {uniqueMetacards.length > itemsToExpand && otherResults}
    </React.Fragment>
  )
}
const TimelineVisualization = (props: Props) => {
  const { selectionInterface } = props
  const { config } = useConfiguration()
  useTimePrefs()
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResults = useSelectedResults({
    lazyResults,
  })
  const { results } = lazyResults
  const [data, setData] = React.useState<TimelineItem[]>([])
  const [dateAttributeAliases, setDateAttributeAliases] = React.useState({})
  const [height, setHeight] = React.useState(0)
  const [pause, setPause] = React.useState(false)
  const rootRef = React.useRef(null)
  const [resized, setResized] = React.useState(false)
  const addSnack = useSnack()
  React.useEffect(() => {
    props.listenTo((wreqr as any).vent, 'resize', () => {
      if (rootRef.current) {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        const rect = rootRef.current.getBoundingClientRect()
        setHeight(rect.height)
      }
      setResized(true)
    })
  }, [])
  React.useEffect(() => {
    if (resized) {
      setResized(false)
    }
  }, [resized])
  React.useEffect(() => {
    const selectedIds = Object.values(selectedResults).map(
      (result) => result.plain.metacard.properties.id
    )
    const possibleDateAttributes = getDateAttributes(results)
    const resultData: TimelineItem[] = Object.values(results).map((result) => {
      const metacard = result.plain.metacard.properties
      const resultDateAttributes: {
        [key: string]: Moment[]
      } = {}
      possibleDateAttributes.forEach((dateAttribute: string) => {
        const val = metacard[dateAttribute]
        if (val) {
          resultDateAttributes[dateAttribute] = Array.isArray(val)
            ? val.map((v) => moment(v) as Moment)
            : [moment(val) as Moment]
        }
      })
      const id = metacard.id
      const resultDataPoint: TimelineItem = {
        id,
        selected: selectedIds.includes(id),
        data: result,
        attributes: resultDateAttributes,
      }
      return resultDataPoint
    })
    setData(resultData)
    if (Object.keys(possibleDateAttributes).length > 0) {
      const aliasMap: {
        [key: string]: string
      } = {}
      possibleDateAttributes.forEach((dateAttribute: any) => {
        aliasMap[dateAttribute] =
          config?.attributeAliases[dateAttribute] || dateAttribute
      })
      if (!_.isEqual(aliasMap, dateAttributeAliases)) {
        setDateAttributeAliases(aliasMap)
      }
    }
  }, [results, selectedResults, config])
  const onSelect = (selectedData: TimelineItem[]) => {
    const selectedIds = selectedData.map((d) => d.id)
    setPause(true)
    lazyResults.selectByIds(selectedIds)
    setPause(false)
  }
  if (pause) {
    return null
  }
  return (
    <TimelineWrapper data-id="timeline-container" ref={rootRef}>
      <Timeline
        min={moment('1975-01-01').tz(user.getTimeZone())}
        max={moment(maxDate)}
        heightOffset={250}
        onSelect={onSelect}
        data={data}
        dateAttributeAliases={dateAttributeAliases}
        renderTooltip={renderTooltip}
        format={user.getDateTimeFormat()}
        timezone={user.getTimeZone()}
        height={height}
        onCopy={(copiedValue) => {
          addSnack('Copied to clipboard: ' + copiedValue, {
            alertProps: {
              severity: 'success',
            },
          })
        }}
      />
    </TimelineWrapper>
  )
}
export default WithListenTo(TimelineVisualization)
