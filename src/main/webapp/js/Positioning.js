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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zaXRpb25pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvUG9zaXRpb25pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLElBQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFBO0FBQzVDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQTtBQUN2QixJQUFNLFlBQVksR0FBRyxNQUFNLENBQUE7QUFFM0IsZUFBZTtJQUNiLG1KQUFtSjtJQUNuSixtQkFBbUIsWUFBQyxPQUFZO1FBQzlCLElBQUksT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQzthQUFNLElBQUksT0FBTyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDdEQsSUFDRSxhQUFhLENBQUMsU0FBUyxLQUFLLFNBQVM7Z0JBQ3JDLGFBQWEsQ0FBQyxPQUFPLEtBQUssV0FBVztnQkFDckMsYUFBYSxDQUFDLE9BQU8sS0FBSyxZQUFZLEVBQ3RDLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUE7WUFDYixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ3JELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuY29uc3QgemVyb1NjYWxlID0gJ21hdHJpeCgwLCAwLCAwLCAwLCAwLCAwKSdcbmNvbnN0IHplcm9PcGFjaXR5ID0gJzAnXG5jb25zdCBub3REaXNwbGF5ZWQgPSAnbm9uZSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAyMykgRklYTUU6ICdpc0VmZmVjdGl2ZWx5SGlkZGVuJyBpbXBsaWNpdGx5IGhhcyByZXR1cm4gdHlwZSAnLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgaXNFZmZlY3RpdmVseUhpZGRlbihlbGVtZW50OiBhbnkpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAoZWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpXG4gICAgICBpZiAoXG4gICAgICAgIGNvbXB1dGVkU3R5bGUudHJhbnNmb3JtID09PSB6ZXJvU2NhbGUgfHxcbiAgICAgICAgY29tcHV0ZWRTdHlsZS5vcGFjaXR5ID09PSB6ZXJvT3BhY2l0eSB8fFxuICAgICAgICBjb21wdXRlZFN0eWxlLmRpc3BsYXkgPT09IG5vdERpc3BsYXllZFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VmZmVjdGl2ZWx5SGlkZGVuKGVsZW1lbnQucGFyZW50Tm9kZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG4iXX0=