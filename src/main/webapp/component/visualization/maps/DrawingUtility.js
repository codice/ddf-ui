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
//allows us to get around svg security restrictions in IE11 (see using svg in opengl)
//make our own image and manually set dimensions because of IE: https://github.com/openlayers/openlayers/issues/3939
import _ from 'underscore';
var defaultColor = '#3c6dd5';
export default {
    getCircle: function (options) {
        _.defaults(options, {
            diameter: 22,
            fillColor: defaultColor,
            strokeWidth: 2,
            strokeColor: 'white',
            badgeOptions: undefined,
        });
        var badgeOffset = options.badgeOptions ? 8 : 0;
        var radius = options.diameter / 2;
        var canvas = document.createElement('canvas');
        canvas.width = options.diameter + badgeOffset;
        canvas.height = options.diameter + badgeOffset;
        var ctx = canvas.getContext('2d');
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.beginPath();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.strokeStyle = options.strokeColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.lineWidth = options.strokeWidth;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.fillColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.arc(radius, radius + badgeOffset, radius - options.strokeWidth / 2, 0, 2 * Math.PI, false);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fill();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.stroke();
        if (options.badgeOptions) {
            return this.addBadge(canvas, {
                width: options.diameter + badgeOffset,
                color: options.badgeOptions.color,
                text: options.badgeOptions.text,
            });
        }
        return canvas;
    },
    getCircleWithText: function (options) {
        _.defaults(options, {
            diameter: 44,
            fillColor: defaultColor,
            strokeWidth: 2,
            strokeColor: 'white',
            text: '',
            textColor: 'white',
            badgeOptions: undefined,
        });
        var badgeOffset = options.badgeOptions ? 8 : 0;
        var canvas = this.getCircle(options);
        var ctx = canvas.getContext('2d');
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.font = '16pt Helvetica';
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.textColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.textAlign = 'center';
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.textBaseline = 'middle';
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillText(options.text, options.diameter / 2, options.diameter / 2 + badgeOffset);
        return canvas;
    },
    getCircleWithIcon: function (options) {
        _.defaults(options, {
            diameter: 24,
            fillColor: defaultColor,
            strokeWidth: 2,
            strokeColor: 'white',
            text: '',
            textColor: 'white',
        });
        var canvas = this.getCircle(options);
        var ctx = canvas.getContext('2d');
        var style = options.icon.style;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.font = style.size + ' ' + style.font;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.textColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.textAlign = 'center';
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.textBaseline = 'middle';
        if (style.code) {
            var icon = String.fromCharCode(parseInt(style.code, 16));
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.fillText(icon, options.diameter / 2, options.diameter / 2);
        }
        return canvas;
    },
    getPin: function (options) {
        _.defaults(options, {
            width: 39,
            height: 40,
            fillColor: defaultColor,
            strokeWidth: 2,
            strokeColor: 'white',
            textColor: 'white',
            badgeOptions: undefined,
        });
        var badgeOffset = options.badgeOptions ? 8 : 0;
        var getValWithOffset = function (val) {
            return val + badgeOffset;
        };
        var canvas = document.createElement('canvas');
        canvas.width = options.width + badgeOffset;
        canvas.height = options.height + badgeOffset;
        var ctx = canvas.getContext('2d');
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.strokeStyle = options.strokeColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.lineWidth = options.strokeWidth;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.fillColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.beginPath();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.moveTo(19.36, getValWithOffset(2));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.bezierCurveTo(11.52, getValWithOffset(2), 4.96, getValWithOffset(6.64), 4.96, getValWithOffset(14.64));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.bezierCurveTo(4.96, getValWithOffset(17.92), 6.08, getValWithOffset(20.96), 7.84, getValWithOffset(23.44));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.lineTo(19.52, getValWithOffset(38.96));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.lineTo(31.2, getValWithOffset(23.44));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.bezierCurveTo(33.04, getValWithOffset(20.96), 34.08, getValWithOffset(17.92), 34.08, getValWithOffset(14.64));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.bezierCurveTo(34.08, getValWithOffset(6.64), 27.6, getValWithOffset(2), 19.52, getValWithOffset(2));
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.fillColor;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fill();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.stroke();
        var style = options.icon.style;
        if (style.code) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.font = style.size + ' ' + style.font;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.fillStyle = options.textColor;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.textAlign = 'center';
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.textBaseline = 'middle';
            var icon = String.fromCharCode(parseInt(style.code, 16));
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.fillText(icon, options.width / 2, options.height / 2 - 5 + badgeOffset);
        }
        if (options.badgeOptions) {
            return this.addBadge(canvas, {
                width: options.width + badgeOffset,
                color: options.badgeOptions.color,
                text: options.badgeOptions.text,
            });
        }
        return canvas;
    },
    addBadge: function (canvas, options) {
        _.defaults(options, {
            width: 48,
            color: '#fff59d',
        });
        var ctx = canvas.getContext('2d');
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.beginPath();
        var radius = 10;
        var badgeX = options.width - (radius + 2);
        var badgeY = radius + 2;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.arc(badgeX, badgeY, radius, 0, 2 * Math.PI, false);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fillStyle = options.color;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.strokeStyle = '#000000';
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.lineWidth = 1;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.fill();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        ctx.stroke();
        if (options.text) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.font = '10pt Helvetica';
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.fillStyle = '#000000';
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.textAlign = 'center';
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.textBaseline = 'middle';
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ctx.fillText(options.text, badgeX, badgeY);
        }
        return canvas;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd2luZ1V0aWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9EcmF3aW5nVXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUoscUZBQXFGO0FBQ3JGLG9IQUFvSDtBQUNwSCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFBO0FBRTlCLGVBQWU7SUFDYixTQUFTLFlBQUMsT0FBWTtRQUNwQixDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUNsQixRQUFRLEVBQUUsRUFBRTtZQUNaLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLE9BQU87WUFDcEIsWUFBWSxFQUFFLFNBQVM7U0FDeEIsQ0FBQyxDQUFBO1FBQ0YsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUE7UUFDbkMsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMvQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFBO1FBQzdDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUE7UUFDOUMsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUVuQyxzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ2Ysc0VBQXNFO1FBQ3RFLEdBQUcsQ0FBQyxX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QUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFdEQsc0VBQXNFO1FBQ3RFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtRQUM3QixzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUE7UUFDM0Isc0VBQXNFO1FBQ3RFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLHNFQUFzRTtRQUN0RSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDVixzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBRVosSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUE7WUFDM0Isc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1lBQ3pCLHNFQUFzRTtZQUN0RSxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtZQUN4QixzRUFBc0U7WUFDdEUsR0FBRyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUE7WUFFM0Isc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDNUMsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuLy9hbGxvd3MgdXMgdG8gZ2V0IGFyb3VuZCBzdmcgc2VjdXJpdHkgcmVzdHJpY3Rpb25zIGluIElFMTEgKHNlZSB1c2luZyBzdmcgaW4gb3BlbmdsKVxuLy9tYWtlIG91ciBvd24gaW1hZ2UgYW5kIG1hbnVhbGx5IHNldCBkaW1lbnNpb25zIGJlY2F1c2Ugb2YgSUU6IGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVubGF5ZXJzL29wZW5sYXllcnMvaXNzdWVzLzM5MzlcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmNvbnN0IGRlZmF1bHRDb2xvciA9ICcjM2M2ZGQ1J1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGdldENpcmNsZShvcHRpb25zOiBhbnkpIHtcbiAgICBfLmRlZmF1bHRzKG9wdGlvbnMsIHtcbiAgICAgIGRpYW1ldGVyOiAyMixcbiAgICAgIGZpbGxDb2xvcjogZGVmYXVsdENvbG9yLFxuICAgICAgc3Ryb2tlV2lkdGg6IDIsXG4gICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgIGJhZGdlT3B0aW9uczogdW5kZWZpbmVkLFxuICAgIH0pXG4gICAgY29uc3QgYmFkZ2VPZmZzZXQgPSBvcHRpb25zLmJhZGdlT3B0aW9ucyA/IDggOiAwXG4gICAgY29uc3QgcmFkaXVzID0gb3B0aW9ucy5kaWFtZXRlciAvIDJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIGNhbnZhcy53aWR0aCA9IG9wdGlvbnMuZGlhbWV0ZXIgKyBiYWRnZU9mZnNldFxuICAgIGNhbnZhcy5oZWlnaHQgPSBvcHRpb25zLmRpYW1ldGVyICsgYmFkZ2VPZmZzZXRcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRpb25zLnN0cm9rZUNvbG9yXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5saW5lV2lkdGggPSBvcHRpb25zLnN0cm9rZVdpZHRoXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLmZpbGxDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguYXJjKFxuICAgICAgcmFkaXVzLFxuICAgICAgcmFkaXVzICsgYmFkZ2VPZmZzZXQsXG4gICAgICByYWRpdXMgLSBvcHRpb25zLnN0cm9rZVdpZHRoIC8gMixcbiAgICAgIDAsXG4gICAgICAyICogTWF0aC5QSSxcbiAgICAgIGZhbHNlXG4gICAgKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbCgpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5zdHJva2UoKVxuXG4gICAgaWYgKG9wdGlvbnMuYmFkZ2VPcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRCYWRnZShjYW52YXMsIHtcbiAgICAgICAgd2lkdGg6IG9wdGlvbnMuZGlhbWV0ZXIgKyBiYWRnZU9mZnNldCxcbiAgICAgICAgY29sb3I6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLmNvbG9yLFxuICAgICAgICB0ZXh0OiBvcHRpb25zLmJhZGdlT3B0aW9ucy50ZXh0LFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gY2FudmFzXG4gIH0sXG4gIGdldENpcmNsZVdpdGhUZXh0KG9wdGlvbnM6IGFueSkge1xuICAgIF8uZGVmYXVsdHMob3B0aW9ucywge1xuICAgICAgZGlhbWV0ZXI6IDQ0LFxuICAgICAgZmlsbENvbG9yOiBkZWZhdWx0Q29sb3IsXG4gICAgICBzdHJva2VXaWR0aDogMixcbiAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgdGV4dDogJycsXG4gICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgICBiYWRnZU9wdGlvbnM6IHVuZGVmaW5lZCxcbiAgICB9KVxuXG4gICAgY29uc3QgYmFkZ2VPZmZzZXQgPSBvcHRpb25zLmJhZGdlT3B0aW9ucyA/IDggOiAwXG5cbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldENpcmNsZShvcHRpb25zKVxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZvbnQgPSAnMTZwdCBIZWx2ZXRpY2EnXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLnRleHRDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsVGV4dChcbiAgICAgIG9wdGlvbnMudGV4dCxcbiAgICAgIG9wdGlvbnMuZGlhbWV0ZXIgLyAyLFxuICAgICAgb3B0aW9ucy5kaWFtZXRlciAvIDIgKyBiYWRnZU9mZnNldFxuICAgIClcblxuICAgIHJldHVybiBjYW52YXNcbiAgfSxcbiAgZ2V0Q2lyY2xlV2l0aEljb24ob3B0aW9uczogYW55KSB7XG4gICAgXy5kZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgICBkaWFtZXRlcjogMjQsXG4gICAgICBmaWxsQ29sb3I6IGRlZmF1bHRDb2xvcixcbiAgICAgIHN0cm9rZVdpZHRoOiAyLFxuICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICB0ZXh0OiAnJyxcbiAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICB9KVxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0Q2lyY2xlKG9wdGlvbnMpXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICBjb25zdCBzdHlsZSA9IG9wdGlvbnMuaWNvbi5zdHlsZVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5mb250ID0gc3R5bGUuc2l6ZSArICcgJyArIHN0eWxlLmZvbnRcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMudGV4dENvbG9yXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSdcblxuICAgIGlmIChzdHlsZS5jb2RlKSB7XG4gICAgICBsZXQgaWNvbiA9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoc3R5bGUuY29kZSwgMTYpKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZpbGxUZXh0KGljb24sIG9wdGlvbnMuZGlhbWV0ZXIgLyAyLCBvcHRpb25zLmRpYW1ldGVyIC8gMilcbiAgICB9XG4gICAgcmV0dXJuIGNhbnZhc1xuICB9LFxuICBnZXRQaW4ob3B0aW9uczogYW55KSB7XG4gICAgXy5kZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgICB3aWR0aDogMzksXG4gICAgICBoZWlnaHQ6IDQwLFxuICAgICAgZmlsbENvbG9yOiBkZWZhdWx0Q29sb3IsXG4gICAgICBzdHJva2VXaWR0aDogMixcbiAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgYmFkZ2VPcHRpb25zOiB1bmRlZmluZWQsXG4gICAgfSlcblxuICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuXG4gICAgY29uc3QgZ2V0VmFsV2l0aE9mZnNldCA9ICh2YWw6IG51bWJlcikgPT4ge1xuICAgICAgcmV0dXJuIHZhbCArIGJhZGdlT2Zmc2V0XG4gICAgfVxuXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXMud2lkdGggPSBvcHRpb25zLndpZHRoICsgYmFkZ2VPZmZzZXRcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKyBiYWRnZU9mZnNldFxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5zdHJva2VDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgubGluZVdpZHRoID0gb3B0aW9ucy5zdHJva2VXaWR0aFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy5maWxsQ29sb3JcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4Lm1vdmVUbygxOS4zNiwgZ2V0VmFsV2l0aE9mZnNldCgyKSlcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlemllckN1cnZlVG8oXG4gICAgICAxMS41MixcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMiksXG4gICAgICA0Ljk2LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCg2LjY0KSxcbiAgICAgIDQuOTYsXG4gICAgICBnZXRWYWxXaXRoT2Zmc2V0KDE0LjY0KVxuICAgIClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlemllckN1cnZlVG8oXG4gICAgICA0Ljk2LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgxNy45MiksXG4gICAgICA2LjA4LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgyMC45NiksXG4gICAgICA3Ljg0LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgyMy40NClcbiAgICApXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5saW5lVG8oMTkuNTIsIGdldFZhbFdpdGhPZmZzZXQoMzguOTYpKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgubGluZVRvKDMxLjIsIGdldFZhbFdpdGhPZmZzZXQoMjMuNDQpKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguYmV6aWVyQ3VydmVUbyhcbiAgICAgIDMzLjA0LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgyMC45NiksXG4gICAgICAzNC4wOCxcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMTcuOTIpLFxuICAgICAgMzQuMDgsXG4gICAgICBnZXRWYWxXaXRoT2Zmc2V0KDE0LjY0KVxuICAgIClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlemllckN1cnZlVG8oXG4gICAgICAzNC4wOCxcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoNi42NCksXG4gICAgICAyNy42LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgyKSxcbiAgICAgIDE5LjUyLFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgyKVxuICAgIClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMuZmlsbENvbG9yXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsKClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnN0cm9rZSgpXG5cbiAgICBjb25zdCBzdHlsZSA9IG9wdGlvbnMuaWNvbi5zdHlsZVxuICAgIGlmIChzdHlsZS5jb2RlKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHguZm9udCA9IHN0eWxlLnNpemUgKyAnICcgKyBzdHlsZS5mb250XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy50ZXh0Q29sb3JcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnXG5cbiAgICAgIGxldCBpY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChzdHlsZS5jb2RlLCAxNikpXG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgaWNvbixcbiAgICAgICAgb3B0aW9ucy53aWR0aCAvIDIsXG4gICAgICAgIG9wdGlvbnMuaGVpZ2h0IC8gMiAtIDUgKyBiYWRnZU9mZnNldFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmJhZGdlT3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQmFkZ2UoY2FudmFzLCB7XG4gICAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoICsgYmFkZ2VPZmZzZXQsXG4gICAgICAgIGNvbG9yOiBvcHRpb25zLmJhZGdlT3B0aW9ucy5jb2xvcixcbiAgICAgICAgdGV4dDogb3B0aW9ucy5iYWRnZU9wdGlvbnMudGV4dCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbnZhc1xuICB9LFxuICBhZGRCYWRnZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBvcHRpb25zOiBhbnkpIHtcbiAgICBfLmRlZmF1bHRzKG9wdGlvbnMsIHtcbiAgICAgIHdpZHRoOiA0OCxcbiAgICAgIGNvbG9yOiAnI2ZmZjU5ZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlZ2luUGF0aCgpXG5cbiAgICBjb25zdCByYWRpdXMgPSAxMFxuICAgIGNvbnN0IGJhZGdlWCA9IG9wdGlvbnMud2lkdGggLSAocmFkaXVzICsgMilcbiAgICBjb25zdCBiYWRnZVkgPSByYWRpdXMgKyAyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5hcmMoYmFkZ2VYLCBiYWRnZVksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLmNvbG9yXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJ1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgubGluZVdpZHRoID0gMVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbCgpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5zdHJva2UoKVxuXG4gICAgaWYgKG9wdGlvbnMudGV4dCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZvbnQgPSAnMTBwdCBIZWx2ZXRpY2EnXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHguZmlsbFN0eWxlID0gJyMwMDAwMDAnXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHguZmlsbFRleHQob3B0aW9ucy50ZXh0LCBiYWRnZVgsIGJhZGdlWSlcbiAgICB9XG5cbiAgICByZXR1cm4gY2FudmFzXG4gIH0sXG59XG4iXX0=