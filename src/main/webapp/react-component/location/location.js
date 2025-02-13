import { __assign, __read, __rest } from "tslib";
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
import LocationOldModel from '../../component/location-old/location-old';
import wreqr from '../../js/wreqr';
import { Drawing, useIsDrawing } from '../../component/singletons/drawing';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Line from './line';
import Polygon from './polygon';
import PointRadius from './point-radius';
import BoundingBox from './bounding-box';
import Gazetteer from './gazetteer';
import ShapeUtils from '../../js/ShapeUtils';
import ExtensionPoints from '../../extension-points/extension-points';
import { useTheme } from '@mui/material/styles';
import { Popover } from '@mui/material';
import { ColorSquare, LocationColorSelector } from './location-color-selector';
import { useMenuState } from '../../component/menu-state/menu-state';
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks';
var BaseInputs = {
    line: {
        label: 'Line',
        Component: Line,
    },
    poly: {
        label: 'Polygon',
        Component: Polygon,
    },
    circle: {
        label: 'Point-Radius',
        Component: PointRadius,
    },
    bbox: {
        label: 'Bounding Box',
        Component: BoundingBox,
    },
    keyword: {
        label: 'Keyword',
        Component: function (_a) {
            var setState = _a.setState, keywordValue = _a.keywordValue, props = __rest(_a, ["setState", "keywordValue"]);
            return (
            // Offsets className="form-group flow-root" below
            React.createElement("div", null,
                React.createElement(Gazetteer, __assign({}, props, { value: keywordValue, setState: function (_a) {
                        var value = _a.value, data = __rest(_a, ["value"]);
                        setState(__assign({ keywordValue: value }, data));
                    }, setBufferState: function (key, value) {
                        var _a;
                        return setState((_a = {}, _a[key] = value, _a));
                    }, variant: "outlined" }))));
        },
    },
};
var drawTypes = ['line', 'poly', 'circle', 'bbox'];
function getCurrentValue(_a) {
    var locationModel = _a.locationModel;
    var modelJSON = locationModel.toJSON();
    var type;
    if (modelJSON.polygon !== undefined) {
        type = ShapeUtils.isArray3D(modelJSON.polygon) ? 'MULTIPOLYGON' : 'POLYGON';
    }
    else if (modelJSON.lat !== undefined &&
        modelJSON.lon !== undefined &&
        modelJSON.radius !== undefined) {
        type = 'POINTRADIUS';
    }
    else if (modelJSON.line !== undefined &&
        modelJSON.lineWidth !== undefined) {
        type = 'LINE';
    }
    else if (modelJSON.north !== undefined &&
        modelJSON.south !== undefined &&
        modelJSON.east !== undefined &&
        modelJSON.west !== undefined) {
        type = 'BBOX';
    }
    return Object.assign(modelJSON, {
        type: type,
        lineWidth: modelJSON.lineWidth,
        radius: modelJSON.radius,
    });
}
function updateMap(_a) {
    var locationModel = _a.locationModel;
    var mode = locationModel.get('mode');
    if (mode !== undefined && Drawing.isDrawing() !== true) {
        ;
        wreqr.vent.trigger('search:' + mode + 'display', locationModel);
    }
}
export var LocationContext = React.createContext({
    filterInputPredicate: function (_name) {
        return true;
    },
});
var LocationInput = function (_a) {
    var onChange = _a.onChange, value = _a.value, errorListener = _a.errorListener;
    var MetacardDefinitions = useMetacardDefinitions();
    var inputs = React.useMemo(function () {
        return ExtensionPoints.locationTypes(BaseInputs);
    }, [ExtensionPoints.locationTypes]);
    var locationContext = React.useContext(LocationContext);
    var _b = __read(React.useState(new LocationOldModel(value)), 1), locationModel = _b[0];
    var _c = __read(React.useState(locationModel.toJSON()), 2), state = _c[0], setState = _c[1];
    var isDrawing = useIsDrawing();
    var _d = useBackbone(), listenTo = _d.listenTo, stopListening = _d.stopListening;
    var _f = useMenuState(), MuiButtonProps = _f.MuiButtonProps, MuiPopoverProps = _f.MuiPopoverProps;
    var onDraw = function () {
        ;
        wreqr.vent.trigger('search:draw' + locationModel.attributes.mode, locationModel);
    };
    var onDrawCancel = function () {
        ;
        wreqr.vent.trigger('search:drawcancel', locationModel);
    };
    var onDrawEnd = function () {
        ;
        wreqr.vent.trigger('search:drawend', locationModel);
    };
    var setColor = function (color) {
        locationModel.set('color', color);
        onDrawEnd();
    };
    React.useEffect(function () {
        var callback = function () { return updateMap({ locationModel: locationModel }); };
        listenTo(wreqr.vent, 'search:requestlocationmodels', callback);
        return function () {
            return stopListening(wreqr.vent, 'search:requestlocationmodels', callback);
        };
    }, []);
    React.useEffect(function () {
        return function () {
            setTimeout(function () {
                // This is to facilitate clearing out the map, it isn't about the value, but we don't want the changeCallback to fire!
                locationModel.set(locationModel.defaults());
                wreqr.vent.trigger('search:removedisplay', locationModel);
                onDrawEnd();
            }, 0);
        };
    }, []);
    React.useEffect(function () {
        var callback = function () { return onDraw(); };
        listenTo(wreqr.vent, 'search:requestdrawingmodels', callback);
        return function () {
            return stopListening(wreqr.vent, 'search:requestdrawingmodels', callback);
        };
    }, []);
    React.useEffect(function () {
        var onChangeCallback = function () {
            setState(locationModel.toJSON());
            updateMap({ locationModel: locationModel });
            onChange(getCurrentValue({ locationModel: locationModel }));
        };
        listenTo(locationModel, 'change', onChangeCallback);
        return function () {
            stopListening(locationModel, 'change', onChangeCallback);
        };
    }, [onChange]);
    React.useEffect(function () {
        var onDoubleClickCallback = function (locationId) {
            if (locationModel.attributes.locationId === locationId)
                onDraw();
        };
        listenTo(wreqr.vent, 'location:doubleClick', onDoubleClickCallback);
        return function () {
            stopListening(wreqr.vent, 'location:doubleClick', onDoubleClickCallback);
        };
    }, [locationModel, state]);
    var ComponentToRender = inputs[state.mode]
        ? inputs[state.mode].Component
        : function () { return null; };
    var options = Object.entries(inputs)
        .map(function (entry) {
        var _a = __read(entry, 2), key = _a[0], value = _a[1];
        return {
            label: value.label,
            value: key,
        };
    })
        .filter(function (value) {
        return locationContext.filterInputPredicate(value.value);
    });
    return (React.createElement("div", null,
        React.createElement("div", null,
            React.createElement(Autocomplete, { className: "mb-2", "data-id": "filter-type-autocomplete", fullWidth: true, size: "small", options: options, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) {
                    return option.value === value.value;
                }, onChange: function (_e, newValue) {
                    locationModel.set('mode', newValue.value);
                }, disableClearable: true, value: options.find(function (opt) { return opt.value === state.mode; }) || {
                    value: '',
                    label: '',
                }, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined", placeholder: 'Select ' + MetacardDefinitions.getAlias('location') + ' Option' }))); } }),
            React.createElement("div", { className: "form-group flow-root" },
                React.createElement(ComponentToRender, __assign({}, state, { setState: function (args) {
                        locationModel.set(args); // always update the locationModel, that's our "source of truth", above we map this back into state by listening to changes
                    }, errorListener: errorListener })),
                drawTypes.includes(state.mode) ? (React.createElement("div", null,
                    React.createElement("div", { className: "flex my-1.5 ml-2 align-middle" },
                        React.createElement("div", { className: "align-middle my-auto pr-16 mr-1" }, "Color"),
                        React.createElement(ColorSquare, __assign({ disabled: isDrawing, color: state.color }, MuiButtonProps, useTheme(), { size: '1.8rem' })),
                        React.createElement(Popover, __assign({}, MuiPopoverProps),
                            React.createElement(LocationColorSelector, { setColor: setColor }))),
                    isDrawing && locationModel === Drawing.getDrawModel() ? (React.createElement(Button, { className: "location-draw mt-2", onClick: onDrawCancel, color: "secondary", fullWidth: true },
                        React.createElement("span", { className: "ml-2" }, "Cancel Drawing"))) : (React.createElement(Button, { className: "location-draw mt-2", onClick: onDraw, color: "primary", fullWidth: true },
                        React.createElement("span", { className: "fa fa-globe" }),
                        React.createElement("span", { className: "ml-2" }, "Draw"))))) : null))));
};
export default hot(module)(LocationInput);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L2xvY2F0aW9uL2xvY2F0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sZ0JBQWdCLE1BQU0sMkNBQTJDLENBQUE7QUFDeEUsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scURBQXFELENBQUE7QUFDakYsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQTtBQUN6QixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxXQUFXLE1BQU0sZ0JBQWdCLENBQUE7QUFDeEMsT0FBTyxXQUFXLE1BQU0sZ0JBQWdCLENBQUE7QUFDeEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFBO0FBQ25DLE9BQU8sVUFBVSxNQUFNLHFCQUFxQixDQUFBO0FBQzVDLE9BQU8sZUFBZSxNQUFNLHlDQUF5QyxDQUFBO0FBQ3JFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUM5RSxPQUFPLEVB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QUMsQ0FBQyxDQUFDLENBQ2hDO29CQUNFLDZCQUFLLFNBQVMsRUFBQywrQkFBK0I7d0JBQzVDLDZCQUFLLFNBQVMsRUFBQyxpQ0FBaUMsWUFBWTt3QkFDNUQsb0JBQUMsV0FBVyxhQUNWLFFBQVEsRUFBRSxTQUFTLEVBQ25CLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxJQUNkLGNBQWMsRUFDZCxRQUFRLEVBQUUsSUFDZCxJQUFJLEVBQUUsUUFBUSxJQUNkO3dCQUNGLG9CQUFDLE9BQU8sZUFBSyxlQUFlOzRCQUMxQixvQkFBQyxxQkFBcUIsSUFBQyxRQUFRLEVBQUUsUUFBUSxHQUFJLENBQ3JDLENBQ047b0JBQ0wsU0FBUyxJQUFJLGFBQWEsS0FBSyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ3ZELG9CQUFDLE1BQU0sSUFDTCxTQUFTLEVBQUMsb0JBQW9CLEVBQzlCLE9BQU8sRUFBRSxZQUFZLEVBQ3JCLEtBQUssRUFBQyxXQUFXLEVBQ2pCLFNBQVM7d0JBRVQsOEJBQU0sU0FBUyxFQUFDLE1BQU0scUJBQXNCLENBQ3JDLENBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FDRixvQkFBQyxNQUFNLElBQ0wsU0FBUyxFQUFDLG9CQUFvQixFQUM5QixPQUFPLEVBQUUsTUFBTSxFQUNmLEtBQUssRUFBQyxTQUFTLEVBQ2YsU0FBUzt3QkFFVCw4QkFBTSxTQUFTLEVBQUMsYUFBYSxHQUFHO3dCQUNoQyw4QkFBTSxTQUFTLEVBQUMsTUFBTSxXQUFZLENBQzNCLENBQ1YsQ0FDRyxDQUNQLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDSixDQUNGLENBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IExvY2F0aW9uT2xkTW9kZWwgZnJvbSAnLi4vLi4vY29tcG9uZW50L2xvY2F0aW9uLW9sZC9sb2NhdGlvbi1vbGQnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgeyBEcmF3aW5nLCB1c2VJc0RyYXdpbmcgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9kcmF3aW5nJ1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IExpbmUgZnJvbSAnLi9saW5lJ1xuaW1wb3J0IFBvbHlnb24gZnJvbSAnLi9wb2x5Z29uJ1xuaW1wb3J0IFBvaW50UmFkaXVzIGZyb20gJy4vcG9pbnQtcmFkaXVzJ1xuaW1wb3J0IEJvdW5kaW5nQm94IGZyb20gJy4vYm91bmRpbmctYm94J1xuaW1wb3J0IEdhemV0dGVlciBmcm9tICcuL2dhemV0dGVlcidcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4uLy4uL2pzL1NoYXBlVXRpbHMnXG5pbXBvcnQgRXh0ZW5zaW9uUG9pbnRzIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMvZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnXG5pbXBvcnQgeyBQb3BvdmVyIH0gZnJvbSAnQG11aS9tYXRlcmlhbCdcbmltcG9ydCB7IENvbG9yU3F1YXJlLCBMb2NhdGlvbkNvbG9yU2VsZWN0b3IgfSBmcm9tICcuL2xvY2F0aW9uLWNvbG9yLXNlbGVjdG9yJ1xuaW1wb3J0IHsgdXNlTWVudVN0YXRlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L21lbnUtc3RhdGUvbWVudS1zdGF0ZSdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuXG50eXBlIElucHV0VHlwZSA9IHtcbiAgbGFiZWw6IHN0cmluZ1xuICBDb21wb25lbnQ6IGFueVxufVxuZXhwb3J0IHR5cGUgSW5wdXRzVHlwZSA9IHtcbiAgW2tleTogc3RyaW5nXTogSW5wdXRUeXBlXG59XG5cbmNvbnN0IEJhc2VJbnB1dHMgPSB7XG4gIGxpbmU6IHtcbiAgICBsYWJlbDogJ0xpbmUnLFxuICAgIENvbXBvbmVudDogTGluZSxcbiAgfSxcbiAgcG9seToge1xuICAgIGxhYmVsOiAnUG9seWdvbicsXG4gICAgQ29tcG9uZW50OiBQb2x5Z29uLFxuICB9LFxuICBjaXJjbGU6IHtcbiAgICBsYWJlbDogJ1BvaW50LVJhZGl1cycsXG4gICAgQ29tcG9uZW50OiBQb2ludFJhZGl1cyxcbiAgfSxcbiAgYmJveDoge1xuICAgIGxhYmVsOiAnQm91bmRpbmcgQm94JyxcbiAgICBDb21wb25lbnQ6IEJvdW5kaW5nQm94LFxuICB9LFxuICBrZXl3b3JkOiB7XG4gICAgbGFiZWw6ICdLZXl3b3JkJyxcbiAgICBDb21wb25lbnQ6ICh7IHNldFN0YXRlLCBrZXl3b3JkVmFsdWUsIC4uLnByb3BzIH06IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gT2Zmc2V0cyBjbGFzc05hbWU9XCJmb3JtLWdyb3VwIGZsb3ctcm9vdFwiIGJlbG93XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPEdhemV0dGVlclxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgdmFsdWU9e2tleXdvcmRWYWx1ZX1cbiAgICAgICAgICAgIHNldFN0YXRlPXsoeyB2YWx1ZSwgLi4uZGF0YSB9OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgc2V0U3RhdGUoeyBrZXl3b3JkVmFsdWU6IHZhbHVlLCAuLi5kYXRhIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2V0QnVmZmVyU3RhdGU9eyhrZXk6IGFueSwgdmFsdWU6IGFueSkgPT5cbiAgICAgICAgICAgICAgc2V0U3RhdGUoeyBba2V5XTogdmFsdWUgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfSxcbiAgfSxcbn0gYXMgSW5wdXRzVHlwZVxuXG5jb25zdCBkcmF3VHlwZXMgPSBbJ2xpbmUnLCAncG9seScsICdjaXJjbGUnLCAnYmJveCddXG5mdW5jdGlvbiBnZXRDdXJyZW50VmFsdWUoeyBsb2NhdGlvbk1vZGVsIH06IGFueSkge1xuICBjb25zdCBtb2RlbEpTT04gPSBsb2NhdGlvbk1vZGVsLnRvSlNPTigpXG4gIGxldCB0eXBlXG4gIGlmIChtb2RlbEpTT04ucG9seWdvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdHlwZSA9IFNoYXBlVXRpbHMuaXNBcnJheTNEKG1vZGVsSlNPTi5wb2x5Z29uKSA/ICdNVUxUSVBPTFlHT04nIDogJ1BPTFlHT04nXG4gIH0gZWxzZSBpZiAoXG4gICAgbW9kZWxKU09OLmxhdCAhPT0gdW5kZWZpbmVkICYmXG4gICAgbW9kZWxKU09OLmxvbiAhPT0gdW5kZWZpbmVkICYmXG4gICAgbW9kZWxKU09OLnJhZGl1cyAhPT0gdW5kZWZpbmVkXG4gICkge1xuICAgIHR5cGUgPSAnUE9JTlRSQURJVVMnXG4gIH0gZWxzZSBpZiAoXG4gICAgbW9kZWxKU09OLmxpbmUgIT09IHVuZGVmaW5lZCAmJlxuICAgIG1vZGVsSlNPTi5saW5lV2lkdGggIT09IHVuZGVmaW5lZFxuICApIHtcbiAgICB0eXBlID0gJ0xJTkUnXG4gIH0gZWxzZSBpZiAoXG4gICAgbW9kZWxKU09OLm5vcnRoICE9PSB1bmRlZmluZWQgJiZcbiAgICBtb2RlbEpTT04uc291dGggIT09IHVuZGVmaW5lZCAmJlxuICAgIG1vZGVsSlNPTi5lYXN0ICE9PSB1bmRlZmluZWQgJiZcbiAgICBtb2RlbEpTT04ud2VzdCAhPT0gdW5kZWZpbmVkXG4gICkge1xuICAgIHR5cGUgPSAnQkJPWCdcbiAgfVxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihtb2RlbEpTT04sIHtcbiAgICB0eXBlLFxuICAgIGxpbmVXaWR0aDogbW9kZWxKU09OLmxpbmVXaWR0aCxcbiAgICByYWRpdXM6IG1vZGVsSlNPTi5yYWRpdXMsXG4gIH0pXG59XG5mdW5jdGlvbiB1cGRhdGVNYXAoeyBsb2NhdGlvbk1vZGVsIH06IGFueSkge1xuICBjb25zdCBtb2RlID0gbG9jYXRpb25Nb2RlbC5nZXQoJ21vZGUnKVxuICBpZiAobW9kZSAhPT0gdW5kZWZpbmVkICYmIERyYXdpbmcuaXNEcmF3aW5nKCkgIT09IHRydWUpIHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzZWFyY2g6JyArIG1vZGUgKyAnZGlzcGxheScsIGxvY2F0aW9uTW9kZWwpXG4gIH1cbn1cbmV4cG9ydCBjb25zdCBMb2NhdGlvbkNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KHtcbiAgZmlsdGVySW5wdXRQcmVkaWNhdGU6IChfbmFtZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbn0pXG5jb25zdCBMb2NhdGlvbklucHV0ID0gKHsgb25DaGFuZ2UsIHZhbHVlLCBlcnJvckxpc3RlbmVyIH06IGFueSkgPT4ge1xuICBjb25zdCBNZXRhY2FyZERlZmluaXRpb25zID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IGlucHV0cyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBFeHRlbnNpb25Qb2ludHMubG9jYXRpb25UeXBlcyhCYXNlSW5wdXRzKVxuICB9LCBbRXh0ZW5zaW9uUG9pbnRzLmxvY2F0aW9uVHlwZXNdKVxuICBjb25zdCBsb2NhdGlvbkNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExvY2F0aW9uQ29udGV4dClcbiAgY29uc3QgW2xvY2F0aW9uTW9kZWxdID0gUmVhY3QudXNlU3RhdGUobmV3IExvY2F0aW9uT2xkTW9kZWwodmFsdWUpIGFzIGFueSlcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZShsb2NhdGlvbk1vZGVsLnRvSlNPTigpIGFzIGFueSlcbiAgY29uc3QgaXNEcmF3aW5nID0gdXNlSXNEcmF3aW5nKClcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCB7IE11aUJ1dHRvblByb3BzLCBNdWlQb3BvdmVyUHJvcHMgfSA9IHVzZU1lbnVTdGF0ZSgpXG4gIGNvbnN0IG9uRHJhdyA9ICgpID0+IHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKFxuICAgICAgJ3NlYXJjaDpkcmF3JyArIGxvY2F0aW9uTW9kZWwuYXR0cmlidXRlcy5tb2RlLFxuICAgICAgbG9jYXRpb25Nb2RlbFxuICAgIClcbiAgfVxuICBjb25zdCBvbkRyYXdDYW5jZWwgPSAoKSA9PiB7XG4gICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc2VhcmNoOmRyYXdjYW5jZWwnLCBsb2NhdGlvbk1vZGVsKVxuICB9XG4gIGNvbnN0IG9uRHJhd0VuZCA9ICgpID0+IHtcbiAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzZWFyY2g6ZHJhd2VuZCcsIGxvY2F0aW9uTW9kZWwpXG4gIH1cbiAgY29uc3Qgc2V0Q29sb3IgPSAoY29sb3I6IHN0cmluZykgPT4ge1xuICAgIGxvY2F0aW9uTW9kZWwuc2V0KCdjb2xvcicsIGNvbG9yKVxuICAgIG9uRHJhd0VuZCgpXG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHVwZGF0ZU1hcCh7IGxvY2F0aW9uTW9kZWwgfSlcbiAgICBsaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAnc2VhcmNoOnJlcXVlc3Rsb2NhdGlvbm1vZGVscycsIGNhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PlxuICAgICAgc3RvcExpc3RlbmluZyhcbiAgICAgICAgKHdyZXFyIGFzIGFueSkudmVudCxcbiAgICAgICAgJ3NlYXJjaDpyZXF1ZXN0bG9jYXRpb25tb2RlbHMnLFxuICAgICAgICBjYWxsYmFja1xuICAgICAgKVxuICB9LCBbXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgdG8gZmFjaWxpdGF0ZSBjbGVhcmluZyBvdXQgdGhlIG1hcCwgaXQgaXNuJ3QgYWJvdXQgdGhlIHZhbHVlLCBidXQgd2UgZG9uJ3Qgd2FudCB0aGUgY2hhbmdlQ2FsbGJhY2sgdG8gZmlyZSFcbiAgICAgICAgbG9jYXRpb25Nb2RlbC5zZXQobG9jYXRpb25Nb2RlbC5kZWZhdWx0cygpKVxuICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzZWFyY2g6cmVtb3ZlZGlzcGxheScsIGxvY2F0aW9uTW9kZWwpXG4gICAgICAgIG9uRHJhd0VuZCgpXG4gICAgICB9LCAwKVxuICAgIH1cbiAgfSwgW10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiBvbkRyYXcoKVxuICAgIGxpc3RlblRvKCh3cmVxciBhcyBhbnkpLnZlbnQsICdzZWFyY2g6cmVxdWVzdGRyYXdpbmdtb2RlbHMnLCBjYWxsYmFjaylcbiAgICByZXR1cm4gKCkgPT5cbiAgICAgIHN0b3BMaXN0ZW5pbmcoXG4gICAgICAgICh3cmVxciBhcyBhbnkpLnZlbnQsXG4gICAgICAgICdzZWFyY2g6cmVxdWVzdGRyYXdpbmdtb2RlbHMnLFxuICAgICAgICBjYWxsYmFja1xuICAgICAgKVxuICB9LCBbXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkNoYW5nZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgc2V0U3RhdGUobG9jYXRpb25Nb2RlbC50b0pTT04oKSlcbiAgICAgIHVwZGF0ZU1hcCh7IGxvY2F0aW9uTW9kZWwgfSlcbiAgICAgIG9uQ2hhbmdlKGdldEN1cnJlbnRWYWx1ZSh7IGxvY2F0aW9uTW9kZWwgfSkpXG4gICAgfVxuICAgIGxpc3RlblRvKGxvY2F0aW9uTW9kZWwsICdjaGFuZ2UnLCBvbkNoYW5nZUNhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdG9wTGlzdGVuaW5nKGxvY2F0aW9uTW9kZWwsICdjaGFuZ2UnLCBvbkNoYW5nZUNhbGxiYWNrKVxuICAgIH1cbiAgfSwgW29uQ2hhbmdlXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvbkRvdWJsZUNsaWNrQ2FsbGJhY2sgPSAobG9jYXRpb25JZDogYW55KSA9PiB7XG4gICAgICBpZiAobG9jYXRpb25Nb2RlbC5hdHRyaWJ1dGVzLmxvY2F0aW9uSWQgPT09IGxvY2F0aW9uSWQpIG9uRHJhdygpXG4gICAgfVxuICAgIGxpc3RlblRvKCh3cmVxciBhcyBhbnkpLnZlbnQsICdsb2NhdGlvbjpkb3VibGVDbGljaycsIG9uRG91YmxlQ2xpY2tDYWxsYmFjaylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcExpc3RlbmluZyhcbiAgICAgICAgKHdyZXFyIGFzIGFueSkudmVudCxcbiAgICAgICAgJ2xvY2F0aW9uOmRvdWJsZUNsaWNrJyxcbiAgICAgICAgb25Eb3VibGVDbGlja0NhbGxiYWNrXG4gICAgICApXG4gICAgfVxuICB9LCBbbG9jYXRpb25Nb2RlbCwgc3RhdGVdKVxuICBjb25zdCBDb21wb25lbnRUb1JlbmRlciA9IGlucHV0c1tzdGF0ZS5tb2RlXVxuICAgID8gaW5wdXRzW3N0YXRlLm1vZGVdLkNvbXBvbmVudFxuICAgIDogKCkgPT4gbnVsbFxuICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmVudHJpZXMoaW5wdXRzKVxuICAgIC5tYXAoKGVudHJ5KSA9PiB7XG4gICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBlbnRyeVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGFiZWw6IHZhbHVlLmxhYmVsLFxuICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbHRlcigodmFsdWUpID0+IHtcbiAgICAgIHJldHVybiBsb2NhdGlvbkNvbnRleHQuZmlsdGVySW5wdXRQcmVkaWNhdGUodmFsdWUudmFsdWUpXG4gICAgfSlcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm1iLTJcIlxuICAgICAgICAgIGRhdGEtaWQ9XCJmaWx0ZXItdHlwZS1hdXRvY29tcGxldGVcIlxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4gb3B0aW9uLmxhYmVsfVxuICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi52YWx1ZSA9PT0gdmFsdWUudmFsdWVcbiAgICAgICAgICB9fVxuICAgICAgICAgIG9uQ2hhbmdlPXsoX2UsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICBsb2NhdGlvbk1vZGVsLnNldCgnbW9kZScsIG5ld1ZhbHVlLnZhbHVlKVxuICAgICAgICAgIH19XG4gICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgIHZhbHVlPXtcbiAgICAgICAgICAgIG9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IHN0YXRlLm1vZGUpIHx8IHtcbiAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtcbiAgICAgICAgICAgICAgICAnU2VsZWN0ICcgKyBNZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKCdsb2NhdGlvbicpICsgJyBPcHRpb24nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgLz5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgZmxvdy1yb290XCI+XG4gICAgICAgICAgey8qIHRoaXMgcGFydCBpcyByZWFsbHkgd2VpcmQsIHdlIHNwbGF0IHN0YXRlIGFzIHNlcGFyYXRlIHByb3BzLCB0aGF0J3Mgd2h5IHdlIHVzZSBkZXN0cnVjdHVyaW5nICovfVxuICAgICAgICAgIDxDb21wb25lbnRUb1JlbmRlclxuICAgICAgICAgICAgey4uLnN0YXRlfVxuICAgICAgICAgICAgc2V0U3RhdGU9eyhhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgbG9jYXRpb25Nb2RlbC5zZXQoYXJncykgLy8gYWx3YXlzIHVwZGF0ZSB0aGUgbG9jYXRpb25Nb2RlbCwgdGhhdCdzIG91ciBcInNvdXJjZSBvZiB0cnV0aFwiLCBhYm92ZSB3ZSBtYXAgdGhpcyBiYWNrIGludG8gc3RhdGUgYnkgbGlzdGVuaW5nIHRvIGNoYW5nZXNcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBlcnJvckxpc3RlbmVyPXtlcnJvckxpc3RlbmVyfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2RyYXdUeXBlcy5pbmNsdWRlcyhzdGF0ZS5tb2RlKSA/IChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBteS0xLjUgbWwtMiBhbGlnbi1taWRkbGVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFsaWduLW1pZGRsZSBteS1hdXRvIHByLTE2IG1yLTFcIj5Db2xvcjwvZGl2PlxuICAgICAgICAgICAgICAgIDxDb2xvclNxdWFyZVxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzRHJhd2luZ31cbiAgICAgICAgICAgICAgICAgIGNvbG9yPXtzdGF0ZS5jb2xvcn1cbiAgICAgICAgICAgICAgICAgIHsuLi5NdWlCdXR0b25Qcm9wc31cbiAgICAgICAgICAgICAgICAgIHsuLi51c2VUaGVtZSgpfVxuICAgICAgICAgICAgICAgICAgc2l6ZT17JzEuOHJlbSd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8UG9wb3ZlciB7Li4uTXVpUG9wb3ZlclByb3BzfT5cbiAgICAgICAgICAgICAgICAgIDxMb2NhdGlvbkNvbG9yU2VsZWN0b3Igc2V0Q29sb3I9e3NldENvbG9yfSAvPlxuICAgICAgICAgICAgICAgIDwvUG9wb3Zlcj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtpc0RyYXdpbmcgJiYgbG9jYXRpb25Nb2RlbCA9PT0gRHJhd2luZy5nZXREcmF3TW9kZWwoKSA/IChcbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJsb2NhdGlvbi1kcmF3IG10LTJcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17b25EcmF3Q2FuY2VsfVxuICAgICAgICAgICAgICAgICAgY29sb3I9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMlwiPkNhbmNlbCBEcmF3aW5nPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxvY2F0aW9uLWRyYXcgbXQtMlwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkRyYXd9XG4gICAgICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZmEgZmEtZ2xvYmVcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMlwiPkRyYXc8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoTG9jYXRpb25JbnB1dClcbiJdfQ==