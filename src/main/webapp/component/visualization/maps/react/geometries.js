import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Drawing } from '../../../singletons/drawing';
import { useLazyResultsFromSelectionInterface } from '../../../selection-interface/hooks';
import Geometry from './geometry';
import CalculateClusters from './calculate-clusters';
import Cluster from './cluster';
import ZoomToSelection from './zoom-to-selection';
import { SHAPE_ID_PREFIX } from '../drawing-and-display';
var Geometries = function (props) {
    var map = props.map, selectionInterface = props.selectionInterface, isClustering = props.isClustering;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var lazyResultsRef = React.useRef(lazyResults);
    lazyResultsRef.current = lazyResults;
    var _a = __read(React.useState([]), 2), clusters = _a[0], setClusters = _a[1];
    // possible since we debounce
    if (isClustering === false && clusters.length > 0) {
        setClusters([]);
    }
    React.useEffect(function () {
        var handleCtrlClick = function (id) {
            if (id.constructor === String) {
                lazyResultsRef.current.results[id].controlSelect();
            }
            else {
                ;
                id.map(function (subid) {
                    return lazyResultsRef.current.results[subid].controlSelect();
                });
            }
        };
        var handleClick = function (id) {
            if (id.constructor === String) {
                lazyResultsRef.current.results[id].select();
            }
            else {
                var resultIds = id;
                var shouldJustDeselect = resultIds.some(function (subid) { return lazyResultsRef.current.results[subid].isSelected; });
                lazyResultsRef.current.deselect();
                if (!shouldJustDeselect) {
                    resultIds.map(function (subid) {
                        return lazyResultsRef.current.results[subid].controlSelect();
                    });
                }
            }
        };
        var handleLeftClick = function (event, mapEvent) {
            if (mapEvent.mapTarget &&
                mapEvent.mapTarget !== 'userDrawing' &&
                !Drawing.isDrawing()) {
                // we get click events on normal drawn features from the location drawing
                if (mapEvent.mapTarget.constructor === String &&
                    mapEvent.mapTarget.startsWith(SHAPE_ID_PREFIX)) {
                    return;
                }
                if (event.shiftKey) {
                    handleCtrlClick(mapEvent.mapTarget);
                }
                else if (event.ctrlKey || event.metaKey) {
                    handleCtrlClick(mapEvent.mapTarget);
                }
                else {
                    handleClick(mapEvent.mapTarget);
                }
            }
        };
        map.onLeftClick(handleLeftClick);
        return function () { };
    }, []);
    var IndividualGeometries = React.useMemo(function () {
        return Object.values(lazyResults.results).map(function (lazyResult) {
            return (React.createElement(Geometry, { key: lazyResult['metacard.id'], lazyResult: lazyResult, map: map, clusters: clusters }));
        });
    }, [lazyResults.results, clusters]);
    var Clusters = React.useMemo(function () {
        return clusters.map(function (cluster) {
            return React.createElement(Cluster, { key: cluster.id, cluster: cluster, map: map });
        });
    }, [clusters, lazyResults.results]);
    var CalculateClustersMemo = React.useMemo(function () {
        return (React.createElement(CalculateClusters, { key: "clusters", isClustering: isClustering, map: map, lazyResults: lazyResults.results, setClusters: setClusters }));
    }, [lazyResults.results, isClustering]);
    var ZoomToSelectionMemo = React.useMemo(function () {
        return React.createElement(ZoomToSelection, { map: map, lazyResults: lazyResults });
    }, [lazyResults]);
    return (React.createElement(React.Fragment, null,
        ZoomToSelectionMemo,
        CalculateClustersMemo,
        Clusters,
        IndividualGeometries));
};
export default hot(module)(Geometries);
//# sourceMappingURL=geometries.js.map