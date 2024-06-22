import * as React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
Enzyme.configure({ adapter: new Adapter() });
import { expect } from 'chai';
import FilterLeaf from './filter-leaf';
import { FilterClass, } from './filter.structure';
import moment from 'moment';
import user from '../singletons/user-instance';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { BasicDataTypePropertyName } from './reserved.properties';
function addTestDefs() {
    var _a;
    StartupDataStore.MetacardDefinitions.addDynamicallyFoundMetacardDefinitions({
        testing: (_a = {
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
                }
            },
            _a[BasicDataTypePropertyName] = {
                type: 'STRING',
                id: BasicDataTypePropertyName,
                multivalued: false,
                isInjected: false,
                hidden: true,
            },
            _a),
    });
}
// do not rely on our own transforms for testing, rely on static data!
var data = {
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
    },
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
    },
    location3: {
        type: 'POINTRADIUS',
        mode: 'circle',
        radiusUnits: 'meters',
        radius: 50,
        lat: 0,
        lon: 30,
    },
};
describe('filter leaf testing', function () {
    before(function () {
        /**
         * Needs to be done here, otherwise these get blown away when the mock fetch happens.
         */
        addTestDefs();
    });
    it('renders with a blank FilterClass', function () {
        mount(React.createElement(FilterLeaf, { filter: new FilterClass({}), setFilter: function () { } }));
    });
    it('renders with a non-blank text FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: 'ILIKE',
                property: 'anyText',
                value: 'text',
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('anyText');
        expect(wrapper.find('input').last().render().val()).to.equal('text');
    });
    it('renders with a non-blank number FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'integerType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('integerType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank integer FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'integerType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('integerType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank float FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'floatType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('floatType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank long FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'longType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('longType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank short FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'shortType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('shortType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank double FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'doubleType',
                value: 4,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('doubleType');
        expect(wrapper.find('input').last().render().val()).to.equal('4');
    });
    it('renders with a non-blank boolean FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: '=',
                property: 'booleanType',
                value: true,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('booleanType');
        expect(wrapper.find('input').last().render().val()).to.equal('true');
    });
    it('renders with a non-blank date FilterClass', function () {
        user.get('user').get('preferences').set('timeZone', data.date1.timezone);
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: 'AFTER',
                property: 'dateType',
                value: data.date1.originalISO,
            }), setFilter: function () { } }));
        expect(wrapper.find('input').first().render().val()).to.equal('dateType');
        expect(wrapper.find('input').last().render().val()).to.equal(data.date1.userFormatISO);
    });
    it('renders with a non-blank location FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location1,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location1)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            return val.toLowerCase();
        })
            .filter(function (val) { return val !== 'line'; });
        wrapper.find('input').forEach(function (node) {
            var rendering = node.render();
            var val = rendering.val().toLowerCase();
            var index = thingsToFind.indexOf(val);
            if (index >= 0) {
                thingsToFind.splice(index, 1);
            }
        });
        expect(thingsToFind.length).to.equal(0);
    });
    it('renders with a non-blank polygon location FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location2,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location2)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            return val.toLowerCase();
        })
            .filter(function (val) { return val !== 'poly'; });
        wrapper.find('input').forEach(function (node) {
            var rendering = node.render();
            var val = rendering.val().toLowerCase();
            var index = thingsToFind.indexOf(val);
            if (index >= 0) {
                thingsToFind.splice(index, 1);
            }
        });
        expect(thingsToFind.length).to.equal(0);
    });
    it('renders with a non-blank point radius location FilterClass', function () {
        var wrapper = mount(React.createElement(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location3,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location3)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            if (val === 'POINTRADIUS') {
                return 'point-radius';
            }
            return val.toLowerCase();
        })
            .filter(function (val) { return val !== 'circle'; });
        wrapper.find('input').forEach(function (node) {
            var rendering = node.render();
            var val = rendering.val().toLowerCase();
            var index = thingsToFind.indexOf(val);
            if (index >= 0) {
                thingsToFind.splice(index, 1);
            }
        });
        expect(thingsToFind.length).to.equal(0);
    });
});
//# sourceMappingURL=filter-leaf.spec.js.map