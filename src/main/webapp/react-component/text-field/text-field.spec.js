import { jsx as _jsx } from "react/jsx-runtime";
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
import { expect } from 'chai';
import TextField from './text-field';
import { fireEvent, render } from '@testing-library/react';
describe('<TextField />', function () {
    it('<input /> should have the right value', function () {
        var wrapper = render(_jsx(TextField, { value: "test" }));
        expect(wrapper.getByDisplayValue('test')).to.exist;
    });
    it('should update input on change', function (done) {
        var onChange = function (value) {
            expect(value).to.equal('test');
            done();
        };
        var wrapper = render(_jsx(TextField, { onChange: onChange }));
        fireEvent.change(wrapper.getByDisplayValue(''), {
            target: { value: 'test' },
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWVsZC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC90ZXh0LWZpZWxkL3RleHQtZmllbGQuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBRTdCLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQTtBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRTFELFFBQVEsQ0FBQyxlQUFlLEVBQUU7SUFDeEIsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO1FBQzFDLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFDLFNBQVMsSUFBQyxLQUFLLEVBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQTtJQUNwRCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxVQUFDLElBQUk7UUFDdkMsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFVO1lBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzlCLElBQUksRUFBRSxDQUFBO1FBQ1IsQ0FBQyxDQUFBO1FBQ0QsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUMsU0FBUyxJQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUksQ0FBQyxDQUFBO1FBQ3pELFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzlDLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7U0FDMUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJy4vdGV4dC1maWVsZCdcbmltcG9ydCB7IGZpcmVFdmVudCwgcmVuZGVyIH0gZnJvbSAnQHRlc3RpbmctbGlicmFyeS9yZWFjdCdcblxuZGVzY3JpYmUoJzxUZXh0RmllbGQgLz4nLCAoKSA9PiB7XG4gIGl0KCc8aW5wdXQgLz4gc2hvdWxkIGhhdmUgdGhlIHJpZ2h0IHZhbHVlJywgKCkgPT4ge1xuICAgIGNvbnN0IHdyYXBwZXIgPSByZW5kZXIoPFRleHRGaWVsZCB2YWx1ZT1cInRlc3RcIiAvPilcbiAgICBleHBlY3Qod3JhcHBlci5nZXRCeURpc3BsYXlWYWx1ZSgndGVzdCcpKS50by5leGlzdFxuICB9KVxuXG4gIGl0KCdzaG91bGQgdXBkYXRlIGlucHV0IG9uIGNoYW5nZScsIChkb25lKSA9PiB7XG4gICAgY29uc3Qgb25DaGFuZ2UgPSAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgZXhwZWN0KHZhbHVlKS50by5lcXVhbCgndGVzdCcpXG4gICAgICBkb25lKClcbiAgICB9XG4gICAgY29uc3Qgd3JhcHBlciA9IHJlbmRlcig8VGV4dEZpZWxkIG9uQ2hhbmdlPXtvbkNoYW5nZX0gLz4pXG4gICAgZmlyZUV2ZW50LmNoYW5nZSh3cmFwcGVyLmdldEJ5RGlzcGxheVZhbHVlKCcnKSwge1xuICAgICAgdGFyZ2V0OiB7IHZhbHVlOiAndGVzdCcgfSxcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==