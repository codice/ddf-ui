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
//# sourceMappingURL=calculate-clusters.js.map