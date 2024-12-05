import { __assign, __extends } from "tslib";
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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import withListenTo from '../backbone-container';
import DistanceInfoPresentation from './presentation';
var LEFT_OFFSET = 390;
var TOP_OFFSET = 180;
var mapPropsToState = function (props) {
    var map = props.map;
    var distance = map.get('currentDistance');
    return {
        showDistance: map.get('measurementState') === 'START' && distance,
        currentDistance: distance,
        left: map.get('distanceInfo')['left'] - LEFT_OFFSET + 'px',
        top: map.get('distanceInfo')['top'] - TOP_OFFSET + 'px',
    };
};
var DistanceInfo = /** @class */ (function (_super) {
    __extends(DistanceInfo, _super);
    function DistanceInfo(props) {
        var _this = _super.call(this, props) || this;
        _this.listenToMap = function () {
            var _a = _this.props, listenTo = _a.listenTo, map = _a.map;
            listenTo(map, 'change:currentDistance', _this.handleDistanceChange);
            listenTo(map, 'change:measurementState', _this.handleMeasurementStateChange);
        };
        _this.handleDistanceChange = function () {
            _this.setState(mapPropsToState(_this.props));
        };
        _this.handleMeasurementStateChange = function () {
            _this.setState(mapPropsToState(_this.props));
        };
        _this.state = __assign(__assign({}, mapPropsToState(props)), { showDistance: false });
        return _this;
    }
    DistanceInfo.prototype.componentDidMount = function () {
        this.listenToMap();
    };
    DistanceInfo.prototype.componentWillUnmount = function () {
        var _a = this.props, stopListening = _a.stopListening, map = _a.map;
        stopListening(map, 'change:currentDistance', this.handleDistanceChange);
        stopListening(map, 'change:measurementState', this.handleMeasurementStateChange);
    };
    DistanceInfo.prototype.render = function () {
        return this.state.showDistance ? (
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ showDistance: Boolean; currentDistance: Nu... Remove this comment to see the full error message
        React.createElement(DistanceInfoPresentation, __assign({}, this.state))) : null;
    };
    return DistanceInfo;
}(React.Component));
export default hot(module)(withListenTo(DistanceInfo));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdGFuY2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvZGlzdGFuY2UtaW5mby9kaXN0YW5jZS1pbmZvLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLFlBQW1DLE1BQU0sdUJBQXVCLENBQUE7QUFDdkUsT0FBTyx3QkFBd0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNyRCxJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUE7QUFDdkIsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFBO0FBRXRCLElBQU0sZUFBZSxHQUFHLFVBQUMsS0FBWTtJQUMzQixJQUFBLEdBQUcsR0FBSyxLQUFLLElBQVYsQ0FBVTtJQUNyQixJQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDM0MsT0FBTztRQUNMLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEtBQUssT0FBTyxJQUFJLFFBQVE7UUFDakUsZUFBZSxFQUFFLFFBQVE7UUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVyxHQUFHLElBQUk7UUFDMUQsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUk7S0FDeEQsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQWFEO0lBQTJCLGdDQUE2QjtJQUN0RCxzQkFBWSxLQUFZO1FBQXhCLFlBQ0Usa0JBQU0sS0FBSyxDQUFDLFNBRWI7UUFnQkQsaUJBQVcsR0FBRztZQUNOLElBQUEsS0FBb0IsS0FBSSxDQUFDLEtBQUssRUFBNUIsUUFBUSxjQUFBLEVBQUUsR0FBRyxTQUFlLENBQUE7WUFDcEMsUUFBUSxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxLQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtZQUNsRSxRQUFRLENBQUMsR0FBRyxFQUFFLHlCQUF5QixFQUFFLEtBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO1FBQzdFLENBQUMsQ0FBQTtRQUVELDBCQUFvQixHQUFHO1lBQ3JCLEtBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQzVDLENBQUMsQ0FBQTtRQUVELGtDQUE0QixHQUFHO1lBQzdCLEtBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQzVDLENBQUMsQ0FBQTtRQTdCQyxLQUFJLENBQUMsS0FBSyx5QkFBUSxlQUFlLENBQUMsS0FBSyxDQUFDLEtBQUUsWUFBWSxFQUFFLEtBQUssR0FBRSxDQUFBOztJQUNqRSxDQUFDO0lBRUQsd0NBQWlCLEdBQWpCO1FBQ0UsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BCLENBQUM7SUFFRCwyQ0FBb0IsR0FBcEI7UUFDUSxJQUFBLEtBQXlCLElBQUksQ0FBQyxLQUFLLEVBQWpDLGFBQWEsbUJBQUEsRUFBRSxHQUFHLFNBQWUsQ0FBQTtRQUN6QyxhQUFhLENBQUMsR0FBRyxFQUFFLHdCQUF3QixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ3ZFLGFBQWEsQ0FDWCxHQUFHLEVBQ0gseUJBQXlCLEVBQ3pCLElBQUksQ0FBQyw0QkFBNEIsQ0FDbEMsQ0FBQTtJQUNILENBQUM7SUFnQkQsNkJBQU0sR0FBTjtRQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQy9CLG1KQUFtSjtRQUNuSixvQkFBQyx3QkFBd0IsZUFBSyxJQUFJLENBQUMsS0FBSyxFQUFJLENBQzdDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtJQUNWLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF4Q0QsQ0FBMkIsS0FBSyxDQUFDLFNBQVMsR0F3Q3pDO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB3aXRoTGlzdGVuVG8sIHsgV2l0aEJhY2tib25lUHJvcHMgfSBmcm9tICcuLi9iYWNrYm9uZS1jb250YWluZXInXG5pbXBvcnQgRGlzdGFuY2VJbmZvUHJlc2VudGF0aW9uIGZyb20gJy4vcHJlc2VudGF0aW9uJ1xuY29uc3QgTEVGVF9PRkZTRVQgPSAzOTBcbmNvbnN0IFRPUF9PRkZTRVQgPSAxODBcblxuY29uc3QgbWFwUHJvcHNUb1N0YXRlID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7IG1hcCB9ID0gcHJvcHNcbiAgY29uc3QgZGlzdGFuY2UgPSBtYXAuZ2V0KCdjdXJyZW50RGlzdGFuY2UnKVxuICByZXR1cm4ge1xuICAgIHNob3dEaXN0YW5jZTogbWFwLmdldCgnbWVhc3VyZW1lbnRTdGF0ZScpID09PSAnU1RBUlQnICYmIGRpc3RhbmNlLFxuICAgIGN1cnJlbnREaXN0YW5jZTogZGlzdGFuY2UsXG4gICAgbGVmdDogbWFwLmdldCgnZGlzdGFuY2VJbmZvJylbJ2xlZnQnXSAtIExFRlRfT0ZGU0VUICsgJ3B4JyxcbiAgICB0b3A6IG1hcC5nZXQoJ2Rpc3RhbmNlSW5mbycpWyd0b3AnXSAtIFRPUF9PRkZTRVQgKyAncHgnLFxuICB9XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1hcDogQmFja2JvbmUuTW9kZWxcbn0gJiBXaXRoQmFja2JvbmVQcm9wc1xuXG50eXBlIFN0YXRlID0ge1xuICBzaG93RGlzdGFuY2U6IEJvb2xlYW5cbiAgY3VycmVudERpc3RhbmNlOiBOdW1iZXJcbiAgbGVmdDogU3RyaW5nXG4gIHRvcDogU3RyaW5nXG59XG5cbmNsYXNzIERpc3RhbmNlSW5mbyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHsgLi4ubWFwUHJvcHNUb1N0YXRlKHByb3BzKSwgc2hvd0Rpc3RhbmNlOiBmYWxzZSB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLmxpc3RlblRvTWFwKClcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGNvbnN0IHsgc3RvcExpc3RlbmluZywgbWFwIH0gPSB0aGlzLnByb3BzXG4gICAgc3RvcExpc3RlbmluZyhtYXAsICdjaGFuZ2U6Y3VycmVudERpc3RhbmNlJywgdGhpcy5oYW5kbGVEaXN0YW5jZUNoYW5nZSlcbiAgICBzdG9wTGlzdGVuaW5nKFxuICAgICAgbWFwLFxuICAgICAgJ2NoYW5nZTptZWFzdXJlbWVudFN0YXRlJyxcbiAgICAgIHRoaXMuaGFuZGxlTWVhc3VyZW1lbnRTdGF0ZUNoYW5nZVxuICAgIClcbiAgfVxuXG4gIGxpc3RlblRvTWFwID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgbGlzdGVuVG8sIG1hcCB9ID0gdGhpcy5wcm9wc1xuICAgIGxpc3RlblRvKG1hcCwgJ2NoYW5nZTpjdXJyZW50RGlzdGFuY2UnLCB0aGlzLmhhbmRsZURpc3RhbmNlQ2hhbmdlKVxuICAgIGxpc3RlblRvKG1hcCwgJ2NoYW5nZTptZWFzdXJlbWVudFN0YXRlJywgdGhpcy5oYW5kbGVNZWFzdXJlbWVudFN0YXRlQ2hhbmdlKVxuICB9XG5cbiAgaGFuZGxlRGlzdGFuY2VDaGFuZ2UgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZShtYXBQcm9wc1RvU3RhdGUodGhpcy5wcm9wcykpXG4gIH1cblxuICBoYW5kbGVNZWFzdXJlbWVudFN0YXRlQ2hhbmdlID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUobWFwUHJvcHNUb1N0YXRlKHRoaXMucHJvcHMpKVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNob3dEaXN0YW5jZSA/IChcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyBzaG93RGlzdGFuY2U6IEJvb2xlYW47IGN1cnJlbnREaXN0YW5jZTogTnUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgPERpc3RhbmNlSW5mb1ByZXNlbnRhdGlvbiB7Li4udGhpcy5zdGF0ZX0gLz5cbiAgICApIDogbnVsbFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKHdpdGhMaXN0ZW5UbyhEaXN0YW5jZUluZm8pKVxuIl19