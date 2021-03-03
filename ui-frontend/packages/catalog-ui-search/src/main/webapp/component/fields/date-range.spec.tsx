import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })
import { expect } from 'chai'

import { DateRangeField } from './date-range'
import moment from 'moment'
const Common = require('../../js/Common')

//@ts-ignore
import user from '../singletons/user-instance'
import { ValueTypes } from '../filter-builder/filter.structure'

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

// do not rely on our own transforms for testing, rely on static data!
const data = {
  date1: {
    timezone: 'America/St_Johns',
    originalISO: '2021-01-15T06:53:54.316Z',
    originalDate: new Date('2021-01-15T06:53:54.316Z'),
    shiftedISO: '2021-01-15T10:23:54.316Z',
    shiftedDate: new Date('2021-01-15T10:23:54.316Z'),
    userFormatISO: '2021-01-15T03:23:54.316-03:30',
    userFormat24: '15 Jan 2021 03:23:54.316 -03:30',
    userFormat12: '15 Jan 2021 03:23:54.316 am -03:30',
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
    shiftedISO: '2021-01-14T10:23:54.316Z',
    shiftedDate: new Date('2021-01-14T10:23:54.316Z'),
    userFormatISO: '2021-01-14T03:23:54.316-03:30',
    userFormat24: '14 Jan 2021 03:23:54.316 -03:30',
    userFormat12: '14 Jan 2021 03:23:54.316 am -03:30',
  },
}
describe('verify date field works', () => {
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
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO'])
  })
  afterEach(() => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO'])
  })
  it(`should not allow overlapping dates`, () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO'])
    const wrapper = mount(
      <DateRangeField
        value={{
          start: data.date1.originalISO,
          end: data.date4.originalISO,
        }}
        onChange={() => {}}
      />
    )
    expect(wrapper.render().find('input').first().val()).to.equal(
      data.date1.userFormatISO
    )
    expect(wrapper.render().find('input').last().val()).to.equal(
      'Overlapping dates'
    )
  })
  it(`should allow non-overlapping dates`, () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO'])
    const wrapper = mount(
      <DateRangeField
        value={{
          start: data.date4.originalISO,
          end: data.date1.originalISO,
        }}
        onChange={() => {}}
      />
    )
    expect(wrapper.render().find('input').first().val()).to.equal(
      data.date4.userFormatISO
    )
    expect(wrapper.render().find('input').last().val()).to.equal(
      data.date1.userFormatISO
    )
  })
  it(`should render with user's pref format of 12hr standard`, () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['12'])

    const wrapper = mount(
      <DateRangeField
        value={{
          start: data.date4.originalISO,
          end: data.date1.originalISO,
        }}
        onChange={() => {}}
      />
    )
    expect(wrapper.render().find('input').first().val()).to.equal(
      data.date4.userFormat12
    )
    expect(wrapper.render().find('input').last().val()).to.equal(
      data.date1.userFormat12
    )
  })
  it(`should render with user's pref format of 24hr standard`, () => {
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['24'])

    const wrapper = mount(
      <DateRangeField
        value={{
          start: data.date4.originalISO,
          end: data.date1.originalISO,
        }}
        onChange={() => {}}
      />
    )
    expect(wrapper.render().find('input').first().val()).to.equal(
      data.date4.userFormat24
    )
    expect(wrapper.render().find('input').last().val()).to.equal(
      data.date1.userFormat24
    )
  })
  it(`should parse with user's pref timezone`, () => {
    // gist is user enters a time in a diff time from their pref, on blur we adjust it to their preference
    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['24'])

    const wrapper = mount(
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
  it(`should generate appropriately shifted ISO strings on change`, () => {
    const wrapper = mount(
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
      [data.date1.shiftedDate, data.date1.shiftedDate],
      true
    )
  })
  it(`should not allow dates beyond max future`, () => {
    const wrapper = mount(
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
    const wrapper = mount(
      <DateRangeField
        value={{
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        }}
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
