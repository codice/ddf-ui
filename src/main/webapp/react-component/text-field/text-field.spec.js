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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWVsZC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC90ZXh0LWZpZWxkL3RleHQtZmllbGQuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUV6QixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUE7QUFDM0IsT0FBTyxPQUFPLE1BQU0sb0NBQW9DLENBQUE7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUU3QixNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBRTVDLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQTtBQUU1QixJQUFBLEtBQUssR0FBSyxNQUFNLE1BQVgsQ0FBVztBQUV4QixRQUFRLENBQUMsZUFBZSxFQUFFO0lBQ3hCLEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTtRQUMxQyxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsb0JBQUMsU0FBUyxJQUFDLEtBQUssRUFBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO1FBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUQsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsK0JBQStCLEVBQUUsVUFBQyxJQUFJO1FBQ3ZDLElBQU0sUUFBUSxHQUFHLFVBQUMsS0FBVTtZQUMxQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM5QixJQUFJLEVBQUUsQ0FBQTtRQUNSLENBQUMsQ0FBQTtRQUNELElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxvQkFBQyxTQUFTLElBQUMsUUFBUSxFQUFFLFFBQVEsR0FBSSxDQUFDLENBQUE7UUFDeEQsbUpBQW1KO1FBQ25KLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUN2RSxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmltcG9ydCBFbnp5bWUgZnJvbSAnZW56eW1lJ1xuaW1wb3J0IEFkYXB0ZXIgZnJvbSAnQHdvanRla21hai9lbnp5bWUtYWRhcHRlci1yZWFjdC0xNydcbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknXG5cbkVuenltZS5jb25maWd1cmUoeyBhZGFwdGVyOiBuZXcgQWRhcHRlcigpIH0pXG5cbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnLi90ZXh0LWZpZWxkJ1xuXG5jb25zdCB7IG1vdW50IH0gPSBFbnp5bWVcblxuZGVzY3JpYmUoJzxUZXh0RmllbGQgLz4nLCAoKSA9PiB7XG4gIGl0KCc8aW5wdXQgLz4gc2hvdWxkIGhhdmUgdGhlIHJpZ2h0IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IHdyYXBwZXIgPSBtb3VudCg8VGV4dEZpZWxkIHZhbHVlPVwidGVzdFwiIC8+KVxuICAgIGV4cGVjdCh3cmFwcGVyLmZpbmQoJ2lucHV0JykucHJvcCgndmFsdWUnKSkudG8uZXF1YWwoJ3Rlc3QnKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgdXBkYXRlIGlucHV0IG9uIGNoYW5nZScsIChkb25lKSA9PiB7XG4gICAgY29uc3Qgb25DaGFuZ2UgPSAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgZXhwZWN0KHZhbHVlKS50by5lcXVhbCgndGVzdCcpXG4gICAgICBkb25lKClcbiAgICB9XG4gICAgY29uc3Qgd3JhcHBlciA9IG1vdW50KDxUZXh0RmllbGQgb25DaGFuZ2U9e29uQ2hhbmdlfSAvPilcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjcyMikgRklYTUU6IENhbm5vdCBpbnZva2UgYW4gb2JqZWN0IHdoaWNoIGlzIHBvc3NpYmx5ICd1bmRlZmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICB3cmFwcGVyLmZpbmQoJ2lucHV0JykucHJvcCgnb25DaGFuZ2UnKSh7IHRhcmdldDogeyB2YWx1ZTogJ3Rlc3QnIH0gfSlcbiAgfSlcbn0pXG4iXX0=