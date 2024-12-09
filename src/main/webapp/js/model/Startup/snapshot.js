import { __extends } from "tslib";
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
import _cloneDeep from 'lodash.clonedeep';
import _isEqualWith from 'lodash.isequalwith';
import { Subscribable } from '../Base/base-classes';
/**
 *  useSyncExternalStore expects us to return a cached or immutable version of the object
 *  as a result, it tries to be smart and only rerender if the object itself is different (despite our subscription telling it to update)
 *  this allows us to do a simple compare / snapshot to handle our usage of mutable data with useSyncExternalStore
 */
var SnapshotManager = /** @class */ (function (_super) {
    __extends(SnapshotManager, _super);
    function SnapshotManager(getMutable, subscribeToMutable) {
        var _this = _super.call(this) || this;
        _this.updateSnapshot = function () {
            var newSnapshot = _cloneDeep(_this.getMutable());
            if (!_isEqualWith(newSnapshot, _this.snapshot, function (_v1, _v2, key) {
                if (key === 'subscriptionsToMe') {
                    return true; // Ignore the "subscriptionsToMe" field
                }
                // Perform default comparison for other fields
                return undefined;
            })) {
                _this.snapshot = newSnapshot;
                _this._notifySubscribers({ thing: 'update' });
            }
        };
        _this.subscribe = function (callback) {
            return _this.subscribeTo({ subscribableThing: 'update', callback: callback });
        };
        _this.getSnapshot = function () {
            return _this.snapshot;
        };
        _this.getMutable = getMutable;
        _this.snapshot = _cloneDeep(_this.getMutable());
        _this.subscribeToMutable = subscribeToMutable;
        _this.subscribeToMutable(function () {
            _this.updateSnapshot();
        });
        return _this;
    }
    return SnapshotManager;
}(Subscribable));
export { SnapshotManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvU3RhcnR1cC9zbmFwc2hvdC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QyxPQUFPLFlBQVksTUFBTSxvQkFBb0IsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFFbkQ7Ozs7R0FJRztBQUNIO0lBQTJDLG1DQUFpQztJQW1CMUUseUJBQ0UsVUFBc0IsRUFDdEIsa0JBQWtEO1FBRnBELFlBSUUsaUJBQU8sU0FPUjtRQTFCTyxvQkFBYyxHQUFHO1lBQ3ZCLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtZQUNqRCxJQUNFLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxLQUFJLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUN0RCxJQUFJLEdBQUcsS0FBSyxtQkFBbUIsRUFBRTtvQkFDL0IsT0FBTyxJQUFJLENBQUEsQ0FBQyx1Q0FBdUM7aUJBQ3BEO2dCQUNELDhDQUE4QztnQkFDOUMsT0FBTyxTQUFTLENBQUE7WUFDbEIsQ0FBQyxDQUFDLEVBQ0Y7Z0JBQ0EsS0FBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUE7Z0JBQzNCLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO2FBQzdDO1FBQ0gsQ0FBQyxDQUFBO1FBYUQsZUFBUyxHQUFHLFVBQUMsUUFBb0I7WUFDL0IsT0FBTyxLQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFFBQVEsVUFBQSxFQUFFLENBQUMsQ0FBQTtRQUNwRSxDQUFDLENBQUE7UUFDRCxpQkFBVyxHQUFHO1lBQ1osT0FBTyxLQUFJLENBQUMsUUFBUSxDQUFBO1FBQ3RCLENBQUMsQ0FBQTtRQVpDLEtBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1FBQzVCLEtBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBQzdDLEtBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtRQUM1QyxLQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDdEIsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3ZCLENBQUMsQ0FBQyxDQUFBOztJQUNKLENBQUM7SUFPSCxzQkFBQztBQUFELENBQUMsQUFyQ0QsQ0FBMkMsWUFBWSxHQXFDdEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnXG5pbXBvcnQgX2lzRXF1YWxXaXRoIGZyb20gJ2xvZGFzaC5pc2VxdWFsd2l0aCdcbmltcG9ydCB7IFN1YnNjcmliYWJsZSB9IGZyb20gJy4uL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuXG4vKipcbiAqICB1c2VTeW5jRXh0ZXJuYWxTdG9yZSBleHBlY3RzIHVzIHRvIHJldHVybiBhIGNhY2hlZCBvciBpbW11dGFibGUgdmVyc2lvbiBvZiB0aGUgb2JqZWN0XG4gKiAgYXMgYSByZXN1bHQsIGl0IHRyaWVzIHRvIGJlIHNtYXJ0IGFuZCBvbmx5IHJlcmVuZGVyIGlmIHRoZSBvYmplY3QgaXRzZWxmIGlzIGRpZmZlcmVudCAoZGVzcGl0ZSBvdXIgc3Vic2NyaXB0aW9uIHRlbGxpbmcgaXQgdG8gdXBkYXRlKVxuICogIHRoaXMgYWxsb3dzIHVzIHRvIGRvIGEgc2ltcGxlIGNvbXBhcmUgLyBzbmFwc2hvdCB0byBoYW5kbGUgb3VyIHVzYWdlIG9mIG11dGFibGUgZGF0YSB3aXRoIHVzZVN5bmNFeHRlcm5hbFN0b3JlXG4gKi9cbmV4cG9ydCBjbGFzcyBTbmFwc2hvdE1hbmFnZXI8RGF0YT4gZXh0ZW5kcyBTdWJzY3JpYmFibGU8eyB0aGluZzogJ3VwZGF0ZScgfT4ge1xuICBwcml2YXRlIHNuYXBzaG90OiBEYXRhXG4gIHByaXZhdGUgZ2V0TXV0YWJsZTogKCkgPT4gRGF0YVxuICBwcml2YXRlIHN1YnNjcmliZVRvTXV0YWJsZTogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkXG4gIHByaXZhdGUgdXBkYXRlU25hcHNob3QgPSAoKSA9PiB7XG4gICAgY29uc3QgbmV3U25hcHNob3QgPSBfY2xvbmVEZWVwKHRoaXMuZ2V0TXV0YWJsZSgpKVxuICAgIGlmIChcbiAgICAgICFfaXNFcXVhbFdpdGgobmV3U25hcHNob3QsIHRoaXMuc25hcHNob3QsIChfdjEsIF92Miwga2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkgPT09ICdzdWJzY3JpcHRpb25zVG9NZScpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZSAvLyBJZ25vcmUgdGhlIFwic3Vic2NyaXB0aW9uc1RvTWVcIiBmaWVsZFxuICAgICAgICB9XG4gICAgICAgIC8vIFBlcmZvcm0gZGVmYXVsdCBjb21wYXJpc29uIGZvciBvdGhlciBmaWVsZHNcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfSlcbiAgICApIHtcbiAgICAgIHRoaXMuc25hcHNob3QgPSBuZXdTbmFwc2hvdFxuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ3VwZGF0ZScgfSlcbiAgICB9XG4gIH1cbiAgY29uc3RydWN0b3IoXG4gICAgZ2V0TXV0YWJsZTogKCkgPT4gRGF0YSxcbiAgICBzdWJzY3JpYmVUb011dGFibGU6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZFxuICApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5nZXRNdXRhYmxlID0gZ2V0TXV0YWJsZVxuICAgIHRoaXMuc25hcHNob3QgPSBfY2xvbmVEZWVwKHRoaXMuZ2V0TXV0YWJsZSgpKVxuICAgIHRoaXMuc3Vic2NyaWJlVG9NdXRhYmxlID0gc3Vic2NyaWJlVG9NdXRhYmxlXG4gICAgdGhpcy5zdWJzY3JpYmVUb011dGFibGUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVTbmFwc2hvdCgpXG4gICAgfSlcbiAgfVxuICBzdWJzY3JpYmUgPSAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVUbyh7IHN1YnNjcmliYWJsZVRoaW5nOiAndXBkYXRlJywgY2FsbGJhY2sgfSlcbiAgfVxuICBnZXRTbmFwc2hvdCA9ICgpOiBEYXRhID0+IHtcbiAgICByZXR1cm4gdGhpcy5zbmFwc2hvdFxuICB9XG59XG4iXX0=