import { ValueTypes } from '../filter-builder/filter.structure';
export declare const ISO_8601_FORMAT_ZONED = "YYYY-MM-DDTHH:mm:ss.SSSZ";
export declare const DefaultMinDate: Date;
export declare const DefaultMaxDate: Date;
export declare const DateHelpers: {
    General: {
        getDateFormat: () => string;
        getTimeZone: () => string;
        getTimePrecision: () => import("@blueprintjs/datetime").TimePrecision;
        withPrecision: (date: Date) => Date;
    };
    Blueprint: {
        commonProps: {
            /**
             * Need some user feedback on how this works.  I think it works appropriately at the moment, because it turns user input into the user timezone of choice.
             *
             * So if  user enters time in another timezone by pasting, the input will fix it for them to show it in their chosen timezone.
             *
             * TLDR: this function is only called when the user manually types in a date
             */
            parseDate: (input?: string) => Date | null;
            /**
             * Basically undoes the value shift to make sure the date is displayed in user's chosen timezone
             */
            formatDate: (date: Date) => string;
            isValid: (date: Date, minDate?: Date, maxDate?: Date) => boolean;
        };
        DateProps: {
            generateOnChange: (onChange: (value: string) => void) => ((selectedDate: Date, isUserChange: boolean) => void) | undefined;
            generateValue: (value: string, minDate?: Date, maxDate?: Date) => Date;
        };
        DateRangeProps: {
            generateOnChange: (onChange: (value: ValueTypes['during']) => void) => ((selectedRange: import("@blueprintjs/datetime").DateRange) => void) | undefined;
            generateValue: (value: ValueTypes['during'], minDate?: Date, maxDate?: Date) => import("@blueprintjs/datetime").DateRange | undefined;
        };
        converters: {
            /**
             * The datepicker from blueprint doesn't handle timezones.  So if we want to make it feel like the user is in their
             * chosen timezone, we have to shift the date ourselves.  So what we do is pretend the value is utc, then calculate the offset of the computer's local timezone and the timezone the user wants to create a total offset.  This is because the datepicker internally
             * uses date, so we have to pretend we're in local time.  We then take that utc date and add the totaloffset, then tell the datepicker that is our value.  As a result, when the datepicker internally uses Date it will shift back to the correct timezone.
             *
             * TLDR: Use this on a date string formatted in the manner specified by the provided format going INTO the blueprint datepicker (the value prop).  Use the sibling function UntimeshiftFromDatePicker to reverse this.
             */
            TimeshiftForDatePicker: (value: string, format: string, minDate?: Date, maxDate?: Date) => Date;
            /**
             * The form within the datepicker is Timeshifted, so we have to untimeshift things as they come out of the datepicker.
             * See TimeshiftForDatePicker, since we're undoing what we do there
             *
             * TLDR: Use this on the Date object coming out of the Blueprint datepicker (only if you used the sibling function to format the value going in of course, since it reverses it).  That means the use this in the onChange prop and the formatDate prop.
             */
            UntimeshiftFromDatePicker: (value: Date) => Date;
            /**
             * The output from the onChange is an ISOString. This converts it to a string in the user's timezone and preferred format.
             *
             * TLDR: Use this on the string from the onChange when you want to display it.
             */
            ISOtoFormattedString: (value: string) => string;
        };
    };
};
