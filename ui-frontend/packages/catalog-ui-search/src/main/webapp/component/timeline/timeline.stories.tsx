import * as React from 'react'
import { useState } from 'react'
import { action } from '@connexta/ace/@storybook/addon-actions'
import { select, number, date } from '@connexta/ace/@storybook/addon-knobs'
import { storiesOf } from '@connexta/ace/@storybook/react'
import Timeline from './index'
import styled from 'styled-components'
import { createTestData, formatDate } from './util'
import { TimelineItem } from './timeline'

const stories = storiesOf('Components|Timeline', module).addParameters({
  info: `The TimelinePicker is a controlled component that can be used to select a time range. The TimelinePicker utilizies d3.js,
  and supports zooming and dragging as well as translation between timezones.`,
})

const ShowTimelineButton = styled.button`
  background-color: ${({ theme }) => theme.primaryColor};
  color: white;
`

const renderDates = (dates: Date[], format: string, timezone: string) => {
  if (dates.length == 0) {
    return null
  } else if (dates.length == 1) {
    return formatDate(dates[0], format, timezone)
  } else if (dates.length == 2) {
    return `${formatDate(dates[0], format, timezone)} ---------- ${formatDate(
      dates[1],
      format,
      timezone
    )}`
  }
}

stories.add('Timeline with Data', () => {
  const numDataPoints = number('Number of spaced data points to render', 2000)
  const testData = createTestData(numDataPoints)

  const modeKnob = select(
    'Initial Mode',
    {
      Selection: null,
      Single: 'single',
      Range: 'range',
    },
    null
  )

  const [mode, setMode] = useState<'single' | 'range' | undefined>(
    modeKnob as any
  )

  const timezoneKnob = select(
    'Timezone',
    {
      UTC: 'Etc/UTC',
      '+7:00': 'Etc/GMT-7',
      '-12:00': 'Etc/GMT+12',
    },
    'Etc/UTC'
  )

  const dateFormatKnob = select(
    'Date Format',
    {
      ISO: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
      '24 Hour Standard': 'DD MMM YYYY HH:mm:ss.SSS Z',
      '12 Hour Standard': 'DD MMM YYYY h:mm:ss.SSS a Z',
    },
    'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
  )

  const minKnob = date('Minimum Date', new Date('1980-01-01:00:00.000z'))
  const maxKnob = date('Maximum Date', new Date())

  const [data, setData] = useState(testData)

  return (
    <Timeline
      min={new Date(minKnob)}
      max={new Date(maxKnob)}
      height={300}
      mode={mode}
      format={dateFormatKnob}
      timezone={timezoneKnob}
      data={data}
      dateAttributeAliases={{
        created: 'Created',
        modified: 'Modified',
        published_date: 'Published',
      }}
      onCopy={(copiedValue: string) => action('clicked onCopy')(copiedValue)}
      onSelect={(selectedData: TimelineItem[]) => {
        action('onSelect')(selectedData)
        const selectedIds = selectedData.map((d) => d.id)
        const newData = data.map((d) => {
          d.selected = selectedIds.indexOf(d.id) !== -1
          return d
        })
        setData(newData)
      }}
      onDone={(selectionRange: Date[]) => {
        action('clicked onDone')(selectionRange)
        setMode(undefined)
      }}
    />
  )
})

stories.add('Conditional Render', () => {
  const numDataPoints = number('Number of spaced data points to render', 2000)
  const testData = createTestData(numDataPoints)

  const modeKnob = select(
    'Initial Mode',
    {
      Single: 'single',
      Range: 'range',
    },
    'single'
  )

  const [mode, setMode] = useState<'single' | 'range' | undefined>(
    modeKnob as any
  )

  const [showTimeline, setShowTimeline] = useState(true)
  const [timePicked, setTimePicked] = useState<Date[]>([])

  const timezoneKnob = select(
    'Timezone',
    {
      UTC: 'Etc/UTC',
      '+5:00': 'Etc/GMT-5',
      '+7:00': 'Etc/GMT-7',
      '-7:00': 'Etc/GMT+7',
      '-12:00': 'Etc/GMT+12',
    },
    'Etc/GMT+7'
  )

  const dateFormatKnob = select(
    'Date Format',
    {
      ISO: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
      '24 Hour Standard': 'DD MMM YYYY HH:mm:ss.SSS Z',
      '12 Hour Standard': 'DD MMM YYYY h:mm:ss.SSS a Z',
    },
    'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
  )

  const minKnob = date('Minimum Date', new Date('1980-01-01:00:00.000z'))
  const maxKnob = date('Maximum Date', new Date())

  return (
    <div>
      Launch Time Picker: &nbsp;
      <ShowTimelineButton
        onClick={() => {
          setShowTimeline(!showTimeline)
          setMode(modeKnob as any)
        }}
      >
        T
      </ShowTimelineButton>
      <br />
      <br />
      {renderDates(timePicked, dateFormatKnob, timezoneKnob)}
      {showTimeline && (
        <Timeline
          min={new Date(minKnob)}
          max={new Date(maxKnob)}
          data={testData}
          height={300}
          mode={mode}
          timezone={timezoneKnob}
          format={dateFormatKnob}
          heightOffset={100}
          onCopy={(copiedValue: string) =>
            action('clicked onCopy')(copiedValue)
          }
          onDone={(selectionRange: Date[]) => {
            setShowTimeline(false)
            action('clicked onDone')(selectionRange)
            setTimePicked(selectionRange)
            setMode(undefined)
          }}
        />
      )}
    </div>
  )
})
