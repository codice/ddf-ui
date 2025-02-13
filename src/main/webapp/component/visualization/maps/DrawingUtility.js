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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd2luZ1V0aWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9EcmF3aW5nVXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUoscUZBQXFGO0FBQ3JGLG9IQUFvSDtBQUNwSCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFBO0FBRTlCLGVBQWU7SUFDYixTQUFTLFlBQUMsT0FBWTtRQUNwQixDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUNsQixRQUFRLEVBQUUsRUFBRTtZQUNaLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLE9BQU87WUFDcEIsWUFBWSxFQUFFLFNBQVM7U0FDeEIsQ0FBQyxDQUFBO1FBQ0YsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUE7UUFDbkMsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMvQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFBO1FBQzdDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUE7UUFDOUMsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUVuQyxzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ2Ysc0VBQXNFO1FBQ3RFLEdBQUcsQ0FBQyxX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QUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUV0RCxzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO1FBQzdCLHNFQUFzRTtRQUN0RSxHQUFHLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQTtRQUMzQixzRUFBc0U7UUFDdEUsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDakIsc0VBQXNFO1FBQ3RFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNWLHNFQUFzRTtRQUN0RSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUE7UUFFWixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDaEIsc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUE7WUFDM0Isc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1lBQ3pCLHNFQUFzRTtZQUN0RSxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtZQUN4QixzRUFBc0U7WUFDdEUsR0FBRyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUE7WUFFM0Isc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDM0M7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbi8vYWxsb3dzIHVzIHRvIGdldCBhcm91bmQgc3ZnIHNlY3VyaXR5IHJlc3RyaWN0aW9ucyBpbiBJRTExIChzZWUgdXNpbmcgc3ZnIGluIG9wZW5nbClcbi8vbWFrZSBvdXIgb3duIGltYWdlIGFuZCBtYW51YWxseSBzZXQgZGltZW5zaW9ucyBiZWNhdXNlIG9mIElFOiBodHRwczovL2dpdGh1Yi5jb20vb3BlbmxheWVycy9vcGVubGF5ZXJzL2lzc3Vlcy8zOTM5XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5jb25zdCBkZWZhdWx0Q29sb3IgPSAnIzNjNmRkNSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBnZXRDaXJjbGUob3B0aW9uczogYW55KSB7XG4gICAgXy5kZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgICBkaWFtZXRlcjogMjIsXG4gICAgICBmaWxsQ29sb3I6IGRlZmF1bHRDb2xvcixcbiAgICAgIHN0cm9rZVdpZHRoOiAyLFxuICAgICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAgICBiYWRnZU9wdGlvbnM6IHVuZGVmaW5lZCxcbiAgICB9KVxuICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuICAgIGNvbnN0IHJhZGl1cyA9IG9wdGlvbnMuZGlhbWV0ZXIgLyAyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICBjYW52YXMud2lkdGggPSBvcHRpb25zLmRpYW1ldGVyICsgYmFkZ2VPZmZzZXRcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5kaWFtZXRlciArIGJhZGdlT2Zmc2V0XG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5zdHJva2VDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgubGluZVdpZHRoID0gb3B0aW9ucy5zdHJva2VXaWR0aFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy5maWxsQ29sb3JcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmFyYyhcbiAgICAgIHJhZGl1cyxcbiAgICAgIHJhZGl1cyArIGJhZGdlT2Zmc2V0LFxuICAgICAgcmFkaXVzIC0gb3B0aW9ucy5zdHJva2VXaWR0aCAvIDIsXG4gICAgICAwLFxuICAgICAgMiAqIE1hdGguUEksXG4gICAgICBmYWxzZVxuICAgIClcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZpbGwoKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguc3Ryb2tlKClcblxuICAgIGlmIChvcHRpb25zLmJhZGdlT3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQmFkZ2UoY2FudmFzLCB7XG4gICAgICAgIHdpZHRoOiBvcHRpb25zLmRpYW1ldGVyICsgYmFkZ2VPZmZzZXQsXG4gICAgICAgIGNvbG9yOiBvcHRpb25zLmJhZGdlT3B0aW9ucy5jb2xvcixcbiAgICAgICAgdGV4dDogb3B0aW9ucy5iYWRnZU9wdGlvbnMudGV4dCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbnZhc1xuICB9LFxuICBnZXRDaXJjbGVXaXRoVGV4dChvcHRpb25zOiBhbnkpIHtcbiAgICBfLmRlZmF1bHRzKG9wdGlvbnMsIHtcbiAgICAgIGRpYW1ldGVyOiA0NCxcbiAgICAgIGZpbGxDb2xvcjogZGVmYXVsdENvbG9yLFxuICAgICAgc3Ryb2tlV2lkdGg6IDIsXG4gICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgIHRleHQ6ICcnLFxuICAgICAgdGV4dENvbG9yOiAnd2hpdGUnLFxuICAgICAgYmFkZ2VPcHRpb25zOiB1bmRlZmluZWQsXG4gICAgfSlcblxuICAgIGNvbnN0IGJhZGdlT2Zmc2V0ID0gb3B0aW9ucy5iYWRnZU9wdGlvbnMgPyA4IDogMFxuXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5nZXRDaXJjbGUob3B0aW9ucylcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5mb250ID0gJzE2cHQgSGVsdmV0aWNhJ1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy50ZXh0Q29sb3JcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbFRleHQoXG4gICAgICBvcHRpb25zLnRleHQsXG4gICAgICBvcHRpb25zLmRpYW1ldGVyIC8gMixcbiAgICAgIG9wdGlvbnMuZGlhbWV0ZXIgLyAyICsgYmFkZ2VPZmZzZXRcbiAgICApXG5cbiAgICByZXR1cm4gY2FudmFzXG4gIH0sXG4gIGdldENpcmNsZVdpdGhJY29uKG9wdGlvbnM6IGFueSkge1xuICAgIF8uZGVmYXVsdHMob3B0aW9ucywge1xuICAgICAgZGlhbWV0ZXI6IDI0LFxuICAgICAgZmlsbENvbG9yOiBkZWZhdWx0Q29sb3IsXG4gICAgICBzdHJva2VXaWR0aDogMixcbiAgICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgdGV4dDogJycsXG4gICAgICB0ZXh0Q29sb3I6ICd3aGl0ZScsXG4gICAgfSlcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldENpcmNsZShvcHRpb25zKVxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgY29uc3Qgc3R5bGUgPSBvcHRpb25zLmljb24uc3R5bGVcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZm9udCA9IHN0eWxlLnNpemUgKyAnICcgKyBzdHlsZS5mb250XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLnRleHRDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnXG5cbiAgICBpZiAoc3R5bGUuY29kZSkge1xuICAgICAgbGV0IGljb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KHN0eWxlLmNvZGUsIDE2KSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC5maWxsVGV4dChpY29uLCBvcHRpb25zLmRpYW1ldGVyIC8gMiwgb3B0aW9ucy5kaWFtZXRlciAvIDIpXG4gICAgfVxuICAgIHJldHVybiBjYW52YXNcbiAgfSxcbiAgZ2V0UGluKG9wdGlvbnM6IGFueSkge1xuICAgIF8uZGVmYXVsdHMob3B0aW9ucywge1xuICAgICAgd2lkdGg6IDM5LFxuICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgIGZpbGxDb2xvcjogZGVmYXVsdENvbG9yLFxuICAgICAgc3Ryb2tlV2lkdGg6IDIsXG4gICAgICBzdHJva2VDb2xvcjogJ3doaXRlJyxcbiAgICAgIHRleHRDb2xvcjogJ3doaXRlJyxcbiAgICAgIGJhZGdlT3B0aW9uczogdW5kZWZpbmVkLFxuICAgIH0pXG5cbiAgICBjb25zdCBiYWRnZU9mZnNldCA9IG9wdGlvbnMuYmFkZ2VPcHRpb25zID8gOCA6IDBcblxuICAgIGNvbnN0IGdldFZhbFdpdGhPZmZzZXQgPSAodmFsOiBudW1iZXIpID0+IHtcbiAgICAgIHJldHVybiB2YWwgKyBiYWRnZU9mZnNldFxuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aCArIGJhZGdlT2Zmc2V0XG4gICAgY2FudmFzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ICsgYmFkZ2VPZmZzZXRcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdGlvbnMuc3Ryb2tlQ29sb3JcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmxpbmVXaWR0aCA9IG9wdGlvbnMuc3Ryb2tlV2lkdGhcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMuZmlsbENvbG9yXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5tb3ZlVG8oMTkuMzYsIGdldFZhbFdpdGhPZmZzZXQoMikpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKFxuICAgICAgMTEuNTIsXG4gICAgICBnZXRWYWxXaXRoT2Zmc2V0KDIpLFxuICAgICAgNC45NixcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoNi42NCksXG4gICAgICA0Ljk2LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgxNC42NClcbiAgICApXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKFxuICAgICAgNC45NixcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMTcuOTIpLFxuICAgICAgNi4wOCxcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMjAuOTYpLFxuICAgICAgNy44NCxcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMjMuNDQpXG4gICAgKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHgubGluZVRvKDE5LjUyLCBnZXRWYWxXaXRoT2Zmc2V0KDM4Ljk2KSlcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmxpbmVUbygzMS4yLCBnZXRWYWxXaXRoT2Zmc2V0KDIzLjQ0KSlcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmJlemllckN1cnZlVG8oXG4gICAgICAzMy4wNCxcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMjAuOTYpLFxuICAgICAgMzQuMDgsXG4gICAgICBnZXRWYWxXaXRoT2Zmc2V0KDE3LjkyKSxcbiAgICAgIDM0LjA4LFxuICAgICAgZ2V0VmFsV2l0aE9mZnNldCgxNC42NClcbiAgICApXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKFxuICAgICAgMzQuMDgsXG4gICAgICBnZXRWYWxXaXRoT2Zmc2V0KDYuNjQpLFxuICAgICAgMjcuNixcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMiksXG4gICAgICAxOS41MixcbiAgICAgIGdldFZhbFdpdGhPZmZzZXQoMilcbiAgICApXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRpb25zLmZpbGxDb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbCgpXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5zdHJva2UoKVxuXG4gICAgY29uc3Qgc3R5bGUgPSBvcHRpb25zLmljb24uc3R5bGVcbiAgICBpZiAoc3R5bGUuY29kZSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZvbnQgPSBzdHlsZS5zaXplICsgJyAnICsgc3R5bGUuZm9udFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMudGV4dENvbG9yXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuXG4gICAgICBsZXQgaWNvbiA9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoc3R5bGUuY29kZSwgMTYpKVxuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHguZmlsbFRleHQoXG4gICAgICAgIGljb24sXG4gICAgICAgIG9wdGlvbnMud2lkdGggLyAyLFxuICAgICAgICBvcHRpb25zLmhlaWdodCAvIDIgLSA1ICsgYmFkZ2VPZmZzZXRcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5iYWRnZU9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEJhZGdlKGNhbnZhcywge1xuICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCArIGJhZGdlT2Zmc2V0LFxuICAgICAgICBjb2xvcjogb3B0aW9ucy5iYWRnZU9wdGlvbnMuY29sb3IsXG4gICAgICAgIHRleHQ6IG9wdGlvbnMuYmFkZ2VPcHRpb25zLnRleHQsXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBjYW52YXNcbiAgfSxcbiAgYWRkQmFkZ2UoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgb3B0aW9uczogYW55KSB7XG4gICAgXy5kZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgICB3aWR0aDogNDgsXG4gICAgICBjb2xvcjogJyNmZmY1OWQnLFxuICAgIH0pXG5cbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIGN0eC5iZWdpblBhdGgoKVxuXG4gICAgY29uc3QgcmFkaXVzID0gMTBcbiAgICBjb25zdCBiYWRnZVggPSBvcHRpb25zLndpZHRoIC0gKHJhZGl1cyArIDIpXG4gICAgY29uc3QgYmFkZ2VZID0gcmFkaXVzICsgMlxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguYXJjKGJhZGdlWCwgYmFkZ2VZLCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSlcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0aW9ucy5jb2xvclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCdcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgY3R4LmZpbGwoKVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICBjdHguc3Ryb2tlKClcblxuICAgIGlmIChvcHRpb25zLnRleHQpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgIGN0eC5mb250ID0gJzEwcHQgSGVsdmV0aWNhJ1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwMDAwJ1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSdcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY3R4LmZpbGxUZXh0KG9wdGlvbnMudGV4dCwgYmFkZ2VYLCBiYWRnZVkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbnZhc1xuICB9LFxufVxuIl19