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
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { DmsLatitude, DmsLongitude, } from '../../component/location-new/geo-components/coordinates';
import DirectionInput from '../../component/location-new/geo-components/direction';
var DmsTextfield = function (_a) {
    var point = _a.point, setPoint = _a.setPoint, deletePoint = _a.deletePoint;
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex flex-row items-center flex-nowrap" },
            React.createElement("div", { className: "flex flex-col space-y-2 flex-nowrap shrink w-full" },
                React.createElement(DmsLatitude, { label: "Latitude", value: point.lat, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { lat: value }));
                    } },
                    React.createElement(DirectionInput
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    , { 
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        options: ['N', 'S'], value: point.latDirection, onChange: function (value) {
                            setPoint(__assign(__assign({}, point), { latDirection: value }));
                        } })),
                React.createElement(DmsLongitude, { label: "Longitude", value: point.lon, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { lon: value }));
                    } },
                    React.createElement(DirectionInput
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    , { 
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        options: ['E', 'W'], value: point.lonDirection, onChange: function (value) {
                            setPoint(__assign(__assign({}, point), { lonDirection: value }));
                        } }))),
            React.createElement("div", { className: "shrink-0 grow-0" },
                React.createElement(IconButton, { onClick: deletePoint, size: "large" },
                    React.createElement(CloseIcon, null))))));
};
export default DmsTextfield;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG1zLXRleHRmaWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vZG1zLXRleHRmaWVsZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxFQUNMLFdBQVcsRUFDWCxZQUFZLEdBQ2IsTUFBTSx5REFBeUQsQ0FBQTtBQUNoRSxPQUFPLGNBQWMsTUFBTSx1REFBdUQsQ0FBQTtBQVdsRixJQUFNLFlBQVksR0FBRyxVQUFDLEVBUXJCO1FBUEMsS0FBSyxXQUFBLEVBQ0wsUUFBUSxjQUFBLEVBQ1IsV0FBVyxpQkFBQTtJQU1YLE9BQU8sQ0FDTDtRQUNFLDZCQUFLLFNBQVMsRUFBQyx3Q0FBd0M7WUFDckQsNkJBQUssU0FBUyxFQUFDLG1EQUFtRDtnQkFDaEUsb0JBQUMsV0FBVyxJQUNWLEtBQUssRUFBQyxVQUFVLEVBQ2hCLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxFQUNoQixRQUFRLEVBQUUsVUFBQyxLQUFhO3dCQUN0QixRQUFRLHVCQUNILEtBQUssS0FDUixHQUFHLEVBQUUsS0FBSyxJQUNWLENBQUE7b0JBQ0osQ0FBQztvQkFFRCxvQkFBQyxjQUFjO29CQUNiLDBFQUEwRTs7d0JBQTFFLDBFQUEwRTt3QkFDMUUsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUNuQixLQUFLLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFDekIsUUFBUSxFQUFFLFVBQUMsS0FBVTs0QkFDbkIsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsWUFBWSxFQUFFLEtBQUssSUFDbkIsQ0FBQTt3QkFDSixDQUFDLEdBQ0QsQ0FDVTtnQkFDZCxvQkFBQyxZQUFZLElBQ1gsS0FBSyxFQUFDLFdBQVcsRUFDakIsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQ2hCLFFBQVEsRUFBRSxVQUFDLEtBQWE7d0JBQ3RCLFFBQVEsdUJBQ0gsS0FBSyxLQUNSLEdBQUcsRUFBRSxLQUFLLElBQ1YsQ0FBQTtvQkFDSixDQUFDO29CQUVELG9CQUFDLGNBQWM7b0JBQ2IsMEVBQTBFOzt3QkFBMUUsMEVBQTBFO3dCQUMxRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ25CLEtBQUssRUFBRSxLQUFLLENBQUMsWUFBWSxFQUN6QixRQUFRLEVBQUUsVUFBQyxLQUFVOzRCQUNuQixRQUFRLHVCQUNILEtBQUssS0FDUixZQUFZLEVBQUUsS0FBSyxJQUNuQixDQUFBO3dCQUNKLENBQUMsR0FDRCxDQUNXLENBQ1g7WUFDTiw2QkFBSyxTQUFTLEVBQUMsaUJBQWlCO2dCQUM5QixvQkFBQyxVQUFVLElBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUMsT0FBTztvQkFDNUMsb0JBQUMsU0FBUyxPQUFHLENBQ0YsQ0FDVCxDQUNGLENBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxZQUFZLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBDbG9zZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DbG9zZSdcbmltcG9ydCBJY29uQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvSWNvbkJ1dHRvbidcbmltcG9ydCB7XG4gIERtc0xhdGl0dWRlLFxuICBEbXNMb25naXR1ZGUsXG59IGZyb20gJy4uLy4uL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvZ2VvLWNvbXBvbmVudHMvY29vcmRpbmF0ZXMnXG5pbXBvcnQgRGlyZWN0aW9uSW5wdXQgZnJvbSAnLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW5ldy9nZW8tY29tcG9uZW50cy9kaXJlY3Rpb24nXG5cbnR5cGUgRGlyZWN0aW9uID0gJ04nIHwgJ1MnIHwgJ0UnIHwgJ1cnXG5cbnR5cGUgUG9pbnQgPSB7XG4gIGxhdERpcmVjdGlvbjogRGlyZWN0aW9uXG4gIGxvbkRpcmVjdGlvbjogRGlyZWN0aW9uXG4gIGxhdDogc3RyaW5nXG4gIGxvbjogc3RyaW5nXG59XG5cbmNvbnN0IERtc1RleHRmaWVsZCA9ICh7XG4gIHBvaW50LFxuICBzZXRQb2ludCxcbiAgZGVsZXRlUG9pbnQsXG59OiB7XG4gIHBvaW50OiBQb2ludFxuICBzZXRQb2ludDogKHBvaW50OiBQb2ludCkgPT4gdm9pZFxuICBkZWxldGVQb2ludDogKCkgPT4gdm9pZFxufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBzcGFjZS15LTIgZmxleC1ub3dyYXAgc2hyaW5rIHctZnVsbFwiPlxuICAgICAgICAgIDxEbXNMYXRpdHVkZVxuICAgICAgICAgICAgbGFiZWw9XCJMYXRpdHVkZVwiXG4gICAgICAgICAgICB2YWx1ZT17cG9pbnQubGF0fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIHNldFBvaW50KHtcbiAgICAgICAgICAgICAgICAuLi5wb2ludCxcbiAgICAgICAgICAgICAgICBsYXQ6IHZhbHVlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8RGlyZWN0aW9uSW5wdXRcbiAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI3NjkpIEZJWE1FOiBObyBvdmVybG9hZCBtYXRjaGVzIHRoaXMgY2FsbC5cbiAgICAgICAgICAgICAgb3B0aW9ucz17WydOJywgJ1MnXX1cbiAgICAgICAgICAgICAgdmFsdWU9e3BvaW50LmxhdERpcmVjdGlvbn1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0UG9pbnQoe1xuICAgICAgICAgICAgICAgICAgLi4ucG9pbnQsXG4gICAgICAgICAgICAgICAgICBsYXREaXJlY3Rpb246IHZhbHVlLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRG1zTGF0aXR1ZGU+XG4gICAgICAgICAgPERtc0xvbmdpdHVkZVxuICAgICAgICAgICAgbGFiZWw9XCJMb25naXR1ZGVcIlxuICAgICAgICAgICAgdmFsdWU9e3BvaW50Lmxvbn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBzZXRQb2ludCh7XG4gICAgICAgICAgICAgICAgLi4ucG9pbnQsXG4gICAgICAgICAgICAgICAgbG9uOiB2YWx1ZSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPERpcmVjdGlvbklucHV0XG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzY5KSBGSVhNRTogTm8gb3ZlcmxvYWQgbWF0Y2hlcyB0aGlzIGNhbGwuXG4gICAgICAgICAgICAgIG9wdGlvbnM9e1snRScsICdXJ119XG4gICAgICAgICAgICAgIHZhbHVlPXtwb2ludC5sb25EaXJlY3Rpb259XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFBvaW50KHtcbiAgICAgICAgICAgICAgICAgIC4uLnBvaW50LFxuICAgICAgICAgICAgICAgICAgbG9uRGlyZWN0aW9uOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0Rtc0xvbmdpdHVkZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2hyaW5rLTAgZ3Jvdy0wXCI+XG4gICAgICAgICAgPEljb25CdXR0b24gb25DbGljaz17ZGVsZXRlUG9pbnR9IHNpemU9XCJsYXJnZVwiPlxuICAgICAgICAgICAgPENsb3NlSWNvbiAvPlxuICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBEbXNUZXh0ZmllbGRcbiJdfQ==