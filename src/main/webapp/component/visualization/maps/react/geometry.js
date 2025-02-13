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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9yZWFjdC9nZW9tZXRyeS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBR3RDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUN2QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyxVQUFVLE1BQU0sMkJBQTJCLENBQUE7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUNyRixPQUFPLFNBQVMsTUFBTSw4QkFBOEIsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQTtBQVFoRyxJQUFNLG9CQUFvQixHQUFHLFVBQUMsRUFNN0I7UUFMQyxRQUFRLGNBQUEsRUFDUixNQUFNLFlBQUE7SUFLTixPQUFPLE9BQU8sQ0FDWixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsT0FBTztRQUNwQixPQUFBLE9BQU8sQ0FDTCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDbEIsVUFBQyxlQUFlO1lBQ2QsT0FBQSxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUF4RCxDQUF3RCxDQUMzRCxDQUNGO0lBTEQsQ0FLQyxDQUNGLENBQ0YsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELElBQU0sUUFBUSxHQUFHLFVBQUMsRUFBb0M7UUFBbEMsVUFBVSxnQkFBQSxFQUFFLEdBQUcsU0FB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QyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUE7SUFFM0MsSUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3RDLE9BQU87WUFDTCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQ2xDLEdBQUcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDOUIsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ25DLE9BQU87WUFDTCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQ2xDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDNUIsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ25DLE9BQU87WUFDTCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQ2xDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDNUIsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IENsdXN0ZXJUeXBlIH0gZnJvbSAnLi9nZW9tZXRyaWVzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBfZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJ1xuaW1wb3J0IHdreCBmcm9tICd3a3gnXG5pbXBvcnQgaWNvbkhlbHBlciBmcm9tICcuLi8uLi8uLi8uLi9qcy9JY29uSGVscGVyJ1xuaW1wb3J0IHsgdXNlVXBkYXRlRWZmZWN0IH0gZnJvbSAncmVhY3QtdXNlJ1xuaW1wb3J0IHsgdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IGV4dGVuc2lvbiBmcm9tICcuLi8uLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgdXNlTWV0YWNhcmREZWZpbml0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvbWV0YWNhcmQtZGVmaW5pdGlvbnMuaG9va3MnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICBtYXA6IGFueVxuICBjbHVzdGVyczogQ2x1c3RlclR5cGVbXVxufVxuXG5jb25zdCBkZXRlcm1pbmVJZkNsdXN0ZXJlZCA9ICh7XG4gIGNsdXN0ZXJzLFxuICByZXN1bHQsXG59OiB7XG4gIGNsdXN0ZXJzOiBDbHVzdGVyVHlwZVtdXG4gIHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG59KSA9PiB7XG4gIHJldHVybiBCb29sZWFuKFxuICAgIGNsdXN0ZXJzLmZpbmQoKGNsdXN0ZXIpID0+XG4gICAgICBCb29sZWFuKFxuICAgICAgICBjbHVzdGVyLnJlc3VsdHMuZmluZChcbiAgICAgICAgICAoY2x1c3RlcmVkUmVzdWx0KSA9PlxuICAgICAgICAgICAgY2x1c3RlcmVkUmVzdWx0WydtZXRhY2FyZC5pZCddID09PSByZXN1bHRbJ21ldGFjYXJkLmlkJ11cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgKVxufVxuXG5jb25zdCBHZW9tZXRyeSA9ICh7IGxhenlSZXN1bHQsIG1hcCwgY2x1c3RlcnMgfTogUHJvcHMpID0+IHtcbiAgY29uc3QgTWV0YWNhcmREZWZpbml0aW9ucyA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuICBjb25zdCBpc0NsdXN0ZXJlZCA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgZ2VvbWV0cmllcyA9IFJlYWN0LnVzZVJlZihbXSBhcyBhbnlbXSlcbiAgY29uc3QgaXNTZWxlY3RlZCA9IHVzZVNlbGVjdGlvbk9mTGF6eVJlc3VsdCh7IGxhenlSZXN1bHQgfSlcblxuICB1c2VVcGRhdGVFZmZlY3QoKCkgPT4ge1xuICAgIHVwZGF0ZURpc3BsYXkoaXNTZWxlY3RlZClcbiAgfSwgW2lzU2VsZWN0ZWQsIGxhenlSZXN1bHQucGxhaW5dKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY2hlY2tJZkNsdXN0ZXJlZCgpXG4gIH0sIFtjbHVzdGVycywgbGF6eVJlc3VsdC5wbGFpbl0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdXBkYXRlR2VvbWV0cmllcygpXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gY2xlYW51cFxuICAgICAgZGVzdHJveUdlb21ldHJpZXMoKVxuICAgIH1cbiAgfSwgW2xhenlSZXN1bHQucGxhaW5dKVxuXG4gIGNvbnN0IGhhbmRsZVBvaW50ID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3QgYmFkZ2VPcHRpb25zID0gZXh0ZW5zaW9uLmN1c3RvbU1hcEJhZGdlKHtcbiAgICAgIHJlc3VsdHM6IFtsYXp5UmVzdWx0XSxcbiAgICAgIGlzQ2x1c3RlcjogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gKHBvaW50OiBhbnkpID0+IHtcbiAgICAgIGdlb21ldHJpZXMuY3VycmVudC5wdXNoKFxuICAgICAgICBtYXAuYWRkUG9pbnQocG9pbnQsIHtcbiAgICAgICAgICBpZDogbGF6eVJlc3VsdFsnbWV0YWNhcmQuaWQnXSxcbiAgICAgICAgICB0aXRsZTogbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlLFxuICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgIGljb24sXG4gICAgICAgICAgaXNTZWxlY3RlZCxcbiAgICAgICAgICBiYWRnZU9wdGlvbnMsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9LCBbbGF6eVJlc3VsdC5wbGFpbl0pXG5cbiAgY29uc3QgaGFuZGxlTGluZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAobGluZTogYW55KSA9PiB7XG4gICAgICBnZW9tZXRyaWVzLmN1cnJlbnQucHVzaChcbiAgICAgICAgbWFwLmFkZExpbmUobGluZSwge1xuICAgICAgICAgIGlkOiBsYXp5UmVzdWx0WydtZXRhY2FyZC5pZCddLFxuICAgICAgICAgIHRpdGxlOiBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGUsXG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgaXNTZWxlY3RlZCxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0sIFtsYXp5UmVzdWx0LnBsYWluXSlcblxuICBjb25zdCBoYW5kbGVHZW9tZXRyeSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoZ2VvbWV0cnk6IGFueSkgPT4ge1xuICAgICAgc3dpdGNoIChnZW9tZXRyeS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgICAgICBoYW5kbGVQb2ludChnZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdQb2x5Z29uJzpcbiAgICAgICAgICBnZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChwb2x5Z29uOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZVBvaW50KHBvbHlnb25bMF0pXG4gICAgICAgICAgICBoYW5kbGVMaW5lKHBvbHlnb24pXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgICAgICBoYW5kbGVQb2ludChnZW9tZXRyeS5jb29yZGluYXRlc1swXSlcbiAgICAgICAgICBoYW5kbGVMaW5lKGdlb21ldHJ5LmNvb3JkaW5hdGVzKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6XG4gICAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaCgobGluZTogYW55KSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVQb2ludChsaW5lWzBdKVxuICAgICAgICAgICAgaGFuZGxlTGluZShsaW5lKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlUG9pbnQocG9pbnQpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goKG11bHRpcG9seWdvbjogYW55KSA9PiB7XG4gICAgICAgICAgICBtdWx0aXBvbHlnb24uZm9yRWFjaCgocG9seWdvbjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIGhhbmRsZVBvaW50KHBvbHlnb25bMF0pXG4gICAgICAgICAgICAgIGhhbmRsZUxpbmUocG9seWdvbilcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxuICAgICAgICAgIGdlb21ldHJ5Lmdlb21ldHJpZXMuZm9yRWFjaCgoc3ViZ2VvbWV0cnk6IGFueSkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlR2VvbWV0cnkoc3ViZ2VvbWV0cnkpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgY2hlY2tJZkNsdXN0ZXJlZCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVJc0NsdXN0ZXJlZCA9IGRldGVybWluZUlmQ2x1c3RlcmVkKHtcbiAgICAgICAgY2x1c3RlcnMsXG4gICAgICAgIHJlc3VsdDogbGF6eVJlc3VsdCxcbiAgICAgIH0pXG4gICAgICBpZiAoaXNDbHVzdGVyZWQuY3VycmVudCAhPT0gdXBkYXRlSXNDbHVzdGVyZWQpIHtcbiAgICAgICAgaXNDbHVzdGVyZWQuY3VycmVudCA9IHVwZGF0ZUlzQ2x1c3RlcmVkXG4gICAgICAgIGlmIChpc0NsdXN0ZXJlZC5jdXJyZW50KSB7XG4gICAgICAgICAgaGlkZUdlb21ldHJpZXMoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNob3dHZW9tZXRyaWVzKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW2NsdXN0ZXJzLCBsYXp5UmVzdWx0LnBsYWluXSlcblxuICBjb25zdCBjb2xvciA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBsYXp5UmVzdWx0LmdldENvbG9yKClcbiAgfSwgW10pXG5cbiAgY29uc3QgaWNvbiA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBpY29uSGVscGVyLmdldEZ1bGxCeU1ldGFjYXJkT2JqZWN0KGxhenlSZXN1bHQucGxhaW4pXG4gIH0sIFtsYXp5UmVzdWx0LnBsYWluXSlcblxuICBjb25zdCB1cGRhdGVEaXNwbGF5ID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIF9kZWJvdW5jZShcbiAgICAgICh1cGRhdGVJc1NlbGVjdGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGdlb21ldHJpZXMuY3VycmVudC5mb3JFYWNoKChnZW9tZXRyeSkgPT4ge1xuICAgICAgICAgIG1hcC51cGRhdGVHZW9tZXRyeShnZW9tZXRyeSwge1xuICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICBpY29uLFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogdXBkYXRlSXNTZWxlY3RlZCxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIDEwMCxcbiAgICAgIHtcbiAgICAgICAgbGVhZGluZzogZmFsc2UsXG4gICAgICAgIHRyYWlsaW5nOiB0cnVlLFxuICAgICAgfVxuICAgIClcbiAgfSwgW10pIGFzICh1cGRhdGVJc1NlbGVjdGVkOiBib29sZWFuKSA9PiB2b2lkXG4gIGNvbnN0IHVwZGF0ZUdlb21ldHJpZXMgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKHByb3BlcnRpZXNNb2RlbD86IGFueSkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBwcm9wZXJ0aWVzTW9kZWwgJiZcbiAgICAgICAgXy5maW5kKFxuICAgICAgICAgIE9iamVjdC5rZXlzKHByb3BlcnRpZXNNb2RlbC5jaGFuZ2VkQXR0cmlidXRlcygpKSxcbiAgICAgICAgICAoYXR0cmlidXRlOiBhbnkpID0+XG4gICAgICAgICAgICAoTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVthdHRyaWJ1dGVdICYmXG4gICAgICAgICAgICAgIE1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXS50eXBlID09PVxuICAgICAgICAgICAgICAgICdHRU9NRVRSWScpIHx8XG4gICAgICAgICAgICBhdHRyaWJ1dGUgPT09ICdpZCdcbiAgICAgICAgKSA9PT0gdW5kZWZpbmVkXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBkZXN0cm95R2VvbWV0cmllcygpXG4gICAgICBpc0NsdXN0ZXJlZC5jdXJyZW50ID0gZmFsc2VcbiAgICAgIGNvbnN0IGxhenlSZXN1bHRHZW9tZXRyaWVzID0gXy5mbGF0dGVuKGxhenlSZXN1bHQuZ2V0R2VvbWV0cmllcygpKVxuICAgICAgaWYgKGxhenlSZXN1bHRHZW9tZXRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZ2VvbWV0cmllcy5jdXJyZW50ID0gW11cbiAgICAgICAgXy5mb3JFYWNoKGxhenlSZXN1bHRHZW9tZXRyaWVzLCAocHJvcGVydHk6IGFueSkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVHZW9tZXRyeSh3a3guR2VvbWV0cnkucGFyc2UocHJvcGVydHkpLnRvR2VvSlNPTigpKVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjaGVja0lmQ2x1c3RlcmVkKClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtsYXp5UmVzdWx0LnBsYWluLCBNZXRhY2FyZERlZmluaXRpb25zXSlcblxuICBjb25zdCBkZXN0cm95R2VvbWV0cmllcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBnZW9tZXRyaWVzLmN1cnJlbnQuZm9yRWFjaCgoZ2VvbWV0cnkpID0+IHtcbiAgICAgICAgbWFwLnJlbW92ZUdlb21ldHJ5KGdlb21ldHJ5KVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFtdKVxuICBjb25zdCBzaG93R2VvbWV0cmllcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBnZW9tZXRyaWVzLmN1cnJlbnQuZm9yRWFjaCgoZ2VvbWV0cnkpID0+IHtcbiAgICAgICAgbWFwLnNob3dHZW9tZXRyeShnZW9tZXRyeSlcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbXSlcbiAgY29uc3QgaGlkZUdlb21ldHJpZXMgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZ2VvbWV0cmllcy5jdXJyZW50LmZvckVhY2goKGdlb21ldHJ5KSA9PiB7XG4gICAgICAgIG1hcC5oaWRlR2VvbWV0cnkoZ2VvbWV0cnkpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW10pXG5cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoR2VvbWV0cnkpXG4iXX0=