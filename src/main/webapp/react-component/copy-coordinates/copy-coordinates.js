import { __assign, __awaiter, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsxs(_Fragment, { children: [_jsxs(Button, __assign({ className: "metacard-interaction interaction-copy-coordinates" }, menuState.MuiButtonProps, { children: ["Copy Coordinates as", _jsx(ExpandMoreIcon, {})] })), _jsx(Popover, __assign({}, menuState.MuiPopoverProps, { children: _jsxs("div", { className: "flex flex-col", children: [_jsx(Button, { "data-help": "Copies the coordinates to your clipboard.", onClick: generateClipboardHandler({
                                text: "".concat(lat, " ").concat(lon),
                                closeParent: closeParent,
                                addSnack: addSnack,
                            }), children: _jsxs("div", { children: [_jsx("div", { className: "opacity-75", children: "Decimal Degrees (DD)" }), lat + ' ' + lon] }) }), _jsx(Button, { "data-help": "Copies the DMS coordinates to your clipboard.", onClick: generateClipboardHandler({
                                text: dms,
                                closeParent: closeParent,
                                addSnack: addSnack,
                            }), children: _jsxs("div", { children: [_jsx("div", { className: "opacity-75", children: "Degrees Minutes Seconds (DMS)" }), dms] }) }), mgrs ? (_jsx(Button, { "data-help": "Copies the MGRS coordinates to your clipboard.", onClick: generateClipboardHandler({
                                text: mgrs,
                                closeParent: closeParent,
                                addSnack: addSnack,
                            }), children: _jsxs("div", { children: [_jsx("div", { className: "opacity-75", children: "MGRS" }), mgrs] }) })) : null, _jsx(Button, { "data-help": "Copies the UTM/UPS coordinates to your clipboard.", onClick: generateClipboardHandler({
                                text: utmUps,
                                closeParent: closeParent,
                                addSnack: addSnack,
                            }), children: _jsxs("div", { children: [_jsx("div", { className: "opacity-75", children: "UTM/UPS" }), utmUps] }) }), _jsx(Button, { "data-help": "Copies the WKT of the coordinates to your clipboard.", onClick: generateClipboardHandler({
                                text: "POINT (".concat(lon, " ").concat(lat, ")"),
                                closeParent: closeParent,
                                addSnack: addSnack,
                            }), children: _jsxs("div", { children: [_jsx("div", { className: "opacity-75", children: "Well Known (WKT)" }), "POINT (", lon, " ", lat, ")"] }) })] }) }))] }));
};
export default render;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS1jb29yZGluYXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvY29weS1jb29yZGluYXRlcy9jb3B5LWNvb3JkaW5hdGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFDcEUsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sZ0NBQWdDLENBQUE7QUFDM0QsT0FBTyxRQUFRLE1BQU0sZ0NBQWdDLENBQUE7QUFjckQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBUWpDO1FBUEMsSUFBSSxVQUFBLEVBQ0osV0FBVyxpQkFBQSxFQUNYLFFBQVEsY0FBQTtJQU1SLE9BQU87Ozs7OztvQkFFSCxxQkFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQTs7b0JBQXpDLFNBQXlDLENBQUE7b0JBQ3pDLFFBQVEsQ0FBQywrQkFBd0IsSUFBSSxDQUFFLEVBQUU7d0JBQ3ZDLFVBQVUsRUFBRTs0QkFDVixRQUFRLEVBQUUsU0FBUzt5QkFDcEI7cUJBQ0YsQ0FBQyxDQUFBOzs7O29CQUVGLFFBQVEsQ0FBQyx5QkFBa0IsSUFBSSxtQkFBZ0IsRUFBRTt3QkFDL0MsVUFBVSxFQUFFOzRCQUNWLFFBQVEsRUFBRSxPQUFPO3lCQUNsQjt3QkFDRCxtRkFBbUY7d0JBQ25GLE9BQU8sRUFBRSxLQUFLO3FCQUNmLENBQUMsQ0FBQTs7O29CQUVGLFdBQVcsRUFBRSxDQUFBOzs7OztTQUVoQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFZO0lBQ3BCLElBQUEsS0FBa0MsS0FBSyxDQUFDLGdCQUFnQixFQUF0RCxHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxNQUFNLFlBQTJCLENBQUE7SUFDdEQsSUFBQSxXQUFXLEdBQUssS0FBSyxZQUFWLENBQVU7SUFDN0IsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDaEMsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDM0IsT0FBTyxDQUNMLDhCQUNFLE1BQUMsTUFBTSxhQUNMLFNBQVMsRUFBQyxtREFBbUQsSUFDekQsU0FBUyxDQUFDLGNBQWMsc0NBRzVCLEtBQUMsY0FBYyxLQUFHLEtBQ1gsRUFDVCxLQUFDLE9BQU8sZUFBSyxTQUFTLENBQUMsZUFBZSxjQUNwQyxlQUFLLFNBQVMsRUFBQyxlQUFlLGFBQzVCLEtBQUMsTUFBTSxpQkFDSywyQ0FBMkMsRUFDckQsT0FBTyxFQUFFLHdCQUF3QixDQUFDO2dDQUNoQyxJQUFJLEVBQUUsVUFBRyxHQUFHLGNBQUksR0FBRyxDQUFFO2dDQUNyQixXQUFXLGFBQUE7Z0NBQ1gsUUFBUSxVQUFBOzZCQUNULENBQUMsWUFFRiwwQkFDRSxjQUFLLFNBQVMsRUFBQyxZQUFZLHFDQUEyQixFQUNyRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFDWixHQUNDLEVBQ1QsS0FBQyxNQUFNLGlCQUNLLCtDQUErQyxFQUN6RCxPQUFPLEVBQUUsd0JBQXdCLENBQUM7Z0NBQ2hDLElBQUksRUFBRSxHQUFHO2dDQUNULFdBQVcsYUFBQTtnQ0FDWCxRQUFRLFVBQUE7NkJBQ1QsQ0FBQyxZQUVGLDBCQUNFLGNBQUssU0FBUyxFQUFDLFlBQVksOENBQW9DLEVBQzlELEdBQUcsSUFDQSxHQUNDLEVBQ1IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNOLEtBQUMsTUFBTSxpQkFDSyxnREFBZ0QsRUFDMUQsT0FBTyxFQUFFLHdCQUF3QixDQUFDO2dDQUNoQyxJQUFJLEVBQUUsSUFBSTtnQ0FDVixXQUFXLGFBQUE7Z0NBQ1gsUUFBUSxVQUFBOzZCQUNULENBQUMsWUFFRiwwQkFDRSxjQUFLLFNBQVMsRUFBQyxZQUFZLHFCQUFXLEVBQ3JDLElBQUksSUFDRCxHQUNDLENBQ1YsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNSLEtBQUMsTUFBTSxpQkFDSyxtREFBbUQsRUFDN0QsT0FBTyxFQUFFLHdCQUF3QixDQUFDO2dDQUNoQyxJQUFJLEVBQUUsTUFBTTtnQ0FDWixXQUFXLGFBQUE7Z0NBQ1gsUUFBUSxVQUFBOzZCQUNULENBQUMsWUFFRiwwQkFDRSxjQUFLLFNBQVMsRUFBQyxZQUFZLHdCQUFjLEVBQ3hDLE1BQU0sSUFDSCxHQUNDLEVBQ1QsS0FBQyxNQUFNLGlCQUNLLHNEQUFzRCxFQUNoRSxPQUFPLEVBQUUsd0JBQXdCLENBQUM7Z0NBQ2hDLElBQUksRUFBRSxpQkFBVSxHQUFHLGNBQUksR0FBRyxNQUFHO2dDQUM3QixXQUFXLGFBQUE7Z0NBQ1gsUUFBUSxVQUFBOzZCQUNULENBQUMsWUFFRiwwQkFDRSxjQUFLLFNBQVMsRUFBQyxZQUFZLGlDQUF1QixhQUMxQyxHQUFHLE9BQUcsR0FBRyxTQUNiLEdBQ0MsSUFDTCxJQUNFLElBQ1QsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB7IHVzZU1lbnVTdGF0ZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9tZW51LXN0YXRlL21lbnUtc3RhdGUnXG5pbXBvcnQgUG9wb3ZlciBmcm9tICdAbXVpL21hdGVyaWFsL1BvcG92ZXInXG5pbXBvcnQgRXhwYW5kTW9yZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9FeHBhbmRNb3JlJ1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2NvbXBvbmVudC9ob29rcy91c2VTbmFjaydcbmltcG9ydCB7IEFkZFNuYWNrIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NuYWNrL3NuYWNrLnByb3ZpZGVyJ1xuXG50eXBlIFByb3BzID0ge1xuICBjb29yZGluYXRlVmFsdWVzOiB7XG4gICAgZG1zOiBzdHJpbmdcbiAgICBsYXQ6IHN0cmluZ1xuICAgIGxvbjogc3RyaW5nXG4gICAgbWdyczogc3RyaW5nXG4gICAgdXRtVXBzOiBzdHJpbmdcbiAgfVxuICBjbG9zZVBhcmVudDogKCkgPT4gdm9pZFxufVxuXG5jb25zdCBnZW5lcmF0ZUNsaXBib2FyZEhhbmRsZXIgPSAoe1xuICB0ZXh0LFxuICBjbG9zZVBhcmVudCxcbiAgYWRkU25hY2ssXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBjbG9zZVBhcmVudDogKCkgPT4gdm9pZFxuICBhZGRTbmFjazogQWRkU25hY2tcbn0pID0+IHtcbiAgcmV0dXJuIGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgICAgIGFkZFNuYWNrKGBDb3BpZWQgdG8gY2xpcGJvYXJkOiAke3RleHR9YCwge1xuICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgc2V2ZXJpdHk6ICdzdWNjZXNzJyxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYWRkU25hY2soYFVuYWJsZSB0byBjb3B5ICR7dGV4dH0gdG8gY2xpcGJvYXJkLmAsIHtcbiAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICB9LFxuICAgICAgICAvLyBMb25nZXIgdGltZW91dCB0byBnaXZlIHRoZSB1c2VyIGEgY2hhbmNlIHRvIGNvcHkgdGhlIGNvb3JkaW5hdGVzIGZyb20gdGhlIHNuYWNrLlxuICAgICAgICB0aW1lb3V0OiAxMDAwMCxcbiAgICAgIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNsb3NlUGFyZW50KClcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgcmVuZGVyID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7IGRtcywgbGF0LCBsb24sIG1ncnMsIHV0bVVwcyB9ID0gcHJvcHMuY29vcmRpbmF0ZVZhbHVlc1xuICBjb25zdCB7IGNsb3NlUGFyZW50IH0gPSBwcm9wc1xuICBjb25zdCBtZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9XCJtZXRhY2FyZC1pbnRlcmFjdGlvbiBpbnRlcmFjdGlvbi1jb3B5LWNvb3JkaW5hdGVzXCJcbiAgICAgICAgey4uLm1lbnVTdGF0ZS5NdWlCdXR0b25Qcm9wc31cbiAgICAgID5cbiAgICAgICAgQ29weSBDb29yZGluYXRlcyBhc1xuICAgICAgICA8RXhwYW5kTW9yZUljb24gLz5cbiAgICAgIDwvQnV0dG9uPlxuICAgICAgPFBvcG92ZXIgey4uLm1lbnVTdGF0ZS5NdWlQb3BvdmVyUHJvcHN9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2xcIj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkYXRhLWhlbHA9XCJDb3BpZXMgdGhlIGNvb3JkaW5hdGVzIHRvIHlvdXIgY2xpcGJvYXJkLlwiXG4gICAgICAgICAgICBvbkNsaWNrPXtnZW5lcmF0ZUNsaXBib2FyZEhhbmRsZXIoe1xuICAgICAgICAgICAgICB0ZXh0OiBgJHtsYXR9ICR7bG9ufWAsXG4gICAgICAgICAgICAgIGNsb3NlUGFyZW50LFxuICAgICAgICAgICAgICBhZGRTbmFjayxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3BhY2l0eS03NVwiPkRlY2ltYWwgRGVncmVlcyAoREQpPC9kaXY+XG4gICAgICAgICAgICAgIHtsYXQgKyAnICcgKyBsb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkYXRhLWhlbHA9XCJDb3BpZXMgdGhlIERNUyBjb29yZGluYXRlcyB0byB5b3VyIGNsaXBib2FyZC5cIlxuICAgICAgICAgICAgb25DbGljaz17Z2VuZXJhdGVDbGlwYm9hcmRIYW5kbGVyKHtcbiAgICAgICAgICAgICAgdGV4dDogZG1zLFxuICAgICAgICAgICAgICBjbG9zZVBhcmVudCxcbiAgICAgICAgICAgICAgYWRkU25hY2ssXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9wYWNpdHktNzVcIj5EZWdyZWVzIE1pbnV0ZXMgU2Vjb25kcyAoRE1TKTwvZGl2PlxuICAgICAgICAgICAgICB7ZG1zfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAge21ncnMgPyAoXG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRhdGEtaGVscD1cIkNvcGllcyB0aGUgTUdSUyBjb29yZGluYXRlcyB0byB5b3VyIGNsaXBib2FyZC5cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXtnZW5lcmF0ZUNsaXBib2FyZEhhbmRsZXIoe1xuICAgICAgICAgICAgICAgIHRleHQ6IG1ncnMsXG4gICAgICAgICAgICAgICAgY2xvc2VQYXJlbnQsXG4gICAgICAgICAgICAgICAgYWRkU25hY2ssXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3BhY2l0eS03NVwiPk1HUlM8L2Rpdj5cbiAgICAgICAgICAgICAgICB7bWdyc31cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkYXRhLWhlbHA9XCJDb3BpZXMgdGhlIFVUTS9VUFMgY29vcmRpbmF0ZXMgdG8geW91ciBjbGlwYm9hcmQuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2dlbmVyYXRlQ2xpcGJvYXJkSGFuZGxlcih7XG4gICAgICAgICAgICAgIHRleHQ6IHV0bVVwcyxcbiAgICAgICAgICAgICAgY2xvc2VQYXJlbnQsXG4gICAgICAgICAgICAgIGFkZFNuYWNrLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCI+VVRNL1VQUzwvZGl2PlxuICAgICAgICAgICAgICB7dXRtVXBzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGF0YS1oZWxwPVwiQ29waWVzIHRoZSBXS1Qgb2YgdGhlIGNvb3JkaW5hdGVzIHRvIHlvdXIgY2xpcGJvYXJkLlwiXG4gICAgICAgICAgICBvbkNsaWNrPXtnZW5lcmF0ZUNsaXBib2FyZEhhbmRsZXIoe1xuICAgICAgICAgICAgICB0ZXh0OiBgUE9JTlQgKCR7bG9ufSAke2xhdH0pYCxcbiAgICAgICAgICAgICAgY2xvc2VQYXJlbnQsXG4gICAgICAgICAgICAgIGFkZFNuYWNrLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcGFjaXR5LTc1XCI+V2VsbCBLbm93biAoV0tUKTwvZGl2PlxuICAgICAgICAgICAgICBQT0lOVCAoe2xvbn0ge2xhdH0pXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BvcG92ZXI+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iXX0=