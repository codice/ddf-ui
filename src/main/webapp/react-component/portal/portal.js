import { __read } from "tslib";
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
import * as ReactDOM from 'react-dom';
var Portal = function (_a) {
    var children = _a.children;
    /*
      Why this wrapper?  Well, styled-components doesn't have a good
      abstraction for making a portal yet, so we keep the portal lightly styled
      in a wrapper where we feed styled-components.  Hence the overflow set
      to visible.  This allows us to accomplish pretty much exactly what
      we want.
    */
    var _b = __read(React.useState(document.createElement('react-portal')), 1), wrapper = _b[0];
    React.useEffect(function () {
        wrapper.style.position = 'absolute';
        wrapper.style.left = '0px';
        wrapper.style.top = '0px';
        wrapper.style.display = 'block';
        wrapper.style.overflow = 'visible';
        wrapper.style.zIndex = '103'; // use creation / append order from here on out
        document.body.appendChild(wrapper);
        return function () {
            wrapper.remove();
        };
    }, []);
    return ReactDOM.createPortal(children, wrapper);
};
export default Portal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9wb3J0YWwvcG9ydGFsLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxRQUFRLE1BQU0sV0FBVyxDQUFBO0FBRXJDLElBQU0sTUFBTSxHQUFHLFVBQUMsRUFJZjtRQUhDLFFBQVEsY0FBQTtJQUlSOzs7Ozs7TUFNRTtJQUNJLElBQUEsS0FBQSxPQUFZLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFBLEVBQWpFLE9BQU8sUUFBMEQsQ0FBQTtJQUV4RSxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtRQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUE7UUFDekIsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQTtRQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQywrQ0FBK0M7UUFDNUUsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbEMsT0FBTztZQUNMLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUNsQixDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixPQUFPLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ2pELENBQUMsQ0FBQTtBQUVELGVBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCAqIGFzIFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSdcblxuY29uc3QgUG9ydGFsID0gKHtcbiAgY2hpbGRyZW4sXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbn0pOiBSZWFjdC5SZWFjdFBvcnRhbCA9PiB7XG4gIC8qXG4gICAgV2h5IHRoaXMgd3JhcHBlcj8gIFdlbGwsIHN0eWxlZC1jb21wb25lbnRzIGRvZXNuJ3QgaGF2ZSBhIGdvb2QgXG4gICAgYWJzdHJhY3Rpb24gZm9yIG1ha2luZyBhIHBvcnRhbCB5ZXQsIHNvIHdlIGtlZXAgdGhlIHBvcnRhbCBsaWdodGx5IHN0eWxlZCBcbiAgICBpbiBhIHdyYXBwZXIgd2hlcmUgd2UgZmVlZCBzdHlsZWQtY29tcG9uZW50cy4gIEhlbmNlIHRoZSBvdmVyZmxvdyBzZXRcbiAgICB0byB2aXNpYmxlLiAgVGhpcyBhbGxvd3MgdXMgdG8gYWNjb21wbGlzaCBwcmV0dHkgbXVjaCBleGFjdGx5IHdoYXQgXG4gICAgd2Ugd2FudC5cbiAgKi9cbiAgY29uc3QgW3dyYXBwZXJdID0gUmVhY3QudXNlU3RhdGUoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncmVhY3QtcG9ydGFsJykpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB3cmFwcGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIHdyYXBwZXIuc3R5bGUubGVmdCA9ICcwcHgnXG4gICAgd3JhcHBlci5zdHlsZS50b3AgPSAnMHB4J1xuICAgIHdyYXBwZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICB3cmFwcGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gICAgd3JhcHBlci5zdHlsZS56SW5kZXggPSAnMTAzJyAvLyB1c2UgY3JlYXRpb24gLyBhcHBlbmQgb3JkZXIgZnJvbSBoZXJlIG9uIG91dFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQod3JhcHBlcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd3JhcHBlci5yZW1vdmUoKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbChjaGlsZHJlbiwgd3JhcHBlcilcbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9ydGFsXG4iXX0=