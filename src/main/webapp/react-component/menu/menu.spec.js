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
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { expect } from 'chai';
Enzyme.configure({ adapter: new Adapter() });
import { Menu, MenuItem } from './menu';
var shallow = Enzyme.shallow;
describe('<Menu />', function () {
    it('should not throw an error with no children', function () {
        // @ts-expect-error ts-migrate(2741) FIXME: Property 'onChange' is missing in type '{}' but re... Remove this comment to see the full error message
        shallow(React.createElement(Menu, null));
    });
    it('should render the correct number of <MenuItem />s', function () {
        var wrapper = shallow(React.createElement(Menu, { value: "two", onChange: function () { } },
            React.createElement(MenuItem, { value: "one" }),
            React.createElement(MenuItem, { value: "two" }),
            React.createElement(MenuItem, { value: "three" })));
        expect(wrapper.find('MenuItem').length).to.equal(3);
    });
    it('should have the correct <MenuItem /> selected', function () {
        var wrapper = shallow(React.createElement(Menu, { value: "two", onChange: function () { } },
            React.createElement(MenuItem, { value: "one" }),
            React.createElement(MenuItem, { value: "two" }),
            React.createElement(MenuItem, { value: "three" })));
        expect(wrapper.find({ selected: true }).prop('value')).to.equal('two');
    });
    it('should select the right <MenuItem /> on click', function (done) {
        var onChange = function (value) {
            expect(value).to.equal('one');
            done();
        };
        var wrapper = shallow(React.createElement(Menu, { value: "two", onChange: onChange },
            React.createElement(MenuItem, { value: "one" }),
            React.createElement(MenuItem, { value: "two" }),
            React.createElement(MenuItem, { value: "three" })));
        wrapper.find({ value: 'one' }).prop('onClick')();
    });
    var table = [
        {
            events: [],
            state: 'two',
        },
        {
            events: ['ArrowDown'],
            state: 'three',
        },
        {
            events: ['ArrowUp'],
            state: 'one',
        },
        {
            events: ['ArrowDown', 'ArrowDown'],
            state: 'one',
        },
        {
            events: ['ArrowDown', 'ArrowDown', 'ArrowDown'],
            state: 'two',
        },
    ];
    var mockEvent = function (code) { return ({
        code: code,
        preventDefault: function () { },
    }); };
    table.forEach(function (_a) {
        var events = _a.events, state = _a.state;
        it("should equal value='".concat(state, "' after ").concat(JSON.stringify(events)), function (done) {
            var onChange = function (value) {
                expect(value).to.equal(state);
                done();
            };
            var wrapper = shallow(React.createElement(Menu, { value: "two", onChange: onChange },
                React.createElement(MenuItem, { value: "one" }),
                React.createElement(MenuItem, { value: "two" }),
                React.createElement(MenuItem, { value: "three" })));
            var listener = wrapper.find('DocumentListener').prop('listener');
            events.forEach(function (event) {
                ;
                listener(mockEvent(event));
            });
            listener(mockEvent('Enter'));
        });
    });
    it('should activate <MenuItem /> on hover', function () {
        var wrapper = shallow(React.createElement(Menu, { value: "two", onChange: function () { } },
            React.createElement(MenuItem, { value: "one" }),
            React.createElement(MenuItem, { value: "two" }),
            React.createElement(MenuItem, { value: "three" })));
        expect(wrapper.state('active')).to.equal('two');
        wrapper.find({ value: 'one' }).prop('onHover')();
        expect(wrapper.state('active')).to.equal('one');
    });
    it('should support multi', function (done) {
        var onChange = function (value) {
            expect(value).to.deep.equal(['one', 'two']);
            done();
        };
        var wrapper = shallow(React.createElement(Menu, { multi: true, value: ['one'], onChange: onChange },
            React.createElement(MenuItem, { value: "one" }),
            React.createElement(MenuItem, { value: "two" }),
            React.createElement(MenuItem, { value: "three" })));
        var selected = wrapper.find({ value: 'one' }).prop('selected');
        expect(selected).to.equal(true);
        wrapper.find({ value: 'two' }).prop('onClick')();
    });
});
//# sourceMappingURL=menu.spec.js.map