import { __read } from "tslib";
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
import LayerItem from '../../react-component/layer-item';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
function useSortable(_a) {
    var sortableElement = _a.sortableElement, updateOrdering = _a.updateOrdering, focusModel = _a.focusModel;
    var _b = __read(React.useState(null), 2), sortable = _b[0], setSortable = _b[1];
    React.useEffect(function () {
        if (sortableElement) {
            setSortable(Sortable.create(sortableElement, {
                handle: 'button.layer-rearrange',
                animation: 250,
                draggable: '>*',
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
    return (React.createElement("div", { ref: setSortableElement }, collection.map(function (layer) {
        return (React.createElement(LayerItem, { key: layer.id, layer: layer, focusModel: focusModel, updateOrdering: updateOrdering, sortable: sortable }));
    })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXItaXRlbS5jb2xsZWN0aW9uLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xheWVyLWl0ZW0vbGF5ZXItaXRlbS5jb2xsZWN0aW9uLnZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osbUJBQW1CO0FBQ25CLG1KQUFtSjtBQUNuSixPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUE7QUFDakMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxTQUFTLE1BQU0sa0NBQWtDLENBQUE7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBRXBFLFNBQVMsV0FBVyxDQUFDLEVBUXBCO1FBUEMsZUFBZSxxQkFBQSxFQUNmLGNBQWMsb0JBQUEsRUFDZCxVQUFVLGdCQUFBO0lBTUosSUFBQSxLQUFBLE9BQTBCLEtBQUssQ0FBQyxRQUFRLENBQU0sSUFBSSxDQUFDLElBQUEsRUFBbEQsUUFBUSxRQUFBLEVBQUUsV0FBVyxRQUE2QixDQUFBO0lBRXpELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLGVBQWUsRUFBRTtZQUNuQixXQUFXLENBQ1QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLFNBQVMsRUFBRSxHQUFHO2dCQUNkLFNBQVMsRUFBRSxJQUFJO2dCQUNmLEtBQUssRUFBRTtvQkFDTCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFBO2dCQUNsQixDQUFDO2FBQ0YsQ0FBQyxDQUNILENBQUE7U0FDRjtJQUNILENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7SUFFckIsT0FBTyxRQUFRLENBQUE7QUFDakIsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLDRCQUE0QixHQUFHLFVBQUMsRUFRNUM7UUFQQyxVQUFVLGdCQUFBLEVBQ1YsY0FBYyxvQkFBQSxFQUNkLFVBQVUsZ0JBQUE7SUFNSixJQUFBLEtBQUEsT0FBcUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBQSxFQUEvQyxjQUFjLFFBQWlDLENBQUE7SUFDbEQsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBd0IsSUFBSSxDQUFDLElBQUEsRUFEdEMsZUFBZSxRQUFBLEVBQUUsa0JBQWtCLFFBQ0csQ0FBQTtJQUM3QyxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsRUFBRSxlQUFlLGlCQUFBLEVBQUUsY0FBYyxnQkFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQTtJQUM3RSxXQUFXLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRTtRQUM5QixjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDL0IsQ0FBQyxDQUFDLENBQUE7SUFFRixPQUFPLENBQ0wsNkJBQUssR0FBRyxFQUFFLGtCQUFrQixJQUN6QixVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSztRQUNwQixPQUFPLENBQ0wsb0JBQUMsU0FBUyxJQUNSLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUNiLEtBQUssRUFBRSxLQUFLLEVBQ1osVUFBVSxFQUFFLFVBQVUsRUFDdEIsY0FBYyxFQUFFLGNBQWMsRUFDOUIsUUFBUSxFQUFFLFFBQVEsR0FDbEIsQ0FDSCxDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQ0UsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vKiBnbG9iYWwgcmVxdWlyZSovXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdzb3J0Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBTb3J0YWJsZSBmcm9tICdzb3J0YWJsZWpzJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgTGF5ZXJJdGVtIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sYXllci1pdGVtJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcblxuZnVuY3Rpb24gdXNlU29ydGFibGUoe1xuICBzb3J0YWJsZUVsZW1lbnQsXG4gIHVwZGF0ZU9yZGVyaW5nLFxuICBmb2N1c01vZGVsLFxufToge1xuICBzb3J0YWJsZUVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICB1cGRhdGVPcmRlcmluZzogYW55XG4gIGZvY3VzTW9kZWw6IGFueVxufSkge1xuICBjb25zdCBbc29ydGFibGUsIHNldFNvcnRhYmxlXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzb3J0YWJsZUVsZW1lbnQpIHtcbiAgICAgIHNldFNvcnRhYmxlKFxuICAgICAgICBTb3J0YWJsZS5jcmVhdGUoc29ydGFibGVFbGVtZW50LCB7XG4gICAgICAgICAgaGFuZGxlOiAnYnV0dG9uLmxheWVyLXJlYXJyYW5nZScsXG4gICAgICAgICAgYW5pbWF0aW9uOiAyNTAsXG4gICAgICAgICAgZHJhZ2dhYmxlOiAnPionLCAvLyBUT0RPOiBtYWtlIGEgUFIgdG8gc29ydGFibGUgc28gdGhpcyB3b24ndCBiZSBuZWNlc3NhcnlcbiAgICAgICAgICBvbkVuZDogKCkgPT4ge1xuICAgICAgICAgICAgZm9jdXNNb2RlbC5jbGVhcigpXG4gICAgICAgICAgICB1cGRhdGVPcmRlcmluZygpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0sIFtzb3J0YWJsZUVsZW1lbnRdKVxuXG4gIHJldHVybiBzb3J0YWJsZVxufVxuXG5leHBvcnQgY29uc3QgTGF5ZXJJdGVtQ29sbGVjdGlvblZpZXdSZWFjdCA9ICh7XG4gIGNvbGxlY3Rpb24sXG4gIHVwZGF0ZU9yZGVyaW5nLFxuICBmb2N1c01vZGVsLFxufToge1xuICBjb2xsZWN0aW9uOiBBcnJheTxhbnk+XG4gIHVwZGF0ZU9yZGVyaW5nOiBhbnlcbiAgZm9jdXNNb2RlbDogYW55XG59KSA9PiB7XG4gIGNvbnN0IFssIHNldEZvcmNlUmVuZGVyXSA9IFJlYWN0LnVzZVN0YXRlKE1hdGgucmFuZG9tKCkpXG4gIGNvbnN0IFtzb3J0YWJsZUVsZW1lbnQsIHNldFNvcnRhYmxlRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc29ydGFibGUgPSB1c2VTb3J0YWJsZSh7IHNvcnRhYmxlRWxlbWVudCwgdXBkYXRlT3JkZXJpbmcsIGZvY3VzTW9kZWwgfSlcbiAgdXNlTGlzdGVuVG8oY29sbGVjdGlvbiwgJ3NvcnQnLCAoKSA9PiB7XG4gICAgc2V0Rm9yY2VSZW5kZXIoTWF0aC5yYW5kb20oKSlcbiAgfSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgcmVmPXtzZXRTb3J0YWJsZUVsZW1lbnR9PlxuICAgICAge2NvbGxlY3Rpb24ubWFwKChsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxMYXllckl0ZW1cbiAgICAgICAgICAgIGtleT17bGF5ZXIuaWR9XG4gICAgICAgICAgICBsYXllcj17bGF5ZXJ9XG4gICAgICAgICAgICBmb2N1c01vZGVsPXtmb2N1c01vZGVsfVxuICAgICAgICAgICAgdXBkYXRlT3JkZXJpbmc9e3VwZGF0ZU9yZGVyaW5nfVxuICAgICAgICAgICAgc29ydGFibGU9e3NvcnRhYmxlfVxuICAgICAgICAgIC8+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvZGl2PlxuICApXG59XG4iXX0=