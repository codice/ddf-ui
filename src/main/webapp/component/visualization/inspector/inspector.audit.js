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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdG9yLmF1ZGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2luc3BlY3Rvci9pbnNwZWN0b3IuYXVkaXQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNqQyxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN0RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUM1RSxPQUFPLEVBRUwsWUFBWSxHQUNiLE1BQU0scURBQXFELENBQUE7QUFFNUQsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxFQUlwQztRQUhDLGtCQUFrQix3QkFBQTtJQUlsQixJQUFNLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztRQUN2RCxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7UUFDekMsV0FBVyxhQUFBO0tBQ1osQ0FBQyxDQUFBO0lBQ0ksSUFBQSxLQUFBLE9BQWdDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQVUsQ0FBQyxJQUFBLEVBQWhFLFdBQVcsUUFBQSxFQUFFLGNBQWMsUUFBcUMsQ0FBQTtJQUN2RSxJQUFNLGFBQWEsR0FBRyxVQUFDLEdBQWdCO1FBQ3JDLElBQUksS0FBSyxHQUFnQixFQUFFLENBQUE7UUFFM0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUU7O1lBQ2IsSUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLE1BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsMENBQUUsS0FBSywwQ0FBRSxRQUFRLDBDQUFFLFVBQVUsQ0FBQTtZQUV4RSxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN6RSxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUMsQ0FBQTtJQUVELFNBQVMsQ0FBQztRQUNSLElBQUksY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQTtRQUMxRCxJQUFJLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFBO1FBRXJDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFVO1lBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDdkIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDcEQsSUFBSSxlQUFlLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBRWxELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMvQixZQUFZLENBQUM7Z0JBQ1gsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFNBQVMsRUFBRSxVQUFVO2dCQUNyQixLQUFLLEVBQUUsZUFBZTthQUN2QixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDaEMsWUFBWSxDQUFDO2dCQUNYLE1BQU0sRUFBRSxVQUFVO2dCQUNsQixTQUFTLEVBQUUsVUFBVTtnQkFDckIsS0FBSyxFQUFFLGdCQUFnQjthQUN4QixDQUFDLENBQUE7WUFDRixjQUFjLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDaEMsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7QUFDdkIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQUMsRUFJOUI7UUFIQyxrQkFBa0Isd0JBQUE7SUFJbEIsb0JBQW9CLENBQUMsRUFBRSxrQkFBa0Isb0JBQUEsRUFBRSxDQUFDLENBQUE7SUFDNUMsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1pbnRlcmZhY2UvaG9va3MnXG5pbXBvcnQgeyB1c2VTZWxlY3RlZFJlc3VsdHMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQge1xuICBBdWRpdEl0ZW0sXG4gIHBvc3RBdWRpdExvZyxcbn0gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2F1ZGl0L2F1ZGl0LWVuZHBvaW50J1xuXG5leHBvcnQgY29uc3QgdXNlU2VsZWN0aW9uQXVkaXRpbmcgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIGNvbnN0IHNlbGVjdGVkUmVzdWx0cyA9IHVzZVNlbGVjdGVkUmVzdWx0cyh7XG4gICAgbGF6eVJlc3VsdHMsXG4gIH0pXG4gIGNvbnN0IFtzZWxlY3RlZElkcywgc2V0U2VsZWN0ZWRJZHNdID0gUmVhY3QudXNlU3RhdGUobmV3IFNldDxzdHJpbmc+KCkpXG4gIGNvbnN0IGdldEF1ZGl0SXRlbXMgPSAoaWRzOiBTZXQ8c3RyaW5nPikgPT4ge1xuICAgIGxldCBpdGVtczogQXVkaXRJdGVtW10gPSBbXVxuXG4gICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gbGF6eVJlc3VsdHM/LnJlc3VsdHNbaWRdPy5wbGFpbj8ubWV0YWNhcmQ/LnByb3BlcnRpZXNcblxuICAgICAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICAgICAgaXRlbXMucHVzaCh7IGlkOiBwcm9wZXJ0aWVzLmlkLCAnc291cmNlLWlkJzogcHJvcGVydGllc1snc291cmNlLWlkJ10gfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGl0ZW1zXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBuZXdTZWxlY3RlZElkcyA9IG5ldyBTZXQoT2JqZWN0LmtleXMoc2VsZWN0ZWRSZXN1bHRzKSlcbiAgICBsZXQgdW5zZWxlY3RlZElkcyA9IG5ldyBTZXQ8c3RyaW5nPigpXG5cbiAgICBzZWxlY3RlZElkcy5mb3JFYWNoKChpZDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoIW5ld1NlbGVjdGVkSWRzLmhhcyhpZCkpIHtcbiAgICAgICAgdW5zZWxlY3RlZElkcy5hZGQoaWQpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGxldCBuZXdTZWxlY3RlZEl0ZW1zID0gZ2V0QXVkaXRJdGVtcyhuZXdTZWxlY3RlZElkcylcbiAgICBsZXQgdW5zZWxlY3RlZEl0ZW1zID0gZ2V0QXVkaXRJdGVtcyh1bnNlbGVjdGVkSWRzKVxuXG4gICAgaWYgKHVuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBwb3N0QXVkaXRMb2coe1xuICAgICAgICBhY3Rpb246ICd1bnNlbGVjdGVkJyxcbiAgICAgICAgY29tcG9uZW50OiAncmVzb3VyY2UnLFxuICAgICAgICBpdGVtczogdW5zZWxlY3RlZEl0ZW1zLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAobmV3U2VsZWN0ZWRJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBwb3N0QXVkaXRMb2coe1xuICAgICAgICBhY3Rpb246ICdzZWxlY3RlZCcsXG4gICAgICAgIGNvbXBvbmVudDogJ3Jlc291cmNlJyxcbiAgICAgICAgaXRlbXM6IG5ld1NlbGVjdGVkSXRlbXMsXG4gICAgICB9KVxuICAgICAgc2V0U2VsZWN0ZWRJZHMobmV3U2VsZWN0ZWRJZHMpXG4gICAgfVxuICB9LCBbc2VsZWN0ZWRSZXN1bHRzXSlcbn1cblxuZXhwb3J0IGNvbnN0IEF1ZGl0Q29tcG9uZW50ID0gKHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxufToge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufSkgPT4ge1xuICB1c2VTZWxlY3Rpb25BdWRpdGluZyh7IHNlbGVjdGlvbkludGVyZmFjZSB9KVxuICByZXR1cm4gbnVsbFxufVxuIl19