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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL2V4YW1wbGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNILFlBQVk7QUFDWixJQUFNLFFBQVEsR0FBRztJQUNmO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxJQUFJLEVBQUUsT0FBTztnQkFDYixRQUFRLEVBQUUsU0FBUztnQkFDbkIsS0FBSyxFQUFFLFFBQVE7YUFDaEI7U0FDRjtLQUNGO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRTtZQUNQO2dCQUNFLElBQUksRUFBRSxNQUFNO2dCQUNaLFFBQVEsRUFBRSxTQUFTO2dCQUNuQixLQUFLLEVBQUUsUUFBUTthQUNoQjtTQUNGO0tBQ0Y7SUFDRDtRQUNFLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLEtBQUssRUFBRSxRQUFRO2FBQ2hCO1NBQ0Y7S0FDRjtJQUNEO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxJQUFJLEVBQUUsR0FBRztnQkFDVCxLQUFLLEVBQUUsSUFBSTtnQkFDWCxRQUFRLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLGlCQUFpQjtvQkFDdkIsa0JBQWtCLEVBQUUsV0FBVztvQkFDL0IsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7aUJBQzlCO2FBQ0Y7U0FDRjtLQUNGO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRTtZQUNQO2dCQUNFLElBQUksRUFBRSxTQUFTO2dCQUNmLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixLQUFL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QUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO3FCQUN0QztvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFLE9BQU87d0JBQ2IsTUFBTSxFQUFFOzRCQUNOLEtBQUssRUFBRSxhQUFhOzRCQUNwQixJQUFJLEVBQUUsUUFBUTt5QkFDZjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtJQUNEO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLEtBQUssRUFDSCx3SEFBd0g7Z0JBQzFILE9BQU8sRUFBRTtvQkFDUCxJQUFJLEVBQUUsU0FBUztvQkFDZixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUNyRCxRQUFRLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsV0FBVyxFQUFFOzRCQUNYO2dDQUNFLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO2dDQUN4QixDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQztnQ0FDdkIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7Z0NBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO2dDQUN4QixDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQzs2QkFDekI7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRSxhQUFhO3dCQUNuQixLQUFLLEVBQUUsU0FBUzt3QkFDaEIsSUFBSSxFQUFFLENBQUMsU0FBUzt3QkFDaEIsS0FBSyxFQUFFLFNBQVM7d0JBQ2hCLElBQUksRUFBRSxDQUFDLFVBQVU7cUJBQ2xCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXhhbXBsZXMgcHVsbGVkIGZyb20gdGhlIGV4aXN0aW5nIGZpbHRlciB0cmVlIG9mIGZpbHRlciBqc29uXG4gKlxuICogSSBub3RpY2VkIHdlIGRvbid0IGtlZXAgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIHN0b3JlZCBhbnl3aGVyZSBpbiB0aGUgbG9jYXRpb25cbiAqIGpzb24gYXQgdGhlIG1vbWVudC4gIE5lZWQgdG8gYWRkIHdoYXRldmVyIGtleXdvcmQgbG9va3MgbGlrZS5cbiAqL1xuLy9AdHMtaWdub3JlXG5jb25zdCBleGFtcGxlcyA9IFtcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgdmFsdWU6ICcxMjMyMTMnLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnTElLRScsXG4gICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgIHZhbHVlOiAnMTIzMjEzJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJz0nLFxuICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICB2YWx1ZTogJzEyMzIxMycsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgIHByb3BlcnR5OiB7XG4gICAgICAgICAgdHlwZTogJ0ZJTFRFUl9GVU5DVElPTicsXG4gICAgICAgICAgZmlsdGVyRnVuY3Rpb25OYW1lOiAncHJveGltaXR5JyxcbiAgICAgICAgICBwYXJhbXM6IFsnYW55VGV4dCcsIDIyLCAnMTInXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ0lTIE5VTEwnLFxuICAgICAgICBwcm9wZXJ0eTogJ2NoZWNrc3VtJyxcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICBwcm9wZXJ0eTogJ2RhdGV0aW1lLmVuZCcsXG4gICAgICAgIHZhbHVlOiAnMjAyMC0wNy0wMVQwNzowMDowMC4wMDBaJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ0FGVEVSJyxcbiAgICAgICAgcHJvcGVydHk6ICdkYXRldGltZS5lbmQnLFxuICAgICAgICB2YWx1ZTogJzIwMjAtMDctMDFUMDc6MDA6MDAuMDAwWicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgcHJvcGVydHk6ICdkYXRldGltZS5lbmQnLFxuICAgICAgICB2YWx1ZTogJ1JFTEFUSVZFKFBUMTFNKScsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdEVVJJTkcnLFxuICAgICAgICBwcm9wZXJ0eTogJ2RhdGV0aW1lLmVuZCcsXG4gICAgICAgIHZhbHVlOiAnMjAyMC0wNy0wMVQwNzowMDowMC4wMDBaLzIwMjAtMDctMTBUMDc6MDA6MDAuMDAwWicsXG4gICAgICAgIGZyb206ICcyMDIwLTA3LTAxVDA3OjAwOjAwLjAwMFonLFxuICAgICAgICB0bzogJzIwMjAtMDctMTBUMDc6MDA6MDAuMDAwWicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdJUyBOVUxMJyxcbiAgICAgICAgcHJvcGVydHk6ICdkYXRldGltZS5lbmQnLFxuICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJz4nLFxuICAgICAgICBwcm9wZXJ0eTogJ2xvY2F0aW9uLmFsdGl0dWRlLW1ldGVycycsXG4gICAgICAgIHZhbHVlOiAnMScsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICc8JyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbi5hbHRpdHVkZS1tZXRlcnMnLFxuICAgICAgICB2YWx1ZTogJzEnLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgIHByb3BlcnR5OiAnbG9jYXRpb24uYWx0aXR1ZGUtbWV0ZXJzJyxcbiAgICAgICAgdmFsdWU6ICcxJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJz49JyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbi5hbHRpdHVkZS1tZXRlcnMnLFxuICAgICAgICB2YWx1ZTogJzEnLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnPD0nLFxuICAgICAgICBwcm9wZXJ0eTogJ2xvY2F0aW9uLmFsdGl0dWRlLW1ldGVycycsXG4gICAgICAgIHZhbHVlOiAnMScsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdCRVRXRUVOJyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbi5hbHRpdHVkZS1tZXRlcnMnLFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIGxvd2VyOiAxLFxuICAgICAgICAgIHVwcGVyOiAyLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnSU5URVJTRUNUUycsXG4gICAgICAgIHByb3BlcnR5OiAnbG9jYXRpb24nLFxuICAgICAgICB2YWx1ZTpcbiAgICAgICAgICAnTElORVNUUklORygtOTkuMzA1MiA1NC42MTU2MjksLTk1Ljc4Mzk2NSA0NS4yMzY1NDYsLTExMi40NDUwNTUgNDcuMTM3NTQxKScsXG4gICAgICAgIGRpc3RhbmNlOiAwLFxuICAgICAgICBnZW9qc29uOiB7XG4gICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBjb29yZGluYXRlczogW1xuICAgICAgICAgICAgICBbLTk5LjMwNTIsIDU0LjYxNTYyOV0sXG4gICAgICAgICAgICAgIFstOTUuNzgzOTY1LCA0NS4yMzY1NDZdLFxuICAgICAgICAgICAgICBbLTExMi40NDUwNTUsIDQ3LjEzNzU0MV0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxuICAgICAgICAgICAgYnVmZmVyOiB7XG4gICAgICAgICAgICAgIHdpZHRoOiAnJyxcbiAgICAgICAgICAgICAgdW5pdDogJ21ldGVycycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdEV0lUSElOJyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbicsXG4gICAgICAgIHZhbHVlOlxuICAgICAgICAgICdMSU5FU1RSSU5HKC05OS4zMDUyIDU0LjYxNTYyOSwtOTUuNzgzOTY1IDQ1LjIzNjU0NiwtMTEyLjQ0NTA1NSA0Ny4xMzc1NDEpJyxcbiAgICAgICAgZGlzdGFuY2U6IDEsXG4gICAgICAgIGdlb2pzb246IHtcbiAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgIFstOTkuMzA1MiwgNTQuNjE1NjI5XSxcbiAgICAgICAgICAgICAgWy05NS43ODM5NjUsIDQ1LjIzNjU0Nl0sXG4gICAgICAgICAgICAgIFstMTEyLjQ0NTA1NSwgNDcuMTM3NTQxXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBidWZmZXI6IHtcbiAgICAgICAgICAgICAgd2lkdGg6ICcxJyxcbiAgICAgICAgICAgICAgdW5pdDogJ21ldGVycycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdEV0lUSElOJyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbicsXG4gICAgICAgIHZhbHVlOlxuICAgICAgICAgICdQT0xZR09OKCgtMTA3LjYyNjY3OSA1My4xNjAzMTgsLTk3LjE0MjE3NSA0MC43ODM2NTEsLTExMi4xNTI0NzcgMzguNTI4NDM3LC0xMDcuNjI2Njc5IDUzLjE2MDMxOCkpJyxcbiAgICAgICAgZGlzdGFuY2U6IDMuNjU3NjAwMDAwMDAwMDAwNCxcbiAgICAgICAgZ2VvanNvbjoge1xuICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFstMTA3LjYyNjY3OSwgNTMuMTYwMzE4XSxcbiAgICAgICAgICAgICAgICBbLTk3LjE0MjE3NSwgNDAuNzgzNjUxXSxcbiAgICAgICAgICAgICAgICBbLTExMi4xNTI0NzcsIDM4LjUyODQzN10sXG4gICAgICAgICAgICAgICAgWy0xMDcuNjI2Njc5LCA1My4xNjAzMThdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgICAgIGJ1ZmZlcjoge1xuICAgICAgICAgICAgICB3aWR0aDogJzEyJyxcbiAgICAgICAgICAgICAgdW5pdDogJ2ZlZXQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnRFdJVEhJTicsXG4gICAgICAgIHByb3BlcnR5OiAnbG9jYXRpb24nLFxuICAgICAgICB2YWx1ZTogJ1BPSU5UKC0xMDEuNzQxNTAxIDQ5LjY3MjgxMSknLFxuICAgICAgICBkaXN0YW5jZTogNjM2NzY1Ljg1NzAyNSxcbiAgICAgICAgZ2VvanNvbjoge1xuICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbLTEwMS43NDE1MDEsIDQ5LjY3MjgxMV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgICAgYnVmZmVyOiB7XG4gICAgICAgICAgICAgIHdpZHRoOiA2MzY3NjUuODU3MDI1LFxuICAgICAgICAgICAgICB1bml0OiAnbWV0ZXJzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ0RXSVRISU4nLFxuICAgICAgICBwcm9wZXJ0eTogJ2xvY2F0aW9uJyxcbiAgICAgICAgdmFsdWU6ICdQT0lOVCgtMTAxLjc0MTUwMSA0OS42NzI4MTEpJyxcbiAgICAgICAgZGlzdGFuY2U6IDYzNjc2NS44NTcwMjUsXG4gICAgICAgIGdlb2pzb246IHtcbiAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICBjb29yZGluYXRlczogWy0xMDEuNzQxNTAxLCA0OS42NzI4MTFdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgICAgIGJ1ZmZlcjoge1xuICAgICAgICAgICAgICB3aWR0aDogNjM2NzY1Ljg1NzAyNSxcbiAgICAgICAgICAgICAgdW5pdDogJ21ldGVycycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdJTlRFUlNFQ1RTJyxcbiAgICAgICAgcHJvcGVydHk6ICdsb2NhdGlvbicsXG4gICAgICAgIHZhbHVlOlxuICAgICAgICAgICdQT0xZR09OKCgtMTA2LjYwNjEyNSA0Ny40NTI0MTYsLTEwNi42MDYxMjUgNTEuOTc0Nzg0LC05Mi42Njk5MjYgNTEuOTc0Nzg0LC05Mi42Njk5MjYgNDcuNDUyNDE2LC0xMDYuNjA2MTI1IDQ3LjQ1MjQxNikpJyxcbiAgICAgICAgZ2VvanNvbjoge1xuICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICBiYm94OiBbNDcuNDUyNDE2LCA1MS45NzQ3ODQsIC0xMDYuNjA2MTI1LCAtOTIuNjY5OTI2XSxcbiAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFstMTA2LjYwNjEyNSwgNTEuOTc0Nzg0XSxcbiAgICAgICAgICAgICAgICBbLTkyLjY2OTkyNiwgNTEuOTc0Nzg0XSxcbiAgICAgICAgICAgICAgICBbLTkyLjY2OTkyNiwgNDcuNDUyNDE2XSxcbiAgICAgICAgICAgICAgICBbLTEwNi42MDYxMjUsIDQ3LjQ1MjQxNl0sXG4gICAgICAgICAgICAgICAgWy0xMDYuNjA2MTI1LCA1MS45NzQ3ODRdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdCb3VuZGluZ0JveCcsXG4gICAgICAgICAgICBub3J0aDogNTEuOTc0Nzg0LFxuICAgICAgICAgICAgZWFzdDogLTkyLjY2OTkyNixcbiAgICAgICAgICAgIHNvdXRoOiA0Ny40NTI0MTYsXG4gICAgICAgICAgICB3ZXN0OiAtMTA2LjYwNjEyNSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXVxuIl19