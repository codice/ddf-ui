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
export var LayoutContext = React.createContext({
    getValue: function () { },
    setValue: function () { },
    onStateChanged: function (callback) { return callback(); },
    visualTitle: '',
    hasLayoutContext: false,
});
export var VisualSettingsProvider = function (props) {
    var container = props.container, goldenLayout = props.goldenLayout, children = props.children;
    var getVisualSettingValue = function (key, defaultValue) {
        var _a;
        var settingsVal = (_a = container.getState()) === null || _a === void 0 ? void 0 : _a[key];
        if ((!settingsVal || settingsVal.length === 0) && defaultValue) {
            settingsVal = defaultValue;
        }
        return settingsVal;
    };
    var setVisualSettingValue = function (key, value) {
        var _a;
        container.setState(__assign(__assign({}, (container.getState() || {})), (_a = {}, _a[key] = value, _a)));
    };
    var onVisualSettingChangedListener = function (callback) {
        goldenLayout.on('stateChanged', function () { return callback(); });
    };
    return (React.createElement(LayoutContext.Provider, { value: {
            getValue: getVisualSettingValue,
            setValue: setVisualSettingValue,
            onStateChanged: onVisualSettingChangedListener,
            visualTitle: container.title,
            hasLayoutContext: true,
        } }, children));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L3Zpc3VhbC1zZXR0aW5ncy5wcm92aWRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFVekIsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQW9CO0lBQ2xFLFFBQVEsRUFBRSxjQUFPLENBQUM7SUFDbEIsUUFBUSxFQUFFLGNBQU8sQ0FBQztJQUNsQixjQUFjLEVBQUUsVUFBQyxRQUFvQixJQUFLLE9BQUEsUUFBUSxFQUFFLEVBQVYsQ0FBVTtJQUNwRCxXQUFXLEVBQUUsRUFBRTtJQUNmLGdCQUFnQixFQUFFLEtBQUs7Q0FDeEIsQ0FBQyxDQUFBO0FBUUYsTUFBTSxDQUFDLElBQU0sc0JBQXNCLEdBQUcsVUFBQyxLQUFrQztJQUMvRCxJQUFBLFNBQVMsR0FBNkIsS0FBSyxVQUFsQyxFQUFFLFlBQVksR0FBZSxLQUFLLGFBQXBCLEVBQUUsUUFBUSxHQUFLLEtBQUssU0FBVixDQUFVO0lBRW5ELElBQU0scUJBQXFCLEdBQUcsVUFBQyxHQUFXLEVBQUUsWUFBa0I7O1FBQzVELElBQUksV0FBVyxHQUFHLE1BQUEsU0FBUyxDQUFDLFFBQVEsRUFBRSwwQ0FBRyxHQUFHLENBQUMsQ0FBQTtRQUU3QyxJQUFJLENBQUMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxZQUFZLEVBQUU7WUFDOUQsV0FBVyxHQUFHLFlBQVksQ0FBQTtTQUMzQjtRQUNELE9BQU8sV0FBVyxDQUFBO0lBQ3BCLENBQUMsQ0FBQTtJQUVELElBQU0scUJBQXFCLEdBQUcsVUFBQyxHQUFXLEVBQUUsS0FBVTs7UUFDcEQsU0FBUyxDQUFDLFFBQVEsdUJBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLGdCQUFHLEdBQUcsSUFBRyxLQUFLLE9BQUcsQ0FBQTtJQUN2RSxDQUFDLENBQUE7SUFFRCxJQUFNLDhCQUE4QixHQUFHLFVBQUMsUUFBb0I7UUFDMUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsY0FBTSxPQUFBLFFBQVEsRUFBRSxFQUFWLENBQVUsQ0FBQyxDQUFBO0lBQ25ELENBQUMsQ0FBQTtJQUVELE9BQU8sQ0FDTCxvQkFBQyxhQUFhLENBQUMsUUFBUSxJQUNyQixLQUFLLEVBQUU7WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsY0FBYyxFQUFFLDhCQUE4QjtZQUM5QyxXQUFXLEVBQUUsU0FBUyxDQUFDLEtBQUs7WUFDNUIsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixJQUVBLFFBQVEsQ0FDYyxDQUMxQixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5cbnR5cGUgTGF5b3V0Q29udGV4dFR5cGUgPSB7XG4gIGdldFZhbHVlOiAoa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IGFueSkgPT4gYW55XG4gIHNldFZhbHVlOiAoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHZvaWRcbiAgb25TdGF0ZUNoYW5nZWQ6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZFxuICB2aXN1YWxUaXRsZTogc3RyaW5nXG4gIGhhc0xheW91dENvbnRleHQ6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNvbnN0IExheW91dENvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0PExheW91dENvbnRleHRUeXBlPih7XG4gIGdldFZhbHVlOiAoKSA9PiB7fSxcbiAgc2V0VmFsdWU6ICgpID0+IHt9LFxuICBvblN0YXRlQ2hhbmdlZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBjYWxsYmFjaygpLFxuICB2aXN1YWxUaXRsZTogJycsXG4gIGhhc0xheW91dENvbnRleHQ6IGZhbHNlLFxufSlcblxudHlwZSBWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyUHJvcHMgPSB7XG4gIGNvbnRhaW5lcjogYW55XG4gIGdvbGRlbkxheW91dDogYW55XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbn1cblxuZXhwb3J0IGNvbnN0IFZpc3VhbFNldHRpbmdzUHJvdmlkZXIgPSAocHJvcHM6IFZpc3VhbFNldHRpbmdzUHJvdmlkZXJQcm9wcykgPT4ge1xuICBjb25zdCB7IGNvbnRhaW5lciwgZ29sZGVuTGF5b3V0LCBjaGlsZHJlbiB9ID0gcHJvcHNcblxuICBjb25zdCBnZXRWaXN1YWxTZXR0aW5nVmFsdWUgPSAoa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IGFueSkgPT4ge1xuICAgIGxldCBzZXR0aW5nc1ZhbCA9IGNvbnRhaW5lci5nZXRTdGF0ZSgpPy5ba2V5XVxuXG4gICAgaWYgKCghc2V0dGluZ3NWYWwgfHwgc2V0dGluZ3NWYWwubGVuZ3RoID09PSAwKSAmJiBkZWZhdWx0VmFsdWUpIHtcbiAgICAgIHNldHRpbmdzVmFsID0gZGVmYXVsdFZhbHVlXG4gICAgfVxuICAgIHJldHVybiBzZXR0aW5nc1ZhbFxuICB9XG5cbiAgY29uc3Qgc2V0VmlzdWFsU2V0dGluZ1ZhbHVlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XG4gICAgY29udGFpbmVyLnNldFN0YXRlKHsgLi4uKGNvbnRhaW5lci5nZXRTdGF0ZSgpIHx8IHt9KSwgW2tleV06IHZhbHVlIH0pXG4gIH1cblxuICBjb25zdCBvblZpc3VhbFNldHRpbmdDaGFuZ2VkTGlzdGVuZXIgPSAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHtcbiAgICBnb2xkZW5MYXlvdXQub24oJ3N0YXRlQ2hhbmdlZCcsICgpID0+IGNhbGxiYWNrKCkpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxMYXlvdXRDb250ZXh0LlByb3ZpZGVyXG4gICAgICB2YWx1ZT17e1xuICAgICAgICBnZXRWYWx1ZTogZ2V0VmlzdWFsU2V0dGluZ1ZhbHVlLFxuICAgICAgICBzZXRWYWx1ZTogc2V0VmlzdWFsU2V0dGluZ1ZhbHVlLFxuICAgICAgICBvblN0YXRlQ2hhbmdlZDogb25WaXN1YWxTZXR0aW5nQ2hhbmdlZExpc3RlbmVyLFxuICAgICAgICB2aXN1YWxUaXRsZTogY29udGFpbmVyLnRpdGxlLFxuICAgICAgICBoYXNMYXlvdXRDb250ZXh0OiB0cnVlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9MYXlvdXRDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG4iXX0=