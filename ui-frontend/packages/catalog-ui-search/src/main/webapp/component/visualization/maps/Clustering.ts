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

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'dens... Remove this comment to see the full error message
import clustering from 'density-clustering'

const dbscan = new clustering.DBSCAN()

function removeInvalidCenters(results: any, centers: any) {
  for (let i = centers.length - 1; i >= 0; i--) {
    if (!centers[i]) {
      results.splice(i, 1)
      centers.splice(i, 1)
    }
  }
}

function convertIndicesToResults(results: any, cluster: any) {
  return cluster.map((index: any) => results[index])
}

export default {
  /*
      Takes in a list of geometries and a view height and returns a list of clusters
    */
  calculateClusters(results: any, map: any) {
    const centers = map.getWindowLocationsOfResults(results)
    removeInvalidCenters(results, centers)
    return dbscan
      .run(centers, 44, 2)
      .map((cluster: any) => convertIndicesToResults(results, cluster))
  },
}
