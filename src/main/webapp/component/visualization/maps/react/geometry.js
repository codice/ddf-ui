import * as React from 'react';
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
export default Geometry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9yZWFjdC9nZW9tZXRyeS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFJOUIsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sU0FBUyxNQUFNLGlCQUFpQixDQUFBO0FBQ3ZDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUNyQixPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzNDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFBO0FBQ3JGLE9BQU8sU0FBUyxNQUFNLDhCQUE4QixDQUFBO0FBQ3BELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFBO0FBUWhHLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxFQU03QjtRQUxDLFFBQVEsY0FBQSxFQUNSLE1BQU0sWUFBQTtJQUtOLE9BQU8sT0FBTyxDQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxPQUFPO1FBQ3BCLE9BQUEsT0FBTyxDQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNsQixVQUFDLGVBQWU7WUFDZCxPQUFBLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQXhELENBQXdELENBQzNELENBQ0Y7SUFMRCxDQUtDLENBQ0YsQ0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxRQUFRLEdBQUcsVUFBQyxFQUFvQztRQUFsQyxVQUFVLGdCQUFBLEVBQUUsR0FBRyxTQUFBLEVBQUUsUUFBUSxjQUFBO0lBQzNDLElBQU0sbUJBQW1CLEdBQUcsc0JB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QUE7WUFDcEIsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO0lBRTNDLElBQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN0QyxPQUFPO1lBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNsQyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzlCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNsQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzVCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNsQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzVCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRU4sT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDLENBQUE7QUFFRCxlQUFlLFFBQVEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgQ2x1c3RlclR5cGUgfSBmcm9tICcuL2dlb21ldHJpZXMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2gvZGVib3VuY2UnXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcbmltcG9ydCBpY29uSGVscGVyIGZyb20gJy4uLy4uLy4uLy4uL2pzL0ljb25IZWxwZXInXG5pbXBvcnQgeyB1c2VVcGRhdGVFZmZlY3QgfSBmcm9tICdyZWFjdC11c2UnXG5pbXBvcnQgeyB1c2VTZWxlY3Rpb25PZkxhenlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgZXh0ZW5zaW9uIGZyb20gJy4uLy4uLy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyB1c2VNZXRhY2FyZERlZmluaXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy5ob29rcydcblxudHlwZSBQcm9wcyA9IHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIG1hcDogYW55XG4gIGNsdXN0ZXJzOiBDbHVzdGVyVHlwZVtdXG59XG5cbmNvbnN0IGRldGVybWluZUlmQ2x1c3RlcmVkID0gKHtcbiAgY2x1c3RlcnMsXG4gIHJlc3VsdCxcbn06IHtcbiAgY2x1c3RlcnM6IENsdXN0ZXJUeXBlW11cbiAgcmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbn0pID0+IHtcbiAgcmV0dXJuIEJvb2xlYW4oXG4gICAgY2x1c3RlcnMuZmluZCgoY2x1c3RlcikgPT5cbiAgICAgIEJvb2xlYW4oXG4gICAgICAgIGNsdXN0ZXIucmVzdWx0cy5maW5kKFxuICAgICAgICAgIChjbHVzdGVyZWRSZXN1bHQpID0+XG4gICAgICAgICAgICBjbHVzdGVyZWRSZXN1bHRbJ21ldGFjYXJkLmlkJ10gPT09IHJlc3VsdFsnbWV0YWNhcmQuaWQnXVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICApXG59XG5cbmNvbnN0IEdlb21ldHJ5ID0gKHsgbGF6eVJlc3VsdCwgbWFwLCBjbHVzdGVycyB9OiBQcm9wcykgPT4ge1xuICBjb25zdCBNZXRhY2FyZERlZmluaXRpb25zID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IGlzQ2x1c3RlcmVkID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBnZW9tZXRyaWVzID0gUmVhY3QudXNlUmVmKFtdIGFzIGFueVtdKVxuICBjb25zdCBpc1NlbGVjdGVkID0gdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0KHsgbGF6eVJlc3VsdCB9KVxuXG4gIHVzZVVwZGF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgdXBkYXRlRGlzcGxheShpc1NlbGVjdGVkKVxuICB9LCBbaXNTZWxlY3RlZCwgbGF6eVJlc3VsdC5wbGFpbl0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjaGVja0lmQ2x1c3RlcmVkKClcbiAgfSwgW2NsdXN0ZXJzLCBsYXp5UmVzdWx0LnBsYWluXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB1cGRhdGVHZW9tZXRyaWVzKClcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyBjbGVhbnVwXG4gICAgICBkZXN0cm95R2VvbWV0cmllcygpXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdC5wbGFpbl0pXG5cbiAgY29uc3QgaGFuZGxlUG9pbnQgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBiYWRnZU9wdGlvbnMgPSBleHRlbnNpb24uY3VzdG9tTWFwQmFkZ2Uoe1xuICAgICAgcmVzdWx0czogW2xhenlSZXN1bHRdLFxuICAgICAgaXNDbHVzdGVyOiBmYWxzZSxcbiAgICB9KVxuICAgIHJldHVybiAocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgZ2VvbWV0cmllcy5jdXJyZW50LnB1c2goXG4gICAgICAgIG1hcC5hZGRQb2ludChwb2ludCwge1xuICAgICAgICAgIGlkOiBsYXp5UmVzdWx0WydtZXRhY2FyZC5pZCddLFxuICAgICAgICAgIHRpdGxlOiBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGUsXG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgaWNvbixcbiAgICAgICAgICBpc1NlbGVjdGVkLFxuICAgICAgICAgIGJhZGdlT3B0aW9ucyxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0sIFtsYXp5UmVzdWx0LnBsYWluXSlcblxuICBjb25zdCBoYW5kbGVMaW5lID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIChsaW5lOiBhbnkpID0+IHtcbiAgICAgIGdlb21ldHJpZXMuY3VycmVudC5wdXNoKFxuICAgICAgICBtYXAuYWRkTGluZShsaW5lLCB7XG4gICAgICAgICAgaWQ6IGxhenlSZXN1bHRbJ21ldGFjYXJkLmlkJ10sXG4gICAgICAgICAgdGl0bGU6IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZSxcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBpc1NlbGVjdGVkLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSwgW2xhenlSZXN1bHQucGxhaW5dKVxuXG4gIGNvbnN0IGhhbmRsZUdlb21ldHJ5ID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIChnZW9tZXRyeTogYW55KSA9PiB7XG4gICAgICBzd2l0Y2ggKGdlb21ldHJ5LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnUG9pbnQnOlxuICAgICAgICAgIGhhbmRsZVBvaW50KGdlb21ldHJ5LmNvb3JkaW5hdGVzKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgICAgICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goKHBvbHlnb246IGFueSkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlUG9pbnQocG9seWdvblswXSlcbiAgICAgICAgICAgIGhhbmRsZUxpbmUocG9seWdvbilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgICAgIGhhbmRsZVBvaW50KGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKVxuICAgICAgICAgIGhhbmRsZUxpbmUoZ2VvbWV0cnkuY29vcmRpbmF0ZXMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgICAgICAgICBnZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChsaW5lOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZVBvaW50KGxpbmVbMF0pXG4gICAgICAgICAgICBoYW5kbGVMaW5lKGxpbmUpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdNdWx0aVBvaW50JzpcbiAgICAgICAgICBnZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVQb2ludChwb2ludClcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ011bHRpUG9seWdvbic6XG4gICAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaCgobXVsdGlwb2x5Z29uOiBhbnkpID0+IHtcbiAgICAgICAgICAgIG11bHRpcG9seWdvbi5mb3JFYWNoKChwb2x5Z29uOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgaGFuZGxlUG9pbnQocG9seWdvblswXSlcbiAgICAgICAgICAgICAgaGFuZGxlTGluZShwb2x5Z29uKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgICAgICAgZ2VvbWV0cnkuZ2VvbWV0cmllcy5mb3JFYWNoKChzdWJnZW9tZXRyeTogYW55KSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVHZW9tZXRyeShzdWJnZW9tZXRyeSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBjaGVja0lmQ2x1c3RlcmVkID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZUlzQ2x1c3RlcmVkID0gZGV0ZXJtaW5lSWZDbHVzdGVyZWQoe1xuICAgICAgICBjbHVzdGVycyxcbiAgICAgICAgcmVzdWx0OiBsYXp5UmVzdWx0LFxuICAgICAgfSlcbiAgICAgIGlmIChpc0NsdXN0ZXJlZC5jdXJyZW50ICE9PSB1cGRhdGVJc0NsdXN0ZXJlZCkge1xuICAgICAgICBpc0NsdXN0ZXJlZC5jdXJyZW50ID0gdXBkYXRlSXNDbHVzdGVyZWRcbiAgICAgICAgaWYgKGlzQ2x1c3RlcmVkLmN1cnJlbnQpIHtcbiAgICAgICAgICBoaWRlR2VvbWV0cmllcygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hvd0dlb21ldHJpZXMoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbY2x1c3RlcnMsIGxhenlSZXN1bHQucGxhaW5dKVxuXG4gIGNvbnN0IGNvbG9yID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIGxhenlSZXN1bHQuZ2V0Q29sb3IoKVxuICB9LCBbXSlcblxuICBjb25zdCBpY29uID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIGljb25IZWxwZXIuZ2V0RnVsbEJ5TWV0YWNhcmRPYmplY3QobGF6eVJlc3VsdC5wbGFpbilcbiAgfSwgW2xhenlSZXN1bHQucGxhaW5dKVxuXG4gIGNvbnN0IHVwZGF0ZURpc3BsYXkgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gX2RlYm91bmNlKFxuICAgICAgKHVwZGF0ZUlzU2VsZWN0ZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgZ2VvbWV0cmllcy5jdXJyZW50LmZvckVhY2goKGdlb21ldHJ5KSA9PiB7XG4gICAgICAgICAgbWFwLnVwZGF0ZUdlb21ldHJ5KGdlb21ldHJ5LCB7XG4gICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgIGljb24sXG4gICAgICAgICAgICBpc1NlbGVjdGVkOiB1cGRhdGVJc1NlbGVjdGVkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgMTAwLFxuICAgICAge1xuICAgICAgICBsZWFkaW5nOiBmYWxzZSxcbiAgICAgICAgdHJhaWxpbmc6IHRydWUsXG4gICAgICB9XG4gICAgKVxuICB9LCBbXSkgYXMgKHVwZGF0ZUlzU2VsZWN0ZWQ6IGJvb2xlYW4pID0+IHZvaWRcbiAgY29uc3QgdXBkYXRlR2VvbWV0cmllcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAocHJvcGVydGllc01vZGVsPzogYW55KSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIHByb3BlcnRpZXNNb2RlbCAmJlxuICAgICAgICBfLmZpbmQoXG4gICAgICAgICAgT2JqZWN0LmtleXMocHJvcGVydGllc01vZGVsLmNoYW5nZWRBdHRyaWJ1dGVzKCkpLFxuICAgICAgICAgIChhdHRyaWJ1dGU6IGFueSkgPT5cbiAgICAgICAgICAgIChNZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2F0dHJpYnV0ZV0gJiZcbiAgICAgICAgICAgICAgTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVthdHRyaWJ1dGVdLnR5cGUgPT09XG4gICAgICAgICAgICAgICAgJ0dFT01FVFJZJykgfHxcbiAgICAgICAgICAgIGF0dHJpYnV0ZSA9PT0gJ2lkJ1xuICAgICAgICApID09PSB1bmRlZmluZWRcbiAgICAgICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGRlc3Ryb3lHZW9tZXRyaWVzKClcbiAgICAgIGlzQ2x1c3RlcmVkLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgY29uc3QgbGF6eVJlc3VsdEdlb21ldHJpZXMgPSBfLmZsYXR0ZW4obGF6eVJlc3VsdC5nZXRHZW9tZXRyaWVzKCkpXG4gICAgICBpZiAobGF6eVJlc3VsdEdlb21ldHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBnZW9tZXRyaWVzLmN1cnJlbnQgPSBbXVxuICAgICAgICBfLmZvckVhY2gobGF6eVJlc3VsdEdlb21ldHJpZXMsIChwcm9wZXJ0eTogYW55KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZUdlb21ldHJ5KHdreC5HZW9tZXRyeS5wYXJzZShwcm9wZXJ0eSkudG9HZW9KU09OKCkpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNoZWNrSWZDbHVzdGVyZWQoKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW2xhenlSZXN1bHQucGxhaW4sIE1ldGFjYXJkRGVmaW5pdGlvbnNdKVxuXG4gIGNvbnN0IGRlc3Ryb3lHZW9tZXRyaWVzID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGdlb21ldHJpZXMuY3VycmVudC5mb3JFYWNoKChnZW9tZXRyeSkgPT4ge1xuICAgICAgICBtYXAucmVtb3ZlR2VvbWV0cnkoZ2VvbWV0cnkpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IHNob3dHZW9tZXRyaWVzID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGdlb21ldHJpZXMuY3VycmVudC5mb3JFYWNoKChnZW9tZXRyeSkgPT4ge1xuICAgICAgICBtYXAuc2hvd0dlb21ldHJ5KGdlb21ldHJ5KVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFtdKVxuICBjb25zdCBoaWRlR2VvbWV0cmllcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBnZW9tZXRyaWVzLmN1cnJlbnQuZm9yRWFjaCgoZ2VvbWV0cnkpID0+IHtcbiAgICAgICAgbWFwLmhpZGVHZW9tZXRyeShnZW9tZXRyeSlcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbXSlcblxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZGVmYXVsdCBHZW9tZXRyeVxuIl19