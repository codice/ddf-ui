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
/* This is a collection of masking functions for the various coordinate inputs */
var decimalMask = ['.', /\d/, /\d/, /\d/, '"'];
export var latitudeDMSMask = function (rawValue) {
    var baseMask = [/\d/, /\d/, '°', /\d/, /\d/, "'", /\d/, /\d/];
    var pattern = new RegExp('^[0-9_]{2,3}[°*][0-9_]{2,3}[`\'’]([0-9_]{2,3}(?:[.][0-9]{0,3})?)"?');
    var match = rawValue.match(pattern);
    if (match) {
        var seconds = match[1];
        if (seconds.includes('.')) {
            return baseMask.concat(decimalMask);
        }
    }
    return baseMask.concat('"');
};
export var longitudeDMSMask = function (rawValue) {
    var baseMask = [/\d/, /\d/, /\d/, '°', /\d/, /\d/, "'", /\d/, /\d/];
    var pattern = new RegExp('^[0-9_]{3,4}[°*][0-9_]{2,3}[`\'’]([0-9_]{2,3}(?:[.][0-9]{0,3})?)"?');
    var match = rawValue.match(pattern);
    if (match) {
        var seconds = match[1];
        if (seconds.includes('.')) {
            return baseMask.concat(decimalMask);
        }
    }
    return baseMask.concat('"');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9nZW8tY29tcG9uZW50cy9tYXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osaUZBQWlGO0FBRWpGLElBQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBRWhELE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxVQUFVLFFBQWE7SUFDcEQsSUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFL0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQ3hCLG9FQUFvRSxDQUNyRSxDQUFBO0lBQ0QsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNyQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1YsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFCLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNyQyxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM3QixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxVQUFVLFFBQWE7SUFDckQsSUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBRXJFLElBQU0sT0FBTyxHQUFHLElBQUksTUFBTSxDQUN4QixvRUFBb0UsQ0FDckUsQ0FBQTtJQUNELElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDckMsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDckMsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDN0IsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vKiBUaGlzIGlzIGEgY29sbGVjdGlvbiBvZiBtYXNraW5nIGZ1bmN0aW9ucyBmb3IgdGhlIHZhcmlvdXMgY29vcmRpbmF0ZSBpbnB1dHMgKi9cblxuY29uc3QgZGVjaW1hbE1hc2sgPSBbJy4nLCAvXFxkLywgL1xcZC8sIC9cXGQvLCAnXCInXVxuXG5leHBvcnQgY29uc3QgbGF0aXR1ZGVETVNNYXNrID0gZnVuY3Rpb24gKHJhd1ZhbHVlOiBhbnkpIHtcbiAgY29uc3QgYmFzZU1hc2sgPSBbL1xcZC8sIC9cXGQvLCAnwrAnLCAvXFxkLywgL1xcZC8sIFwiJ1wiLCAvXFxkLywgL1xcZC9dXG5cbiAgY29uc3QgcGF0dGVybiA9IG5ldyBSZWdFeHAoXG4gICAgJ15bMC05X117MiwzfVvCsCpdWzAtOV9dezIsM31bYFxcJ+KAmV0oWzAtOV9dezIsM30oPzpbLl1bMC05XXswLDN9KT8pXCI/J1xuICApXG4gIGNvbnN0IG1hdGNoID0gcmF3VmFsdWUubWF0Y2gocGF0dGVybilcbiAgaWYgKG1hdGNoKSB7XG4gICAgY29uc3Qgc2Vjb25kcyA9IG1hdGNoWzFdXG4gICAgaWYgKHNlY29uZHMuaW5jbHVkZXMoJy4nKSkge1xuICAgICAgcmV0dXJuIGJhc2VNYXNrLmNvbmNhdChkZWNpbWFsTWFzaylcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJhc2VNYXNrLmNvbmNhdCgnXCInKVxufVxuXG5leHBvcnQgY29uc3QgbG9uZ2l0dWRlRE1TTWFzayA9IGZ1bmN0aW9uIChyYXdWYWx1ZTogYW55KSB7XG4gIGNvbnN0IGJhc2VNYXNrID0gWy9cXGQvLCAvXFxkLywgL1xcZC8sICfCsCcsIC9cXGQvLCAvXFxkLywgXCInXCIsIC9cXGQvLCAvXFxkL11cblxuICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cChcbiAgICAnXlswLTlfXXszLDR9W8KwKl1bMC05X117MiwzfVtgXFwn4oCZXShbMC05X117MiwzfSg/OlsuXVswLTldezAsM30pPylcIj8nXG4gIClcbiAgY29uc3QgbWF0Y2ggPSByYXdWYWx1ZS5tYXRjaChwYXR0ZXJuKVxuICBpZiAobWF0Y2gpIHtcbiAgICBjb25zdCBzZWNvbmRzID0gbWF0Y2hbMV1cbiAgICBpZiAoc2Vjb25kcy5pbmNsdWRlcygnLicpKSB7XG4gICAgICByZXR1cm4gYmFzZU1hc2suY29uY2F0KGRlY2ltYWxNYXNrKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZU1hc2suY29uY2F0KCdcIicpXG59XG4iXX0=