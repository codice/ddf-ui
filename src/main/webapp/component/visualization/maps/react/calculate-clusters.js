import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import _ from 'underscore';
import Clustering from '../Clustering';
var CalculateClusters = function (_a) {
    var map = _a.map, setClusters = _a.setClusters, isClustering = _a.isClustering, lazyResults = _a.lazyResults;
    var clusteringAnimationFrameId = React.useRef(undefined);
    var getResultsWithGeometry = function () {
        return Object.values(lazyResults).filter(function (lazyResult) {
            return lazyResult.hasGeometry();
        });
    };
    var calculateClusters = _.debounce(function () {
        if (isClustering) {
            // const now = Date.now() look into trying to boost perf here
            var calculatedClusters = Clustering.calculateClusters(getResultsWithGeometry(), map);
            // console.log(`Time to cluster: ${Date.now() - now}`)
            setClusters(calculatedClusters.map(function (calculatedCluster) {
                return {
                    results: calculatedCluster,
                    id: calculatedCluster
                        .map(function (result) { return result['metacard.id']; })
                        .sort()
                        .toString(),
                };
            }));
        }
    }, 500);
    var handleResultsChange = function () {
        setClusters([]);
        calculateClusters();
    };
    var startClusterAnimating = function () {
        if (isClustering) {
            clusteringAnimationFrameId.current = window.requestAnimationFrame(function () {
                calculateClusters();
                startClusterAnimating();
            });
        }
    };
    var stopClusterAnimating = function () {
        window.cancelAnimationFrame(clusteringAnimationFrameId.current);
        calculateClusters();
    };
    React.useEffect(function () {
        handleResultsChange();
    }, [lazyResults]);
    React.useEffect(function () {
        if (isClustering) {
            calculateClusters();
        }
        else {
            setClusters([]);
        }
        map.onCameraMoveStart(startClusterAnimating);
        map.onCameraMoveEnd(stopClusterAnimating);
        return function () {
            map.offCameraMoveStart(startClusterAnimating);
            map.offCameraMoveEnd(stopClusterAnimating);
        };
    }, [isClustering, lazyResults]);
    return _jsx(_Fragment, {});
};
export default CalculateClusters;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsY3VsYXRlLWNsdXN0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvcmVhY3QvY2FsY3VsYXRlLWNsdXN0ZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRTFCLE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQVl0QyxJQUFNLGlCQUFpQixHQUFHLFVBQUMsRUFLbkI7UUFKTixHQUFHLFNBQUEsRUFDSCxXQUFXLGlCQUFBLEVBQ1gsWUFBWSxrQkFBQSxFQUNaLFdBQVcsaUJBQUE7SUFFWCxJQUFNLDBCQUEwQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQzdDLFNBQStCLENBQ2hDLENBQUE7SUFFRCxJQUFNLHNCQUFzQixHQUFHO1FBQzdCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxVQUFVO1lBQ2xELE9BQUEsVUFBVSxDQUFDLFdBQVcsRUFBRTtRQUF4QixDQUF3QixDQUN6QixDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ25DLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsNkRBQTZEO1lBQzdELElBQU0sa0JBQWtCLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUNyRCxzQkFBc0IsRUFBRSxFQUN4QixHQUFHLENBQ21CLENBQUE7WUFDeEIsc0RBQXNEO1lBQ3RELFdBQVcsQ0FDVCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBQyxpQkFBaUI7Z0JBQ3ZDLE9BQU87b0JBQ0wsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsRUFBRSxFQUFFLGlCQUFpQjt5QkFDbEIsR0FBRyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFyQixDQUFxQixDQUFDO3lCQUN0QyxJQUFJLEVBQUU7eUJBQ04sUUFBUSxFQUFFO2lCQUNkLENBQUE7WUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUVQLElBQU0sbUJBQW1CLEdBQUc7UUFDMUIsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsaUJBQWlCLEVBQUUsQ0FBQTtJQUNyQixDQUFDLENBQUE7SUFFRCxJQUFNLHFCQUFxQixHQUFHO1FBQzVCLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsMEJBQTBCLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztnQkFDaEUsaUJBQWlCLEVBQUUsQ0FBQTtnQkFDbkIscUJBQXFCLEVBQUUsQ0FBQTtZQUN6QixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxJQUFNLG9CQUFvQixHQUFHO1FBQzNCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQywwQkFBMEIsQ0FBQyxPQUFpQixDQUFDLENBQUE7UUFDekUsaUJBQWlCLEVBQUUsQ0FBQTtJQUNyQixDQUFDLENBQUE7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsbUJBQW1CLEVBQUUsQ0FBQTtJQUN2QixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBRWpCLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLGlCQUFpQixFQUFFLENBQUE7UUFDckIsQ0FBQzthQUFNLENBQUM7WUFDTixXQUFXLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDakIsQ0FBQztRQUNELEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQzVDLEdBQUcsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN6QyxPQUFPO1lBQ0wsR0FBRyxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUE7WUFDN0MsR0FBRyxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFDNUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7SUFFL0IsT0FBTyxtQkFBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBRUQsZUFBZSxpQkFBaUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5pbXBvcnQgQ2x1c3RlcmluZyBmcm9tICcuLi9DbHVzdGVyaW5nJ1xuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuL2dlb21ldHJpZXMnXG5pbXBvcnQgeyBMYXp5UmVzdWx0c1R5cGUgfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcblxudHlwZSBQcm9wcyA9IHtcbiAgaXNDbHVzdGVyaW5nOiBib29sZWFuXG4gIG1hcDogYW55XG4gIHNldENsdXN0ZXJzOiBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxDbHVzdGVyVHlwZVtdPj5cbiAgbGF6eVJlc3VsdHM6IExhenlSZXN1bHRzVHlwZVxufVxuXG5jb25zdCBDYWxjdWxhdGVDbHVzdGVycyA9ICh7XG4gIG1hcCxcbiAgc2V0Q2x1c3RlcnMsXG4gIGlzQ2x1c3RlcmluZyxcbiAgbGF6eVJlc3VsdHMsXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCBjbHVzdGVyaW5nQW5pbWF0aW9uRnJhbWVJZCA9IFJlYWN0LnVzZVJlZihcbiAgICB1bmRlZmluZWQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkXG4gIClcblxuICBjb25zdCBnZXRSZXN1bHRzV2l0aEdlb21ldHJ5ID0gKCkgPT4ge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzKS5maWx0ZXIoKGxhenlSZXN1bHQpID0+XG4gICAgICBsYXp5UmVzdWx0Lmhhc0dlb21ldHJ5KClcbiAgICApXG4gIH1cblxuICBjb25zdCBjYWxjdWxhdGVDbHVzdGVycyA9IF8uZGVib3VuY2UoKCkgPT4ge1xuICAgIGlmIChpc0NsdXN0ZXJpbmcpIHtcbiAgICAgIC8vIGNvbnN0IG5vdyA9IERhdGUubm93KCkgbG9vayBpbnRvIHRyeWluZyB0byBib29zdCBwZXJmIGhlcmVcbiAgICAgIGNvbnN0IGNhbGN1bGF0ZWRDbHVzdGVycyA9IENsdXN0ZXJpbmcuY2FsY3VsYXRlQ2x1c3RlcnMoXG4gICAgICAgIGdldFJlc3VsdHNXaXRoR2VvbWV0cnkoKSxcbiAgICAgICAgbWFwXG4gICAgICApIGFzIExhenlRdWVyeVJlc3VsdFtdW11cbiAgICAgIC8vIGNvbnNvbGUubG9nKGBUaW1lIHRvIGNsdXN0ZXI6ICR7RGF0ZS5ub3coKSAtIG5vd31gKVxuICAgICAgc2V0Q2x1c3RlcnMoXG4gICAgICAgIGNhbGN1bGF0ZWRDbHVzdGVycy5tYXAoKGNhbGN1bGF0ZWRDbHVzdGVyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3VsdHM6IGNhbGN1bGF0ZWRDbHVzdGVyLFxuICAgICAgICAgICAgaWQ6IGNhbGN1bGF0ZWRDbHVzdGVyXG4gICAgICAgICAgICAgIC5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0WydtZXRhY2FyZC5pZCddKVxuICAgICAgICAgICAgICAuc29ydCgpXG4gICAgICAgICAgICAgIC50b1N0cmluZygpLFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0sIDUwMClcblxuICBjb25zdCBoYW5kbGVSZXN1bHRzQ2hhbmdlID0gKCkgPT4ge1xuICAgIHNldENsdXN0ZXJzKFtdKVxuICAgIGNhbGN1bGF0ZUNsdXN0ZXJzKClcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0Q2x1c3RlckFuaW1hdGluZyA9ICgpID0+IHtcbiAgICBpZiAoaXNDbHVzdGVyaW5nKSB7XG4gICAgICBjbHVzdGVyaW5nQW5pbWF0aW9uRnJhbWVJZC5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGNhbGN1bGF0ZUNsdXN0ZXJzKClcbiAgICAgICAgc3RhcnRDbHVzdGVyQW5pbWF0aW5nKClcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RvcENsdXN0ZXJBbmltYXRpbmcgPSAoKSA9PiB7XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGNsdXN0ZXJpbmdBbmltYXRpb25GcmFtZUlkLmN1cnJlbnQgYXMgbnVtYmVyKVxuICAgIGNhbGN1bGF0ZUNsdXN0ZXJzKClcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaGFuZGxlUmVzdWx0c0NoYW5nZSgpXG4gIH0sIFtsYXp5UmVzdWx0c10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNDbHVzdGVyaW5nKSB7XG4gICAgICBjYWxjdWxhdGVDbHVzdGVycygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldENsdXN0ZXJzKFtdKVxuICAgIH1cbiAgICBtYXAub25DYW1lcmFNb3ZlU3RhcnQoc3RhcnRDbHVzdGVyQW5pbWF0aW5nKVxuICAgIG1hcC5vbkNhbWVyYU1vdmVFbmQoc3RvcENsdXN0ZXJBbmltYXRpbmcpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG1hcC5vZmZDYW1lcmFNb3ZlU3RhcnQoc3RhcnRDbHVzdGVyQW5pbWF0aW5nKVxuICAgICAgbWFwLm9mZkNhbWVyYU1vdmVFbmQoc3RvcENsdXN0ZXJBbmltYXRpbmcpXG4gICAgfVxuICB9LCBbaXNDbHVzdGVyaW5nLCBsYXp5UmVzdWx0c10pXG5cbiAgcmV0dXJuIDw+PC8+XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbGN1bGF0ZUNsdXN0ZXJzXG4iXX0=