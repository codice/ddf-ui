import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import ExpandInteraction from './expand-interaction';
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
Enzyme.configure({ adapter: new Adapter() });
import { expect } from 'chai';
describe('smoke test', function () {
    it('it handles undefined', function () {
        var wrapper = mount(React.createElement(Router, null,
            React.createElement(ExpandInteraction, { onClose: function () { }, model: undefined })));
        expect(wrapper.html()).to.eq('');
    });
    it('it handles empty array', function () {
        var wrapper = mount(React.createElement(Router, null,
            React.createElement(ExpandInteraction, { onClose: function () { }, model: [] })));
        expect(wrapper.html()).to.eq('');
    });
});
//# sourceMappingURL=expand-interaction.spec.js.map