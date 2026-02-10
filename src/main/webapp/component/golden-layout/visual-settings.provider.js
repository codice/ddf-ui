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
    return (_jsx(LayoutContext.Provider, { value: {
            getValue: getVisualSettingValue,
            setValue: setVisualSettingValue,
            onStateChanged: onVisualSettingChangedListener,
            visualTitle: container.title,
            hasLayoutContext: true,
        }, children: children }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L3Zpc3VhbC1zZXR0aW5ncy5wcm92aWRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBVXpCLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFvQjtJQUNsRSxRQUFRLEVBQUUsY0FBTyxDQUFDO0lBQ2xCLFFBQVEsRUFBRSxjQUFPLENBQUM7SUFDbEIsY0FBYyxFQUFFLFVBQUMsUUFBb0IsSUFBSyxPQUFBLFFBQVEsRUFBRSxFQUFWLENBQVU7SUFDcEQsV0FBVyxFQUFFLEVBQUU7SUFDZixnQkFBZ0IsRUFBRSxLQUFLO0NBQ3hCLENBQUMsQ0FBQTtBQVFGLE1BQU0sQ0FBQyxJQUFNLHNCQUFzQixHQUFHLFVBQUMsS0FBa0M7SUFDL0QsSUFBQSxTQUFTLEdBQTZCLEtBQUssVUFBbEMsRUFBRSxZQUFZLEdBQWUsS0FBSyxhQUFwQixFQUFFLFFBQVEsR0FBSyxLQUFLLFNBQVYsQ0FBVTtJQUVuRCxJQUFNLHFCQUFxQixHQUFHLFVBQUMsR0FBVyxFQUFFLFlBQWtCOztRQUM1RCxJQUFJLFdBQVcsR0FBRyxNQUFBLFNBQVMsQ0FBQyxRQUFRLEVBQUUsMENBQUcsR0FBRyxDQUFDLENBQUE7UUFFN0MsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksWUFBWSxFQUFFLENBQUM7WUFDL0QsV0FBVyxHQUFHLFlBQVksQ0FBQTtRQUM1QixDQUFDO1FBQ0QsT0FBTyxXQUFXLENBQUE7SUFDcEIsQ0FBQyxDQUFBO0lBRUQsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLEdBQVcsRUFBRSxLQUFVOztRQUNwRCxTQUFTLENBQUMsUUFBUSx1QkFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsZ0JBQUcsR0FBRyxJQUFHLEtBQUssT0FBRyxDQUFBO0lBQ3ZFLENBQUMsQ0FBQTtJQUVELElBQU0sOEJBQThCLEdBQUcsVUFBQyxRQUFvQjtRQUMxRCxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxjQUFNLE9BQUEsUUFBUSxFQUFFLEVBQVYsQ0FBVSxDQUFDLENBQUE7SUFDbkQsQ0FBQyxDQUFBO0lBRUQsT0FBTyxDQUNMLEtBQUMsYUFBYSxDQUFDLFFBQVEsSUFDckIsS0FBSyxFQUFFO1lBQ0wsUUFBUSxFQUFFLHFCQUFxQjtZQUMvQixRQUFRLEVBQUUscUJBQXFCO1lBQy9CLGNBQWMsRUFBRSw4QkFBOEI7WUFDOUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxLQUFLO1lBQzVCLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsWUFFQSxRQUFRLEdBQ2MsQ0FDMUIsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG50eXBlIExheW91dENvbnRleHRUeXBlID0ge1xuICBnZXRWYWx1ZTogKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBhbnkpID0+IGFueVxuICBzZXRWYWx1ZTogKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkXG4gIG9uU3RhdGVDaGFuZ2VkOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWRcbiAgdmlzdWFsVGl0bGU6IHN0cmluZ1xuICBoYXNMYXlvdXRDb250ZXh0OiBib29sZWFuXG59XG5cbmV4cG9ydCBjb25zdCBMYXlvdXRDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxMYXlvdXRDb250ZXh0VHlwZT4oe1xuICBnZXRWYWx1ZTogKCkgPT4ge30sXG4gIHNldFZhbHVlOiAoKSA9PiB7fSxcbiAgb25TdGF0ZUNoYW5nZWQ6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gY2FsbGJhY2soKSxcbiAgdmlzdWFsVGl0bGU6ICcnLFxuICBoYXNMYXlvdXRDb250ZXh0OiBmYWxzZSxcbn0pXG5cbnR5cGUgVmlzdWFsU2V0dGluZ3NQcm92aWRlclByb3BzID0ge1xuICBjb250YWluZXI6IGFueVxuICBnb2xkZW5MYXlvdXQ6IGFueVxuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlXG59XG5cbmV4cG9ydCBjb25zdCBWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyID0gKHByb3BzOiBWaXN1YWxTZXR0aW5nc1Byb3ZpZGVyUHJvcHMpID0+IHtcbiAgY29uc3QgeyBjb250YWluZXIsIGdvbGRlbkxheW91dCwgY2hpbGRyZW4gfSA9IHByb3BzXG5cbiAgY29uc3QgZ2V0VmlzdWFsU2V0dGluZ1ZhbHVlID0gKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBhbnkpID0+IHtcbiAgICBsZXQgc2V0dGluZ3NWYWwgPSBjb250YWluZXIuZ2V0U3RhdGUoKT8uW2tleV1cblxuICAgIGlmICgoIXNldHRpbmdzVmFsIHx8IHNldHRpbmdzVmFsLmxlbmd0aCA9PT0gMCkgJiYgZGVmYXVsdFZhbHVlKSB7XG4gICAgICBzZXR0aW5nc1ZhbCA9IGRlZmF1bHRWYWx1ZVxuICAgIH1cbiAgICByZXR1cm4gc2V0dGluZ3NWYWxcbiAgfVxuXG4gIGNvbnN0IHNldFZpc3VhbFNldHRpbmdWYWx1ZSA9IChrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xuICAgIGNvbnRhaW5lci5zZXRTdGF0ZSh7IC4uLihjb250YWluZXIuZ2V0U3RhdGUoKSB8fCB7fSksIFtrZXldOiB2YWx1ZSB9KVxuICB9XG5cbiAgY29uc3Qgb25WaXN1YWxTZXR0aW5nQ2hhbmdlZExpc3RlbmVyID0gKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgZ29sZGVuTGF5b3V0Lm9uKCdzdGF0ZUNoYW5nZWQnLCAoKSA9PiBjYWxsYmFjaygpKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8TGF5b3V0Q29udGV4dC5Qcm92aWRlclxuICAgICAgdmFsdWU9e3tcbiAgICAgICAgZ2V0VmFsdWU6IGdldFZpc3VhbFNldHRpbmdWYWx1ZSxcbiAgICAgICAgc2V0VmFsdWU6IHNldFZpc3VhbFNldHRpbmdWYWx1ZSxcbiAgICAgICAgb25TdGF0ZUNoYW5nZWQ6IG9uVmlzdWFsU2V0dGluZ0NoYW5nZWRMaXN0ZW5lcixcbiAgICAgICAgdmlzdWFsVGl0bGU6IGNvbnRhaW5lci50aXRsZSxcbiAgICAgICAgaGFzTGF5b3V0Q29udGV4dDogdHJ1ZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvTGF5b3V0Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuIl19