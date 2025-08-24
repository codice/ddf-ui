import { __assign } from "tslib";
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
import { testComponent as ExampleCoordinates } from './example-coordinates';
import { render } from '@testing-library/react';
describe('<ExampleCoordinates />', function () {
    var props = {
        selected: 'mgrs',
        examples: { mgrs: '4Q FL 23009 12331' },
    };
    it('displays empty example for unknown coordinate type', function () {
        var wrapper = render(_jsx(ExampleCoordinates, { selected: "foo" }));
        // look for empty span, just one
        var span = wrapper.container.querySelector('span');
        expect(span).to.exist;
        if (span) {
            expect(span.textContent).to.equal('');
        }
    });
    it('displays the correct example', function () {
        var wrapper = render(_jsx(ExampleCoordinates, __assign({}, props)));
        expect(wrapper.getByText('4Q FL 23009 12331')).to.exist;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBsZS1jb29yZGluYXRlcy5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtc2V0dGluZ3MvZXhhbXBsZS1jb29yZGluYXRlcy5zcGVjLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQzdCLE9BQU8sRUFBRSxhQUFhLElBQUksa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFL0MsUUFBUSxDQUFDLHdCQUF3QixFQUFFO0lBQ2pDLElBQU0sS0FBSyxHQUFHO1FBQ1osUUFBUSxFQUFFLE1BQU07UUFDaEIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFO0tBQ3hDLENBQUE7SUFFRCxFQUFFLENBQUMsb0RBQW9ELEVBQUU7UUFDdkQsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUMsa0JBQWtCLElBQUMsUUFBUSxFQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDN0QsZ0NBQWdDO1FBQ2hDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3BELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFBO1FBQ3JCLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkMsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDhCQUE4QixFQUFFO1FBQ2pDLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFDLGtCQUFrQixlQUFLLEtBQUssRUFBSSxDQUFDLENBQUE7UUFDekQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUE7SUFDekQsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSdcbmltcG9ydCB7IHRlc3RDb21wb25lbnQgYXMgRXhhbXBsZUNvb3JkaW5hdGVzIH0gZnJvbSAnLi9leGFtcGxlLWNvb3JkaW5hdGVzJ1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnQHRlc3RpbmctbGlicmFyeS9yZWFjdCdcblxuZGVzY3JpYmUoJzxFeGFtcGxlQ29vcmRpbmF0ZXMgLz4nLCAoKSA9PiB7XG4gIGNvbnN0IHByb3BzID0ge1xuICAgIHNlbGVjdGVkOiAnbWdycycsXG4gICAgZXhhbXBsZXM6IHsgbWdyczogJzRRIEZMIDIzMDA5IDEyMzMxJyB9LFxuICB9XG5cbiAgaXQoJ2Rpc3BsYXlzIGVtcHR5IGV4YW1wbGUgZm9yIHVua25vd24gY29vcmRpbmF0ZSB0eXBlJywgKCkgPT4ge1xuICAgIGNvbnN0IHdyYXBwZXIgPSByZW5kZXIoPEV4YW1wbGVDb29yZGluYXRlcyBzZWxlY3RlZD1cImZvb1wiIC8+KVxuICAgIC8vIGxvb2sgZm9yIGVtcHR5IHNwYW4sIGp1c3Qgb25lXG4gICAgY29uc3Qgc3BhbiA9IHdyYXBwZXIuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKVxuICAgIGV4cGVjdChzcGFuKS50by5leGlzdFxuICAgIGlmIChzcGFuKSB7XG4gICAgICBleHBlY3Qoc3Bhbi50ZXh0Q29udGVudCkudG8uZXF1YWwoJycpXG4gICAgfVxuICB9KVxuXG4gIGl0KCdkaXNwbGF5cyB0aGUgY29ycmVjdCBleGFtcGxlJywgKCkgPT4ge1xuICAgIGNvbnN0IHdyYXBwZXIgPSByZW5kZXIoPEV4YW1wbGVDb29yZGluYXRlcyB7Li4ucHJvcHN9IC8+KVxuICAgIGV4cGVjdCh3cmFwcGVyLmdldEJ5VGV4dCgnNFEgRkwgMjMwMDkgMTIzMzEnKSkudG8uZXhpc3RcbiAgfSlcbn0pXG4iXX0=