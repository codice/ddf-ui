
import { expect } from 'chai'
import FilterLeaf from './filter-leaf'
import {
  FilterClass,
  LineLocation,
  PointRadiusLocation,
  PolygonLocation,
} from './filter.structure'
import moment from 'moment-timezone'
import user from '../singletons/user-instance'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { BasicDataTypePropertyName } from './reserved.properties'
import { render } from '@testing-library/react'

// trim whitespace, lowercase
function customNormalizer(text: string) {
  return text.trim().toLowerCase()
}

function addTestDefs() {
  StartupDataStore.MetacardDefinitions.addDynamicallyFoundMetacardDefinitions({
    testing: {
      integerType: {
        type: 'INTEGER',
        id: 'integerType',
        multivalued: false,
        isInjected: false,
      },
      floatType: {
        type: 'FLOAT',
        id: 'floatType',
        multivalued: false,
        isInjected: false,
      },
      longType: {
        type: 'LONG',
        id: 'longType',
        multivalued: false,
        isInjected: false,
      },
      shortType: {
        type: 'SHORT',
        id: 'shortType',
        multivalued: false,
        isInjected: false,
      },
      doubleType: {
        type: 'DOUBLE',
        id: 'doubleType',
        multivalued: false,
        isInjected: false,
      },
      booleanType: {
        type: 'BOOLEAN',
        id: 'booleanType',
        multivalued: false,
        isInjected: false,
      },
      dateType: {
        type: 'DATE',
        id: 'dateType',
        multivalued: false,
        isInjected: false,
      },
      locationType: {
        type: 'LOCATION',
        id: 'locationType',
        multivalued: false,
        isInjected: false,
      },
      xmlType: {
        type: 'XML',
        id: 'xmlType',
        multivalued: false,
        isInjected: false,
        hidden: true,
      },
      binaryType: {
        type: 'BINARY',
        id: 'binaryType',
        multivalued: false,
        isInjected: false,
        hidden: true,
      },
      'location.country-code': {
        type: 'STRING',
        id: 'location.country-code',
        multivalued: false,
        isInjected: false,
      },
      datatype: {
        type: 'STRING',
        id: 'datatype',
        multivalued: false,
        isInjected: false,
      },
      anyText: {
        type: 'STRING',
        id: 'anyText',
        multivalued: false,
        isInjected: false,
        hidden: true,
      },
      [BasicDataTypePropertyName]: {
        type: 'STRING',
        id: BasicDataTypePropertyName,
        multivalued: false,
        isInjected: false,
        hidden: true,
      },
    },
  })
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
  location1: {
    type: 'LINE',
    mode: 'line',
    lineWidth: '50',
    line: [
      [0, 0],
      [1, 1],
    ],
  } as LineLocation,
  location2: {
    type: 'POLYGON',
    mode: 'poly',
    polygonBufferWidth: '50',
    polygonBufferUnits: 'meters',
    polygon: [
      [0, 0],
      [1, 1],
      [2, 2],
      [0, 0],
    ],
  } as PolygonLocation,
  location3: {
    type: 'POINTRADIUS',
    mode: 'circle',
    radiusUnits: 'meters',
    radius: 50,
    lat: 0,
    lon: 30,
  } as PointRadiusLocation,
}

describe('filter leaf testing', () => {
  before(() => {
    /**
     * Needs to be done here, otherwise these get blown away when the mock fetch happens.
     */
    addTestDefs()
  })
  it('renders with a blank FilterClass', () => {
    render(<FilterLeaf filter={new FilterClass({})} setFilter={() => {}} />)
  })
  it('renders with a non-blank text FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: 'ILIKE',
            property: 'anyText',
            value: 'text',
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('anyText')
    const textInput = filterLeafInstance.getByDisplayValue('text')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank number FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'integerType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('integerType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank integer FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'integerType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('integerType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank float FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'floatType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('floatType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank long FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'longType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('longType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank short FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'shortType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('shortType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank double FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '<',
            property: 'doubleType',
            value: 4,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('doubleType')
    const textInput = filterLeafInstance.getByDisplayValue('4')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank boolean FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: '=',
            property: 'booleanType',
            value: true,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('booleanType')
    const textInput = filterLeafInstance.getByDisplayValue('true')
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank date FilterClass', () => {
    user.get('user').get('preferences').set('timeZone', data.date1.timezone)

    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: 'AFTER',
            property: 'dateType',
            value: data.date1.originalISO,
          })
        }
        setFilter={() => {}}
      />
    )
    const anyTextInput = filterLeafInstance.getByDisplayValue('dateType')
    const textInput = filterLeafInstance.getByDisplayValue(
      data.date1.userFormatISO
    )
    expect(anyTextInput).to.exist
    expect(textInput).to.exist
  })
  it('renders with a non-blank location FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: 'DWITHIN',
            property: 'locationType',
            value: data.location1,
          })
        }
        setFilter={() => {}}
      />
    )
    const thingsToFind = Object.values(data.location1)
      .map((val) => {
        if (typeof val !== 'string') {
          return JSON.stringify(val)
        }
        return val
      })
      .map(customNormalizer)
    thingsToFind.forEach((thing) => {
      const input = filterLeafInstance.getByDisplayValue(thing, {
        normalizer: customNormalizer,
      })
      expect(input).to.exist
    })
  })
  it('renders with a non-blank polygon location FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: 'DWITHIN',
            property: 'locationType',
            value: data.location2,
          })
        }
        setFilter={() => {}}
      />
    )
    const thingsToFind = Object.values(data.location2)
      .map((val) => {
        if (typeof val !== 'string') {
          return JSON.stringify(val)
        }
        return val
      })
      .map(customNormalizer)
      .map((val) => {
        if (val === 'poly') {
          return 'polygon'
        }
        return val
      })
    thingsToFind.forEach((thing) => {
      const input = filterLeafInstance.getByDisplayValue(thing, {
        normalizer: customNormalizer,
      })
      expect(input).to.exist
    })
  })
  it('renders with a non-blank point radius location FilterClass', () => {
    const filterLeafInstance = render(
      <FilterLeaf
        filter={
          new FilterClass({
            type: 'DWITHIN',
            property: 'locationType',
            value: data.location3,
          })
        }
        setFilter={() => {}}
      />
    )
    const thingsToFind = Object.values(data.location3)
      .map((val) => {
        if (typeof val !== 'string') {
          return JSON.stringify(val)
        }
        return val
      })
      .map(customNormalizer)
      .map((val) => {
        if (val === 'circle' || val === 'pointradius') {
          return 'point-radius'
        }
        return val
      })
    thingsToFind.forEach((thing) => {
      const input = filterLeafInstance.getByDisplayValue(thing, {
        normalizer: customNormalizer,
      })
      expect(input).to.exist
    })
  })
})
