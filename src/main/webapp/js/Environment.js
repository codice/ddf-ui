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
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
console.info(__ENV__); // moving this here as it's useful to see at least once
export var Environment = {
    isTest: function () {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
        return __ENV__ === 'test';
    },
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_HASH__'.
    commitHash: __COMMIT_HASH__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__IS_DIRTY__'.
    isDirty: __IS_DIRTY__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_DATE__'.
    commitDate: __COMMIT_DATE__,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvRW52aXJvbm1lbnQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSix1RUFBdUU7QUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQSxDQUFDLHVEQUF1RDtBQUM3RSxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekIsTUFBTTtRQUNKLHVFQUF1RTtRQUN2RSxPQUFPLE9BQU8sS0FBSyxNQUFNLENBQUE7SUFDM0IsQ0FBQztJQUNELCtFQUErRTtJQUMvRSxVQUFVLEVBQUUsZUFBZTtJQUMzQiw0RUFBNEU7SUFDNUUsT0FBTyxFQUFFLFlBQVk7SUFDckIsK0VBQStFO0lBQy9FLFVBQVUsRUFBRSxlQUFlO0NBQzVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzA0KSBGSVhNRTogQ2Fubm90IGZpbmQgbmFtZSAnX19FTlZfXycuXG5jb25zb2xlLmluZm8oX19FTlZfXykgLy8gbW92aW5nIHRoaXMgaGVyZSBhcyBpdCdzIHVzZWZ1bCB0byBzZWUgYXQgbGVhc3Qgb25jZVxuZXhwb3J0IGNvbnN0IEVudmlyb25tZW50ID0ge1xuICBpc1Rlc3QoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDQpIEZJWE1FOiBDYW5ub3QgZmluZCBuYW1lICdfX0VOVl9fJy5cbiAgICByZXR1cm4gX19FTlZfXyA9PT0gJ3Rlc3QnXG4gIH0sXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzA0KSBGSVhNRTogQ2Fubm90IGZpbmQgbmFtZSAnX19DT01NSVRfSEFTSF9fJy5cbiAgY29tbWl0SGFzaDogX19DT01NSVRfSEFTSF9fLFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMwNCkgRklYTUU6IENhbm5vdCBmaW5kIG5hbWUgJ19fSVNfRElSVFlfXycuXG4gIGlzRGlydHk6IF9fSVNfRElSVFlfXyxcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDQpIEZJWE1FOiBDYW5ub3QgZmluZCBuYW1lICdfX0NPTU1JVF9EQVRFX18nLlxuICBjb21taXREYXRlOiBfX0NPTU1JVF9EQVRFX18sXG59XG4iXX0=