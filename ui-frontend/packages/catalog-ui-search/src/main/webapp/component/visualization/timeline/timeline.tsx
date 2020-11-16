import WithListenTo, {
  WithBackboneProps,
} from './../../../react-component/backbone-container'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks'
import Timeline from '../../timeline'
import { TimelineItem } from '../../timeline/timeline'
import moment, { Moment } from 'moment-timezone'
import useTimePrefs from '../../fields/useTimePrefs'

const metacardDefinitions = require('../../singletons/metacard-definitions.js')
const properties = require('../../../js/properties.js')
const IconHelper = require('../../../js/IconHelper.js')
const wreqr = require('../../../js/wreqr.js')
const announcement = require('../../announcement')
const user = require('../../singletons/user-instance')
const _ = require('lodash')

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
      currentAvailable = _.union(
        currentAvailable,
        Object.keys(result.plain.metacard.properties)
      )
      return currentAvailable
    }, [])
    .sort()

  let dateAttributes = availableAttributes.reduce(
    (list: any, attribute: any) => {
      if (metacardDefinitions.metacardTypes[attribute].type == 'DATE') {
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
  const results = timelineItems.slice(0, itemsToExpand).map((item) => {
    const data = item.data as LazyQueryResult
    const icon = IconHelper.getFullByMetacardObject(data.plain)
    const metacard = data.plain.metacard.properties
    return (
      <React.Fragment key={metacard.id}>
        <span className={icon.class} />
        &nbsp;
        <span>{metacard.title || metacard.id}</span>
        <br />
      </React.Fragment>
    )
  })

  const otherResults = (
    <React.Fragment>
      <br />
      {`+${timelineItems.length - itemsToExpand} other results`}
    </React.Fragment>
  )

  return (
    <React.Fragment>
      {results}
      {timelineItems.length > itemsToExpand && otherResults}
    </React.Fragment>
  )
}

const onCopy = (copiedValue: string) => {
  announcement.announce(
    {
      title: 'Copied to clipboard',
      message: copiedValue,
      type: 'success',
    },
    2500
  )
}

const TimelineVisualization = (props: Props) => {
  const { selectionInterface } = props
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

  React.useEffect(() => {
    props.listenTo(wreqr.vent, 'resize', () => {
      if (rootRef.current) {
        // @ts-ignore ts-migrate(2531) FIXME: Object is possibly 'null'.
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

      const resultDateAttributes: { [key: string]: Moment } = {}
      possibleDateAttributes.forEach((dateAttribute: string) => {
        resultDateAttributes[dateAttribute] = moment(
          metacard[dateAttribute]
        ) as Moment
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
      const aliasMap: { [key: string]: string } = {}
      possibleDateAttributes.forEach((dateAttribute: any) => {
        aliasMap[dateAttribute] =
          properties.attributeAliases[dateAttribute] || dateAttribute
      })

      if (!_.isEqual(aliasMap, dateAttributeAliases)) {
        setDateAttributeAliases(aliasMap)
      }
    }
  }, [results, selectedResults])

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
        onCopy={onCopy}
      />
    </TimelineWrapper>
  )
}

export default hot(module)(WithListenTo(TimelineVisualization))
