import { __read } from "tslib";
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
/* global require*/
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'sort... Remove this comment to see the full error message
import Sortable from 'sortablejs';
import * as React from 'react';
import LayerItem from '../../react-component/layer-item/layer-item';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
function useSortable(_a) {
    var sortableElement = _a.sortableElement, updateOrdering = _a.updateOrdering, focusModel = _a.focusModel;
    var _b = __read(React.useState(null), 2), sortable = _b[0], setSortable = _b[1];
    React.useEffect(function () {
        if (sortableElement) {
            setSortable(Sortable.create(sortableElement, {
                handle: 'button.layer-rearrange',
                animation: 250,
                draggable: '>*', // TODO: make a PR to sortable so this won't be necessary
                onEnd: function () {
                    focusModel.clear();
                    updateOrdering();
                },
            }));
        }
    }, [sortableElement]);
    return sortable;
}
export var LayerItemCollectionViewReact = function (_a) {
    var collection = _a.collection, updateOrdering = _a.updateOrdering, focusModel = _a.focusModel;
    var _b = __read(React.useState(Math.random()), 2), setForceRender = _b[1];
    var _c = __read(React.useState(null), 2), sortableElement = _c[0], setSortableElement = _c[1];
    var sortable = useSortable({ sortableElement: sortableElement, updateOrdering: updateOrdering, focusModel: focusModel });
    useListenTo(collection, 'sort', function () {
        setForceRender(Math.random());
    });
    return (_jsx("div", { ref: setSortableElement, children: collection.map(function (layer) {
            return (_jsx(LayerItem, { layer: layer, focusModel: focusModel, updateOrdering: updateOrdering, sortable: sortable }, layer.id));
        }) }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXItaXRlbS5jb2xsZWN0aW9uLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xheWVyLWl0ZW0vbGF5ZXItaXRlbS5jb2xsZWN0aW9uLnZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLG1CQUFtQjtBQUNuQixtSkFBbUo7QUFDbkosT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sU0FBUyxNQUFNLDZDQUE2QyxDQUFBO0FBQ25FLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUVwRSxTQUFTLFdBQVcsQ0FBQyxFQVFwQjtRQVBDLGVBQWUscUJBQUEsRUFDZixjQUFjLG9CQUFBLEVBQ2QsVUFBVSxnQkFBQTtJQU1KLElBQUEsS0FBQSxPQUEwQixLQUFLLENBQUMsUUFBUSxDQUFNLElBQUksQ0FBQyxJQUFBLEVBQWxELFFBQVEsUUFBQSxFQUFFLFdBQVcsUUFBNkIsQ0FBQTtJQUV6RCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxlQUFlLEVBQUUsQ0FBQztZQUNwQixXQUFXLENBQ1QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLFNBQVMsRUFBRSxHQUFHO2dCQUNkLFNBQVMsRUFBRSxJQUFJLEVBQUUseURBQXlEO2dCQUMxRSxLQUFLLEVBQUU7b0JBQ0wsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFBO29CQUNsQixjQUFjLEVBQUUsQ0FBQTtnQkFDbEIsQ0FBQzthQUNGLENBQUMsQ0FDSCxDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7SUFFckIsT0FBTyxRQUFRLENBQUE7QUFDakIsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLDRCQUE0QixHQUFHLFVBQUMsRUFRNUM7UUFQQyxVQUFVLGdCQUFBLEVBQ1YsY0FBYyxvQkFBQSxFQUNkLFVBQVUsZ0JBQUE7SUFNSixJQUFBLEtBQUEsT0FBcUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBQSxFQUEvQyxjQUFjLFFBQWlDLENBQUE7SUFDbEQsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBd0IsSUFBSSxDQUFDLElBQUEsRUFEdEMsZUFBZSxRQUFBLEVBQUUsa0JBQWtCLFFBQ0csQ0FBQTtJQUM3QyxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsRUFBRSxlQUFlLGlCQUFBLEVBQUUsY0FBYyxnQkFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQTtJQUM3RSxXQUFXLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRTtRQUM5QixjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDL0IsQ0FBQyxDQUFDLENBQUE7SUFFRixPQUFPLENBQ0wsY0FBSyxHQUFHLEVBQUUsa0JBQWtCLFlBQ3pCLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLO1lBQ3BCLE9BQU8sQ0FDTCxLQUFDLFNBQVMsSUFFUixLQUFLLEVBQUUsS0FBSyxFQUNaLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLGNBQWMsRUFBRSxjQUFjLEVBQzlCLFFBQVEsRUFBRSxRQUFRLElBSmIsS0FBSyxDQUFDLEVBQUUsQ0FLYixDQUNILENBQUE7UUFDSCxDQUFDLENBQUMsR0FDRSxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIGdsb2JhbCByZXF1aXJlKi9cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ3NvcnQuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IFNvcnRhYmxlIGZyb20gJ3NvcnRhYmxlanMnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBMYXllckl0ZW0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2xheWVyLWl0ZW0vbGF5ZXItaXRlbSdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5cbmZ1bmN0aW9uIHVzZVNvcnRhYmxlKHtcbiAgc29ydGFibGVFbGVtZW50LFxuICB1cGRhdGVPcmRlcmluZyxcbiAgZm9jdXNNb2RlbCxcbn06IHtcbiAgc29ydGFibGVFbGVtZW50OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgdXBkYXRlT3JkZXJpbmc6IGFueVxuICBmb2N1c01vZGVsOiBhbnlcbn0pIHtcbiAgY29uc3QgW3NvcnRhYmxlLCBzZXRTb3J0YWJsZV0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc29ydGFibGVFbGVtZW50KSB7XG4gICAgICBzZXRTb3J0YWJsZShcbiAgICAgICAgU29ydGFibGUuY3JlYXRlKHNvcnRhYmxlRWxlbWVudCwge1xuICAgICAgICAgIGhhbmRsZTogJ2J1dHRvbi5sYXllci1yZWFycmFuZ2UnLFxuICAgICAgICAgIGFuaW1hdGlvbjogMjUwLFxuICAgICAgICAgIGRyYWdnYWJsZTogJz4qJywgLy8gVE9ETzogbWFrZSBhIFBSIHRvIHNvcnRhYmxlIHNvIHRoaXMgd29uJ3QgYmUgbmVjZXNzYXJ5XG4gICAgICAgICAgb25FbmQ6ICgpID0+IHtcbiAgICAgICAgICAgIGZvY3VzTW9kZWwuY2xlYXIoKVxuICAgICAgICAgICAgdXBkYXRlT3JkZXJpbmcoKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9LCBbc29ydGFibGVFbGVtZW50XSlcblxuICByZXR1cm4gc29ydGFibGVcbn1cblxuZXhwb3J0IGNvbnN0IExheWVySXRlbUNvbGxlY3Rpb25WaWV3UmVhY3QgPSAoe1xuICBjb2xsZWN0aW9uLFxuICB1cGRhdGVPcmRlcmluZyxcbiAgZm9jdXNNb2RlbCxcbn06IHtcbiAgY29sbGVjdGlvbjogQXJyYXk8YW55PlxuICB1cGRhdGVPcmRlcmluZzogYW55XG4gIGZvY3VzTW9kZWw6IGFueVxufSkgPT4ge1xuICBjb25zdCBbLCBzZXRGb3JjZVJlbmRlcl0gPSBSZWFjdC51c2VTdGF0ZShNYXRoLnJhbmRvbSgpKVxuICBjb25zdCBbc29ydGFibGVFbGVtZW50LCBzZXRTb3J0YWJsZUVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNvcnRhYmxlID0gdXNlU29ydGFibGUoeyBzb3J0YWJsZUVsZW1lbnQsIHVwZGF0ZU9yZGVyaW5nLCBmb2N1c01vZGVsIH0pXG4gIHVzZUxpc3RlblRvKGNvbGxlY3Rpb24sICdzb3J0JywgKCkgPT4ge1xuICAgIHNldEZvcmNlUmVuZGVyKE1hdGgucmFuZG9tKCkpXG4gIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHJlZj17c2V0U29ydGFibGVFbGVtZW50fT5cbiAgICAgIHtjb2xsZWN0aW9uLm1hcCgobGF5ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TGF5ZXJJdGVtXG4gICAgICAgICAgICBrZXk9e2xheWVyLmlkfVxuICAgICAgICAgICAgbGF5ZXI9e2xheWVyfVxuICAgICAgICAgICAgZm9jdXNNb2RlbD17Zm9jdXNNb2RlbH1cbiAgICAgICAgICAgIHVwZGF0ZU9yZGVyaW5nPXt1cGRhdGVPcmRlcmluZ31cbiAgICAgICAgICAgIHNvcnRhYmxlPXtzb3J0YWJsZX1cbiAgICAgICAgICAvPlxuICAgICAgICApXG4gICAgICB9KX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIl19