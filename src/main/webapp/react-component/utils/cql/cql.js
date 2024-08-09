/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
export var getResultSetCql = function (ids) {
    var queries = ids.map(function (id) { return "((\"id\" = '".concat(id, "'))"); });
    return "(".concat(queries.join(' OR '), ")");
};
export var limitCqlToDeleted = function (cql) {
    var deletedCql = "((\"metacard-tags\" ILIKE 'deleted') AND (\"metacard.deleted.tags\" ILIKE 'resource'))";
    return "(".concat(cql, " AND ").concat(deletedCql, ")");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91dGlscy9jcWwvY3FsLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLFVBQUMsR0FBYTtJQUMzQyxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsc0JBQWEsRUFBRSxRQUFLLEVBQXBCLENBQW9CLENBQUMsQ0FBQTtJQUNyRCxPQUFPLFdBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBRyxDQUFBO0FBQ3BDLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFHLFVBQUMsR0FBVztJQUMzQyxJQUFNLFVBQVUsR0FBRyx3RkFBb0YsQ0FBQTtJQUN2RyxPQUFPLFdBQUksR0FBRyxrQkFBUSxVQUFVLE1BQUcsQ0FBQTtBQUNyQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmV4cG9ydCBjb25zdCBnZXRSZXN1bHRTZXRDcWwgPSAoaWRzOiBzdHJpbmdbXSkgPT4ge1xuICBjb25zdCBxdWVyaWVzID0gaWRzLm1hcCgoaWQpID0+IGAoKFwiaWRcIiA9ICcke2lkfScpKWApXG4gIHJldHVybiBgKCR7cXVlcmllcy5qb2luKCcgT1IgJyl9KWBcbn1cblxuZXhwb3J0IGNvbnN0IGxpbWl0Q3FsVG9EZWxldGVkID0gKGNxbDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGRlbGV0ZWRDcWwgPSBgKChcIm1ldGFjYXJkLXRhZ3NcIiBJTElLRSAnZGVsZXRlZCcpIEFORCAoXCJtZXRhY2FyZC5kZWxldGVkLnRhZ3NcIiBJTElLRSAncmVzb3VyY2UnKSlgXG4gIHJldHVybiBgKCR7Y3FsfSBBTkQgJHtkZWxldGVkQ3FsfSlgXG59XG4iXX0=