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
//# sourceMappingURL=cluster.js.map