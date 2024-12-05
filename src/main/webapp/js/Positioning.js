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
var zeroScale = 'matrix(0, 0, 0, 0, 0, 0)';
var zeroOpacity = '0';
var notDisplayed = 'none';
export default {
    // @ts-expect-error ts-migrate(7023) FIXME: 'isEffectivelyHidden' implicitly has return type '... Remove this comment to see the full error message
    isEffectivelyHidden: function (element) {
        if (element === document) {
            return false;
        }
        else if (element === null) {
            return true;
        }
        else {
            var computedStyle = window.getComputedStyle(element);
            if (computedStyle.transform === zeroScale ||
                computedStyle.opacity === zeroOpacity ||
                computedStyle.display === notDisplayed) {
                return true;
            }
            else {
                return this.isEffectivelyHidden(element.parentNode);
            }
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zaXRpb25pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvUG9zaXRpb25pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLElBQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFBO0FBQzVDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQTtBQUN2QixJQUFNLFlBQVksR0FBRyxNQUFNLENBQUE7QUFFM0IsZUFBZTtJQUNiLG1KQUFtSjtJQUNuSixtQkFBbUIsWUFBQyxPQUFZO1FBQzlCLElBQUksT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUN4QixPQUFPLEtBQUssQ0FBQTtTQUNiO2FBQU0sSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQzNCLE9BQU8sSUFBSSxDQUFBO1NBQ1o7YUFBTTtZQUNMLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUN0RCxJQUNFLGFBQWEsQ0FBQyxTQUFTLEtBQUssU0FBUztnQkFDckMsYUFBYSxDQUFDLE9BQU8sS0FBSyxXQUFXO2dCQUNyQyxhQUFhLENBQUMsT0FBTyxLQUFLLFlBQVksRUFDdEM7Z0JBQ0EsT0FBTyxJQUFJLENBQUE7YUFDWjtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7YUFDcEQ7U0FDRjtJQUNILENBQUM7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmNvbnN0IHplcm9TY2FsZSA9ICdtYXRyaXgoMCwgMCwgMCwgMCwgMCwgMCknXG5jb25zdCB6ZXJvT3BhY2l0eSA9ICcwJ1xuY29uc3Qgbm90RGlzcGxheWVkID0gJ25vbmUnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMjMpIEZJWE1FOiAnaXNFZmZlY3RpdmVseUhpZGRlbicgaW1wbGljaXRseSBoYXMgcmV0dXJuIHR5cGUgJy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGlzRWZmZWN0aXZlbHlIaWRkZW4oZWxlbWVudDogYW55KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KVxuICAgICAgaWYgKFxuICAgICAgICBjb21wdXRlZFN0eWxlLnRyYW5zZm9ybSA9PT0gemVyb1NjYWxlIHx8XG4gICAgICAgIGNvbXB1dGVkU3R5bGUub3BhY2l0eSA9PT0gemVyb09wYWNpdHkgfHxcbiAgICAgICAgY29tcHV0ZWRTdHlsZS5kaXNwbGF5ID09PSBub3REaXNwbGF5ZWRcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNFZmZlY3RpdmVseUhpZGRlbihlbGVtZW50LnBhcmVudE5vZGUpXG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuIl19