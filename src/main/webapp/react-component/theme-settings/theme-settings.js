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
/*global require*/
import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import user from '../../component/singletons/user-instance';
import { hot } from 'react-hot-loader';
import Grid from '@mui/material/Grid';
import ColorTool from './color-tool';
window.user = user;
var getPreferences = function () {
    return user.get('user').get('preferences');
};
var getAnimationMode = function () {
    return Boolean(getPreferences().get('animation'));
};
var getCurrentTheme = function () {
    return getPreferences().get('theme').toJSON();
};
var AnimationSetting = function () {
    var _a = __read(React.useState(getAnimationMode()), 2), animationMode = _a[0], setAnimationMode = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:animation', function () {
            setAnimationMode(getAnimationMode());
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: animationMode, onChange: function (e) {
                getPreferences().set('animation', e.target.checked);
                getPreferences().savePreferences();
            } }), label: "Animation" }));
};
var ThemeMode = function () {
    var _a = __read(React.useState(getCurrentTheme().theme === 'dark'), 2), darkMode = _a[0], setDarkMode = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:theme', function () {
            setDarkMode(getCurrentTheme().theme === 'dark');
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: darkMode, onChange: function (e) {
                getPreferences()
                    .get('theme')
                    .set('theme', e.target.checked ? 'dark' : 'light');
                getPreferences().savePreferences();
            } }), label: "Dark Mode" }));
};
var ThemePalette = function () {
    var _a = __read(React.useState(getCurrentTheme().palette === 'custom'), 2), palette = _a[0], setPalette = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:theme', function () {
            setPalette(getCurrentTheme().palette === 'custom');
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true },
            React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: palette, onChange: function (e) {
                        getPreferences()
                            .get('theme')
                            .set('palette', e.target.checked ? 'custom' : 'default');
                        getPreferences().savePreferences();
                    } }), label: "Custom Palette" })),
        React.createElement(Grid, { item: true, className: "w-full ".concat(palette ? '' : 'hidden') },
            React.createElement(ColorTool, null))));
};
var ThemeSettings = function () {
    return (React.createElement(Grid, { container: true, direction: "column", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(AnimationSetting, null)),
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(ThemeMode, null)),
        React.createElement(ThemePalette, null)));
};
export default hot(module)(ThemeSettings);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtc2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3RoZW1lLXNldHRpbmdzL3RoZW1lLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLGtCQUFrQjtBQUNsQixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFBO0FBQzdELE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNqRixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUNuQztBQUFDLE1BQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBSzVCLElBQU0sY0FBYyxHQUFHO0lBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDNUMsQ0FBQyxDQUFBO0FBQ0QsSUFBTSxnQkFBZ0IsR0FBRztJQUN2QixPQUFPLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxDQUFDLENBQUE7QUFDRCxJQUFNLGVBQWUsR0FBRztJQUN0QixPQUFPLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUMvQyxDQUFDLENBQUE7QUFDRCxJQUFNLGdCQUFnQixHQUFHO0lBQ2pCLElBQUEsS0FBQSxPQUFvQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBQSxFQUFyRSxhQUFhLFFBQUEsRUFBRSxnQkFBZ0IsUUFBc0MsQ0FBQTtJQUNwRSxJQUFBLFFBQVEsR0FBSyxXQUFXLEVBQUUsU0FBbEIsQ0FBa0I7SUFDbEMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxrQkFBa0IsRUFBRTtZQUNoRSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUE7UUFDdEMsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixPQUFPLENBQ0wsb0JBQUMsZ0JBQWdCLElBQ2YsY0FBYyxFQUFDLE9BQU8sRUFDdEIsT0FBTyxFQUNMLG9CQUFDLFFBQVEsSUFDUCxLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBRSxhQUFhLEVBQ3RCLFFBQVEsRUFBRSxVQUFDLENBQUM7Z0JBQ1YsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUNuRCxjQUFjLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtZQUNwQyxDQUFDLEdBQ0QsRUFFSixLQUFLLEVBQUMsV0FBVyxHQUNqQixDQUNILENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxJQUFNLFNBQVMsR0FBRztJQUNWLElBQUEsS0FBQSxPQUEwQixLQUFLLENBQUMsUUFBUSxDQUM1QyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUNuQyxJQUFBLEVBRk0sUUFBUSxRQUFBLEVBQUUsV0FBVyxRQUUzQixDQUFBO0lBQ08sSUFBQSxRQUFRLEdBQUssV0FBVyxFQUFFLFNBQWxCLENBQWtCO0lBQ2xDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsY0FBYyxFQUFFO1lBQzVELFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUE7UUFDakQsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixPQUFPLENBQ0wsb0JBQUMsZ0JBQWdCLElBQ2YsY0FBYyxFQUFDLE9BQU8sRUFDdEIsT0FBTyxFQUNMLG9CQUFDLFFBQVEsSUFDUCxLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBRSxRQUFRLEVBQ2pCLFFBQVEsRUFBRSxVQUFDLENBQUM7Z0JBQ1YsY0FBYyxFQUFFO3FCQUNiLEdBQUcsQ0FBQyxPQUFPLENBQUM7cUJBQ1osR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDcEQsY0FBYyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUE7WUFDcEMsQ0FBQyxHQUNELEVBRUosS0FBSyxFQUFDLFdBQVcsR0FDakIsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsSUFBTSxZQUFZLEdBQUc7SUFDYixJQUFBLEtBQUEsT0FBd0IsS0FBSyxDQUFDLFFBQVEsQ0FDMUMsZUFBZSxFQUFFLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FDdkMsSUFBQSxFQUZNLE9BQU8sUUFBQSxFQUFFLFVBQVUsUUFFekIsQ0FBQTtJQUNPLElBQUEsUUFBUSxHQUFLLFdBQVcsRUFBRSxTQUFsQixDQUFrQjtJQUNsQyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLGNBQWMsRUFBRTtZQUM1RCxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFBO1FBQ3BELENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMO1FBQ0Usb0JBQUMsSUFBSSxJQUFDLElBQUk7WUFDUixvQkFBQyxnQkFBZ0IsSUFDZixjQUFjLEVBQUMsT0FBTyxFQUN0QixPQUFPLEVBQ0wsb0JBQUMsUUFBUSxJQUNQLEtBQUssRUFBQyxTQUFTLEVBQ2YsT0FBTyxFQUFFLE9BQU8sRUFDaEIsUUFBUSxFQUFFLFVBQUMsQ0FBQzt3QkFDVixjQUFjLEVBQUU7NkJBQ2IsR0FBRyxDQUFDLE9BQU8sQ0FBQzs2QkFDWixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFBO3dCQUMxRCxjQUFjLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtvQkFDcEMsQ0FBQyxHQUNELEVBRUosS0FBSyxFQUFDLGdCQUFnQixHQUN0QixDQUNHO1FBQ1Asb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUUsaUJBQVUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBRTtZQUN2RCxvQkFBQyxTQUFTLE9BQUcsQ0FDUixDQUNOLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELElBQU0sYUFBYSxHQUFHO0lBQ3BCLE9BQU8sQ0FDTCxvQkFBQyxJQUFJLElBQUMsU0FBUyxRQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLFFBQVE7UUFDOUMsb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUMsUUFBUTtZQUMzQixvQkFBQyxnQkFBZ0IsT0FBRyxDQUNmO1FBQ1Asb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUMsUUFBUTtZQUMzQixvQkFBQyxTQUFTLE9BQUcsQ0FDUjtRQUNQLG9CQUFDLFlBQVksT0FBRyxDQUNYLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vKmdsb2JhbCByZXF1aXJlKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEZvcm1Db250cm9sTGFiZWwgZnJvbSAnQG11aS9tYXRlcmlhbC9Gb3JtQ29udHJvbExhYmVsJ1xuaW1wb3J0IENoZWNrYm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2hlY2tib3gnXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IENvbG9yVG9vbCBmcm9tICcuL2NvbG9yLXRvb2wnXG47KHdpbmRvdyBhcyBhbnkpLnVzZXIgPSB1c2VyXG50eXBlIFRoZW1lVHlwZSA9IHtcbiAgdGhlbWU6ICdkYXJrJyB8ICdsaWdodCdcbiAgcGFsZXR0ZTogJ2RlZmF1bHQnIHwgJ2N1c3RvbSdcbn1cbmNvbnN0IGdldFByZWZlcmVuY2VzID0gKCkgPT4ge1xuICByZXR1cm4gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJylcbn1cbmNvbnN0IGdldEFuaW1hdGlvbk1vZGUgPSAoKSA9PiB7XG4gIHJldHVybiBCb29sZWFuKGdldFByZWZlcmVuY2VzKCkuZ2V0KCdhbmltYXRpb24nKSlcbn1cbmNvbnN0IGdldEN1cnJlbnRUaGVtZSA9ICgpOiBUaGVtZVR5cGUgPT4ge1xuICByZXR1cm4gZ2V0UHJlZmVyZW5jZXMoKS5nZXQoJ3RoZW1lJykudG9KU09OKClcbn1cbmNvbnN0IEFuaW1hdGlvblNldHRpbmcgPSAoKSA9PiB7XG4gIGNvbnN0IFthbmltYXRpb25Nb2RlLCBzZXRBbmltYXRpb25Nb2RlXSA9IFJlYWN0LnVzZVN0YXRlKGdldEFuaW1hdGlvbk1vZGUoKSlcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLCAnY2hhbmdlOmFuaW1hdGlvbicsICgpID0+IHtcbiAgICAgIHNldEFuaW1hdGlvbk1vZGUoZ2V0QW5pbWF0aW9uTW9kZSgpKVxuICAgIH0pXG4gIH0sIFtdKVxuICByZXR1cm4gKFxuICAgIDxGb3JtQ29udHJvbExhYmVsXG4gICAgICBsYWJlbFBsYWNlbWVudD1cInN0YXJ0XCJcbiAgICAgIGNvbnRyb2w9e1xuICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICBjb2xvcj1cImRlZmF1bHRcIlxuICAgICAgICAgIGNoZWNrZWQ9e2FuaW1hdGlvbk1vZGV9XG4gICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICBnZXRQcmVmZXJlbmNlcygpLnNldCgnYW5pbWF0aW9uJywgZS50YXJnZXQuY2hlY2tlZClcbiAgICAgICAgICAgIGdldFByZWZlcmVuY2VzKCkuc2F2ZVByZWZlcmVuY2VzKClcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgfVxuICAgICAgbGFiZWw9XCJBbmltYXRpb25cIlxuICAgIC8+XG4gIClcbn1cbmNvbnN0IFRoZW1lTW9kZSA9ICgpID0+IHtcbiAgY29uc3QgW2RhcmtNb2RlLCBzZXREYXJrTW9kZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRDdXJyZW50VGhlbWUoKS50aGVtZSA9PT0gJ2RhcmsnXG4gIClcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLCAnY2hhbmdlOnRoZW1lJywgKCkgPT4ge1xuICAgICAgc2V0RGFya01vZGUoZ2V0Q3VycmVudFRoZW1lKCkudGhlbWUgPT09ICdkYXJrJylcbiAgICB9KVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8Rm9ybUNvbnRyb2xMYWJlbFxuICAgICAgbGFiZWxQbGFjZW1lbnQ9XCJzdGFydFwiXG4gICAgICBjb250cm9sPXtcbiAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgY29sb3I9XCJkZWZhdWx0XCJcbiAgICAgICAgICBjaGVja2VkPXtkYXJrTW9kZX1cbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgIGdldFByZWZlcmVuY2VzKClcbiAgICAgICAgICAgICAgLmdldCgndGhlbWUnKVxuICAgICAgICAgICAgICAuc2V0KCd0aGVtZScsIGUudGFyZ2V0LmNoZWNrZWQgPyAnZGFyaycgOiAnbGlnaHQnKVxuICAgICAgICAgICAgZ2V0UHJlZmVyZW5jZXMoKS5zYXZlUHJlZmVyZW5jZXMoKVxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICB9XG4gICAgICBsYWJlbD1cIkRhcmsgTW9kZVwiXG4gICAgLz5cbiAgKVxufVxuY29uc3QgVGhlbWVQYWxldHRlID0gKCkgPT4ge1xuICBjb25zdCBbcGFsZXR0ZSwgc2V0UGFsZXR0ZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRDdXJyZW50VGhlbWUoKS5wYWxldHRlID09PSAnY3VzdG9tJ1xuICApXG4gIGNvbnN0IHsgbGlzdGVuVG8gfSA9IHVzZUJhY2tib25lKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaXN0ZW5Ubyh1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKSwgJ2NoYW5nZTp0aGVtZScsICgpID0+IHtcbiAgICAgIHNldFBhbGV0dGUoZ2V0Q3VycmVudFRoZW1lKCkucGFsZXR0ZSA9PT0gJ2N1c3RvbScpXG4gICAgfSlcbiAgfSwgW10pXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxGb3JtQ29udHJvbExhYmVsXG4gICAgICAgICAgbGFiZWxQbGFjZW1lbnQ9XCJzdGFydFwiXG4gICAgICAgICAgY29udHJvbD17XG4gICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgY29sb3I9XCJkZWZhdWx0XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17cGFsZXR0ZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgZ2V0UHJlZmVyZW5jZXMoKVxuICAgICAgICAgICAgICAgICAgLmdldCgndGhlbWUnKVxuICAgICAgICAgICAgICAgICAgLnNldCgncGFsZXR0ZScsIGUudGFyZ2V0LmNoZWNrZWQgPyAnY3VzdG9tJyA6ICdkZWZhdWx0JylcbiAgICAgICAgICAgICAgICBnZXRQcmVmZXJlbmNlcygpLnNhdmVQcmVmZXJlbmNlcygpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICBsYWJlbD1cIkN1c3RvbSBQYWxldHRlXCJcbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPXtgdy1mdWxsICR7cGFsZXR0ZSA/ICcnIDogJ2hpZGRlbid9YH0+XG4gICAgICAgIDxDb2xvclRvb2wgLz5cbiAgICAgIDwvR3JpZD5cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgVGhlbWVTZXR0aW5ncyA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwiY29sdW1uXCIgd3JhcD1cIm5vd3JhcFwiPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgICAgPEFuaW1hdGlvblNldHRpbmcgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgIDxUaGVtZU1vZGUgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxUaGVtZVBhbGV0dGUgLz5cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFRoZW1lU2V0dGluZ3MpXG4iXX0=