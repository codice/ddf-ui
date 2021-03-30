import * as React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })
import { expect } from 'chai'
import FilterLeaf from './filter-leaf'
import {
  FilterClass,
  LineLocation,
  PointRadiusLocation,
  PolygonLocation,
} from './filter.structure'
import moment from 'moment'
//@ts-ignore
import user from '../singletons/user-instance'
import TypedMetacardDefinitions from '../tabs/metacard/metacardDefinitions'
TypedMetacardDefinitions.addMetacardDefinitions({
  testing: {
    integerType: { type: 'INTEGER', id: 'integerType' },
    floatType: { type: 'FLOAT', id: 'floatType' },
    longType: { type: 'LONG', id: 'longType' },
    shortType: { type: 'SHORT', id: 'shortType' },
    doubleType: { type: 'DOUBLE', id: 'doubleType' },
    booleanType: { type: 'BOOLEAN', id: 'booleanType' },
    dateType: { type: 'DATE', id: 'dateType' },
    locationType: { type: 'LOCATION', id: 'locationType' },
    xmlType: { type: 'XML', id: 'xmlType' },
    binaryType: { type: 'BINARY', id: 'binaryType' },
  },
})
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
  it('renders with a blank FilterClass', () => {
    mount(<FilterLeaf filter={new FilterClass({})} setFilter={() => {}} />)
  })
  it('renders with a non-blank text FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('anyText')
    expect(wrapper.find('input').last().render().val()).to.equal('text')
  })
  it('renders with a non-blank number FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('integerType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank integer FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('integerType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank float FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('floatType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank long FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('longType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank short FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('shortType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank double FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('doubleType')
    expect(wrapper.find('input').last().render().val()).to.equal('4')
  })
  it('renders with a non-blank boolean FilterClass', () => {
    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('booleanType')
    expect(wrapper.find('input').last().render().val()).to.equal('true')
  })
  it('renders with a non-blank date FilterClass', () => {
    user.get('user').get('preferences').set('timeZone', data.date1.timezone)

    const wrapper = mount(
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
    expect(wrapper.find('input').first().render().val()).to.equal('dateType')
    expect(wrapper.find('input').last().render().val()).to.equal(
      data.date1.userFormatISO
    )
  })
  it('renders with a non-blank location FilterClass', () => {
    const wrapper = mount(
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
        return val.toLowerCase()
      })
      .filter((val) => val !== 'line')
    wrapper.find('input').forEach((node) => {
      const rendering = node.render()
      const val = rendering.val().toLowerCase()
      const index = thingsToFind.indexOf(val)
      if (index >= 0) {
        thingsToFind.splice(index, 1)
      }
    })
    expect(thingsToFind.length).to.equal(0)
  })
  it('renders with a non-blank polygon location FilterClass', () => {
    const wrapper = mount(
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
        return val.toLowerCase()
      })
      .filter((val) => val !== 'poly')
    wrapper.find('input').forEach((node) => {
      const rendering = node.render()
      const val = rendering.val().toLowerCase()
      const index = thingsToFind.indexOf(val)
      if (index >= 0) {
        thingsToFind.splice(index, 1)
      }
    })
    expect(thingsToFind.length).to.equal(0)
  })
  it('renders with a non-blank point radius location FilterClass', () => {
    const wrapper = mount(
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
        if (val === 'POINTRADIUS') {
          return 'point-radius'
        }
        return val.toLowerCase()
      })
      .filter((val) => val !== 'circle')
    wrapper.find('input').forEach((node) => {
      const rendering = node.render()
      const val = rendering.val().toLowerCase()
      const index = thingsToFind.indexOf(val)
      if (index >= 0) {
        thingsToFind.splice(index, 1)
      }
    })
    expect(thingsToFind.length).to.equal(0)
  })
})
