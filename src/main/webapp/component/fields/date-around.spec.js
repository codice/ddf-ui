import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
Enzyme.configure({ adapter: new Adapter() });
import { DateAroundField } from './date-around';
import { expect } from 'chai';
import user from '../singletons/user-instance';
import Common from '../../js/Common';
// rely on static data when possible, but in these we can use the DateHelpers (a must for shifted date timezone testing)
var data = {
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
};
var wrapper;
describe('verify date around field works', function () {
    beforeEach(function () {
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond']);
    });
    afterEach(function () {
        // Must unmount to stop listening to the user prefs model (the useTimePrefs() hook)
        // Has to be unmounted before we set any preferences so we don't trigger any onChange
        // callbacks again.
        wrapper.unmount();
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond']);
    });
    var verifyDateRender = function (format, precision, expected) {
        return function () {
            user
                .get('user')
                .get('preferences')
                .set('dateTimeFormat', Common.getDateTimeFormats()[format][precision]);
            wrapper = mount(React.createElement(DateAroundField, { value: {
                    date: data.date1.originalISO,
                    buffer: {
                        amount: '1',
                        unit: 'd',
                    },
                    direction: 'both',
                }, onChange: function () { } }));
            expect(wrapper.render().find('input').val()).to.equal(expected);
        };
    };
    it('should render with ISO format and millisecond precision', verifyDateRender('ISO', 'millisecond', data.date1.userFormatISO.millisecond));
    it('should render with ISO format and second precision', verifyDateRender('ISO', 'second', data.date1.userFormatISO.second));
    it('should render with ISO format and minute precision', verifyDateRender('ISO', 'minute', data.date1.userFormatISO.minute));
    it('should render with 24hr format and millisecond precision', verifyDateRender('24', 'millisecond', data.date1.userFormat24.millisecond));
    it('should render with 24hr format and second precision', verifyDateRender('24', 'second', data.date1.userFormat24.second));
    it('should render with 24hr format and minute precision', verifyDateRender('24', 'minute', data.date1.userFormat24.minute));
    it('should render with 12hr format and millisecond precision', verifyDateRender('12', 'millisecond', data.date1.userFormat12.millisecond));
    it('should render with 12hr format and second precision', verifyDateRender('12', 'second', data.date1.userFormat12.second));
    it('should render with 12hr format and minute precision', verifyDateRender('12', 'minute', data.date1.userFormat12.minute));
    it('calls onChange with updated value when precision changes', function () {
        wrapper = mount(React.createElement(DateAroundField, { value: {
                date: data.date1.userFormatISO.millisecond,
                buffer: {
                    amount: '1',
                    unit: 'd',
                },
                direction: 'both',
            }, onChange: function (updatedValue) {
                expect(updatedValue.date).to.equal(data.date1.utcISOMinutes);
            } }));
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['minute']);
    });
});
//# sourceMappingURL=date-around.spec.js.map