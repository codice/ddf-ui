import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
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
    return _jsx(_Fragment, {});
};
export default Cluster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL3JlYWN0L2NsdXN0ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUc5QixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUN0RixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsbUpBQW1KO0FBQ25KLE9BQU8sbUJBQW1CLE1BQU0saUJBQWlCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sOEJBQThCLENBQUE7QUFPcEQsSUFBTSxPQUFPLEdBQUcsVUFBQyxFQUF1QjtRQUFyQixPQUFPLGFBQUEsRUFBRSxHQUFHLFNBQUE7SUFDN0IsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFXLENBQUMsQ0FBQTtJQUM1QyxJQUFNLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUU5RSxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsUUFBUSxVQUFVLEVBQUUsQ0FBQztZQUNuQixLQUFLLFVBQVU7Z0JBQ2IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO29CQUNwQyxLQUFLLEVBQUUsUUFBUTtvQkFDZixVQUFVLFlBQUE7b0JBQ1YsS0FBSyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTTtvQkFDN0IsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFFBQVEsRUFBRSxPQUFPO2lCQUNsQixDQUFDLENBQUE7Z0JBQ0YsTUFBSztZQUNQLEtBQUssV0FBVztnQkFDZCxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7b0JBQ3BDLEtBQUss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Q0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkMsQ0FBQyxDQUFBO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLGFBQWEsRUFBRSxDQUFBO1FBQ2YsYUFBYSxFQUFFLENBQUE7UUFDZixPQUFPO1lBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNsQyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzlCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxtQkFBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBRUQsZUFBZSxPQUFPLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuL2dlb21ldHJpZXMnXG5pbXBvcnQgeyB1c2VTZWxlY3Rpb25PZkxhenlSZXN1bHRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2dlby0uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IGNhbGN1bGF0ZUNvbnZleEh1bGwgZnJvbSAnZ2VvLWNvbnZleC1odWxsJ1xuaW1wb3J0IGV4dGVuc2lvbiBmcm9tICcuLi8uLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuXG50eXBlIFByb3BzID0ge1xuICBjbHVzdGVyOiBDbHVzdGVyVHlwZVxuICBtYXA6IGFueVxufVxuXG5jb25zdCBDbHVzdGVyID0gKHsgY2x1c3RlciwgbWFwIH06IFByb3BzKSA9PiB7XG4gIGNvbnN0IGdlb21ldHJpZXMgPSBSZWFjdC51c2VSZWYoW10gYXMgYW55W10pXG4gIGNvbnN0IGlzU2VsZWN0ZWQgPSB1c2VTZWxlY3Rpb25PZkxhenlSZXN1bHRzKHsgbGF6eVJlc3VsdHM6IGNsdXN0ZXIucmVzdWx0cyB9KVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc3dpdGNoIChpc1NlbGVjdGVkKSB7XG4gICAgICBjYXNlICdzZWxlY3RlZCc6XG4gICAgICAgIG1hcC51cGRhdGVDbHVzdGVyKGdlb21ldHJpZXMuY3VycmVudCwge1xuICAgICAgICAgIGNvbG9yOiAnb3JhbmdlJyxcbiAgICAgICAgICBpc1NlbGVjdGVkLFxuICAgICAgICAgIGNvdW50OiBjbHVzdGVyLnJlc3VsdHMubGVuZ3RoLFxuICAgICAgICAgIG91dGxpbmU6ICd3aGl0ZScsXG4gICAgICAgICAgdGV4dEZpbGw6ICd3aGl0ZScsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdwYXJ0aWFsbHknOlxuICAgICAgICBtYXAudXBkYXRlQ2x1c3RlcihnZW9tZXRyaWVzLmN1cnJlbnQsIHtcbiAgICAgICAgICBjb2xvcjogY2x1c3Rlci5yZXN1bHRzWzBdLmdldENvbG9yKCksXG4gICAgICAgICAgaXNTZWxlY3RlZCxcbiAgICAgICAgICBjb3VudDogY2x1c3Rlci5yZXN1bHRzLmxlbmd0aCxcbiAgICAgICAgICBvdXRsaW5lOiAnYmxhY2snLFxuICAgICAgICAgIHRleHRGaWxsOiAnd2hpdGUnLFxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAndW5zZWxlY3RlZCc6XG4gICAgICAgIG1hcC51cGRhdGVDbHVzdGVyKGdlb21ldHJpZXMuY3VycmVudCwge1xuICAgICAgICAgIGNvbG9yOiBjbHVzdGVyLnJlc3VsdHNbMF0uZ2V0Q29sb3IoKSxcbiAgICAgICAgICBpc1NlbGVjdGVkLFxuICAgICAgICAgIGNvdW50OiBjbHVzdGVyLnJlc3VsdHMubGVuZ3RoLFxuICAgICAgICAgIG91dGxpbmU6ICd3aGl0ZScsXG4gICAgICAgICAgdGV4dEZpbGw6ICd3aGl0ZScsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9LCBbaXNTZWxlY3RlZF0pXG5cbiAgY29uc3QgaGFuZGxlQ2x1c3RlciA9ICgpID0+IHtcbiAgICBjb25zdCBjZW50ZXIgPSBtYXAuZ2V0Q2FydG9ncmFwaGljQ2VudGVyT2ZDbHVzdGVySW5EZWdyZWVzKGNsdXN0ZXIpXG5cbiAgICBjb25zdCBiYWRnZU9wdGlvbnMgPSBleHRlbnNpb24uY3VzdG9tTWFwQmFkZ2Uoe1xuICAgICAgcmVzdWx0czogY2x1c3Rlci5yZXN1bHRzLFxuICAgICAgaXNDbHVzdGVyOiB0cnVlLFxuICAgIH0pXG5cbiAgICBnZW9tZXRyaWVzLmN1cnJlbnQucHVzaChcbiAgICAgIG1hcC5hZGRQb2ludFdpdGhUZXh0KGNlbnRlciwge1xuICAgICAgICBpZDogY2x1c3Rlci5yZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHRbJ21ldGFjYXJkLmlkJ10pLFxuICAgICAgICBjb2xvcjogY2x1c3Rlci5yZXN1bHRzWzBdLmdldENvbG9yKCksXG4gICAgICAgIGlzU2VsZWN0ZWQsXG4gICAgICAgIGJhZGdlT3B0aW9ucyxcbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgY29uc3QgYWRkQ29udmV4SHVsbCA9ICgpID0+IHtcbiAgICBjb25zdCBwb2ludHMgPSBjbHVzdGVyLnJlc3VsdHMubWFwKChyZXN1bHQpID0+IHJlc3VsdC5nZXRQb2ludHMoKSlcbiAgICBjb25zdCBkYXRhID0gXy5mbGF0dGVuKHBvaW50cywgdHJ1ZSkubWFwKChjb29yZDogYW55KSA9PiAoe1xuICAgICAgbG9uZ2l0dWRlOiBjb29yZFswXSxcbiAgICAgIGxhdGl0dWRlOiBjb29yZFsxXSxcbiAgICB9KSlcbiAgICBjb25zdCBjb252ZXhIdWxsID0gY2FsY3VsYXRlQ29udmV4SHVsbChkYXRhKS5tYXAoKGNvb3JkOiBhbnkpID0+IFtcbiAgICAgIGNvb3JkLmxvbmdpdHVkZSxcbiAgICAgIGNvb3JkLmxhdGl0dWRlLFxuICAgIF0pXG4gICAgY29udmV4SHVsbC5wdXNoKGNvbnZleEh1bGxbMF0pXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBtYXAuYWRkTGluZShjb252ZXhIdWxsLCB7XG4gICAgICBpZDogY2x1c3Rlci5yZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHRbJ21ldGFjYXJkLmlkJ10pLFxuICAgICAgY29sb3I6IGNsdXN0ZXIucmVzdWx0c1swXS5nZXRDb2xvcigpLFxuICAgIH0pXG4gICAgbWFwLmhpZGVHZW9tZXRyeShnZW9tZXRyeSlcbiAgICBnZW9tZXRyaWVzLmN1cnJlbnQucHVzaChnZW9tZXRyeSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaGFuZGxlQ2x1c3RlcigpXG4gICAgYWRkQ29udmV4SHVsbCgpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGdlb21ldHJpZXMuY3VycmVudC5mb3JFYWNoKChnZW9tZXRyeSkgPT4ge1xuICAgICAgICBtYXAucmVtb3ZlR2VvbWV0cnkoZ2VvbWV0cnkpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW10pXG4gIHJldHVybiA8PjwvPlxufVxuXG5leHBvcnQgZGVmYXVsdCBDbHVzdGVyXG4iXX0=