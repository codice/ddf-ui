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
import * as React from 'react';
import { createRoot } from 'react-dom/client';
export var attemptToStart = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        import('../component/app/base-app').then(function (BaseApp) {
            var root = createRoot(document.querySelector('#router'));
            root.render(React.createElement(BaseApp.default, null));
        });
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGljYXRpb25TdGFydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9BcHBsaWNhdGlvblN0YXJ0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUU3QyxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUc7O1FBQzVCLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE9BQU87WUFDL0MsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFRLENBQUMsQ0FBQTtZQUNqRSxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFDLE9BQU8sQ0FBQyxPQUFPLE9BQUcsQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBOzs7S0FDSCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tICdyZWFjdC1kb20vY2xpZW50J1xuXG5leHBvcnQgY29uc3QgYXR0ZW1wdFRvU3RhcnQgPSBhc3luYyAoKSA9PiB7XG4gIGltcG9ydCgnLi4vY29tcG9uZW50L2FwcC9iYXNlLWFwcCcpLnRoZW4oKEJhc2VBcHApID0+IHtcbiAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcm91dGVyJykgYXMgYW55KVxuICAgIHJvb3QucmVuZGVyKDxCYXNlQXBwLmRlZmF1bHQgLz4pXG4gIH0pXG59XG4iXX0=