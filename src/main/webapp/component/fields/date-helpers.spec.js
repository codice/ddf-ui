/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import { expect } from 'chai';
import { DateHelpers, ISO_8601_FORMAT_ZONED } from './date-helpers';
import user from '../singletons/user-instance';
import Common from '../../js/Common';
user.get('user').get('preferences').set('timeZone', 'America/St_Johns');
var date = new Date();
describe('verify that transforming to and from timezone is accurate (no loss)', function () {
    it("shifts and unshifts without losing information ".concat(date.toISOString()), function () {
        var timeShiftedDate = DateHelpers.Blueprint.converters.TimeshiftForDatePicker(date.toISOString(), ISO_8601_FORMAT_ZONED);
        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(timeShiftedDate);
        expect(date.toISOString(), 'Unexpected difference').to.equal(unshiftedDate.toISOString());
    });
});
describe('untimeshifting respects the time precision', function () {
    it('milliseconds are 0 when time precision is seconds', function () {
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['second']);
        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(new Date('2023-04-23T22:39:46.117Z'));
        expect(unshiftedDate.getUTCMilliseconds()).to.equal(0);
    });
    it('seconds and milliseconds are 0 when time precision is minutes', function () {
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['minute']);
        var unshiftedDate = DateHelpers.Blueprint.converters.UntimeshiftFromDatePicker(new Date('2023-04-23T22:39:46.117Z'));
        expect(unshiftedDate.getUTCMilliseconds()).to.equal(0);
        expect(unshiftedDate.getUTCSeconds()).to.equal(0);
    });
});
//# sourceMappingURL=date-helpers.spec.js.map