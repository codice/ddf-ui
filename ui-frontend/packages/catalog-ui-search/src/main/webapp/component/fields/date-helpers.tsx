import { ValueTypes } from '../filter-builder/filter.structure'
import { IDateInputProps } from '@blueprintjs/datetime'
import { IDateRangeInputProps } from '@blueprintjs/datetime'
// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../s... Remove this comment to see the full error message
import user from '../singletons/user-instance'
import moment from 'moment-timezone'

export const DateHelpers = {
  General: {
    getDateFormat: () => {
      return user
        .get('user')
        .get('preferences')
        .get('dateTimeFormat')['datetimefmt'] as string
    },
    getTimeZone: () => {
      return user
        .get('user')
        .get('preferences')
        .get('timeZone') as string
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
          return DateHelpers.Blueprint.converters.ISOToTimeshiftedDate(
            input || ''
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
          return user.getUserReadableDateTime(
            DateHelpers.Blueprint.converters.TimeshiftedDateToISO(date)
          )
        } catch (err) {
          return ''
        }
      },
    },
    DateProps: {
      generateOnChange: (onChange: (value: string) => void) => {
        return ((selectedDate, isUserChange) => {
          if (onChange && selectedDate && isUserChange) {
            onChange(
              DateHelpers.Blueprint.converters.TimeshiftedDateToISO(
                selectedDate
              )
            )
          }
        }) as IDateInputProps['onChange']
      },
      generateValue: (value: string) =>
        DateHelpers.Blueprint.converters.ISOToTimeshiftedDate(value),
    },
    DateRangeProps: {
      generateOnChange: (onChange: (value: ValueTypes['during']) => void) => {
        return (([start, end]) => {
          if (onChange) {
            onChange({
              start: start
                ? DateHelpers.Blueprint.converters.TimeshiftedDateToISO(start)
                : '',
              end: end
                ? DateHelpers.Blueprint.converters.TimeshiftedDateToISO(end)
                : '',
            })
          }
        }) as IDateRangeInputProps['onChange']
      },
      generateValue: (value: ValueTypes['during']) =>
        [
          DateHelpers.Blueprint.converters.ISOToTimeshiftedDate(value.start),
          DateHelpers.Blueprint.converters.ISOToTimeshiftedDate(value.end),
        ] as IDateRangeInputProps['value'],
    },
    converters: {
      /**
       * The datepicker from blueprint doesn't handle timezones.  So if we want to make it feel like the user is in their
       * chosen timezone, we have to shift the date ourselves.  So what we do is pretend the value is utc, then calculate the offset of the computer's local timezone and the timezone the user wants to create a total offset.  This is because the datepicker internally
       * uses date, so we have to pretend we're in local time.  We then take that utc date and add the totaloffset, then tell the datepicker that is our value.  As a result, when the datepicker internally uses Date it will shift back to the correct timezone.
       *
       * TLDR: Use this on an ISO date going INTO the blueprint datepicker (the value prop).  Use the sibling function TimeshiftedDateToISO to reverse this.
       */
      ISOToTimeshiftedDate: (value: string) => {
        try {
          let momentShiftedDate = moment.utc(new Date(value).toUTCString())
          const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
          const utcOffsetMinutesTimezone = moment
            .tz(DateHelpers.General.getTimeZone())
            .utcOffset()
          const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
          console.log(`offset: ${totalOffset}`)
          return momentShiftedDate.add(totalOffset, 'minutes').toDate()
        } catch (err) {
          console.error(err)
          return new Date()
        }
      },
      /**
       * The form within the datepicker is Timeshifted, so we have to untimeshift things as they come out of the datepicker.
       * See ISOToTimeshiftedISO, since we're undoing what we do there
       *
       * TLDR: Use this on the Date object coming out of the Blueprint datepicker (only if you used the sibling function to format the value going in of course, since it reverses it).  That means the use this in the onChange prop and the formatDate prop.
       */
      TimeshiftedDateToISO: (value: Date) => {
        try {
          let momentShiftedDate = moment.utc(value.toUTCString())
          const utcOffsetMinutesLocal = new Date().getTimezoneOffset()
          const utcOffsetMinutesTimezone = moment
            .tz(DateHelpers.General.getTimeZone())
            .utcOffset()
          const totalOffset = utcOffsetMinutesLocal + utcOffsetMinutesTimezone
          return momentShiftedDate
            .subtract(totalOffset, 'minutes')
            .toDate()
            .toISOString()
        } catch (err) {
          console.error(err)
          return value.toISOString()
        }
      },
    },
  },
}
