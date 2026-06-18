import { jsx as _jsx } from "react/jsx-runtime";
import { expect } from 'chai';
import FilterLeaf from './filter-leaf';
import { FilterClass, } from './filter.structure';
import moment from 'moment-timezone';
import user from '../singletons/user-instance';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { BasicDataTypePropertyName } from './reserved.properties';
import { render } from '@testing-library/react';
// trim whitespace, lowercase
function customNormalizer(text) {
    return text.trim().toLowerCase();
}
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
        render(_jsx(FilterLeaf, { filter: new FilterClass({}), setFilter: function () { } }));
    });
    it('renders with a non-blank text FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: 'ILIKE',
                property: 'anyText',
                value: 'text',
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('anyText');
        var textInput = filterLeafInstance.getByDisplayValue('text');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank number FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'integerType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('integerType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank integer FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'integerType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('integerType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank float FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'floatType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('floatType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank long FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'longType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('longType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank short FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'shortType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('shortType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank double FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '<',
                property: 'doubleType',
                value: 4,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('doubleType');
        var textInput = filterLeafInstance.getByDisplayValue('4');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank boolean FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: '=',
                property: 'booleanType',
                value: true,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('booleanType');
        var textInput = filterLeafInstance.getByDisplayValue('true');
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank date FilterClass', function () {
        user.get('user').get('preferences').set('timeZone', data.date1.timezone);
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: 'AFTER',
                property: 'dateType',
                value: data.date1.originalISO,
            }), setFilter: function () { } }));
        var anyTextInput = filterLeafInstance.getByDisplayValue('dateType');
        var textInput = filterLeafInstance.getByDisplayValue(data.date1.userFormatISO);
        expect(anyTextInput).to.exist;
        expect(textInput).to.exist;
    });
    it('renders with a non-blank location FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location1,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location1)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            return val;
        })
            .map(customNormalizer);
        thingsToFind.forEach(function (thing) {
            var input = filterLeafInstance.getByDisplayValue(thing, {
                normalizer: customNormalizer,
            });
            expect(input).to.exist;
        });
    });
    it('renders with a non-blank polygon location FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location2,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location2)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            return val;
        })
            .map(customNormalizer)
            .map(function (val) {
            if (val === 'poly') {
                return 'polygon';
            }
            return val;
        });
        thingsToFind.forEach(function (thing) {
            var input = filterLeafInstance.getByDisplayValue(thing, {
                normalizer: customNormalizer,
            });
            expect(input).to.exist;
        });
    });
    it('renders with a non-blank point radius location FilterClass', function () {
        var filterLeafInstance = render(_jsx(FilterLeaf, { filter: new FilterClass({
                type: 'DWITHIN',
                property: 'locationType',
                value: data.location3,
            }), setFilter: function () { } }));
        var thingsToFind = Object.values(data.location3)
            .map(function (val) {
            if (typeof val !== 'string') {
                return JSON.stringify(val);
            }
            return val;
        })
            .map(customNormalizer)
            .map(function (val) {
            if (val === 'circle' || val === 'pointradius') {
                return 'point-radius';
            }
            return val;
        });
        thingsToFind.forEach(function (thing) {
            var input = filterLeafInstance.getByDisplayValue(thing, {
                normalizer: customNormalizer,
            });
            expect(input).to.exist;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLWxlYWYuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLWxlYWYuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDN0IsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBQ3RDLE9BQU8sRUFDTCxXQUFXLEdBSVosTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQixPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLElBQUksTUFBTSw2QkFBNkIsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFL0MsNkJBQTZCO0FBQzdCLFNBQVMsZ0JBQWdCLENBQUMsSUFBWTtJQUNwQyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQyxDQUFDO0FBRUQsU0FBUyxXQUFXOztJQUNsQixnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxzQ0FBc0MsQ0FBQztRQUMxRSxPQUFPO2dCQUNMLFdBQVcsRUFBRTtvQkFDWCxJQUFJLEVBQUUsU0FBUztvQkFDZixFQUFFLEVBQUUsYUFBYTtvQkFDakIsV0FBVyxFQUFFLEtBQUs7b0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2lCQUNsQjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLE9BQU87b0JBQ2IsRUFBRSxFQUFFLFdBQVc7b0JBQ2YsV0FBVyxFQUFFLEtBQUs7b0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2lCQUNsQjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1Is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LENBQUM7WUFDRCxPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUMsQ0FBQzthQUNELEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQzthQUNyQixHQUFHLENBQUMsVUFBQyxHQUFHO1lBQ1AsSUFBSSxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxhQUFhLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxjQUFjLENBQUE7WUFDdkIsQ0FBQztZQUNELE9BQU8sR0FBRyxDQUFBO1FBQ1osQ0FBQyxDQUFDLENBQUE7UUFDSixZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUN6QixJQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3hELFVBQVUsRUFBRSxnQkFBZ0I7YUFDN0IsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUE7UUFDeEIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSdcbmltcG9ydCBGaWx0ZXJMZWFmIGZyb20gJy4vZmlsdGVyLWxlYWYnXG5pbXBvcnQge1xuICBGaWx0ZXJDbGFzcyxcbiAgTGluZUxvY2F0aW9uLFxuICBQb2ludFJhZGl1c0xvY2F0aW9uLFxuICBQb2x5Z29uTG9jYXRpb24sXG59IGZyb20gJy4vZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUgfSBmcm9tICcuL3Jlc2VydmVkLnByb3BlcnRpZXMnXG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICdAdGVzdGluZy1saWJyYXJ5L3JlYWN0J1xuXG4vLyB0cmltIHdoaXRlc3BhY2UsIGxvd2VyY2FzZVxuZnVuY3Rpb24gY3VzdG9tTm9ybWFsaXplcih0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIHRleHQudHJpbSgpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gYWRkVGVzdERlZnMoKSB7XG4gIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5hZGREeW5hbWljYWxseUZvdW5kTWV0YWNhcmREZWZpbml0aW9ucyh7XG4gICAgdGVzdGluZzoge1xuICAgICAgaW50ZWdlclR5cGU6IHtcbiAgICAgICAgdHlwZTogJ0lOVEVHRVInLFxuICAgICAgICBpZDogJ2ludGVnZXJUeXBlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBmbG9hdFR5cGU6IHtcbiAgICAgICAgdHlwZTogJ0ZMT0FUJyxcbiAgICAgICAgaWQ6ICdmbG9hdFR5cGUnLFxuICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGxvbmdUeXBlOiB7XG4gICAgICAgIHR5cGU6ICdMT05HJyxcbiAgICAgICAgaWQ6ICdsb25nVHlwZScsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgc2hvcnRUeXBlOiB7XG4gICAgICAgIHR5cGU6ICdTSE9SVCcsXG4gICAgICAgIGlkOiAnc2hvcnRUeXBlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBkb3VibGVUeXBlOiB7XG4gICAgICAgIHR5cGU6ICdET1VCTEUnLFxuICAgICAgICBpZDogJ2RvdWJsZVR5cGUnLFxuICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGJvb2xlYW5UeXBlOiB7XG4gICAgICAgIHR5cGU6ICdCT09MRUFOJyxcbiAgICAgICAgaWQ6ICdib29sZWFuVHlwZScsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgZGF0ZVR5cGU6IHtcbiAgICAgICAgdHlwZTogJ0RBVEUnLFxuICAgICAgICBpZDogJ2RhdGVUeXBlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvblR5cGU6IHtcbiAgICAgICAgdHlwZTogJ0xPQ0FUSU9OJyxcbiAgICAgICAgaWQ6ICdsb2NhdGlvblR5cGUnLFxuICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHhtbFR5cGU6IHtcbiAgICAgICAgdHlwZTogJ1hNTCcsXG4gICAgICAgIGlkOiAneG1sVHlwZScsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBiaW5hcnlUeXBlOiB7XG4gICAgICAgIHR5cGU6ICdCSU5BUlknLFxuICAgICAgICBpZDogJ2JpbmFyeVR5cGUnLFxuICAgICAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLFxuICAgICAgICBoaWRkZW46IHRydWUsXG4gICAgICB9LFxuICAgICAgJ2xvY2F0aW9uLmNvdW50cnktY29kZSc6IHtcbiAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgIGlkOiAnbG9jYXRpb24uY291bnRyeS1jb2RlJyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBkYXRhdHlwZToge1xuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgaWQ6ICdkYXRhdHlwZScsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgYW55VGV4dDoge1xuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgaWQ6ICdhbnlUZXh0JyxcbiAgICAgICAgbXVsdGl2YWx1ZWQ6IGZhbHNlLFxuICAgICAgICBpc0luamVjdGVkOiBmYWxzZSxcbiAgICAgICAgaGlkZGVuOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIFtCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lXToge1xuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgaWQ6IEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUsXG4gICAgICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsXG4gICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSlcbn1cblxuLy8gZG8gbm90IHJlbHkgb24gb3VyIG93biB0cmFuc2Zvcm1zIGZvciB0ZXN0aW5nLCByZWx5IG9uIHN0YXRpYyBkYXRhIVxuY29uc3QgZGF0YSA9IHtcbiAgZGF0ZTE6IHtcbiAgICB0aW1lem9uZTogJ0FtZXJpY2EvU3RfSm9obnMnLFxuICAgIG9yaWdpbmFsSVNPOiAnMjAyMS0wMS0xNVQwNjo1Mzo1NC4zMTZaJyxcbiAgICBvcmlnaW5hbERhdGU6IG5ldyBEYXRlKCcyMDIxLTAxLTE1VDA2OjUzOjU0LjMxNlonKSxcbiAgICBzaGlmdGVkSVNPOiAnMjAyMS0wMS0xNVQxMDoyMzo1NC4zMTZaJyxcbiAgICBzaGlmdGVkRGF0ZTogbmV3IERhdGUoJzIwMjEtMDEtMTVUMTA6MjM6NTQuMzE2WicpLFxuICAgIHVzZXJGb3JtYXRJU086ICcyMDIxLTAxLTE1VDAzOjIzOjU0LjMxNi0wMzozMCcsXG4gICAgdXNlckZvcm1hdDI0OiAnMTUgSmFuIDIwMjEgMDM6MjM6NTQuMzE2IC0wMzozMCcsXG4gICAgdXNlckZvcm1hdDEyOiAnMTUgSmFuIDIwMjEgMDM6MjM6NTQuMzE2IGFtIC0wMzozMCcsXG4gIH0sXG4gIGRhdGUyOiB7XG4gICAgdGltZXpvbmU6ICdBbWVyaWNhL1N0X0pvaG5zJyxcbiAgICB1c2VyU3VwcGxpZWRJbnB1dDogJzE1IEphbiAyMDIxIDAzOjI0OjU0LjMxNiAtMDI6MzAnLFxuICAgIHBhcnNlZE91dHB1dDogJzE1IEphbiAyMDIxIDAyOjI0OjU0LjMxNiAtMDM6MzAnLFxuICB9LFxuICBkYXRlMzoge1xuICAgIHRpbWV6b25lOiAnRXRjL1VUQycsXG4gICAgbWF4RnV0dXJlOiBtb21lbnQoKS5hZGQoMTAsICd5ZWFycycpLnRvSVNPU3RyaW5nKCksXG4gICAgZGlzYWxsb3dlZEZ1dHVyZTogbW9tZW50KCkuYWRkKDExLCAneWVhcnMnKS50b0lTT1N0cmluZygpLFxuICB9LFxuICBsb2NhdGlvbjE6IHtcbiAgICB0eXBlOiAnTElORScsXG4gICAgbW9kZTogJ2xpbmUnLFxuICAgIGxpbmVXaWR0aDogJzUwJyxcbiAgICBsaW5lOiBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbMSwgMV0sXG4gICAgXSxcbiAgfSBhcyBMaW5lTG9jYXRpb24sXG4gIGxvY2F0aW9uMjoge1xuICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICBtb2RlOiAncG9seScsXG4gICAgcG9seWdvbkJ1ZmZlcldpZHRoOiAnNTAnLFxuICAgIHBvbHlnb25CdWZmZXJVbml0czogJ21ldGVycycsXG4gICAgcG9seWdvbjogW1xuICAgICAgWzAsIDBdLFxuICAgICAgWzEsIDFdLFxuICAgICAgWzIsIDJdLFxuICAgICAgWzAsIDBdLFxuICAgIF0sXG4gIH0gYXMgUG9seWdvbkxvY2F0aW9uLFxuICBsb2NhdGlvbjM6IHtcbiAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgIHJhZGl1c1VuaXRzOiAnbWV0ZXJzJyxcbiAgICByYWRpdXM6IDUwLFxuICAgIGxhdDogMCxcbiAgICBsb246IDMwLFxuICB9IGFzIFBvaW50UmFkaXVzTG9jYXRpb24sXG59XG5cbmRlc2NyaWJlKCdmaWx0ZXIgbGVhZiB0ZXN0aW5nJywgKCkgPT4ge1xuICBiZWZvcmUoKCkgPT4ge1xuICAgIC8qKlxuICAgICAqIE5lZWRzIHRvIGJlIGRvbmUgaGVyZSwgb3RoZXJ3aXNlIHRoZXNlIGdldCBibG93biBhd2F5IHdoZW4gdGhlIG1vY2sgZmV0Y2ggaGFwcGVucy5cbiAgICAgKi9cbiAgICBhZGRUZXN0RGVmcygpXG4gIH0pXG4gIGl0KCdyZW5kZXJzIHdpdGggYSBibGFuayBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICByZW5kZXIoPEZpbHRlckxlYWYgZmlsdGVyPXtuZXcgRmlsdGVyQ2xhc3Moe30pfSBzZXRGaWx0ZXI9eygpID0+IHt9fSAvPilcbiAgfSlcbiAgaXQoJ3JlbmRlcnMgd2l0aCBhIG5vbi1ibGFuayB0ZXh0IEZpbHRlckNsYXNzJywgKCkgPT4ge1xuICAgIGNvbnN0IGZpbHRlckxlYWZJbnN0YW5jZSA9IHJlbmRlcihcbiAgICAgIDxGaWx0ZXJMZWFmXG4gICAgICAgIGZpbHRlcj17XG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgICAgdmFsdWU6ICd0ZXh0JyxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbHRlcj17KCkgPT4ge319XG4gICAgICAvPlxuICAgIClcbiAgICBjb25zdCBhbnlUZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJ2FueVRleHQnKVxuICAgIGNvbnN0IHRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgndGV4dCcpXG4gICAgZXhwZWN0KGFueVRleHRJbnB1dCkudG8uZXhpc3RcbiAgICBleHBlY3QodGV4dElucHV0KS50by5leGlzdFxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIG51bWJlciBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPCcsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2ludGVnZXJUeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiA0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyPXsoKSA9PiB7fX1cbiAgICAgIC8+XG4gICAgKVxuICAgIGNvbnN0IGFueVRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnaW50ZWdlclR5cGUnKVxuICAgIGNvbnN0IHRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnNCcpXG4gICAgZXhwZWN0KGFueVRleHRJbnB1dCkudG8uZXhpc3RcbiAgICBleHBlY3QodGV4dElucHV0KS50by5leGlzdFxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIGludGVnZXIgRmlsdGVyQ2xhc3MnLCAoKSA9PiB7XG4gICAgY29uc3QgZmlsdGVyTGVhZkluc3RhbmNlID0gcmVuZGVyKFxuICAgICAgPEZpbHRlckxlYWZcbiAgICAgICAgZmlsdGVyPXtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJzwnLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdpbnRlZ2VyVHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbHRlcj17KCkgPT4ge319XG4gICAgICAvPlxuICAgIClcbiAgICBjb25zdCBhbnlUZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJ2ludGVnZXJUeXBlJylcbiAgICBjb25zdCB0ZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJzQnKVxuICAgIGV4cGVjdChhbnlUZXh0SW5wdXQpLnRvLmV4aXN0XG4gICAgZXhwZWN0KHRleHRJbnB1dCkudG8uZXhpc3RcbiAgfSlcbiAgaXQoJ3JlbmRlcnMgd2l0aCBhIG5vbi1ibGFuayBmbG9hdCBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPCcsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2Zsb2F0VHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbHRlcj17KCkgPT4ge319XG4gICAgICAvPlxuICAgIClcbiAgICBjb25zdCBhbnlUZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJ2Zsb2F0VHlwZScpXG4gICAgY29uc3QgdGV4dElucHV0ID0gZmlsdGVyTGVhZkluc3RhbmNlLmdldEJ5RGlzcGxheVZhbHVlKCc0JylcbiAgICBleHBlY3QoYW55VGV4dElucHV0KS50by5leGlzdFxuICAgIGV4cGVjdCh0ZXh0SW5wdXQpLnRvLmV4aXN0XG4gIH0pXG4gIGl0KCdyZW5kZXJzIHdpdGggYSBub24tYmxhbmsgbG9uZyBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPCcsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2xvbmdUeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiA0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyPXsoKSA9PiB7fX1cbiAgICAgIC8+XG4gICAgKVxuICAgIGNvbnN0IGFueVRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnbG9uZ1R5cGUnKVxuICAgIGNvbnN0IHRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnNCcpXG4gICAgZXhwZWN0KGFueVRleHRJbnB1dCkudG8uZXhpc3RcbiAgICBleHBlY3QodGV4dElucHV0KS50by5leGlzdFxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIHNob3J0IEZpbHRlckNsYXNzJywgKCkgPT4ge1xuICAgIGNvbnN0IGZpbHRlckxlYWZJbnN0YW5jZSA9IHJlbmRlcihcbiAgICAgIDxGaWx0ZXJMZWFmXG4gICAgICAgIGZpbHRlcj17XG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICc8JyxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnc2hvcnRUeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiA0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyPXsoKSA9PiB7fX1cbiAgICAgIC8+XG4gICAgKVxuICAgIGNvbnN0IGFueVRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnc2hvcnRUeXBlJylcbiAgICBjb25zdCB0ZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJzQnKVxuICAgIGV4cGVjdChhbnlUZXh0SW5wdXQpLnRvLmV4aXN0XG4gICAgZXhwZWN0KHRleHRJbnB1dCkudG8uZXhpc3RcbiAgfSlcbiAgaXQoJ3JlbmRlcnMgd2l0aCBhIG5vbi1ibGFuayBkb3VibGUgRmlsdGVyQ2xhc3MnLCAoKSA9PiB7XG4gICAgY29uc3QgZmlsdGVyTGVhZkluc3RhbmNlID0gcmVuZGVyKFxuICAgICAgPEZpbHRlckxlYWZcbiAgICAgICAgZmlsdGVyPXtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJzwnLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdkb3VibGVUeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiA0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyPXsoKSA9PiB7fX1cbiAgICAgIC8+XG4gICAgKVxuICAgIGNvbnN0IGFueVRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnZG91YmxlVHlwZScpXG4gICAgY29uc3QgdGV4dElucHV0ID0gZmlsdGVyTGVhZkluc3RhbmNlLmdldEJ5RGlzcGxheVZhbHVlKCc0JylcbiAgICBleHBlY3QoYW55VGV4dElucHV0KS50by5leGlzdFxuICAgIGV4cGVjdCh0ZXh0SW5wdXQpLnRvLmV4aXN0XG4gIH0pXG4gIGl0KCdyZW5kZXJzIHdpdGggYSBub24tYmxhbmsgYm9vbGVhbiBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2Jvb2xlYW5UeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyPXsoKSA9PiB7fX1cbiAgICAgIC8+XG4gICAgKVxuICAgIGNvbnN0IGFueVRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgnYm9vbGVhblR5cGUnKVxuICAgIGNvbnN0IHRleHRJbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSgndHJ1ZScpXG4gICAgZXhwZWN0KGFueVRleHRJbnB1dCkudG8uZXhpc3RcbiAgICBleHBlY3QodGV4dElucHV0KS50by5leGlzdFxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIGRhdGUgRmlsdGVyQ2xhc3MnLCAoKSA9PiB7XG4gICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KCd0aW1lWm9uZScsIGRhdGEuZGF0ZTEudGltZXpvbmUpXG5cbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQUZURVInLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdkYXRlVHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogZGF0YS5kYXRlMS5vcmlnaW5hbElTTyxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbHRlcj17KCkgPT4ge319XG4gICAgICAvPlxuICAgIClcbiAgICBjb25zdCBhbnlUZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoJ2RhdGVUeXBlJylcbiAgICBjb25zdCB0ZXh0SW5wdXQgPSBmaWx0ZXJMZWFmSW5zdGFuY2UuZ2V0QnlEaXNwbGF5VmFsdWUoXG4gICAgICBkYXRhLmRhdGUxLnVzZXJGb3JtYXRJU09cbiAgICApXG4gICAgZXhwZWN0KGFueVRleHRJbnB1dCkudG8uZXhpc3RcbiAgICBleHBlY3QodGV4dElucHV0KS50by5leGlzdFxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIGxvY2F0aW9uIEZpbHRlckNsYXNzJywgKCkgPT4ge1xuICAgIGNvbnN0IGZpbHRlckxlYWZJbnN0YW5jZSA9IHJlbmRlcihcbiAgICAgIDxGaWx0ZXJMZWFmXG4gICAgICAgIGZpbHRlcj17XG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdEV0lUSElOJyxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnbG9jYXRpb25UeXBlJyxcbiAgICAgICAgICAgIHZhbHVlOiBkYXRhLmxvY2F0aW9uMSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbHRlcj17KCkgPT4ge319XG4gICAgICAvPlxuICAgIClcbiAgICBjb25zdCB0aGluZ3NUb0ZpbmQgPSBPYmplY3QudmFsdWVzKGRhdGEubG9jYXRpb24xKVxuICAgICAgLm1hcCgodmFsKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgfSlcbiAgICAgIC5tYXAoY3VzdG9tTm9ybWFsaXplcilcbiAgICB0aGluZ3NUb0ZpbmQuZm9yRWFjaCgodGhpbmcpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZmlsdGVyTGVhZkluc3RhbmNlLmdldEJ5RGlzcGxheVZhbHVlKHRoaW5nLCB7XG4gICAgICAgIG5vcm1hbGl6ZXI6IGN1c3RvbU5vcm1hbGl6ZXIsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGlucHV0KS50by5leGlzdFxuICAgIH0pXG4gIH0pXG4gIGl0KCdyZW5kZXJzIHdpdGggYSBub24tYmxhbmsgcG9seWdvbiBsb2NhdGlvbiBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnRFdJVEhJTicsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2xvY2F0aW9uVHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogZGF0YS5sb2NhdGlvbjIsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBzZXRGaWx0ZXI9eygpID0+IHt9fVxuICAgICAgLz5cbiAgICApXG4gICAgY29uc3QgdGhpbmdzVG9GaW5kID0gT2JqZWN0LnZhbHVlcyhkYXRhLmxvY2F0aW9uMilcbiAgICAgIC5tYXAoKHZhbCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0pXG4gICAgICAubWFwKGN1c3RvbU5vcm1hbGl6ZXIpXG4gICAgICAubWFwKCh2YWwpID0+IHtcbiAgICAgICAgaWYgKHZhbCA9PT0gJ3BvbHknKSB7XG4gICAgICAgICAgcmV0dXJuICdwb2x5Z29uJ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0pXG4gICAgdGhpbmdzVG9GaW5kLmZvckVhY2goKHRoaW5nKSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGZpbHRlckxlYWZJbnN0YW5jZS5nZXRCeURpc3BsYXlWYWx1ZSh0aGluZywge1xuICAgICAgICBub3JtYWxpemVyOiBjdXN0b21Ob3JtYWxpemVyLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChpbnB1dCkudG8uZXhpc3RcbiAgICB9KVxuICB9KVxuICBpdCgncmVuZGVycyB3aXRoIGEgbm9uLWJsYW5rIHBvaW50IHJhZGl1cyBsb2NhdGlvbiBGaWx0ZXJDbGFzcycsICgpID0+IHtcbiAgICBjb25zdCBmaWx0ZXJMZWFmSW5zdGFuY2UgPSByZW5kZXIoXG4gICAgICA8RmlsdGVyTGVhZlxuICAgICAgICBmaWx0ZXI9e1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnRFdJVEhJTicsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2xvY2F0aW9uVHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogZGF0YS5sb2NhdGlvbjMsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBzZXRGaWx0ZXI9eygpID0+IHt9fVxuICAgICAgLz5cbiAgICApXG4gICAgY29uc3QgdGhpbmdzVG9GaW5kID0gT2JqZWN0LnZhbHVlcyhkYXRhLmxvY2F0aW9uMylcbiAgICAgIC5tYXAoKHZhbCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0pXG4gICAgICAubWFwKGN1c3RvbU5vcm1hbGl6ZXIpXG4gICAgICAubWFwKCh2YWwpID0+IHtcbiAgICAgICAgaWYgKHZhbCA9PT0gJ2NpcmNsZScgfHwgdmFsID09PSAncG9pbnRyYWRpdXMnKSB7XG4gICAgICAgICAgcmV0dXJuICdwb2ludC1yYWRpdXMnXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgfSlcbiAgICB0aGluZ3NUb0ZpbmQuZm9yRWFjaCgodGhpbmcpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZmlsdGVyTGVhZkluc3RhbmNlLmdldEJ5RGlzcGxheVZhbHVlKHRoaW5nLCB7XG4gICAgICAgIG5vcm1hbGl6ZXI6IGN1c3RvbU5vcm1hbGl6ZXIsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGlucHV0KS50by5leGlzdFxuICAgIH0pXG4gIH0pXG59KVxuIl19