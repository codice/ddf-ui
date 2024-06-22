import * as React from 'react';
import { hot } from 'react-hot-loader';
import _ from 'underscore';
import _debounce from 'lodash/debounce';
import wkx from 'wkx';
import iconHelper from '../../../../js/IconHelper';
import { useUpdateEffect } from 'react-use';
import { useSelectionOfLazyResult } from '../../../../js/model/LazyQueryResult/hooks';
import extension from '../../../../extension-points';
import { useMetacardDefinitions } from '../../../../js/model/Startup/metacard-definitions.hooks';
var determineIfClustered = function (_a) {
    var clusters = _a.clusters, result = _a.result;
    return Boolean(clusters.find(function (cluster) {
        return Boolean(cluster.results.find(function (clusteredResult) {
            return clusteredResult['metacard.id'] === result['metacard.id'];
        }));
    }));
};
var Geometry = function (_a) {
    var lazyResult = _a.lazyResult, map = _a.map, clusters = _a.clusters;
    var MetacardDefinitions = useMetacardDefinitions();
    var isClustered = React.useRef(false);
    var geometries = React.useRef([]);
    var isSelected = useSelectionOfLazyResult({ lazyResult: lazyResult });
    useUpdateEffect(function () {
        updateDisplay(isSelected);
    }, [isSelected, lazyResult.plain]);
    React.useEffect(function () {
        checkIfClustered();
    }, [clusters, lazyResult.plain]);
    React.useEffect(function () {
        updateGeometries();
        return function () {
            // cleanup
            destroyGeometries();
        };
    }, [lazyResult.plain]);
    var handlePoint = React.useMemo(function () {
        var badgeOptions = extension.customMapBadge({
            results: [lazyResult],
            isCluster: false,
        });
        return function (point) {
            geometries.current.push(map.addPoint(point, {
                id: lazyResult['metacard.id'],
                title: lazyResult.plain.metacard.properties.title,
                color: color,
                icon: icon,
                isSelected: isSelected,
                badgeOptions: badgeOptions,
            }));
        };
    }, [lazyResult.plain]);
    var handleLine = React.useMemo(function () {
        return function (line) {
            geometries.current.push(map.addLine(line, {
                id: lazyResult['metacard.id'],
                title: lazyResult.plain.metacard.properties.title,
                color: color,
                isSelected: isSelected,
            }));
        };
    }, [lazyResult.plain]);
    var handleGeometry = React.useMemo(function () {
        return function (geometry) {
            switch (geometry.type) {
                case 'Point':
                    handlePoint(geometry.coordinates);
                    break;
                case 'Polygon':
                    geometry.coordinates.forEach(function (polygon) {
                        handlePoint(polygon[0]);
                        handleLine(polygon);
                    });
                    break;
                case 'LineString':
                    handlePoint(geometry.coordinates[0]);
                    handleLine(geometry.coordinates);
                    break;
                case 'MultiLineString':
                    geometry.coordinates.forEach(function (line) {
                        handlePoint(line[0]);
                        handleLine(line);
                    });
                    break;
                case 'MultiPoint':
                    geometry.coordinates.forEach(function (point) {
                        handlePoint(point);
                    });
                    break;
                case 'MultiPolygon':
                    geometry.coordinates.forEach(function (multipolygon) {
                        multipolygon.forEach(function (polygon) {
                            handlePoint(polygon[0]);
                            handleLine(polygon);
                        });
                    });
                    break;
                case 'GeometryCollection':
                    geometry.geometries.forEach(function (subgeometry) {
                        handleGeometry(subgeometry);
                    });
                    break;
            }
        };
    }, []);
    var checkIfClustered = React.useMemo(function () {
        return function () {
            var updateIsClustered = determineIfClustered({
                clusters: clusters,
                result: lazyResult,
            });
            if (isClustered.current !== updateIsClustered) {
                isClustered.current = updateIsClustered;
                if (isClustered.current) {
                    hideGeometries();
                }
                else {
                    showGeometries();
                }
            }
        };
    }, [clusters, lazyResult.plain]);
    var color = React.useMemo(function () {
        return lazyResult.getColor();
    }, []);
    var icon = React.useMemo(function () {
        return iconHelper.getFullByMetacardObject(lazyResult.plain);
    }, [lazyResult.plain]);
    var updateDisplay = React.useMemo(function () {
        return _debounce(function (updateIsSelected) {
            geometries.current.forEach(function (geometry) {
                map.updateGeometry(geometry, {
                    color: color,
                    icon: icon,
                    isSelected: updateIsSelected,
                });
            });
        }, 100, {
            leading: false,
            trailing: true,
        });
    }, []);
    var updateGeometries = React.useMemo(function () {
        return function (propertiesModel) {
            if (propertiesModel &&
                _.find(Object.keys(propertiesModel.changedAttributes()), function (attribute) {
                    return (MetacardDefinitions.getAttributeMap()[attribute] &&
                        MetacardDefinitions.getAttributeMap()[attribute].type ===
                            'GEOMETRY') ||
                        attribute === 'id';
                }) === undefined) {
                return;
            }
            destroyGeometries();
            isClustered.current = false;
            var lazyResultGeometries = _.flatten(lazyResult.getGeometries());
            if (lazyResultGeometries.length > 0) {
                geometries.current = [];
                _.forEach(lazyResultGeometries, function (property) {
                    try {
                        handleGeometry(wkx.Geometry.parse(property).toGeoJSON());
                    }
                    catch (err) {
                        console.error(err);
                    }
                });
                checkIfClustered();
            }
        };
    }, [lazyResult.plain, MetacardDefinitions]);
    var destroyGeometries = React.useMemo(function () {
        return function () {
            geometries.current.forEach(function (geometry) {
                map.removeGeometry(geometry);
            });
        };
    }, []);
    var showGeometries = React.useMemo(function () {
        return function () {
            geometries.current.forEach(function (geometry) {
                map.showGeometry(geometry);
            });
        };
    }, []);
    var hideGeometries = React.useMemo(function () {
        return function () {
            geometries.current.forEach(function (geometry) {
                map.hideGeometry(geometry);
            });
        };
    }, []);
    return null;
};
export default hot(module)(Geometry);
//# sourceMappingURL=geometry.js.map