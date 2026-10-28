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
export var ddPoint = {
    latitude: '',
    longitude: '',
};
export var ddModel = {
    shape: 'point',
    point: __assign({}, ddPoint),
    circle: {
        point: __assign({}, ddPoint),
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
        north: '',
        south: '',
        east: '',
        west: '',
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGQtbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9tb2RlbHMvZGQtbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixNQUFNLENBQUMsSUFBTSxPQUFPLEdBQUc7SUFDckIsUUFBUSxFQUFFLEVBQUU7SUFDWixTQUFTLEVBQUUsRUFBRTtDQUNkLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxPQUFPLEdBQUc7SUFDckIsS0FBSyxFQUFFLE9BQU87SUFDZCxLQUFLLGVBQU8sT0FBTyxDQUFFO0lBQ3JCLE1BQU0sRUFBRTtRQUNOLEtBQUssZUFBTyxPQUFPLENBQUU7UUFDckIsTUFBTSxFQUFFLEdBQUc7UUFDWCxLQUFLLEVBQUUsUUFBUTtLQUNoQjtJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxFQUFFO0tBQ1Q7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsRUFBRTtLQUNUO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsS0FBSyxFQUFFLEVBQUU7UUFDVCxLQUFLLEVBQUUsRUFBRTtRQUNULElBQUksRUFBRSxFQUFFO1FBQ1IsSUFBSSxFQUFFLEVBQUU7S0FDVDtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmV4cG9ydCBjb25zdCBkZFBvaW50ID0ge1xuICBsYXRpdHVkZTogJycsXG4gIGxvbmdpdHVkZTogJycsXG59XG5cbmV4cG9ydCBjb25zdCBkZE1vZGVsID0ge1xuICBzaGFwZTogJ3BvaW50JyxcbiAgcG9pbnQ6IHsgLi4uZGRQb2ludCB9LFxuICBjaXJjbGU6IHtcbiAgICBwb2ludDogeyAuLi5kZFBvaW50IH0sXG4gICAgcmFkaXVzOiAnMScsXG4gICAgdW5pdHM6ICdtZXRlcnMnLFxuICB9LFxuICBsaW5lOiB7XG4gICAgbGlzdDogW10sXG4gIH0sXG4gIHBvbHlnb246IHtcbiAgICBsaXN0OiBbXSxcbiAgfSxcbiAgYm91bmRpbmdib3g6IHtcbiAgICBub3J0aDogJycsXG4gICAgc291dGg6ICcnLFxuICAgIGVhc3Q6ICcnLFxuICAgIHdlc3Q6ICcnLFxuICB9LFxufVxuIl19