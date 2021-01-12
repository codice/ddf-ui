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
import { expect } from 'chai'
import { DateHelpers } from './date-helpers'
//@ts-ignore
import user from '../singletons/user-instance'
user.get('user').get('preferences').set('timeZone', 'America/St_Johns')
const date = new Date()
describe('verify that transforming to and from timezone is accurate (no loss)', () => {
  it(`shifts and unshifts without losing information ${date.toISOString()}`, () => {
    const timeShiftedDated = DateHelpers.Blueprint.converters.ISOToTimeshiftedDate(
      date.toISOString()
    )
    const unshiftedDate = DateHelpers.Blueprint.converters.TimeshiftedDateToISO(
      timeShiftedDated
    )
    expect(date.toISOString(), 'Unexpected difference').to.equal(unshiftedDate)
  })
})
