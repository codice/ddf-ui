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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9nZW8tY29tcG9uZW50cy9tYXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osaUZBQWlGO0FBRWpGLElBQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBRWhELE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxVQUFVLFFBQWE7SUFDcEQsSUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFL0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQ3hCLG9FQUFvRSxDQUNyRSxDQUFBO0lBQ0QsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNyQyxJQUFJLEtBQUssRUFBRTtRQUNULElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekIsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1NBQ3BDO0tBQ0Y7SUFDRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDN0IsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBVSxRQUFhO0lBQ3JELElBQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVyRSxJQUFNLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FDeEIsb0VBQW9FLENBQ3JFLENBQUE7SUFDRCxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3JDLElBQUksS0FBSyxFQUFFO1FBQ1QsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7U0FDcEM7S0FDRjtJQUNELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM3QixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIFRoaXMgaXMgYSBjb2xsZWN0aW9uIG9mIG1hc2tpbmcgZnVuY3Rpb25zIGZvciB0aGUgdmFyaW91cyBjb29yZGluYXRlIGlucHV0cyAqL1xuXG5jb25zdCBkZWNpbWFsTWFzayA9IFsnLicsIC9cXGQvLCAvXFxkLywgL1xcZC8sICdcIiddXG5cbmV4cG9ydCBjb25zdCBsYXRpdHVkZURNU01hc2sgPSBmdW5jdGlvbiAocmF3VmFsdWU6IGFueSkge1xuICBjb25zdCBiYXNlTWFzayA9IFsvXFxkLywgL1xcZC8sICfCsCcsIC9cXGQvLCAvXFxkLywgXCInXCIsIC9cXGQvLCAvXFxkL11cblxuICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cChcbiAgICAnXlswLTlfXXsyLDN9W8KwKl1bMC05X117MiwzfVtgXFwn4oCZXShbMC05X117MiwzfSg/OlsuXVswLTldezAsM30pPylcIj8nXG4gIClcbiAgY29uc3QgbWF0Y2ggPSByYXdWYWx1ZS5tYXRjaChwYXR0ZXJuKVxuICBpZiAobWF0Y2gpIHtcbiAgICBjb25zdCBzZWNvbmRzID0gbWF0Y2hbMV1cbiAgICBpZiAoc2Vjb25kcy5pbmNsdWRlcygnLicpKSB7XG4gICAgICByZXR1cm4gYmFzZU1hc2suY29uY2F0KGRlY2ltYWxNYXNrKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZU1hc2suY29uY2F0KCdcIicpXG59XG5cbmV4cG9ydCBjb25zdCBsb25naXR1ZGVETVNNYXNrID0gZnVuY3Rpb24gKHJhd1ZhbHVlOiBhbnkpIHtcbiAgY29uc3QgYmFzZU1hc2sgPSBbL1xcZC8sIC9cXGQvLCAvXFxkLywgJ8KwJywgL1xcZC8sIC9cXGQvLCBcIidcIiwgL1xcZC8sIC9cXGQvXVxuXG4gIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKFxuICAgICdeWzAtOV9dezMsNH1bwrAqXVswLTlfXXsyLDN9W2BcXCfigJldKFswLTlfXXsyLDN9KD86Wy5dWzAtOV17MCwzfSk/KVwiPydcbiAgKVxuICBjb25zdCBtYXRjaCA9IHJhd1ZhbHVlLm1hdGNoKHBhdHRlcm4pXG4gIGlmIChtYXRjaCkge1xuICAgIGNvbnN0IHNlY29uZHMgPSBtYXRjaFsxXVxuICAgIGlmIChzZWNvbmRzLmluY2x1ZGVzKCcuJykpIHtcbiAgICAgIHJldHVybiBiYXNlTWFzay5jb25jYXQoZGVjaW1hbE1hc2spXG4gICAgfVxuICB9XG4gIHJldHVybiBiYXNlTWFzay5jb25jYXQoJ1wiJylcbn1cbiJdfQ==