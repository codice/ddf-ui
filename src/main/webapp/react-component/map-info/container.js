import { __assign, __read } from "tslib";
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
import MapInfoPresentation from './presentation';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { LayoutContext } from '../../component/golden-layout/visual-settings.provider';
import { getUserCoordinateFormat } from '../../component/visualization/settings-helpers';
import user from '../../component/singletons/user-instance';
var mapPropsToState = function (props) {
    var map = props.map;
    return {
        coordinates: {
            lat: map.get('mouseLat'),
            lon: map.get('mouseLon'),
        },
        attributes: getAttributes(map),
    };
};
var getAttributes = function (map) {
    if (map.get('targetMetacard') === undefined) {
        return [];
    }
    return StartupDataStore.Configuration.getSummaryShow()
        .map(function (attribute) {
        var value = map.get('targetMetacard').plain.metacard.properties[attribute];
        return { name: attribute, value: value };
    })
        .filter(function (_a) {
        var value = _a.value;
        return value !== undefined;
    });
};
var MapInfo = function (props) {
    var _a = React.useContext(LayoutContext), getValue = _a.getValue, onStateChanged = _a.onStateChanged, visualTitle = _a.visualTitle, hasLayoutContext = _a.hasLayoutContext;
    var _b = __read(React.useState(mapPropsToState(props)), 2), stateProps = _b[0], setStateProps = _b[1];
    var _c = __read(React.useState('degrees'), 2), coordFormat = _c[0], setCoordFormat = _c[1];
    var listenTo = props.listenTo, map = props.map;
    var coordFormatKey = "".concat(visualTitle, "-coordFormat");
    var onChange = function () { return setStateProps(mapPropsToState(props)); };
    React.useEffect(function () {
        var userDefaultFormat = getUserCoordinateFormat();
        if (hasLayoutContext) {
            setCoordFormat(getValue(coordFormat, userDefaultFormat));
            onStateChanged(function () {
                var coordFormat = getValue(coordFormatKey, getUserCoordinateFormat());
                setCoordFormat(coordFormat);
            });
        }
        else {
            setCoordFormat(userDefaultFormat);
            props.listenTo(user.get('user').get('preferences'), 'change:coordinateFormat', function () { return setCoordFormat(getUserCoordinateFormat()); });
        }
        listenTo(map, 'change:mouseLat change:mouseLon change:targetMetacard', onChange);
    }, []);
    return _jsx(MapInfoPresentation, __assign({}, stateProps, { format: coordFormat }));
};
export default withListenTo(MapInfo);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mby9jb250YWluZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sWUFBbUMsTUFBTSx1QkFBdUIsQ0FBQTtBQUN2RSxPQUFPLG1CQUFtQixNQUFNLGdCQUFnQixDQUFBO0FBR2hELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3REFBd0QsQ0FBQTtBQUN0RixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQTtBQUN4RixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQU0zRCxJQUFNLGVBQWUsR0FBRyxVQUFDLEtBQVk7SUFDM0IsSUFBQSxHQUFHLEdBQUssS0FBSyxJQUFWLENBQVU7SUFDckIsT0FBTztRQUNMLFdBQVcsRUFBRTtZQUNYLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUN4QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7U0FDekI7UUFDRCxVQUFVLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQztLQUMvQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxhQUFhLEdBQUcsVUFBQyxHQUFtQjtJQUN4QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM1QyxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUU7U0FDbkQsR0FBRyxDQUFDLFVBQUMsU0FBaUI7UUFDckIsSUFBTSxLQUFLLEdBQ1QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2hFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUE7SUFDbkMsQ0FBQyxDQUFDO1NBQ0QsTUFBTSxDQUFDLFVBQUMsRUFBb0I7WUFBbEIsS0FBSyxXQUFBO1FBQWtCLE9BQUEsS0FBSyxLQUFLLFNBQVM7SUFBbkIsQ0FBbUIsQ0FBQyxDQUFBO0FBQzFELENBQUMsQ0FBQTtBQUVELElBQU0sT0FBTyxHQUFHLFVBQUMsS0FBWTtJQUNyQixJQUFBLEtBQ0osS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFEekIsUUFBUSxjQUFBLEVBQUUsY0FBYyxvQkFBQSxFQUFFLFdBQVcsaUJBQUEsRUFBRSxnQkFBZ0Isc0JBQzlCLENBQUE7SUFDM0IsSUFBQSxLQUFBLE9BQThCLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUEsRUFBbkUsVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUEwQyxDQUFBO0lBQ3BFLElBQUEsS0FBQSxPQUFnQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFBLEVBQXhELFdBQVcsUUFBQSxFQUFFLGNBQWMsUUFBNkIsQ0FBQTtJQUV2RCxJQUFBLFFBQVEsR0FBVSxLQUFLLFNBQWYsRUFBRSxHQUFHLEdBQUssS0FBSyxJQUFWLENBQVU7SUFDL0IsSUFBTSxjQUFjLEdBQUcsVUFBRyxXQUFXLGlCQUFjLENBQUE7SUFFbkQsSUFBTSxRQUFRLEdBQUcsY0FBTSxPQUFBLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBckMsQ0FBcUMsQ0FBQTtJQUU1RCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBTSxpQkFBaUIsR0FBRyx1QkFBdUIsRUFBRSxDQUFBO1FBQ25ELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNyQixjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7WUFDeEQsY0FBYyxDQUFDO2dCQUNiLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO2dCQUN2RSxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDN0IsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO2FBQU0sQ0FBQztZQUNOLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1lBQ2pDLEtBQUssQ0FBQyxRQUFRLENBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQ25DLHlCQUF5QixFQUN6QixjQUFNLE9BQUEsY0FBYyxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBekMsQ0FBeUMsQ0FDaEQsQ0FBQTtRQUNILENBQUM7UUFFRCxRQUFRLENBQ04sR0FBRyxFQUNILHVEQUF1RCxFQUN2RCxRQUFRLENBQ1QsQ0FBQTtJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLE9BQU8sS0FBQyxtQkFBbUIsZUFBSyxVQUFVLElBQUUsTUFBTSxFQUFFLFdBQXFCLElBQUksQ0FBQTtBQUMvRSxDQUFDLENBQUE7QUFFRCxlQUFlLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgd2l0aExpc3RlblRvLCB7IFdpdGhCYWNrYm9uZVByb3BzIH0gZnJvbSAnLi4vYmFja2JvbmUtY29udGFpbmVyJ1xuaW1wb3J0IE1hcEluZm9QcmVzZW50YXRpb24gZnJvbSAnLi9wcmVzZW50YXRpb24nXG5cbmltcG9ydCB7IEZvcm1hdCwgQXR0cmlidXRlIH0gZnJvbSAnLidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBMYXlvdXRDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2dvbGRlbi1sYXlvdXQvdmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyJ1xuaW1wb3J0IHsgZ2V0VXNlckNvb3JkaW5hdGVGb3JtYXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9zZXR0aW5ncy1oZWxwZXJzJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcblxudHlwZSBQcm9wcyA9IHtcbiAgbWFwOiBCYWNrYm9uZS5Nb2RlbFxufSAmIFdpdGhCYWNrYm9uZVByb3BzXG5cbmNvbnN0IG1hcFByb3BzVG9TdGF0ZSA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBtYXAgfSA9IHByb3BzXG4gIHJldHVybiB7XG4gICAgY29vcmRpbmF0ZXM6IHtcbiAgICAgIGxhdDogbWFwLmdldCgnbW91c2VMYXQnKSxcbiAgICAgIGxvbjogbWFwLmdldCgnbW91c2VMb24nKSxcbiAgICB9LFxuICAgIGF0dHJpYnV0ZXM6IGdldEF0dHJpYnV0ZXMobWFwKSxcbiAgfVxufVxuXG5jb25zdCBnZXRBdHRyaWJ1dGVzID0gKG1hcDogQmFja2JvbmUuTW9kZWwpID0+IHtcbiAgaWYgKG1hcC5nZXQoJ3RhcmdldE1ldGFjYXJkJykgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBbXVxuICB9XG4gIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0U3VtbWFyeVNob3coKVxuICAgIC5tYXAoKGF0dHJpYnV0ZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgIG1hcC5nZXQoJ3RhcmdldE1ldGFjYXJkJykucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGVdXG4gICAgICByZXR1cm4geyBuYW1lOiBhdHRyaWJ1dGUsIHZhbHVlIH1cbiAgICB9KVxuICAgIC5maWx0ZXIoKHsgdmFsdWUgfTogQXR0cmlidXRlKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkKVxufVxuXG5jb25zdCBNYXBJbmZvID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7IGdldFZhbHVlLCBvblN0YXRlQ2hhbmdlZCwgdmlzdWFsVGl0bGUsIGhhc0xheW91dENvbnRleHQgfSA9XG4gICAgUmVhY3QudXNlQ29udGV4dChMYXlvdXRDb250ZXh0KVxuICBjb25zdCBbc3RhdGVQcm9wcywgc2V0U3RhdGVQcm9wc10gPSBSZWFjdC51c2VTdGF0ZShtYXBQcm9wc1RvU3RhdGUocHJvcHMpKVxuICBjb25zdCBbY29vcmRGb3JtYXQsIHNldENvb3JkRm9ybWF0XSA9IFJlYWN0LnVzZVN0YXRlKCdkZWdyZWVzJylcblxuICBjb25zdCB7IGxpc3RlblRvLCBtYXAgfSA9IHByb3BzXG4gIGNvbnN0IGNvb3JkRm9ybWF0S2V5ID0gYCR7dmlzdWFsVGl0bGV9LWNvb3JkRm9ybWF0YFxuXG4gIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4gc2V0U3RhdGVQcm9wcyhtYXBQcm9wc1RvU3RhdGUocHJvcHMpKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdXNlckRlZmF1bHRGb3JtYXQgPSBnZXRVc2VyQ29vcmRpbmF0ZUZvcm1hdCgpXG4gICAgaWYgKGhhc0xheW91dENvbnRleHQpIHtcbiAgICAgIHNldENvb3JkRm9ybWF0KGdldFZhbHVlKGNvb3JkRm9ybWF0LCB1c2VyRGVmYXVsdEZvcm1hdCkpXG4gICAgICBvblN0YXRlQ2hhbmdlZCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvb3JkRm9ybWF0ID0gZ2V0VmFsdWUoY29vcmRGb3JtYXRLZXksIGdldFVzZXJDb29yZGluYXRlRm9ybWF0KCkpXG4gICAgICAgIHNldENvb3JkRm9ybWF0KGNvb3JkRm9ybWF0KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0Q29vcmRGb3JtYXQodXNlckRlZmF1bHRGb3JtYXQpXG4gICAgICBwcm9wcy5saXN0ZW5UbyhcbiAgICAgICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJyksXG4gICAgICAgICdjaGFuZ2U6Y29vcmRpbmF0ZUZvcm1hdCcsXG4gICAgICAgICgpID0+IHNldENvb3JkRm9ybWF0KGdldFVzZXJDb29yZGluYXRlRm9ybWF0KCkpXG4gICAgICApXG4gICAgfVxuXG4gICAgbGlzdGVuVG8oXG4gICAgICBtYXAsXG4gICAgICAnY2hhbmdlOm1vdXNlTGF0IGNoYW5nZTptb3VzZUxvbiBjaGFuZ2U6dGFyZ2V0TWV0YWNhcmQnLFxuICAgICAgb25DaGFuZ2VcbiAgICApXG4gIH0sIFtdKVxuXG4gIHJldHVybiA8TWFwSW5mb1ByZXNlbnRhdGlvbiB7Li4uc3RhdGVQcm9wc30gZm9ybWF0PXtjb29yZEZvcm1hdCBhcyBGb3JtYXR9IC8+XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhMaXN0ZW5UbyhNYXBJbmZvKVxuIl19