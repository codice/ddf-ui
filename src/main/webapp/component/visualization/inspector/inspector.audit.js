import { __read } from "tslib";
import React from 'react';
import { useEffect } from 'react';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks';
import { postAuditLog, } from '../../../react-component/utils/audit/audit-endpoint';
export var useSelectionAuditing = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResults = useSelectedResults({
        lazyResults: lazyResults,
    });
    var _b = __read(React.useState(new Set()), 2), selectedIds = _b[0], setSelectedIds = _b[1];
    var getAuditItems = function (ids) {
        var items = [];
        ids.forEach(function (id) {
            var _a, _b, _c;
            var properties = (_c = (_b = (_a = lazyResults === null || lazyResults === void 0 ? void 0 : lazyResults.results[id]) === null || _a === void 0 ? void 0 : _a.plain) === null || _b === void 0 ? void 0 : _b.metacard) === null || _c === void 0 ? void 0 : _c.properties;
            if (properties) {
                items.push({ id: properties.id, 'source-id': properties['source-id'] });
            }
        });
        return items;
    };
    useEffect(function () {
        var newSelectedIds = new Set(Object.keys(selectedResults));
        var unselectedIds = new Set();
        selectedIds.forEach(function (id) {
            if (!newSelectedIds.has(id)) {
                unselectedIds.add(id);
            }
        });
        var newSelectedItems = getAuditItems(newSelectedIds);
        var unselectedItems = getAuditItems(unselectedIds);
        if (unselectedItems.length > 0) {
            postAuditLog({
                action: 'unselected',
                component: 'resource',
                items: unselectedItems,
            });
        }
        if (newSelectedItems.length > 0) {
            postAuditLog({
                action: 'selected',
                component: 'resource',
                items: newSelectedItems,
            });
            setSelectedIds(newSelectedIds);
        }
    }, [selectedResults]);
};
export var AuditComponent = function (_a) {
    var selectionInterface = _a.selectionInterface;
    useSelectionAuditing({ selectionInterface: selectionInterface });
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdG9yLmF1ZGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2luc3BlY3Rvci9pbnNwZWN0b3IuYXVkaXQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNqQyxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN0RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUM1RSxPQUFPLEVBRUwsWUFBWSxHQUNiLE1BQU0scURBQXFELENBQUE7QUFFNUQsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxFQUlwQztRQUhDLGtCQUFrQix3QkFBQTtJQUlsQixJQUFNLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztRQUN2RCxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7UUFDekMsV0FBVyxhQUFBO0tBQ1osQ0FBQyxDQUFBO0lBQ0ksSUFBQSxLQUFBLE9BQWdDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQVUsQ0FBQyxJQUFBLEVBQWhFLFdBQVcsUUFBQSxFQUFFLGNBQWMsUUFBcUMsQ0FBQTtJQUN2RSxJQUFNLGFBQWEsR0FBRyxVQUFDLEdBQWdCO1FBQ3JDLElBQUksS0FBSyxHQUFnQixFQUFFLENBQUE7UUFFM0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUU7O1lBQ2IsSUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLE1BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsMENBQUUsS0FBSywwQ0FBRSxRQUFRLDBDQUFFLFVBQVUsQ0FBQTtZQUV4RSxJQUFJLFVBQVUsRUFBRTtnQkFDZCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUE7YUFDeEU7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQyxDQUFBO0lBRUQsU0FBUyxDQUFDO1FBQ1IsSUFBSSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFBO1FBQzFELElBQUksYUFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUE7UUFFckMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQVU7WUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzNCLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7YUFDdEI7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQ3BELElBQUksZUFBZSxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUVsRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLFlBQVksQ0FBQztnQkFDWCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLEtBQUssRUFBRSxlQUFlO2FBQ3ZCLENBQUMsQ0FBQTtTQUNIO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLFlBQVksQ0FBQztnQkFDWCxNQUFNLEVBQUUsVUFBVTtnQkFDbEIsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLEtBQUssRUFBRSxnQkFBZ0I7YUFDeEIsQ0FBQyxDQUFBO1lBQ0YsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1NBQy9CO0lBQ0gsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQTtBQUN2QixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsVUFBQyxFQUk5QjtRQUhDLGtCQUFrQix3QkFBQTtJQUlsQixvQkFBb0IsQ0FBQyxFQUFFLGtCQUFrQixvQkFBQSxFQUFFLENBQUMsQ0FBQTtJQUM1QyxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB7IHVzZVNlbGVjdGVkUmVzdWx0cyB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9ob29rcydcbmltcG9ydCB7XG4gIEF1ZGl0SXRlbSxcbiAgcG9zdEF1ZGl0TG9nLFxufSBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvYXVkaXQvYXVkaXQtZW5kcG9pbnQnXG5cbmV4cG9ydCBjb25zdCB1c2VTZWxlY3Rpb25BdWRpdGluZyA9ICh7XG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbn06IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn0pID0+IHtcbiAgY29uc3QgbGF6eVJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3Qgc2VsZWN0ZWRSZXN1bHRzID0gdXNlU2VsZWN0ZWRSZXN1bHRzKHtcbiAgICBsYXp5UmVzdWx0cyxcbiAgfSlcbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShuZXcgU2V0PHN0cmluZz4oKSlcbiAgY29uc3QgZ2V0QXVkaXRJdGVtcyA9IChpZHM6IFNldDxzdHJpbmc+KSA9PiB7XG4gICAgbGV0IGl0ZW1zOiBBdWRpdEl0ZW1bXSA9IFtdXG5cbiAgICBpZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBsYXp5UmVzdWx0cz8ucmVzdWx0c1tpZF0/LnBsYWluPy5tZXRhY2FyZD8ucHJvcGVydGllc1xuXG4gICAgICBpZiAocHJvcGVydGllcykge1xuICAgICAgICBpdGVtcy5wdXNoKHsgaWQ6IHByb3BlcnRpZXMuaWQsICdzb3VyY2UtaWQnOiBwcm9wZXJ0aWVzWydzb3VyY2UtaWQnXSB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gaXRlbXNcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IG5ld1NlbGVjdGVkSWRzID0gbmV3IFNldChPYmplY3Qua2V5cyhzZWxlY3RlZFJlc3VsdHMpKVxuICAgIGxldCB1bnNlbGVjdGVkSWRzID0gbmV3IFNldDxzdHJpbmc+KClcblxuICAgIHNlbGVjdGVkSWRzLmZvckVhY2goKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghbmV3U2VsZWN0ZWRJZHMuaGFzKGlkKSkge1xuICAgICAgICB1bnNlbGVjdGVkSWRzLmFkZChpZClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbGV0IG5ld1NlbGVjdGVkSXRlbXMgPSBnZXRBdWRpdEl0ZW1zKG5ld1NlbGVjdGVkSWRzKVxuICAgIGxldCB1bnNlbGVjdGVkSXRlbXMgPSBnZXRBdWRpdEl0ZW1zKHVuc2VsZWN0ZWRJZHMpXG5cbiAgICBpZiAodW5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc3RBdWRpdExvZyh7XG4gICAgICAgIGFjdGlvbjogJ3Vuc2VsZWN0ZWQnLFxuICAgICAgICBjb21wb25lbnQ6ICdyZXNvdXJjZScsXG4gICAgICAgIGl0ZW1zOiB1bnNlbGVjdGVkSXRlbXMsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChuZXdTZWxlY3RlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc3RBdWRpdExvZyh7XG4gICAgICAgIGFjdGlvbjogJ3NlbGVjdGVkJyxcbiAgICAgICAgY29tcG9uZW50OiAncmVzb3VyY2UnLFxuICAgICAgICBpdGVtczogbmV3U2VsZWN0ZWRJdGVtcyxcbiAgICAgIH0pXG4gICAgICBzZXRTZWxlY3RlZElkcyhuZXdTZWxlY3RlZElkcylcbiAgICB9XG4gIH0sIFtzZWxlY3RlZFJlc3VsdHNdKVxufVxuXG5leHBvcnQgY29uc3QgQXVkaXRDb21wb25lbnQgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIHVzZVNlbGVjdGlvbkF1ZGl0aW5nKHsgc2VsZWN0aW9uSW50ZXJmYWNlIH0pXG4gIHJldHVybiBudWxsXG59XG4iXX0=