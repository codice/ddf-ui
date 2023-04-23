import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })
import { expect } from 'chai'

import { DateRangeField } from './date-range'
import moment from 'moment'

import user from '../singletons/user-instance'
import { ValueTypes } from '../filter-builder/filter.structure'
import { DateHelpers, ISO_8601_FORMAT_ZONED } from './date-helpers'
import Common from '../../js/Common'
import { TimePrecision } from '@blueprintjs/datetime'

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
let wrapper: Enzyme.ReactWrapper
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
    // Must unmount to stop listening to the user prefs model (the useTimePrefs() hook)
    wrapper.unmount()
  })
  it(`should not allow overlapping dates`, () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond'])
    wrapper = mount(
      <DateRangeField
        value={{
          start: data.date1.originalISO,
          end: data.date4.originalISO,
        }}
        onChange={() => {}}
      />
    )
    expect(wrapper.render().find('input').first().val()).to.equal(
      data.date1.userFormatISO.millisecond
    )
    expect(wrapper.render().find('input').last().val()).to.equal(
      'Overlapping dates'
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
      wrapper = mount(
        <DateRangeField
          value={{
            start: data.date4.originalISO,
            end: data.date1.originalISO,
          }}
          onChange={() => {}}
        />
      )
      expect(wrapper.render().find('input').first().val()).to.equal(
        expectedStart
      )
      expect(wrapper.render().find('input').last().val()).to.equal(expectedEnd)
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

    wrapper = mount(
      <UncontrolledDateRangeField
        startingValue={{
          start: data.date2.userSuppliedInput,
          end: data.date2.userSuppliedInput,
        }}
      />
    )
    const input = wrapper.find('input')
    input.first().simulate('change', {
      target: { value: data.date2.userSuppliedInput },
    })
    input.last().simulate('change', {
      target: { value: data.date2.userSuppliedInput },
    })
    expect(input.first().render().val()).to.equal(data.date2.parsedOutput)
    expect(input.last().render().val()).to.equal(data.date2.parsedOutput)
  })
  it(`should generate appropriately shifted ISO strings on change (DST)`, () => {
    wrapper = mount(
      <DateRangeField
        value={{
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        }}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date5.originalISO)
          expect(updatedValue.end).to.equal(data.date5.originalISO)
        }}
      />
    )
    const dateFieldInstance = wrapper.children().get(0)
    dateFieldInstance.props.onChange(
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
  })
  it(`should generate appropriately shifted ISO strings on change`, () => {
    wrapper = mount(
      <DateRangeField
        value={{
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        }}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date1.originalISO)
          expect(updatedValue.end).to.equal(data.date1.originalISO)
        }}
      />
    )
    const dateFieldInstance = wrapper.children().get(0)
    dateFieldInstance.props.onChange(
      [
        DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
          data.date1.originalISO,
          ISO_8601_FORMAT_ZONED
        ),
        DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
          data.date1.originalISO,
          ISO_8601_FORMAT_ZONED
        ),
      ],
      true
    )
  })
  it(`should not allow dates beyond max future`, () => {
    wrapper = mount(
      <DateRangeField
        value={{
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        }}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.not.equal(data.date3.maxFuture)
        }}
      />
    )
    const input = wrapper.find('input').first()
    input.simulate('change', {
      target: { value: data.date3.disallowedFuture },
    })
  })
  it(`should allow dates up to max future`, () => {
    const initValue = {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    }
    wrapper = mount(
      <DateRangeField
        value={initValue}
        onChange={(updatedValue) => {
          expect(updatedValue.start).to.equal(data.date3.maxFuture)
        }}
      />
    )
    const input = wrapper.find('input').first()
    input.simulate('change', {
      target: { value: data.date3.maxFuture },
    })
  })
})
