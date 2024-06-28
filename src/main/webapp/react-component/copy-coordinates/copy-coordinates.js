import { __assign, __awaiter, __generator } from "tslib";
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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { useMenuState } from '../../component/menu-state/menu-state';
import Popover from '@mui/material/Popover';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useSnack from '../../component/hooks/useSnack';
var generateClipboardHandler = function (_a) {
    var text = _a.text, closeParent = _a.closeParent, addSnack = _a.addSnack;
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _a.sent();
                    addSnack("Copied to clipboard: ".concat(text), {
                        alertProps: {
                            severity: 'success',
                        },
                    });
                    return [3 /*break*/, 4];
                case 2:
                    e_1 = _a.sent();
                    addSnack("Unable to copy ".concat(text, " to clipboard."), {
                        alertProps: {
                            severity: 'error',
                        },
                        // Longer timeout to give the user a chance to copy the coordinates from the snack.
                        timeout: 10000,
                    });
                    return [3 /*break*/, 4];
                case 3:
                    closeParent();
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
};
var render = function (props) {
    var _a = props.coordinateValues, dms = _a.dms, lat = _a.lat, lon = _a.lon, mgrs = _a.mgrs, utmUps = _a.utmUps;
    var closeParent = props.closeParent;
    var menuState = useMenuState();
    var addSnack = useSnack();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({ className: "metacard-interaction interaction-copy-coordinates" }, menuState.MuiButtonProps),
            "Copy Coordinates as",
            React.createElement(ExpandMoreIcon, null)),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement("div", { className: "flex flex-col" },
                React.createElement(Button, { "data-help": "Copies the coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: "".concat(lat, " ").concat(lon),
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Decimal Degrees (DD)"),
                        lat + ' ' + lon)),
                React.createElement(Button, { "data-help": "Copies the DMS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: dms,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Degrees Minutes Seconds (DMS)"),
                        dms)),
                mgrs ? (React.createElement(Button, { "data-help": "Copies the MGRS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: mgrs,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "MGRS"),
                        mgrs))) : null,
                React.createElement(Button, { "data-help": "Copies the UTM/UPS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: utmUps,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "UTM/UPS"),
                        utmUps)),
                React.createElement(Button, { "data-help": "Copies the WKT of the coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: "POINT (".concat(lon, " ").concat(lat, ")"),
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Well Known (WKT)"),
                        "POINT (",
                        lon,
                        " ",
                        lat,
                        ")"))))));
};
export default hot(module)(render);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS1jb29yZGluYXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvY29weS1jb29yZGluYXRlcy9jb3B5LWNvb3JkaW5hdGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFDcEUsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sZ0NBQWdDLENBQUE7QUFDM0QsT0FBTyxRQUFRLE1BQU0sZ0NBQWdDLENBQUE7QUFjckQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBUWpDO1FBUEMsSUFBSSxVQUFBLEVBQ0osV0FBVyxpQkFBQSxFQUNYLFFBQVEsY0FBQTtJQU1SLE9BQU87Ozs7OztvQkFFSCxxQkFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQTs7b0JBQXpDLFNBQXlDLENBQUE7b0JBQ3pDLFFBQVEsQ0FBQywrQkFBd0IsSUFBSSxDQUFFLEVBQUU7d0JBQ3ZDLFVBQVUsRUFBRTs0QkFDVixRQUFRLEVBQUUsU0FBUzt5QkFDcEI7cUJBQ0YsQ0FBQyxDQUFBOzs7O29CQUVGLFFBQVEsQ0FBQyx5QkFBa0IsSUFBSSxtQkFBZ0IsRUFBRTt3QkFDL0MsVUFBVSxFQUFFOzRCQUNWLFFBQVEsRUFBRSxPQUFPO3lCQUNsQjt3QkFDRCxtRkFBbUY7d0JBQ25GLE9BQU8sRUFBRSxLQUFLO3FCQUNmLENBQUMsQ0FBQTs7O29CQUVGLFdBQVcsRUFBRSxDQUFBOzs7OztTQUVoQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFZO0lBQ3BCLElBQUEsS0FBa0MsS0FBSyxDQUFDLGdCQUFnQixFQUF0RCxHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxNQUFNLFlBQTJCLENBQUE7SUFDdEQsSUFBQSxXQUFXLEdBQUssS0FBSyxZQUFWLENBQVU7SUFDN0IsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDaEMsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDM0IsT0FBTyxDQUNMO1FBQ0Usb0JBQUMsTUFBTSxhQUNMLFNBQVMsRUFBQyxtREFBbUQsSUFDekQsU0FBUyxDQUFDLGNBQWM7O1lBRzVCLG9CQUFDLGNBQWMsT0FBRyxDQUNYO1FBQ1Qsb0JBQUMsT0FBTyxlQUFLLFNBQVMsQ0FBQyxlQUFlO1lBQ3BDLDZCQUFLLFNBQVMsRUFBQyxlQUFlO2dCQUM1QixvQkFBQyxNQUFNLGlCQUNLLDJDQUEyQyxFQUNyRCxPQUFPLEVBQUUsd0JBQXdCLENBQUM7d0JBQ2hDLElBQUksRUFBRSxVQUFHLEdBQUcsY0FBSSxHQUFHLENBQUU7d0JBQ3JCLFdBQVcsYUFBQTt3QkFDWCxRQUFRLFVBQUE7cUJBQ1QsQ0FBQztvQkFFRjt3QkFDRSw2QkFBSyxTQUFTLEVBQUMsWUFBWSwyQkFBMkI7d0JBQ3JELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUNaLENBQ0M7Z0JBQ1Qsb0JBQUMsTUFBTSxpQkFDSywrQ0FBK0MsRUFDekQsT0FBTyxFQUFFLHdCQUF3QixDQUFDO3dCQUNoQyxJQUFJLEVBQUUsR0FBRzt3QkFDVCxXQUFXLGFBQUE7d0JBQ1gsUUFBUSxVQUFBO3FCQUNULENBQUM7b0JBRUY7d0JBQ0UsNkJBQUssU0FBUyxFQUFDLFlBQVksb0NBQW9DO3dCQUM5RCxHQUFHLENBQ0EsQ0FDQztnQkFDUixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ04sb0JBQUMsTUFBTSxpQkFDSyxnREFBZ0QsRUFDMUQsT0FBTyxFQUFFLHdCQUF3QixDQUFDO3dCQUNoQyxJQUFJLEVBQUUsSUFBSTt3QkFDVixXQUFXLGFBQUE7d0JBQ1gsUUFBUSxVQUFBO3FCQUNULENBQUM7b0JBRUY7d0JBQ0UsNkJBQUssU0FBUyxFQUFDLFlBQVksV0FBVzt3QkFDckMsSUFBSSxDQUNELENBQ0MsQ0FDVixDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUNSLG9CQUFDLE1BQU0saUJBQ0ssbURBQW1ELEVBQzdELE9BQU8sRUFBRSx3QkFBd0IsQ0FBQzt3QkFDaEMsSUFBSSxFQUFFLE1BQU07d0JBQ1osV0FBVyxhQUFBO3dCQUNYLFFBQVEsVUFBQTtxQkFDVCxDQUFDO29CQUVGO3dCQUNFLDZCQUFLLFNBQVMsRUFBQyxZQUFZLGNBQWM7d0JBQ3hDLE1BQU0sQ0FDSCxDQUNDO2dCQUNULG9CQUFDLE1BQU0saUJBQ0ssc0RBQXNELEVBQ2hFLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQzt3QkFDaEMsSUFBSSxFQUFFLGlCQUFVLEdBQUcsY0FBSSxHQUFHLE1BQUc7d0JBQzdCLFdBQVcsYUFBQTt3QkFDWCxRQUFRLFVBQUE7cUJBQ1QsQ0FBQztvQkFFRjt3QkFDRSw2QkFBSyxTQUFTLEVBQUMsWUFBWSx1QkFBdUI7O3dCQUMxQyxHQUFHOzt3QkFBRyxHQUFHOzRCQUNiLENBQ0MsQ0FDTCxDQUNFLENBQ1QsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyB1c2VNZW51U3RhdGUgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvbWVudS1zdGF0ZS9tZW51LXN0YXRlJ1xuaW1wb3J0IFBvcG92ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IEV4cGFuZE1vcmVJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvRXhwYW5kTW9yZSdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi8uLi9jb21wb25lbnQvaG9va3MvdXNlU25hY2snXG5pbXBvcnQgeyBBZGRTbmFjayB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zbmFjay9zbmFjay5wcm92aWRlcidcblxudHlwZSBQcm9wcyA9IHtcbiAgY29vcmRpbmF0ZVZhbHVlczoge1xuICAgIGRtczogc3RyaW5nXG4gICAgbGF0OiBzdHJpbmdcbiAgICBsb246IHN0cmluZ1xuICAgIG1ncnM6IHN0cmluZ1xuICAgIHV0bVVwczogc3RyaW5nXG4gIH1cbiAgY2xvc2VQYXJlbnQ6ICgpID0+IHZvaWRcbn1cblxuY29uc3QgZ2VuZXJhdGVDbGlwYm9hcmRIYW5kbGVyID0gKHtcbiAgdGV4dCxcbiAgY2xvc2VQYXJlbnQsXG4gIGFkZFNuYWNrLFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgY2xvc2VQYXJlbnQ6ICgpID0+IHZvaWRcbiAgYWRkU25hY2s6IEFkZFNuYWNrXG59KSA9PiB7XG4gIHJldHVybiBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gICAgICBhZGRTbmFjayhgQ29waWVkIHRvIGNsaXBib2FyZDogJHt0ZXh0fWAsIHtcbiAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgIHNldmVyaXR5OiAnc3VjY2VzcycsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGFkZFNuYWNrKGBVbmFibGUgdG8gY29weSAke3RleHR9IHRvIGNsaXBib2FyZC5gLCB7XG4gICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gTG9uZ2VyIHRpbWVvdXQgdG8gZ2l2ZSB0aGUgdXNlciBhIGNoYW5jZSB0byBjb3B5IHRoZSBjb29yZGluYXRlcyBmcm9tIHRoZSBzbmFjay5cbiAgICAgICAgdGltZW91dDogMTAwMDAsXG4gICAgICB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBjbG9zZVBhcmVudCgpXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBkbXMsIGxhdCwgbG9uLCBtZ3JzLCB1dG1VcHMgfSA9IHByb3BzLmNvb3JkaW5hdGVWYWx1ZXNcbiAgY29uc3QgeyBjbG9zZVBhcmVudCB9ID0gcHJvcHNcbiAgY29uc3QgbWVudVN0YXRlID0gdXNlTWVudVN0YXRlKClcbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgY2xhc3NOYW1lPVwibWV0YWNhcmQtaW50ZXJhY3Rpb24gaW50ZXJhY3Rpb24tY29weS1jb29yZGluYXRlc1wiXG4gICAgICAgIHsuLi5tZW51U3RhdGUuTXVpQnV0dG9uUHJvcHN9XG4gICAgICA+XG4gICAgICAgIENvcHkgQ29vcmRpbmF0ZXMgYXNcbiAgICAgICAgPEV4cGFuZE1vcmVJY29uIC8+XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxQb3BvdmVyIHsuLi5tZW51U3RhdGUuTXVpUG9wb3ZlclByb3BzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sXCI+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1oZWxwPVwiQ29waWVzIHRoZSBjb29yZGluYXRlcyB0byB5b3VyIGNsaXBib2FyZC5cIlxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDbGlwYm9hcmRIYW5kbGVyKHtcbiAgICAgICAgICAgICAgdGV4dDogYCR7bGF0fSAke2xvbn1gLFxuICAgICAgICAgICAgICBjbG9zZVBhcmVudCxcbiAgICAgICAgICAgICAgYWRkU25hY2ssXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wYWNpdHktNzVcIj5EZWNpbWFsIERlZ3JlZXMgKEREKTwvZGl2PlxuICAgICAgICAgICAgICB7bGF0ICsgJyAnICsgbG9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1oZWxwPVwiQ29waWVzIHRoZSBETVMgY29vcmRpbmF0ZXMgdG8geW91ciBjbGlwYm9hcmQuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2dlbmVyYXRlQ2xpcGJvYXJkSGFuZGxlcih7XG4gICAgICAgICAgICAgIHRleHQ6IGRtcyxcbiAgICAgICAgICAgICAgY2xvc2VQYXJlbnQsXG4gICAgICAgICAgICAgIGFkZFNuYWNrLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCI+RGVncmVlcyBNaW51dGVzIFNlY29uZHMgKERNUyk8L2Rpdj5cbiAgICAgICAgICAgICAge2Rtc31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIHttZ3JzID8gKFxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkYXRhLWhlbHA9XCJDb3BpZXMgdGhlIE1HUlMgY29vcmRpbmF0ZXMgdG8geW91ciBjbGlwYm9hcmQuXCJcbiAgICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDbGlwYm9hcmRIYW5kbGVyKHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBtZ3JzLFxuICAgICAgICAgICAgICAgIGNsb3NlUGFyZW50LFxuICAgICAgICAgICAgICAgIGFkZFNuYWNrLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wYWNpdHktNzVcIj5NR1JTPC9kaXY+XG4gICAgICAgICAgICAgICAge21ncnN9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1oZWxwPVwiQ29waWVzIHRoZSBVVE0vVVBTIGNvb3JkaW5hdGVzIHRvIHlvdXIgY2xpcGJvYXJkLlwiXG4gICAgICAgICAgICBvbkNsaWNrPXtnZW5lcmF0ZUNsaXBib2FyZEhhbmRsZXIoe1xuICAgICAgICAgICAgICB0ZXh0OiB1dG1VcHMsXG4gICAgICAgICAgICAgIGNsb3NlUGFyZW50LFxuICAgICAgICAgICAgICBhZGRTbmFjayxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3BhY2l0eS03NVwiPlVUTS9VUFM8L2Rpdj5cbiAgICAgICAgICAgICAge3V0bVVwc31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGRhdGEtaGVscD1cIkNvcGllcyB0aGUgV0tUIG9mIHRoZSBjb29yZGluYXRlcyB0byB5b3VyIGNsaXBib2FyZC5cIlxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDbGlwYm9hcmRIYW5kbGVyKHtcbiAgICAgICAgICAgICAgdGV4dDogYFBPSU5UICgke2xvbn0gJHtsYXR9KWAsXG4gICAgICAgICAgICAgIGNsb3NlUGFyZW50LFxuICAgICAgICAgICAgICBhZGRTbmFjayxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3BhY2l0eS03NVwiPldlbGwgS25vd24gKFdLVCk8L2Rpdj5cbiAgICAgICAgICAgICAgUE9JTlQgKHtsb259IHtsYXR9KVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Qb3BvdmVyPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKHJlbmRlcilcbiJdfQ==