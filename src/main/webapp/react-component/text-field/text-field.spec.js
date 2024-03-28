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
import TextField from './text-field';
var mount = Enzyme.mount;
describe('<TextField />', function () {
    it('<input /> should have the right value', function () {
        var wrapper = mount(React.createElement(TextField, { value: "test" }));
        expect(wrapper.find('input').prop('value')).to.equal('test');
    });
    it('should update input on change', function (done) {
        var onChange = function (value) {
            expect(value).to.equal('test');
            done();
        };
        var wrapper = mount(React.createElement(TextField, { onChange: onChange }));
        // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
        wrapper.find('input').prop('onChange')({ target: { value: 'test' } });
    });
});
//# sourceMappingURL=text-field.spec.js.map