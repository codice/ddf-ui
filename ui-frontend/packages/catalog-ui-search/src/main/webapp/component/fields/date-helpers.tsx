import { ValueTypes } from '../filter-builder/filter.structure'
import { IDateInputProps } from '@blueprintjs/datetime'
import { IDateRangeInputProps } from '@blueprintjs/datetime'
import user from '../singletons/user-instance'
import moment from 'moment-timezone'
import {
  isDateValid,
  isDayInRange,
} from '@blueprintjs/datetime/lib/esm/common/dateUtils'
import { getDefaultMaxDate } from '@blueprintjs/datetime/lib/esm/datePickerCore'
import Common from '../../js/Common'

export const ISO_8601_FORMAT_ZONED = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

export const DefaultMinDate = new Date('Jan 1, 1900')

export const DefaultMaxDate = moment(getDefaultMaxDate())
  .add(10, 'years')
  .toDate()

export const DateHelpers = {
  General: {
    getDateFormat: () => {
      return user.get('user').get('preferences').get('dateTimeFormat')[
        'datetimefmt'
      ] as string
    },
    getTimeZone: () => {
      return user.get('user').get('preferences').get('timeZone') as string
    },
    getTimePrecision: () => {
      return Common.getDateTimeFormatsReverseMap()[
        DateHelpers.General.getDateFormat()
      ].precision
    },
    withPrecision: (date: Date) => {
      switch (DateHelpers.General.getTimePrecision()) {
        case 'minute':
          date.setUTCSeconds(0)
        // Intentional fall-through
        case 'second':
          date.setUTCMilliseconds(0)
      }
      return date
    },
  },
  Blueprint: {
    commonProps: {
      /**
       * Need some user feedback on how this works.  I think it works appropriately at the moment, because it turns user input into the user timezone of choice.
       *
       * So if  user enters time in another timezone by pasting, the input will fix it for them to show it in their chosen timezone.
       *
       * TLDR: this function is only called when the user manually types in a date
       */
      parseDate: (input?: string) => {
        try {
          return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            input || '',
            DateHelpers.General.getDateFormat()
          )
        } catch (err) {
          return null
        }
      },
      /**
       * Basically undoes the value shift to make sure the date is displayed in user's chosen timezone
       */
      formatDate: (date: Date) => {
        try {
          const unshiftedDate =
            DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(date)
          return moment(unshiftedDate)
            .tz(DateHelpers.General.getTimeZone())
            .format(DateHelpers.General.getDateFormat())
        } catch (err) {
          return ''
        }
      },
      isValid: (
        date: Date,
        minDate: Date = DefaultMinDate,
        maxDate: Date = DefaultMaxDate
      ) => {
        return (
          date && isDateValid(date) && isDayInRange(date, [minDate, maxDate])
        )
      },
    },
    DateProps: {
      generateOnChange: (onChange: (value: string) => void) => {
        return ((selectedDate, isUserChange) => {
          if (selectedDate && isUserChange) {
            const unshiftedDate =
              DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(
                selectedDate
              )
            onChange(unshiftedDate.toISOString())
          }
        }) as IDateInputProps['onChange']
      },
      generateValue: (value: string, minDate?: Date, maxDate?: Date) => {
        return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
          value,
          ISO_8601_FORMAT_ZONED,
          minDate,
          maxDate
        )
      },
    },
    DateRangeProps: {
      generateOnChange: (onChange: (value: ValueTypes['during']) => void) => {
        return (([start, end]) => {
          if (onChange) {
            onChange({
              start: start
                ? DateHelpers.Blueprint.converters
                    .UntimeshiftFromDatePicker(start)
                    .toISOString()
                : '',
              end: end
                ? DateHelpers.Blueprint.converters
                    .UntimeshiftFromDatePicker(end)
                    .toISOString()
                : '',
            })
          }
        }) as IDateRangeInputProps['onChange']
      },
      generateValue: (
        value: ValueTypes['during'],
        minDate?: Date,
        maxDate?: Date
      ) =>
        [
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            value.start,
            ISO_8601_FORMAT_ZONED,
            minDate,
            maxDate
          ),
          DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            value.end,
            ISO_8601_FORMAT_ZONED,
            minDate,
            maxDate
          ),
        ] as IDateRangeInputProps['value'],
    },
    converters: {
      /**
       * The datepicker from blueprint doesn't handle timezones.  So if we want to make it feel like the user is in their
       * chosen timezone, we have to shift the date ourselves.  So what we do is pretend the value is utc, then calculate the offset of the computer's local timezone and the timezone the user wants to create a total offset.  This is because the datepicker internally
       * uses date, so we have to pretend we're in local time.  We then take that utc date and add the totaloffset, then tell the datepicker that is our value.  As a result, when the datepicker internally uses Date it will shift back to the correct timezone.
       *
       * TLDR: Use this on a date string formatted by the user's preference going INTO the blueprint datepicker (the value prop).  Use the sibling function TimeshiftedDateToFormattedDate to reverse this.
       */
      TimeshiftForDatePicker: (
        value: string,
        format: string,
        minDate?: Date,
        maxDate?: Date
      ): Date => {
        try {
          const unshiftedDate = moment(value, format)
          if (!unshiftedDate.isValid()) {
            return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
              moment.utc().toISOString(),
              ISO_8601_FORMAT_ZONED
            )
          }
          switch (DateHelpers.General.getTimePrecision()) {
            case 'minute':
              unshiftedDate.seconds(0)
            // Intentional fall-through
            case 'second':
              unshiftedDate.milliseconds(0)
          }
          const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
          const utcOffsetMinutesTimezone = moment
            .tz(value, format, DateHelpers.General.getTimeZone()) // pass in the value, otherwise it won't account for daylight savings time!
            .utcOffset()
          const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
          const shiftedDate = unshiftedDate.add(totalOffset, 'minutes')
          if (
            shiftedDate.isValid() &&
            DateHelpers.Blueprint.commonProps.isValid(
              shiftedDate.toDate(),
              minDate,
              maxDate
            )
          ) {
            return shiftedDate.toDate()
          } else {
            return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
              moment.utc().toISOString(),
              ISO_8601_FORMAT_ZONED
            )
          }
        } catch (err) {
          console.error(err)
          return DateHelpers.Blueprint.converters.TimeshiftForDatePicker(
            moment.utc().toISOString(),
            ISO_8601_FORMAT_ZONED
          )
        }
      },
      /**
       * The form within the datepicker is Timeshifted, so we have to untimeshift things as they come out of the datepicker.
       * See TimeshiftForDatePicker, since we're undoing what we do there
       *
       * TLDR: Use this on the Date object coming out of the Blueprint datepicker (only if you used the sibling function to format the value going in of course, since it reverses it).  That means the use this in the onChange prop and the formatDate prop.
       */
      UntimeshiftFromDatePicker: (value: Date) => {
        try {
          const shiftedDate = moment(value)
          switch (DateHelpers.General.getTimePrecision()) {
            case 'minute':
              shiftedDate.seconds(0)
            // Intentional fall-through
            case 'second':
              shiftedDate.milliseconds(0)
          }
          const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
          const utcOffsetMinutesTimezone = moment
            .tz(value, DateHelpers.General.getTimeZone()) // pass in the value, otherwise it won't account for daylight savings time!
            .utcOffset()
          const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
          return shiftedDate.subtract(totalOffset, 'minutes').toDate()
        } catch (err) {
          console.error(err)
          return DateHelpers.General.withPrecision(new Date())
        }
      },
      /**
       * The output from the onChange is an ISOString. This converts it to a string in the user's timezone and preferred format.
       *
       * TLDR: Use this on the string from the onChange when you want to display it.
       */
      ISOtoFormattedString: (value: string) => {
        const date = DateHelpers.Blueprint.DateProps.generateValue(value)
        return DateHelpers.Blueprint.commonProps.formatDate(date)
      },
    },
  },
}
