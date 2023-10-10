import { __assign } from "tslib";
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
import { expect } from 'chai';
import { mount } from 'enzyme';
import { testComponent as ExampleCoordinates } from './example-coordinates';
describe('<ExampleCoordinates />', function () {
    var props = {
        selected: 'mgrs',
        examples: { mgrs: '4Q FL 23009 12331' },
    };
    it('renders', function () {
        var wrapper = mount(React.createElement(ExampleCoordinates, { selected: "foo" }));
        expect(wrapper.find({ selected: 'foo' }).length).to.equal(1);
    });
    it('displays empty example for unknown coordinate type', function () {
        var wrapper = mount(React.createElement(ExampleCoordinates, { selected: "foo" }));
        expect(wrapper.containsMatchingElement(React.createElement("span", null))).to.equal(true);
    });
    it('displays the correct example', function () {
        var wrapper = mount(React.createElement(ExampleCoordinates, __assign({}, props)));
        expect(wrapper.containsMatchingElement(React.createElement("span", null, "4Q FL 23009 12331"))).to.equal(true);
    });
});
//# sourceMappingURL=example-coordinates.spec.js.map