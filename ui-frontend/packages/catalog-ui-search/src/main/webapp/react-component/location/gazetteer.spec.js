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

import {
  mock as mockProperties,
  unmock as unmockProperties,
} from '../../test/mock-api/mock-properties'

let GetLargestBbox

const testData = require('./gazetteer-france-test-data.json')

describe('getLargestBbox', () => {
  before(() => {
    mockProperties()
    const { getLargestBbox } = require('./gazetteer')
    GetLargestBbox = getLargestBbox
  })
  after(() => {
    unmockProperties()
  })
  const expectedAnswer = {
    maxX: 7.8125,
    minX: -5.1953125,
    maxY: 50.77891890432069,
    minY: 43.37399002495726,
  }
  it(
    'Largest bounding box for France should equal  ' +
      JSON.stringify(expectedAnswer),
    () => {
      const result = GetLargestBbox(testData[0].geojson.coordinates, true)
      expect(result).to.deep.equal(expectedAnswer)
    }
  )
})
