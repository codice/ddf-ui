import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useSelectionOfLazyResults } from '../../../../js/model/LazyQueryResult/hooks';
import _ from 'underscore';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'geo-... Remove this comment to see the full error message
import calculateConvexHull from 'geo-convex-hull';
import extension from '../../../../extension-points';
var Cluster = function (_a) {
    var cluster = _a.cluster, map = _a.map;
    var geometries = React.useRef([]);
    var isSelected = useSelectionOfLazyResults({ lazyResults: cluster.results });
    React.useEffect(function () {
        switch (isSelected) {
            case 'selected':
                map.updateCluster(geometries.current, {
                    color: 'orange',
                    isSelected: isSelected,
                    count: cluster.results.length,
                    outline: 'white',
                    textFill: 'white',
                });
                break;
            case 'partially':
                map.updateCluster(geometries.current, {
                    color: cluster.results[0].getColor(),
                    isSelected: isSelected,
                    count: cluster.results.length,
                    outline: 'black',
                    textFill: 'white',
                });
                break;
            case 'unselected':
                map.updateCluster(geometries.current, {
                    color: cluster.results[0].getColor(),
                    isSelected: isSelected,
                    count: cluster.results.length,
                    outline: 'white',
                    textFill: 'white',
                });
                break;
        }
    }, [isSelected]);
    var handleCluster = function () {
        var center = map.getCartographicCenterOfClusterInDegrees(cluster);
        var badgeOptions = extension.customMapBadge({
            results: cluster.results,
            isCluster: true,
        });
        geometries.current.push(map.addPointWithText(center, {
            id: cluster.results.map(function (result) { return result['metacard.id']; }),
            color: cluster.results[0].getColor(),
            isSelected: isSelected,
            badgeOptions: badgeOptions,
        }));
    };
    var addConvexHull = function () {
        var points = cluster.results.map(function (result) { return result.getPoints(); });
        var data = _.flatten(points, true).map(function (coord) { return ({
            longitude: coord[0],
            latitude: coord[1],
        }); });
        var convexHull = calculateConvexHull(data).map(function (coord) { return [
            coord.longitude,
            coord.latitude,
        ]; });
        convexHull.push(convexHull[0]);
        var geometry = map.addLine(convexHull, {
            id: cluster.results.map(function (result) { return result['metacard.id']; }),
            color: cluster.results[0].getColor(),
        });
        map.hideGeometry(geometry);
        geometries.current.push(geometry);
    };
    React.useEffect(function () {
        handleCluster();
        addConvexHull();
        return function () {
            geometries.current.forEach(function (geometry) {
                map.removeGeometry(geometry);
            });
        };
    }, []);
    return React.createElement(React.Fragment, null);
};
export default hot(module)(Cluster);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL3JlYWN0L2NsdXN0ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV0QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUN0RixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsbUpBQW1KO0FBQ25KLE9BQU8sbUJBQW1CLE1BQU0saUJBQWlCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sOEJBQThCLENBQUE7QUFPcEQsSUFBTSxPQUFPLEdBQUcsVUFBQyxFQUF1QjtRQUFyQixPQUFPLGFBQUEsRUFBRSxHQUFHLFNBQUE7SUFDN0IsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFXLENBQUMsQ0FBQTtJQUM1QyxJQUFNLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUU5RSxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsUUFBUSxVQUFVLEVBQUU7WUFDbEIsS0FBSyxVQUFVO2dCQUNiLEdBQUcsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtvQkFDcEMsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsVUFBVSxZQUFBO29CQUNWLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU07b0JBQzdCLE9BQU8sRUFBRSxPQUFPO29CQUNoQixRQUFRLEVBQUUsT0FBTztpQkFDbEIsQ0FBQyxDQUFBO2dCQUNGLE1BQUs7WUFDUCxLQUFLLFdBQVc7Z0JBQ2QsR0FBRyxDQUFDLGFBQWEs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LENBQUMsQ0FBQTtRQUMxQixVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNuQyxDQUFDLENBQUE7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsYUFBYSxFQUFFLENBQUE7UUFDZixhQUFhLEVBQUUsQ0FBQTtRQUNmLE9BQU87WUFDTCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQ2xDLEdBQUcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDOUIsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixPQUFPLHlDQUFLLENBQUE7QUFDZCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi9nZW9tZXRyaWVzJ1xuaW1wb3J0IHsgdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0cyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9ob29rcydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdnZW8tLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBjYWxjdWxhdGVDb252ZXhIdWxsIGZyb20gJ2dlby1jb252ZXgtaHVsbCdcbmltcG9ydCBleHRlbnNpb24gZnJvbSAnLi4vLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcblxudHlwZSBQcm9wcyA9IHtcbiAgY2x1c3RlcjogQ2x1c3RlclR5cGVcbiAgbWFwOiBhbnlcbn1cblxuY29uc3QgQ2x1c3RlciA9ICh7IGNsdXN0ZXIsIG1hcCB9OiBQcm9wcykgPT4ge1xuICBjb25zdCBnZW9tZXRyaWVzID0gUmVhY3QudXNlUmVmKFtdIGFzIGFueVtdKVxuICBjb25zdCBpc1NlbGVjdGVkID0gdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0cyh7IGxhenlSZXN1bHRzOiBjbHVzdGVyLnJlc3VsdHMgfSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHN3aXRjaCAoaXNTZWxlY3RlZCkge1xuICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxuICAgICAgICBtYXAudXBkYXRlQ2x1c3RlcihnZW9tZXRyaWVzLmN1cnJlbnQsIHtcbiAgICAgICAgICBjb2xvcjogJ29yYW5nZScsXG4gICAgICAgICAgaXNTZWxlY3RlZCxcbiAgICAgICAgICBjb3VudDogY2x1c3Rlci5yZXN1bHRzLmxlbmd0aCxcbiAgICAgICAgICBvdXRsaW5lOiAnd2hpdGUnLFxuICAgICAgICAgIHRleHRGaWxsOiAnd2hpdGUnLFxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncGFydGlhbGx5JzpcbiAgICAgICAgbWFwLnVwZGF0ZUNsdXN0ZXIoZ2VvbWV0cmllcy5jdXJyZW50LCB7XG4gICAgICAgICAgY29sb3I6IGNsdXN0ZXIucmVzdWx0c1swXS5nZXRDb2xvcigpLFxuICAgICAgICAgIGlzU2VsZWN0ZWQsXG4gICAgICAgICAgY291bnQ6IGNsdXN0ZXIucmVzdWx0cy5sZW5ndGgsXG4gICAgICAgICAgb3V0bGluZTogJ2JsYWNrJyxcbiAgICAgICAgICB0ZXh0RmlsbDogJ3doaXRlJyxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Vuc2VsZWN0ZWQnOlxuICAgICAgICBtYXAudXBkYXRlQ2x1c3RlcihnZW9tZXRyaWVzLmN1cnJlbnQsIHtcbiAgICAgICAgICBjb2xvcjogY2x1c3Rlci5yZXN1bHRzWzBdLmdldENvbG9yKCksXG4gICAgICAgICAgaXNTZWxlY3RlZCxcbiAgICAgICAgICBjb3VudDogY2x1c3Rlci5yZXN1bHRzLmxlbmd0aCxcbiAgICAgICAgICBvdXRsaW5lOiAnd2hpdGUnLFxuICAgICAgICAgIHRleHRGaWxsOiAnd2hpdGUnLFxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfSwgW2lzU2VsZWN0ZWRdKVxuXG4gIGNvbnN0IGhhbmRsZUNsdXN0ZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgY2VudGVyID0gbWFwLmdldENhcnRvZ3JhcGhpY0NlbnRlck9mQ2x1c3RlckluRGVncmVlcyhjbHVzdGVyKVxuXG4gICAgY29uc3QgYmFkZ2VPcHRpb25zID0gZXh0ZW5zaW9uLmN1c3RvbU1hcEJhZGdlKHtcbiAgICAgIHJlc3VsdHM6IGNsdXN0ZXIucmVzdWx0cyxcbiAgICAgIGlzQ2x1c3RlcjogdHJ1ZSxcbiAgICB9KVxuXG4gICAgZ2VvbWV0cmllcy5jdXJyZW50LnB1c2goXG4gICAgICBtYXAuYWRkUG9pbnRXaXRoVGV4dChjZW50ZXIsIHtcbiAgICAgICAgaWQ6IGNsdXN0ZXIucmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0WydtZXRhY2FyZC5pZCddKSxcbiAgICAgICAgY29sb3I6IGNsdXN0ZXIucmVzdWx0c1swXS5nZXRDb2xvcigpLFxuICAgICAgICBpc1NlbGVjdGVkLFxuICAgICAgICBiYWRnZU9wdGlvbnMsXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIGNvbnN0IGFkZENvbnZleEh1bGwgPSAoKSA9PiB7XG4gICAgY29uc3QgcG9pbnRzID0gY2x1c3Rlci5yZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHQuZ2V0UG9pbnRzKCkpXG4gICAgY29uc3QgZGF0YSA9IF8uZmxhdHRlbihwb2ludHMsIHRydWUpLm1hcCgoY29vcmQ6IGFueSkgPT4gKHtcbiAgICAgIGxvbmdpdHVkZTogY29vcmRbMF0sXG4gICAgICBsYXRpdHVkZTogY29vcmRbMV0sXG4gICAgfSkpXG4gICAgY29uc3QgY29udmV4SHVsbCA9IGNhbGN1bGF0ZUNvbnZleEh1bGwoZGF0YSkubWFwKChjb29yZDogYW55KSA9PiBbXG4gICAgICBjb29yZC5sb25naXR1ZGUsXG4gICAgICBjb29yZC5sYXRpdHVkZSxcbiAgICBdKVxuICAgIGNvbnZleEh1bGwucHVzaChjb252ZXhIdWxsWzBdKVxuICAgIGNvbnN0IGdlb21ldHJ5ID0gbWFwLmFkZExpbmUoY29udmV4SHVsbCwge1xuICAgICAgaWQ6IGNsdXN0ZXIucmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0WydtZXRhY2FyZC5pZCddKSxcbiAgICAgIGNvbG9yOiBjbHVzdGVyLnJlc3VsdHNbMF0uZ2V0Q29sb3IoKSxcbiAgICB9KVxuICAgIG1hcC5oaWRlR2VvbWV0cnkoZ2VvbWV0cnkpXG4gICAgZ2VvbWV0cmllcy5jdXJyZW50LnB1c2goZ2VvbWV0cnkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGhhbmRsZUNsdXN0ZXIoKVxuICAgIGFkZENvbnZleEh1bGwoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBnZW9tZXRyaWVzLmN1cnJlbnQuZm9yRWFjaCgoZ2VvbWV0cnkpID0+IHtcbiAgICAgICAgbWFwLnJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5KVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4gPD48Lz5cbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoQ2x1c3RlcilcbiJdfQ==