/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import sessionTimeoutModel from './session-timeout'
import chai from 'chai'

const expect = chai.expect

describe('session-timeout', () => {
  it('logout() navigates to the URL returned by the invalidate endpoint', async () => {
    const navigated: string[] = []
    const originalNavigate = (sessionTimeoutModel as any).navigate
    ;(sessionTimeoutModel as any).navigate = (url: string) => {
      navigated.push(url)
    }
    try {
      await (sessionTimeoutModel as any).logout()
      expect(navigated).to.deep.equal(['/logout?service=test-logout'])
    } finally {
      ;(sessionTimeoutModel as any).navigate = originalNavigate
    }
  })
})
