/**
 * Examples pulled from the existing filter tree of filter json
 *
 * I noticed we don't keep the coordinate system stored anywhere in the location
 * json at the moment.  Need to add whatever keyword looks like.
 */
//@ts-ignore
var examples = [
    {
        type: 'AND',
        filters: [
            {
                type: 'ILIKE',
                property: 'anyText',
                value: '123213',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'LIKE',
                property: 'anyText',
                value: '123213',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '=',
                property: 'anyText',
                value: '123213',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '=',
                value: true,
                property: {
                    type: 'FILTER_FUNCTION',
                    filterFunctionName: 'proximity',
                    params: ['anyText', 22, '12'],
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'IS NULL',
                property: 'checksum',
                value: null,
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'BEFORE',
                property: 'datetime.end',
                value: '2020-07-01T07:00:00.000Z',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'AFTER',
                property: 'datetime.end',
                value: '2020-07-01T07:00:00.000Z',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '=',
                property: 'datetime.end',
                value: 'RELATIVE(PT11M)',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'DURING',
                property: 'datetime.end',
                value: '2020-07-01T07:00:00.000Z/2020-07-10T07:00:00.000Z',
                from: '2020-07-01T07:00:00.000Z',
                to: '2020-07-10T07:00:00.000Z',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'IS NULL',
                property: 'datetime.end',
                value: null,
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '>',
                property: 'location.altitude-meters',
                value: '1',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '<',
                property: 'location.altitude-meters',
                value: '1',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '=',
                property: 'location.altitude-meters',
                value: '1',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '>=',
                property: 'location.altitude-meters',
                value: '1',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: '<=',
                property: 'location.altitude-meters',
                value: '1',
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'BETWEEN',
                property: 'location.altitude-meters',
                value: {
                    lower: 1,
                    upper: 2,
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'INTERSECTS',
                property: 'location',
                value: 'LINESTRING(-99.3052 54.615629,-95.783965 45.236546,-112.445055 47.137541)',
                distance: 0,
                geojson: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-99.3052, 54.615629],
                            [-95.783965, 45.236546],
                            [-112.445055, 47.137541],
                        ],
                    },
                    properties: {
                        type: 'LineString',
                        buffer: {
                            width: '',
                            unit: 'meters',
                        },
                    },
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'DWITHIN',
                property: 'location',
                value: 'LINESTRING(-99.3052 54.615629,-95.783965 45.236546,-112.445055 47.137541)',
                distance: 1,
                geojson: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-99.3052, 54.615629],
                            [-95.783965, 45.236546],
                            [-112.445055, 47.137541],
                        ],
                    },
                    properties: {
                        type: 'LineString',
                        buffer: {
                            width: '1',
                            unit: 'meters',
                        },
                    },
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'DWITHIN',
                property: 'location',
                value: 'POLYGON((-107.626679 53.160318,-97.142175 40.783651,-112.152477 38.528437,-107.626679 53.160318))',
                distance: 3.6576000000000004,
                geojson: {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-107.626679, 53.160318],
                                [-97.142175, 40.783651],
                                [-112.152477, 38.528437],
                                [-107.626679, 53.160318],
                            ],
                        ],
                    },
                    properties: {
                        type: 'Polygon',
                        buffer: {
                            width: '12',
                            unit: 'feet',
                        },
                    },
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'DWITHIN',
                property: 'location',
                value: 'POINT(-101.741501 49.672811)',
                distance: 636765.857025,
                geojson: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-101.741501, 49.672811],
                    },
                    properties: {
                        type: 'Point',
                        buffer: {
                            width: 636765.857025,
                            unit: 'meters',
                        },
                    },
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'DWITHIN',
                property: 'location',
                value: 'POINT(-101.741501 49.672811)',
                distance: 636765.857025,
                geojson: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-101.741501, 49.672811],
                    },
                    properties: {
                        type: 'Point',
                        buffer: {
                            width: 636765.857025,
                            unit: 'meters',
                        },
                    },
                },
            },
        ],
    },
    {
        type: 'AND',
        filters: [
            {
                type: 'INTERSECTS',
                property: 'location',
                value: 'POLYGON((-106.606125 47.452416,-106.606125 51.974784,-92.669926 51.974784,-92.669926 47.452416,-106.606125 47.452416))',
                geojson: {
                    type: 'Feature',
                    bbox: [47.452416, 51.974784, -106.606125, -92.669926],
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-106.606125, 51.974784],
                                [-92.669926, 51.974784],
                                [-92.669926, 47.452416],
                                [-106.606125, 47.452416],
                                [-106.606125, 51.974784],
                            ],
                        ],
                    },
                    properties: {
                        type: 'BoundingBox',
                        north: 51.974784,
                        east: -92.669926,
                        south: 47.452416,
                        west: -106.606125,
                    },
                },
            },
        ],
    },
];
//# sourceMappingURL=examples.js.map