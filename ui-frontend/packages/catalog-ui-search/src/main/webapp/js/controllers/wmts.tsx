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
import WMTSCapabilities from 'ol/format/WMTSCapabilities'

function ensureValidLayer({
  layerIdentifier,
  result,
}: {
  layerIdentifier: string
  result: any
}) {
  const layer = result.Contents.Layer.find(
    (l: any) => l.Identifier === layerIdentifier
  )
  if (!layer) {
    const firstLayer = result.Contents.Layer[0]
    console.error(
      `WMTS map layer source has no layer ${layerIdentifier}. Using first layer ${firstLayer.Identifier}.`
    )
    return firstLayer.Identifier
  }
  return layer.Identifier
}

function ensureValidMatrixSet({
  matrixSetIdentifier,
  result,
}: {
  matrixSetIdentifier: string
  result: any
}) {
  const matrixSet = result.Contents.TileMatrixSet.find(
    (m: any) => m.Identifier === matrixSetIdentifier
  )
  if (!matrixSet) {
    const firstMatrixSet = result.Contents.TileMatrixSet[0]
    console.error(
      `WMTS map layer source has no matrix set ${matrixSetIdentifier}. Using first matrix set ${firstMatrixSet.Identifier}.`
    )
    return firstMatrixSet.Identifier
  }
  return matrixSet.Identifier
}

export async function getWMTSCapabilities(opts: any) {
  const { url, withCredentials, proxyEnabled } = opts
  const originalUrl = proxyEnabled
    ? new URL(url, window.location.origin + window.location.pathname)
    : new URL(url)
  const getCapabilitiesUrl = new URL(originalUrl)
  getCapabilitiesUrl.searchParams.set('request', 'GetCapabilities')
  const res = await window.fetch(getCapabilitiesUrl, {
    credentials: withCredentials ? 'include' : 'same-origin',
  })
  const text = await res.text()
  const parser = new WMTSCapabilities()
  const result = parser.read(text)
  if ((result as any).Contents.Layer.length === 0) {
    throw new Error('WMTS map layer source has no layers.')
  }
  let { layer, matrixSet } = opts
  /* If tileMatrixSetID is present (Cesium WMTS keyword) set matrixSet (OpenLayers WMTS keyword) */
  if (opts.tileMatrixSetID) {
    matrixSet = opts.tileMatrixSetID
  }
  layer = ensureValidLayer({ layerIdentifier: layer, result })
  matrixSet = ensureValidMatrixSet({ matrixSetIdentifier: matrixSet, result })
  return {
    layer,
    matrixSet,
    result,
    originalUrl,
  }
}
