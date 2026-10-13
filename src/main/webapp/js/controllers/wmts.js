import { __awaiter, __generator } from "tslib";
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
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
function ensureValidLayer(_a) {
    var layerIdentifier = _a.layerIdentifier, result = _a.result;
    var layer = result.Contents.Layer.find(function (l) { return l.Identifier === layerIdentifier; });
    if (!layer) {
        var firstLayer = result.Contents.Layer[0];
        console.error("WMTS map layer source has no layer ".concat(layerIdentifier, ". Using first layer ").concat(firstLayer.Identifier, "."));
        return firstLayer.Identifier;
    }
    return layer.Identifier;
}
function ensureValidMatrixSet(_a) {
    var matrixSetIdentifier = _a.matrixSetIdentifier, result = _a.result;
    var matrixSet = result.Contents.TileMatrixSet.find(function (m) { return m.Identifier === matrixSetIdentifier; });
    if (!matrixSet) {
        var firstMatrixSet = result.Contents.TileMatrixSet[0];
        console.error("WMTS map layer source has no matrix set ".concat(matrixSetIdentifier, ". Using first matrix set ").concat(firstMatrixSet.Identifier, "."));
        return firstMatrixSet.Identifier;
    }
    return matrixSet.Identifier;
}
export function getWMTSCapabilities(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var url, withCredentials, proxyEnabled, originalUrl, getCapabilitiesUrl, res, text, parser, result, layer, matrixSet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = opts.url, withCredentials = opts.withCredentials, proxyEnabled = opts.proxyEnabled;
                    originalUrl = proxyEnabled
                        ? new URL(url, window.location.origin + window.location.pathname)
                        : new URL(url);
                    getCapabilitiesUrl = new URL(originalUrl);
                    getCapabilitiesUrl.searchParams.set('request', 'GetCapabilities');
                    return [4 /*yield*/, window.fetch(getCapabilitiesUrl, {
                            credentials: withCredentials ? 'include' : 'same-origin',
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.text()];
                case 2:
                    text = _a.sent();
                    parser = new WMTSCapabilities();
                    result = parser.read(text);
                    if (result.Contents.Layer.length === 0) {
                        throw new Error('WMTS map layer source has no layers.');
                    }
                    layer = opts.layer, matrixSet = opts.matrixSet;
                    /* If tileMatrixSetID is present (Cesium WMTS keyword) set matrixSet (OpenLayers WMTS keyword) */
                    if (opts.tileMatrixSetID) {
                        matrixSet = opts.tileMatrixSetID;
                    }
                    layer = ensureValidLayer({ layerIdentifier: layer, result: result });
                    matrixSet = ensureValidMatrixSet({ matrixSetIdentifier: matrixSet, result: result });
                    return [2 /*return*/, {
                            layer: layer,
                            matrixSet: matrixSet,
                            result: result,
                            originalUrl: originalUrl,
                        }];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid210cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9jb250cm9sbGVycy93bXRzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sZ0JBQWdCLE1BQU0sNEJBQTRCLENBQUE7QUFFekQsU0FBUyxnQkFBZ0IsQ0FBQyxFQU16QjtRQUxDLGVBQWUscUJBQUEsRUFDZixNQUFNLFlBQUE7SUFLTixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQ3RDLFVBQUMsQ0FBTSxJQUFLLE9BQUEsQ0FBQyxDQUFDLFVBQVUsS0FBSyxlQUFlLEVBQWhDLENBQWdDLENBQzdDLENBQUE7SUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQyxPQUFPLENBQUMsS0FBSyxDQUNYLDZDQUFzQyxlQUFlLGlDQUF1QixVQUFVLENBQUMsVUFBVSxNQUFHLENBQ3JHLENBQUE7UUFDRCxPQUFPLFVBQVUsQ0FBQyxVQUFVLENBQUE7SUFDOUIsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQTtBQUN6QixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxFQU03QjtRQUxDLG1CQUFtQix5QkFBQSxFQUNuQixNQUFNLFlBQUE7SUFLTixJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ2xELFVBQUMsQ0FBTSxJQUFLLE9BQUEsQ0FBQyxDQUFDLFVBQVUsS0FBSyxtQkFBbUIsRUFBcEMsQ0FBb0MsQ0FDakQsQ0FBQTtJQUNELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQ1gsa0RBQTJDLG1CQUFtQixzQ0FBNEIsY0FBYyxDQUFDLFVBQVUsTUFBRyxDQUN2SCxDQUFBO1FBQ0QsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFBO0lBQ2xDLENBQUM7SUFDRCxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUE7QUFDN0IsQ0FBQztBQUVELE1BQU0sVUFBZ0IsbUJBQW1CLENBQUMsSUFBUzs7Ozs7O29CQUN6QyxHQUFHLEdBQW9DLElBQUksSUFBeEMsRUFBRSxlQUFlLEdBQW1CLElBQUksZ0JBQXZCLEVBQUUsWUFBWSxHQUFLLElBQUksYUFBVCxDQUFTO29CQUM3QyxXQUFXLEdBQUcsWUFBWTt3QkFDOUIsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzt3QkFDakUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUNWLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO29CQUMvQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO29CQUNyRCxxQkFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFOzRCQUNqRCxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWE7eUJBQ3pELENBQUMsRUFBQTs7b0JBRkksR0FBRyxHQUFHLFNBRVY7b0JBQ1cscUJBQU0sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOztvQkFBdkIsSUFBSSxHQUFHLFNBQWdCO29CQUN2QixNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFBO29CQUMvQixNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtvQkFDaEMsSUFBSyxNQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQTtvQkFDekQsQ0FBQztvQkFDSyxLQUFLLEdBQWdCLElBQUksTUFBcEIsRUFBRSxTQUFTLEdBQUssSUFBSSxVQUFULENBQVM7b0JBQy9CLGlHQUFpRztvQkFDakcsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQ3pCLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFBO29CQUNsQyxDQUFDO29CQUNELEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsTUFBTSxRQUFBLEVBQUUsQ0FBQyxDQUFBO29CQUM1RCxTQUFTLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxRQUFBLEVBQUUsQ0FBQyxDQUFBO29CQUM1RSxzQkFBTzs0QkFDTCxLQUFLLE9BQUE7NEJBQ0wsU0FBUyxXQUFBOzRCQUNULE1BQU0sUUFBQTs0QkFDTixXQUFXLGFBQUE7eUJBQ1osRUFBQTs7OztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgV01UU0NhcGFiaWxpdGllcyBmcm9tICdvbC9mb3JtYXQvV01UU0NhcGFiaWxpdGllcydcblxuZnVuY3Rpb24gZW5zdXJlVmFsaWRMYXllcih7XG4gIGxheWVySWRlbnRpZmllcixcbiAgcmVzdWx0LFxufToge1xuICBsYXllcklkZW50aWZpZXI6IHN0cmluZ1xuICByZXN1bHQ6IGFueVxufSkge1xuICBjb25zdCBsYXllciA9IHJlc3VsdC5Db250ZW50cy5MYXllci5maW5kKFxuICAgIChsOiBhbnkpID0+IGwuSWRlbnRpZmllciA9PT0gbGF5ZXJJZGVudGlmaWVyXG4gIClcbiAgaWYgKCFsYXllcikge1xuICAgIGNvbnN0IGZpcnN0TGF5ZXIgPSByZXN1bHQuQ29udGVudHMuTGF5ZXJbMF1cbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgYFdNVFMgbWFwIGxheWVyIHNvdXJjZSBoYXMgbm8gbGF5ZXIgJHtsYXllcklkZW50aWZpZXJ9LiBVc2luZyBmaXJzdCBsYXllciAke2ZpcnN0TGF5ZXIuSWRlbnRpZmllcn0uYFxuICAgIClcbiAgICByZXR1cm4gZmlyc3RMYXllci5JZGVudGlmaWVyXG4gIH1cbiAgcmV0dXJuIGxheWVyLklkZW50aWZpZXJcbn1cblxuZnVuY3Rpb24gZW5zdXJlVmFsaWRNYXRyaXhTZXQoe1xuICBtYXRyaXhTZXRJZGVudGlmaWVyLFxuICByZXN1bHQsXG59OiB7XG4gIG1hdHJpeFNldElkZW50aWZpZXI6IHN0cmluZ1xuICByZXN1bHQ6IGFueVxufSkge1xuICBjb25zdCBtYXRyaXhTZXQgPSByZXN1bHQuQ29udGVudHMuVGlsZU1hdHJpeFNldC5maW5kKFxuICAgIChtOiBhbnkpID0+IG0uSWRlbnRpZmllciA9PT0gbWF0cml4U2V0SWRlbnRpZmllclxuICApXG4gIGlmICghbWF0cml4U2V0KSB7XG4gICAgY29uc3QgZmlyc3RNYXRyaXhTZXQgPSByZXN1bHQuQ29udGVudHMuVGlsZU1hdHJpeFNldFswXVxuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBgV01UUyBtYXAgbGF5ZXIgc291cmNlIGhhcyBubyBtYXRyaXggc2V0ICR7bWF0cml4U2V0SWRlbnRpZmllcn0uIFVzaW5nIGZpcnN0IG1hdHJpeCBzZXQgJHtmaXJzdE1hdHJpeFNldC5JZGVudGlmaWVyfS5gXG4gICAgKVxuICAgIHJldHVybiBmaXJzdE1hdHJpeFNldC5JZGVudGlmaWVyXG4gIH1cbiAgcmV0dXJuIG1hdHJpeFNldC5JZGVudGlmaWVyXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRXTVRTQ2FwYWJpbGl0aWVzKG9wdHM6IGFueSkge1xuICBjb25zdCB7IHVybCwgd2l0aENyZWRlbnRpYWxzLCBwcm94eUVuYWJsZWQgfSA9IG9wdHNcbiAgY29uc3Qgb3JpZ2luYWxVcmwgPSBwcm94eUVuYWJsZWRcbiAgICA/IG5ldyBVUkwodXJsLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKVxuICAgIDogbmV3IFVSTCh1cmwpXG4gIGNvbnN0IGdldENhcGFiaWxpdGllc1VybCA9IG5ldyBVUkwob3JpZ2luYWxVcmwpXG4gIGdldENhcGFiaWxpdGllc1VybC5zZWFyY2hQYXJhbXMuc2V0KCdyZXF1ZXN0JywgJ0dldENhcGFiaWxpdGllcycpXG4gIGNvbnN0IHJlcyA9IGF3YWl0IHdpbmRvdy5mZXRjaChnZXRDYXBhYmlsaXRpZXNVcmwsIHtcbiAgICBjcmVkZW50aWFsczogd2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogJ3NhbWUtb3JpZ2luJyxcbiAgfSlcbiAgY29uc3QgdGV4dCA9IGF3YWl0IHJlcy50ZXh0KClcbiAgY29uc3QgcGFyc2VyID0gbmV3IFdNVFNDYXBhYmlsaXRpZXMoKVxuICBjb25zdCByZXN1bHQgPSBwYXJzZXIucmVhZCh0ZXh0KVxuICBpZiAoKHJlc3VsdCBhcyBhbnkpLkNvbnRlbnRzLkxheWVyLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignV01UUyBtYXAgbGF5ZXIgc291cmNlIGhhcyBubyBsYXllcnMuJylcbiAgfVxuICBsZXQgeyBsYXllciwgbWF0cml4U2V0IH0gPSBvcHRzXG4gIC8qIElmIHRpbGVNYXRyaXhTZXRJRCBpcyBwcmVzZW50IChDZXNpdW0gV01UUyBrZXl3b3JkKSBzZXQgbWF0cml4U2V0IChPcGVuTGF5ZXJzIFdNVFMga2V5d29yZCkgKi9cbiAgaWYgKG9wdHMudGlsZU1hdHJpeFNldElEKSB7XG4gICAgbWF0cml4U2V0ID0gb3B0cy50aWxlTWF0cml4U2V0SURcbiAgfVxuICBsYXllciA9IGVuc3VyZVZhbGlkTGF5ZXIoeyBsYXllcklkZW50aWZpZXI6IGxheWVyLCByZXN1bHQgfSlcbiAgbWF0cml4U2V0ID0gZW5zdXJlVmFsaWRNYXRyaXhTZXQoeyBtYXRyaXhTZXRJZGVudGlmaWVyOiBtYXRyaXhTZXQsIHJlc3VsdCB9KVxuICByZXR1cm4ge1xuICAgIGxheWVyLFxuICAgIG1hdHJpeFNldCxcbiAgICByZXN1bHQsXG4gICAgb3JpZ2luYWxVcmwsXG4gIH1cbn1cbiJdfQ==