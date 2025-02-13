import * as React from 'react';
import { hot } from 'react-hot-loader';
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
    return React.createElement(React.Fragment, null);
};
export default hot(module)(CalculateClusters);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsY3VsYXRlLWNsdXN0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvcmVhY3QvY2FsY3VsYXRlLWNsdXN0ZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBRTFCLE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQVl0QyxJQUFNLGlCQUFpQixHQUFHLFVBQUMsRUFLbkI7UUFKTixHQUFHLFNBQUEsRUFDSCxXQUFXLGlCQUFBLEVBQ1gsWUFBWSxrQkFBQSxFQUNaLFdBQVcsaUJBQUE7SUFFWCxJQUFNLDBCQUEwQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQzdDLFNBQStCLENBQ2hDLENBQUE7SUFFRCxJQUFNLHNCQUFzQixHQUFHO1FBQzdCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxVQUFVO1lBQ2xELE9BQUEsVUFBVSxDQUFDLFdBQVcsRUFBRTtRQUF4QixDQUF3QixDQUN6QixDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ25DLElBQUksWUFBWSxFQUFFO1lBQ2hCLDZEQUE2RDtZQUM3RCxJQUFNLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FDckQsc0JBQXNCLEVBQUUsRUFDeEIsR0FBRyxDQUNtQixDQUFBO1lBQ3hCLHNEQUFzRDtZQUN0RCxXQUFXLENBQ1Qsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQUMsaUJBQWlCO2dCQUN2QyxPQUFPO29CQUNMLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLEVBQUUsRUFBRSxpQkFBaUI7eUJBQ2xCLEdBQUcsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBckIsQ0FBcUIsQ0FBQzt5QkFDdEMsSUFBSSxFQUFFO3lCQUNOLFFBQVEsRUFBRTtpQkFDZCxDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtTQUNGO0lBQ0gsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRVAsSUFBTSxtQkFBbUIsR0FBRztRQUMxQixXQUFXLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixpQkFBaUIsRUFBRSxDQUFBO0lBQ3JCLENBQUMsQ0FBQTtJQUVELElBQU0scUJBQXFCLEdBQUc7UUFDNUIsSUFBSSxZQUFZLEVBQUU7WUFDaEIsMEJBQTBCLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztnQkFDaEUsaUJBQWlCLEVBQUUsQ0FBQTtnQkFDbkIscUJBQXFCLEVBQUUsQ0FBQTtZQUN6QixDQUFDLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsSUFBTSxvQkFBb0IsR0FBRztRQUMzQixNQUFNLENBQUMsb0JBQW9CLENBQUMsMEJBQTBCLENBQUMsT0FBaUIsQ0FBQyxDQUFBO1FBQ3pFLGlCQUFpQixFQUFFLENBQUE7SUFDckIsQ0FBQyxDQUFBO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLG1CQUFtQixFQUFFLENBQUE7SUFDdkIsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUVqQixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxZQUFZLEVBQUU7WUFDaEIsaUJBQWlCLEVBQUUsQ0FBQTtTQUNwQjthQUFNO1lBQ0wsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2hCO1FBQ0QsR0FBRyxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDNUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ3pDLE9BQU87WUFDTCxHQUFHLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQTtZQUM3QyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUM1QyxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUUvQixPQUFPLHlDQUFLLENBQUE7QUFDZCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuaW1wb3J0IENsdXN0ZXJpbmcgZnJvbSAnLi4vQ2x1c3RlcmluZydcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi9nZW9tZXRyaWVzJ1xuaW1wb3J0IHsgTGF6eVJlc3VsdHNUeXBlIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGlzQ2x1c3RlcmluZzogYm9vbGVhblxuICBtYXA6IGFueVxuICBzZXRDbHVzdGVyczogUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248Q2x1c3RlclR5cGVbXT4+XG4gIGxhenlSZXN1bHRzOiBMYXp5UmVzdWx0c1R5cGVcbn1cblxuY29uc3QgQ2FsY3VsYXRlQ2x1c3RlcnMgPSAoe1xuICBtYXAsXG4gIHNldENsdXN0ZXJzLFxuICBpc0NsdXN0ZXJpbmcsXG4gIGxhenlSZXN1bHRzLFxufTogUHJvcHMpID0+IHtcbiAgY29uc3QgY2x1c3RlcmluZ0FuaW1hdGlvbkZyYW1lSWQgPSBSZWFjdC51c2VSZWYoXG4gICAgdW5kZWZpbmVkIGFzIG51bWJlciB8IHVuZGVmaW5lZFxuICApXG5cbiAgY29uc3QgZ2V0UmVzdWx0c1dpdGhHZW9tZXRyeSA9ICgpID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cykuZmlsdGVyKChsYXp5UmVzdWx0KSA9PlxuICAgICAgbGF6eVJlc3VsdC5oYXNHZW9tZXRyeSgpXG4gICAgKVxuICB9XG5cbiAgY29uc3QgY2FsY3VsYXRlQ2x1c3RlcnMgPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICBpZiAoaXNDbHVzdGVyaW5nKSB7XG4gICAgICAvLyBjb25zdCBub3cgPSBEYXRlLm5vdygpIGxvb2sgaW50byB0cnlpbmcgdG8gYm9vc3QgcGVyZiBoZXJlXG4gICAgICBjb25zdCBjYWxjdWxhdGVkQ2x1c3RlcnMgPSBDbHVzdGVyaW5nLmNhbGN1bGF0ZUNsdXN0ZXJzKFxuICAgICAgICBnZXRSZXN1bHRzV2l0aEdlb21ldHJ5KCksXG4gICAgICAgIG1hcFxuICAgICAgKSBhcyBMYXp5UXVlcnlSZXN1bHRbXVtdXG4gICAgICAvLyBjb25zb2xlLmxvZyhgVGltZSB0byBjbHVzdGVyOiAke0RhdGUubm93KCkgLSBub3d9YClcbiAgICAgIHNldENsdXN0ZXJzKFxuICAgICAgICBjYWxjdWxhdGVkQ2x1c3RlcnMubWFwKChjYWxjdWxhdGVkQ2x1c3RlcikgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN1bHRzOiBjYWxjdWxhdGVkQ2x1c3RlcixcbiAgICAgICAgICAgIGlkOiBjYWxjdWxhdGVkQ2x1c3RlclxuICAgICAgICAgICAgICAubWFwKChyZXN1bHQpID0+IHJlc3VsdFsnbWV0YWNhcmQuaWQnXSlcbiAgICAgICAgICAgICAgLnNvcnQoKVxuICAgICAgICAgICAgICAudG9TdHJpbmcoKSxcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9LCA1MDApXG5cbiAgY29uc3QgaGFuZGxlUmVzdWx0c0NoYW5nZSA9ICgpID0+IHtcbiAgICBzZXRDbHVzdGVycyhbXSlcbiAgICBjYWxjdWxhdGVDbHVzdGVycygpXG4gIH1cblxuICBjb25zdCBzdGFydENsdXN0ZXJBbmltYXRpbmcgPSAoKSA9PiB7XG4gICAgaWYgKGlzQ2x1c3RlcmluZykge1xuICAgICAgY2x1c3RlcmluZ0FuaW1hdGlvbkZyYW1lSWQuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBjYWxjdWxhdGVDbHVzdGVycygpXG4gICAgICAgIHN0YXJ0Q2x1c3RlckFuaW1hdGluZygpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0b3BDbHVzdGVyQW5pbWF0aW5nID0gKCkgPT4ge1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShjbHVzdGVyaW5nQW5pbWF0aW9uRnJhbWVJZC5jdXJyZW50IGFzIG51bWJlcilcbiAgICBjYWxjdWxhdGVDbHVzdGVycygpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGhhbmRsZVJlc3VsdHNDaGFuZ2UoKVxuICB9LCBbbGF6eVJlc3VsdHNdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzQ2x1c3RlcmluZykge1xuICAgICAgY2FsY3VsYXRlQ2x1c3RlcnMoKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRDbHVzdGVycyhbXSlcbiAgICB9XG4gICAgbWFwLm9uQ2FtZXJhTW92ZVN0YXJ0KHN0YXJ0Q2x1c3RlckFuaW1hdGluZylcbiAgICBtYXAub25DYW1lcmFNb3ZlRW5kKHN0b3BDbHVzdGVyQW5pbWF0aW5nKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtYXAub2ZmQ2FtZXJhTW92ZVN0YXJ0KHN0YXJ0Q2x1c3RlckFuaW1hdGluZylcbiAgICAgIG1hcC5vZmZDYW1lcmFNb3ZlRW5kKHN0b3BDbHVzdGVyQW5pbWF0aW5nKVxuICAgIH1cbiAgfSwgW2lzQ2x1c3RlcmluZywgbGF6eVJlc3VsdHNdKVxuXG4gIHJldHVybiA8PjwvPlxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShDYWxjdWxhdGVDbHVzdGVycylcbiJdfQ==