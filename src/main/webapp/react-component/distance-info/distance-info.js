import { __assign, __extends } from "tslib";
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
import * as React from 'react';
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
        _jsx(DistanceInfoPresentation, __assign({}, this.state))) : null;
    };
    return DistanceInfo;
}(React.Component));
export default withListenTo(DistanceInfo);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdGFuY2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvZGlzdGFuY2UtaW5mby9kaXN0YW5jZS1pbmZvLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUU5QixPQUFPLFlBQW1DLE1BQU0sdUJBQXVCLENBQUE7QUFDdkUsT0FBTyx3QkFBd0IsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNyRCxJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUE7QUFDdkIsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFBO0FBRXRCLElBQU0sZUFBZSxHQUFHLFVBQUMsS0FBWTtJQUMzQixJQUFBLEdBQUcsR0FBSyxLQUFLLElBQVYsQ0FBVTtJQUNyQixJQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDM0MsT0FBTztRQUNMLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEtBQUssT0FBTyxJQUFJLFFBQVE7UUFDakUsZUFBZSxFQUFFLFFBQVE7UUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVyxHQUFHLElBQUk7UUFDMUQsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUk7S0FDeEQsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQWFEO0lBQTJCLGdDQUE2QjtJQUN0RCxzQkFBWSxLQUFZO1FBQ3RCLFlBQUEsTUFBSyxZQUFDLEtBQUssQ0FBQyxTQUFBO1FBa0JkLGlCQUFXLEdBQUc7WUFDTixJQUFBLEtBQW9CLEtBQUksQ0FBQyxLQUFLLEVBQTVCLFFBQVEsY0FBQSxFQUFFLEdBQUcsU0FBZSxDQUFBO1lBQ3BDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsS0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFDbEUsUUFBUSxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsRUFBRSxLQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtRQUM3RSxDQUFDLENBQUE7UUFFRCwwQkFBb0IsR0FBRztZQUNyQixLQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUM1QyxDQUFDLENBQUE7UUFFRCxrQ0FBNEIsR0FBRztZQUM3QixLQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUM1QyxDQUFDLENBQUE7UUE3QkMsS0FBSSxDQUFDLEtBQUsseUJBQVEsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFFLFlBQVksRUFBRSxLQUFLLEdBQUUsQ0FBQTs7SUFDakUsQ0FBQztJQUVELHdDQUFpQixHQUFqQjtRQUNFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQixDQUFDO0lBRUQsMkNBQW9CLEdBQXBCO1FBQ1EsSUFBQSxLQUF5QixJQUFJLENBQUMsS0FBSyxFQUFqQyxhQUFhLG1CQUFBLEVBQUUsR0FBRyxTQUFlLENBQUE7UUFDekMsYUFBYSxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN2RSxhQUFhLENBQ1gsR0FBRyxFQUNILHlCQUF5QixFQUN6QixJQUFJLENBQUMsNEJBQTRCLENBQ2xDLENBQUE7SUFDSCxDQUFDO0lBZ0JELDZCQUFNLEdBQU47UUFDRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMvQixtSkFBbUo7UUFDbkosS0FBQyx3QkFBd0IsZUFBSyxJQUFJLENBQUMsS0FBSyxFQUFJLENBQzdDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtJQUNWLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF4Q0QsQ0FBMkIsS0FBSyxDQUFDLFNBQVMsR0F3Q3pDO0FBRUQsZUFBZSxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgd2l0aExpc3RlblRvLCB7IFdpdGhCYWNrYm9uZVByb3BzIH0gZnJvbSAnLi4vYmFja2JvbmUtY29udGFpbmVyJ1xuaW1wb3J0IERpc3RhbmNlSW5mb1ByZXNlbnRhdGlvbiBmcm9tICcuL3ByZXNlbnRhdGlvbidcbmNvbnN0IExFRlRfT0ZGU0VUID0gMzkwXG5jb25zdCBUT1BfT0ZGU0VUID0gMTgwXG5cbmNvbnN0IG1hcFByb3BzVG9TdGF0ZSA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBtYXAgfSA9IHByb3BzXG4gIGNvbnN0IGRpc3RhbmNlID0gbWFwLmdldCgnY3VycmVudERpc3RhbmNlJylcbiAgcmV0dXJuIHtcbiAgICBzaG93RGlzdGFuY2U6IG1hcC5nZXQoJ21lYXN1cmVtZW50U3RhdGUnKSA9PT0gJ1NUQVJUJyAmJiBkaXN0YW5jZSxcbiAgICBjdXJyZW50RGlzdGFuY2U6IGRpc3RhbmNlLFxuICAgIGxlZnQ6IG1hcC5nZXQoJ2Rpc3RhbmNlSW5mbycpWydsZWZ0J10gLSBMRUZUX09GRlNFVCArICdweCcsXG4gICAgdG9wOiBtYXAuZ2V0KCdkaXN0YW5jZUluZm8nKVsndG9wJ10gLSBUT1BfT0ZGU0VUICsgJ3B4JyxcbiAgfVxufVxuXG50eXBlIFByb3BzID0ge1xuICBtYXA6IEJhY2tib25lLk1vZGVsXG59ICYgV2l0aEJhY2tib25lUHJvcHNcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2hvd0Rpc3RhbmNlOiBCb29sZWFuXG4gIGN1cnJlbnREaXN0YW5jZTogTnVtYmVyXG4gIGxlZnQ6IFN0cmluZ1xuICB0b3A6IFN0cmluZ1xufVxuXG5jbGFzcyBEaXN0YW5jZUluZm8gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8UHJvcHMsIFN0YXRlPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7IC4uLm1hcFByb3BzVG9TdGF0ZShwcm9wcyksIHNob3dEaXN0YW5jZTogZmFsc2UgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5saXN0ZW5Ub01hcCgpXG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBjb25zdCB7IHN0b3BMaXN0ZW5pbmcsIG1hcCB9ID0gdGhpcy5wcm9wc1xuICAgIHN0b3BMaXN0ZW5pbmcobWFwLCAnY2hhbmdlOmN1cnJlbnREaXN0YW5jZScsIHRoaXMuaGFuZGxlRGlzdGFuY2VDaGFuZ2UpXG4gICAgc3RvcExpc3RlbmluZyhcbiAgICAgIG1hcCxcbiAgICAgICdjaGFuZ2U6bWVhc3VyZW1lbnRTdGF0ZScsXG4gICAgICB0aGlzLmhhbmRsZU1lYXN1cmVtZW50U3RhdGVDaGFuZ2VcbiAgICApXG4gIH1cblxuICBsaXN0ZW5Ub01hcCA9ICgpID0+IHtcbiAgICBjb25zdCB7IGxpc3RlblRvLCBtYXAgfSA9IHRoaXMucHJvcHNcbiAgICBsaXN0ZW5UbyhtYXAsICdjaGFuZ2U6Y3VycmVudERpc3RhbmNlJywgdGhpcy5oYW5kbGVEaXN0YW5jZUNoYW5nZSlcbiAgICBsaXN0ZW5UbyhtYXAsICdjaGFuZ2U6bWVhc3VyZW1lbnRTdGF0ZScsIHRoaXMuaGFuZGxlTWVhc3VyZW1lbnRTdGF0ZUNoYW5nZSlcbiAgfVxuXG4gIGhhbmRsZURpc3RhbmNlQ2hhbmdlID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUobWFwUHJvcHNUb1N0YXRlKHRoaXMucHJvcHMpKVxuICB9XG5cbiAgaGFuZGxlTWVhc3VyZW1lbnRTdGF0ZUNoYW5nZSA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKG1hcFByb3BzVG9TdGF0ZSh0aGlzLnByb3BzKSlcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zaG93RGlzdGFuY2UgPyAoXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ3sgc2hvd0Rpc3RhbmNlOiBCb29sZWFuOyBjdXJyZW50RGlzdGFuY2U6IE51Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIDxEaXN0YW5jZUluZm9QcmVzZW50YXRpb24gey4uLnRoaXMuc3RhdGV9IC8+XG4gICAgKSA6IG51bGxcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB3aXRoTGlzdGVuVG8oRGlzdGFuY2VJbmZvKVxuIl19