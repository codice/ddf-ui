import React from 'react'
import { expect } from 'chai'
import { render, fireEvent } from '@testing-library/react'

import { DateRangeField, defaultValue } from './date-range'
import moment from 'moment-timezone'

import user from '../singletons/user-instance'
import { ValueTypes } from '../filter-builder/filter.structure'
import { DateHelpers, ISO_8601_FORMAT_ZONED } from './date-helpers'
import Common from '../../js/Common'
import { DateRangeInput, TimePrecision } from '@blueprintjs/datetime'

const UncontrolledDateRangeField = ({
  startingValue,
}: {
  startingValue: ValueTypes['during']
}) => {
  const [value, setValue] = React.useState(startingValue)
  return (
    <DateRangeField
      value={value}
      onChange={(update) => {
        setValue(update)
      }}
    />
  )
}

// rely on static data when possible, but in these we can use the DateHelpers (a must for shifted date timezone testing)
const data = {
  date1: {
    timezone: 'America/St_Johns',
    originalISO: '2021-01-15T06:53:54.316Z',
    originalDate: new Date('2021-01-15T06:53:54.316Z'),
    utcISOMinutes: '2021-01-15T06:53:00.000Z',
    userFormatISO: {
      millisecond: '2021-01-15T03:23:54.316-03:30',
      second: '2021-01-15T03:23:54-03:30',
      minute: '2021-01-15T03:23-03:30',
    },
    userFormat24: {
      millisecond: '15 Jan 2021 03:23:54.316 -03:30',
      second: '15 Jan 2021 03:23:54 -03:30',
      minute: '15 Jan 2021 03:23 -03:30',
    },
    userFormat12: {
      millisecond: '15 Jan 2021 03:23:54.316 am -03:30',
      second: '15 Jan 2021 03:23:54 am -03:30',
      minute: '15 Jan 2021 03:23 am -03:30',
    },
  },
  date2: {
    timezone: 'America/St_Johns',
    userSuppliedInput: '15 Jan 2021 03:24:54.316 -02:30',
    parsedOutput: '15 Jan 2021 02:24:54.316 -03:30',
  },
  date3: {
    timezone: 'Etc/UTC',
    maxFuture: moment().add(10, 'years').toISOString(),
    disallowedFuture: moment().add(11, 'years').toISOString(),
  },
  date4: {
    timezone: 'America/St_Johns',
    originalISO: '2021-01-14T06:53:54.316Z',
    originalDate: new Date('2021-01-14T06:53:54.316Z'),
    utcISOMinutes: '2021-01-14T06:53:00.000Z',
    userFormatISO: {
      millisecond: '2021-01-14T03:23:54.316-03:30',
      second: '2021-01-14T03:23:54-03:30',
      minute: '2021-01-14T03:23-03:30',
    },
    userFormat24: {
      millisecond: '14 Jan 2021 03:23:54.316 -03:30',
      second: '14 Jan 2021 03:23:54 -03:30',
      minute: '14 Jan 2021 03:23 -03:30',
    },
    userFormat12: {
      millisecond: '14 Jan 2021 03:23:54.316 am -03:30',
      second: '14 Jan 2021 03:23:54 am -03:30',
      minute: '14 Jan 2021 03:23 am -03:30',
    },
  },
  // this is useful for testing daylist savings (date 1 is pre, this is post)
  date5: {
    timezone: 'America/St_Johns',
    originalISO: '2021-04-15T05:53:54.316Z', // use the converter to find the appropriate shifted date
  },
}
describe('verify date range field works', () => {
  before(() => {
    user.get('user').get('preferences').set('timeZone', data.date1.timezone)
  })
  after(() => {
    user.get('user').get('preferences').set('timeZone', 'Etc/UTC')
  })
  beforeEach(() => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond'])
  })
  afterEach(() => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond'])
  })
  it('should not allow overlapping dates', () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond'])

    const handleChange = (validValue: ValueTypes['during']) => {
      // verify these are one day apart, as should happen when fed overlapping dates or invalid values
      const start = moment(validValue.start)
      const end = moment(validValue.end)
      expect(start.diff(end, 'days')).to.equal(-1)
    }

    render(
      <DateRangeField
        value={{
          start: data.date1.originalISO,
          end: data.date4.originalISO,
        }}
        onChange={handleChange}
      />
    )
  })
  const verifyDateRender = (
    format: string,
    precision: TimePrecision,
    expectedStart: string,
    expectedEnd: string
  ) => {
    return () => {
      user
        .get('user')
        .get('preferences')
        .set('dateTimeFormat', Common.getDateTimeFormats()[format][precision])

      const { getAllByRole } = render(
        <DateRangeField
          value={{
            start: data.date4.originalISO,
            end: data.date1.originalISO,
          }}
          onChange={() => {}}
        />
      )
      const inputs = getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs[0].value).to.equal(expectedStart)
      expect(inputs[1].value).to.equal(expectedEnd)
    }
  }
  it(
    'should render with ISO format and millisecond precision',
    verifyDateRender(
      'ISO',
      'millisecond',
      data.date4.userFormatISO.millisecond,
      data.date1.userFormatISO.millisecond
    )
  )
  it(
    'should render with ISO format and second precision',
    verifyDateRender(
      'ISO',
      'second',
      data.date4.userFormatISO.second,
      data.date1.userFormatISO.second
    )
  )
  it(
    'should render with ISO format and minute precision',
    verifyDateRender(
      'ISO',
      'minute',
      data.date4.userFormatISO.minute,
      data.date1.userFormatISO.minute
    )
  )
  it(
    'should render with 24hr format and millisecond precision',
    verifyDateRender(
      '24',
      'millisecond',
      data.date4.userFormat24.millisecond,
      data.date1.userFormat24.millisecond
    )
  )
  it(
    'should render with 24hr format and second precision',
    verifyDateRender(
      '24',
      'second',
      data.date4.userFormat24.second,
      data.date1.userFormat24.second
    )
  )
  it(
    'should render with 24hr format and minute precision',
    verifyDateRender(
      '24',
      'minute',
      data.date4.userFormat24.minute,
      data.date1.userFormat24.minute
    )
  )
  it(
    'should render with 12hr format and millisecond precision',
    verifyDateRender(
      '12',
      'millisecond',
      data.date4.userFormat12.millisecond,
      data.date1.userFormat12.millisecond
    )
  )
  it(
    'should render with 12hr format and second precision',
    verifyDateRender(
      '12',
      'second',
      data.date4.userFormat12.second,
      data.date1.userFormat12.second
    )
  )
  it(
    'should render with 12hr format and minute precision',
    verifyDateRender(
      '12',
      'minute',
      data.date4.userFormat12.minute,
      data.date1.userFormat12.minute
    )
  )
  it(`should parse with user's pref timezone`, () => {
    // gist is user enters a time in a diff time from their pref, on blur we adjust it to their preference
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['24']['millisecond'])

    const { getAllByRole } = render(
      <UncontrolledDateRangeField
        startingValue={{
          start: data.date2.userSuppliedInput,
          end: data.date2.userSuppliedInput,
        }}
      />
    )
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0], {
      target: { value: data.date2.userSuppliedInput },
    })
    fireEvent.change(inputs[1], {
      target: { value: data.date2.userSuppliedInput },
    })
    expect(inputs[0].value).to.equal(data.date2.parsedOutput)
    expect(inputs[1].value).to.equal(data.date2.parsedOutput)
  })
  it(`should generate appropriately shifted ISO strings on change (DST)`, () => {
    const ref = React.createRef<DateRangeInput>()
    render(
      <DateRangeField
        value={defaultValue()}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date5.originalISO)
          expect(updatedValue.end).to.equal(data.date5.originalISO)
        }}
        ref={ref}
      />
    )
    if (ref.current) {
      const handleDateRangePickerChange = Reflect.get(
        ref.current,
        'handleDateRangePickerChange'
      )
      handleDateRangePickerChange(
        [
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            data.date5.originalISO,
            ISO_8601_FORMAT_ZONED
          ),
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            data.date5.originalISO,
            ISO_8601_FORMAT_ZONED
          ),
        ],
        true
      )
    }
  })
  it(`should generate appropriately shifted ISO strings on change`, () => {
    const ref = React.createRef<DateRangeInput>()
    render(
      <DateRangeField
        value={defaultValue()}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date4.originalISO)
          expect(updatedValue.end).to.equal(data.date5.originalISO)
        }}
        ref={ref}
      />
    )
    if (ref.current) {
      // use reflection to access private method
      const handleDateRangePickerChange = Reflect.get(
        ref.current,
        'handleDateRangePickerChange'
      )
      handleDateRangePickerChange(
        [
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            data.date4.originalISO,
            ISO_8601_FORMAT_ZONED
          ),
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            data.date5.originalISO,
            ISO_8601_FORMAT_ZONED
          ),
        ],
        true
      )
    }
  })
  it(`should not allow dates beyond max future`, () => {
    const { getAllByRole } = render(
      <DateRangeField
        value={defaultValue()}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.not.equal(data.date3.maxFuture)
        }}
      />
    )

    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    const startInput = inputs[0]

    // Simulate typing in a disallowed future date
    fireEvent.change(startInput, {
      target: { value: data.date3.disallowedFuture },
    })
  })
  it(`should allow dates up to max future`, () => {
    const { getAllByRole } = render(
      <DateRangeField
        value={defaultValue()}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date3.maxFuture)
        }}
      />
    )
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    const startInput = inputs[0]
    fireEvent.change(startInput, {
      target: { value: data.date3.maxFuture },
    })
  })
  it('calls onChange with updated value when precision changes', (done) => {
    render(
      <DateRangeField
        value={{
          start: data.date4.originalISO,
          end: data.date1.originalISO,
        }}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date4.utcISOMinutes)
          expect(updatedValue.end).to.equal(data.date1.utcISOMinutes)
          done()
        }}
      />
    )
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['minute'])
  })
})
