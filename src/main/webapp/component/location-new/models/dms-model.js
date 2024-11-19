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
import { Direction } from '../utils/dms-utils';
var dmsLatitude = {
    coordinate: '',
    direction: Direction.North,
};
var dmsLongitude = {
    coordinate: '',
    direction: Direction.East,
};
export var dmsPoint = {
    latitude: __assign({}, dmsLatitude),
    longitude: __assign({}, dmsLongitude),
};
export var dmsModel = {
    shape: 'point',
    point: __assign({}, dmsPoint),
    circle: {
        point: __assign({}, dmsPoint),
        radius: '1',
        units: 'meters',
    },
    line: {
        list: [],
    },
    polygon: {
        list: [],
    },
    boundingbox: {
        north: __assign({}, dmsLatitude),
        south: __assign({}, dmsLatitude),
        east: __assign({}, dmsLongitude),
        west: __assign({}, dmsLongitude),
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG1zLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvbW9kZWxzL2Rtcy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUU5QyxJQUFNLFdBQVcsR0FBRztJQUNsQixVQUFVLEVBQUUsRUFBRTtJQUNkLFNBQVMsRUFBRSxTQUFTLENBQUMsS0FBSztDQUMzQixDQUFBO0FBRUQsSUFBTSxZQUFZLEdBQUc7SUFDbkIsVUFBVSxFQUFFLEVBQUU7SUFDZCxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUk7Q0FDMUIsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRztJQUN0QixRQUFRLGVBQU8sV0FBVyxDQUFFO0lBQzVCLFNBQVMsZUFBTyxZQUFZLENBQUU7Q0FDL0IsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRztJQUN0QixLQUFLLEVBQUUsT0FBTztJQUNkLEtBQUssZUFBTyxRQUFRLENBQUU7SUFDdEIsTUFBTSxFQUFFO1FBQ04sS0FBSyxlQUFPLFFBQVEsQ0FBRTtRQUN0QixNQUFNLEVBQUUsR0FBRztRQUNYLEtBQUssRUFBRSxRQUFRO0tBQ2hCO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLEVBQUU7S0FDVDtJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxFQUFFO0tBQ1Q7SUFDRCxXQUFXLEVBQUU7UUFDWCxLQUFLLGVBQU8sV0FBVyxDQUFFO1FBQ3pCLEtBQUssZUFBTyxXQUFXLENBQUU7UUFDekIsSUFBSSxlQUFPLFlBQVksQ0FBRTtRQUN6QixJQUFJLGVBQU8sWUFBWSxDQUFFO0tBQzFCO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgRGlyZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvZG1zLXV0aWxzJ1xuXG5jb25zdCBkbXNMYXRpdHVkZSA9IHtcbiAgY29vcmRpbmF0ZTogJycsXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uLk5vcnRoLFxufVxuXG5jb25zdCBkbXNMb25naXR1ZGUgPSB7XG4gIGNvb3JkaW5hdGU6ICcnLFxuICBkaXJlY3Rpb246IERpcmVjdGlvbi5FYXN0LFxufVxuXG5leHBvcnQgY29uc3QgZG1zUG9pbnQgPSB7XG4gIGxhdGl0dWRlOiB7IC4uLmRtc0xhdGl0dWRlIH0sXG4gIGxvbmdpdHVkZTogeyAuLi5kbXNMb25naXR1ZGUgfSxcbn1cblxuZXhwb3J0IGNvbnN0IGRtc01vZGVsID0ge1xuICBzaGFwZTogJ3BvaW50JyxcbiAgcG9pbnQ6IHsgLi4uZG1zUG9pbnQgfSxcbiAgY2lyY2xlOiB7XG4gICAgcG9pbnQ6IHsgLi4uZG1zUG9pbnQgfSxcbiAgICByYWRpdXM6ICcxJyxcbiAgICB1bml0czogJ21ldGVycycsXG4gIH0sXG4gIGxpbmU6IHtcbiAgICBsaXN0OiBbXSxcbiAgfSxcbiAgcG9seWdvbjoge1xuICAgIGxpc3Q6IFtdLFxuICB9LFxuICBib3VuZGluZ2JveDoge1xuICAgIG5vcnRoOiB7IC4uLmRtc0xhdGl0dWRlIH0sXG4gICAgc291dGg6IHsgLi4uZG1zTGF0aXR1ZGUgfSxcbiAgICBlYXN0OiB7IC4uLmRtc0xvbmdpdHVkZSB9LFxuICAgIHdlc3Q6IHsgLi4uZG1zTG9uZ2l0dWRlIH0sXG4gIH0sXG59XG4iXX0=