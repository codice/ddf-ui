import { render, waitFor } from '@testing-library/react'
import { DateAroundField } from './date-around'
import { expect } from 'chai'
import user from '../singletons/user-instance'
import Common from '../../js/Common'
import { TimePrecision } from '@blueprintjs/datetime'

// rely on static data when possible, but in these we can use the DateHelpers (a must for shifted date timezone testing)
const data = {
  date1: {
    originalISO: '2021-01-15T06:53:54.316Z',
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
}

describe('verify date around field works', () => {
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

  const verifyDateRender = (
    format: string,
    precision: TimePrecision,
    expected: string
  ) => {
    return () => {
      user
        .get('user')
        .get('preferences')
        .set('dateTimeFormat', Common.getDateTimeFormats()[format][precision])

      const { container } = render(
        <DateAroundField
          value={{
            date: data.date1.originalISO,
            buffer: {
              amount: '1',
              unit: 'd',
            },
            direction: 'both',
          }}
          onChange={() => {}}
        />
      )

      const input = container.querySelector('input')
      expect(input?.value).to.equal(expected)
    }
  }

  it(
    'should render with ISO format and millisecond precision',
    verifyDateRender('ISO', 'millisecond', data.date1.userFormatISO.millisecond)
  )
  it(
    'should render with ISO format and second precision',
    verifyDateRender('ISO', 'second', data.date1.userFormatISO.second)
  )
  it(
    'should render with ISO format and minute precision',
    verifyDateRender('ISO', 'minute', data.date1.userFormatISO.minute)
  )
  it(
    'should render with 24hr format and millisecond precision',
    verifyDateRender('24', 'millisecond', data.date1.userFormat24.millisecond)
  )
  it(
    'should render with 24hr format and second precision',
    verifyDateRender('24', 'second', data.date1.userFormat24.second)
  )
  it(
    'should render with 24hr format and minute precision',
    verifyDateRender('24', 'minute', data.date1.userFormat24.minute)
  )
  it(
    'should render with 12hr format and millisecond precision',
    verifyDateRender('12', 'millisecond', data.date1.userFormat12.millisecond)
  )
  it(
    'should render with 12hr format and second precision',
    verifyDateRender('12', 'second', data.date1.userFormat12.second)
  )
  it(
    'should render with 12hr format and minute precision',
    verifyDateRender('12', 'minute', data.date1.userFormat12.minute)
  )

  it('calls onChange with updated value when precision changes', async () => {
    let updatedDate = data.date1.userFormatISO.millisecond

    render(
      <DateAroundField
        value={{
          date: updatedDate,
          buffer: {
            amount: '1',
            unit: 'd',
          },
          direction: 'both',
        }}
        onChange={(updatedValue) => {
          updatedDate = updatedValue.date
        }}
      />
    )

    user
      .get('user')
      .get('preferences')
      .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['minute'])

    await waitFor(
      () => {
        expect(updatedDate).to.equal(data.date1.utcISOMinutes)
      },
      { timeout: 1000 }
    )
  })
})
