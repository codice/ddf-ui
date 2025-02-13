import { __makeTemplateObject } from "tslib";
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
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import ExampleCoordinates from './example-coordinates';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  min-width: ", ";\n  padding: ", ";\n"], ["\n  overflow: auto;\n  min-width: ", ";\n  padding: ", ";\n"])), function (props) { return props.theme.minimumScreenSize; }, function (props) { return props.theme.minimumSpacing; });
var coordinateFormatOptions = [
    { label: 'Degrees, Minutes, Seconds', value: 'degrees' },
    { label: 'Decimal', value: 'decimal' },
    { label: 'MGRS', value: 'mgrs' },
    { label: 'UTM/UPS', value: 'utm' },
    { label: 'Well Known Text', value: 'wkt' },
];
var render = function (_a) {
    var coordFormat = _a.coordFormat, updateCoordFormat = _a.updateCoordFormat, autoPan = _a.autoPan, updateAutoPan = _a.updateAutoPan;
    return (React.createElement(Root, null,
        React.createElement(FormGroup, { row: true },
            React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { id: "auto-pan-checkbox", autoFocus: true, onKeyPress: function (e) {
                        if (e.key === 'Enter') {
                            updateAutoPan(e, !autoPan);
                        }
                    }, checked: autoPan, onChange: updateAutoPan, color: "primary", name: "autoPan" }), label: React.createElement(Typography, { variant: "body2" }, "Auto-Pan"), labelPlacement: "start", style: { paddingLeft: '10px' } })),
        React.createElement("div", { style: { padding: '0 10px' } },
            React.createElement(Typography, { variant: "body2" }, "Coordinate Format"),
            React.createElement(Select, { id: "coordinate-format-select", onChange: function (event) {
                    updateCoordFormat(event.target.value);
                }, value: coordFormat, variant: "outlined", margin: "dense", fullWidth: true, MenuProps: {
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                } }, coordinateFormatOptions.map(function (option) {
                return (React.createElement(MenuItem, { key: option.value, value: option.value },
                    React.createElement(Typography, { variant: "subtitle2" }, option.label)));
            }))),
        React.createElement(ExampleCoordinates, { selected: coordFormat })));
};
export default hot(module)(render);
export var testComponent = render;
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtc2V0dGluZ3MvcHJlc2VudGF0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLGtCQUFrQixNQUFNLHVCQUF1QixDQUFBO0FBQ3RELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sZ0JBQWdCLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0QsT0FBTyxRQUFRLE1BQU0sd0JBQXdCLENBQUE7QUFDN0MsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxRQUFRLE1BQU0sd0JBQXdCLENBQUE7QUFjN0MsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0lBQUEsb0NBRVIsRUFBd0MsZ0JBQzFDLEVBQXFDLEtBQ2pELEtBRmMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUE3QixDQUE2QixFQUMxQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixDQUNqRCxDQUFBO0FBRUQsSUFBTSx1QkFBdUIsR0FBRztJQUM5QixFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0lBQ3hELEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO0lBQ3RDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO0lBQ2hDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ2xDLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7Q0FDM0MsQ0FBQTtBQUVELElBQU0sTUFBTSxHQUFHLFVBQUMsRUFLUjtRQUpOLFdBQVcsaUJBQUEsRUFDWCxpQkFBaUIsdUJBQUEsRUFDakIsT0FBTyxhQUFBLEVBQ1AsYUFBYSxtQkFBQTtJQUViLE9BQU8sQ0FDTCxvQkFBQyxJQUFJO1FBQ0gsb0JBQUMsU0FBUyxJQUFDLEdBQUc7WUFDWixvQkFBQyxnQkFBZ0IsSUFDZixPQUFPLEVBQ0wsb0JBQUMsUUFBUSxJQUNQLEVBQUUsRUFBQyxtQkFBbUIsRUFDdEIsU0FBUyxRQUNULFVBQVUsRUFBRSxVQUFDLENBQUM7d0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTs0QkFDckIsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFBO3lCQUMzQjtvQkFDSCxDQUFDLEVBQ0QsT0FBTyxFQUFFLE9BQU8sRUFDaEIsUUFBUSxFQUFFLGFBQWEsRUFDdkIsS0FBSyxFQUFDLFNBQVMsRUFDZixJQUFJLEVBQUMsU0FBUyxHQUNkLEVBRUosS0FBSyxFQUFFLG9CQUFDLFVBQVUsSUFBQyxPQUFPLEVBQUMsT0FBTyxlQUFzQixFQUN4RCxjQUFjLEVBQUMsT0FBTyxFQUN0QixLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQzlCLENBQ1E7UUFFWiw2QkFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO1lBQy9CLG9CQUFDLFVBQVUsSUFBQyxPQUFPLEVBQUMsT0FBTyx3QkFBK0I7WUFDMUQsb0JBQUMsTUFBTSxJQUNMLEVBQUUsRUFBQywwQkFBMEIsRUFDN0IsUUFBUSxFQUFFLFVBQUMsS0FBMEM7b0JBQ25ELGlCQUFpQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3ZDLENBQUMsRUFDRCxLQUFLLEVBQUUsV0FBVyxFQUNsQixPQUFPLEVBQUMsVUFBVSxFQUNsQixNQUFNLEVBQUMsT0FBTyxFQUNkLFNBQVMsUUFDVCxTQUFTLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNaLFFBQVEsRUFBRSxRQUFRO3dCQUNsQixVQUFVLEVBQUUsTUFBTTtxQkFDbkI7b0JBQ0QsZUFBZSxFQUFFO3dCQUNmLFFBQVEsRUFBRSxLQUFLO3dCQUNmLFVBQVUsRUFBRSxNQUFNO3FCQUNuQjtpQkFDRixJQUVBLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07Z0JBQ2xDLE9BQU8sQ0FDTCxvQkFBQyxRQUFRLElBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO29CQUM5QyxvQkFBQyxVQUFVLElBQUMsT0FBTyxFQUFDLFdBQVcsSUFBRSxNQUFNLENBQUMsS0FBSyxDQUFjLENBQ2xELENBQ1osQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUNLLENBQ0w7UUFFTixvQkFBQyxrQkFBa0IsSUFBQyxRQUFRLEVBQUUsV0FBVyxHQUFJLENBQ3hDLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xDLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgRXhhbXBsZUNvb3JkaW5hdGVzIGZyb20gJy4vZXhhbXBsZS1jb29yZGluYXRlcydcbmltcG9ydCBGb3JtR3JvdXAgZnJvbSAnQG11aS9tYXRlcmlhbC9Gb3JtR3JvdXAnXG5pbXBvcnQgRm9ybUNvbnRyb2xMYWJlbCBmcm9tICdAbXVpL21hdGVyaWFsL0Zvcm1Db250cm9sTGFiZWwnXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnQG11aS9tYXRlcmlhbC9DaGVja2JveCdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBTZWxlY3QgZnJvbSAnQG11aS9tYXRlcmlhbC9TZWxlY3QnXG5pbXBvcnQgTWVudUl0ZW0gZnJvbSAnQG11aS9tYXRlcmlhbC9NZW51SXRlbSdcblxudHlwZSBQcm9wcyA9IHtcbiAgY29vcmRGb3JtYXQ6IHN0cmluZ1xuICB1cGRhdGVDb29yZEZvcm1hdDogKHNlbGVjdGVkOiBzdHJpbmcpID0+IHZvaWRcbiAgYXV0b1BhbjogYm9vbGVhblxuICB1cGRhdGVBdXRvUGFuOiAoXG4gICAgZXZlbnQ6XG4gICAgICB8IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+XG4gICAgICB8IFJlYWN0LktleWJvYXJkRXZlbnQ8SFRNTEJ1dHRvbkVsZW1lbnQ+LFxuICAgIGNoZWNrZWQ6IGJvb2xlYW5cbiAgKSA9PiB2b2lkXG59XG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2YFxuICBvdmVyZmxvdzogYXV0bztcbiAgbWluLXdpZHRoOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bVNjcmVlblNpemV9O1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bVNwYWNpbmd9O1xuYFxuXG5jb25zdCBjb29yZGluYXRlRm9ybWF0T3B0aW9ucyA9IFtcbiAgeyBsYWJlbDogJ0RlZ3JlZXMsIE1pbnV0ZXMsIFNlY29uZHMnLCB2YWx1ZTogJ2RlZ3JlZXMnIH0sXG4gIHsgbGFiZWw6ICdEZWNpbWFsJywgdmFsdWU6ICdkZWNpbWFsJyB9LFxuICB7IGxhYmVsOiAnTUdSUycsIHZhbHVlOiAnbWdycycgfSxcbiAgeyBsYWJlbDogJ1VUTS9VUFMnLCB2YWx1ZTogJ3V0bScgfSxcbiAgeyBsYWJlbDogJ1dlbGwgS25vd24gVGV4dCcsIHZhbHVlOiAnd2t0JyB9LFxuXVxuXG5jb25zdCByZW5kZXIgPSAoe1xuICBjb29yZEZvcm1hdCxcbiAgdXBkYXRlQ29vcmRGb3JtYXQsXG4gIGF1dG9QYW4sXG4gIHVwZGF0ZUF1dG9QYW4sXG59OiBQcm9wcykgPT4ge1xuICByZXR1cm4gKFxuICAgIDxSb290PlxuICAgICAgPEZvcm1Hcm91cCByb3c+XG4gICAgICAgIDxGb3JtQ29udHJvbExhYmVsXG4gICAgICAgICAgY29udHJvbD17XG4gICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgaWQ9XCJhdXRvLXBhbi1jaGVja2JveFwiXG4gICAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgICAgICBvbktleVByZXNzPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgICAgICAgdXBkYXRlQXV0b1BhbihlLCAhYXV0b1BhbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGNoZWNrZWQ9e2F1dG9QYW59XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt1cGRhdGVBdXRvUGFufVxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBuYW1lPVwiYXV0b1BhblwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICBsYWJlbD17PFR5cG9ncmFwaHkgdmFyaWFudD1cImJvZHkyXCI+QXV0by1QYW48L1R5cG9ncmFwaHk+fVxuICAgICAgICAgIGxhYmVsUGxhY2VtZW50PVwic3RhcnRcIlxuICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiAnMTBweCcgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvRm9ybUdyb3VwPlxuXG4gICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcwIDEwcHgnIH19PlxuICAgICAgICA8VHlwb2dyYXBoeSB2YXJpYW50PVwiYm9keTJcIj5Db29yZGluYXRlIEZvcm1hdDwvVHlwb2dyYXBoeT5cbiAgICAgICAgPFNlbGVjdFxuICAgICAgICAgIGlkPVwiY29vcmRpbmF0ZS1mb3JtYXQtc2VsZWN0XCJcbiAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICAgICAgdXBkYXRlQ29vcmRGb3JtYXQoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgIH19XG4gICAgICAgICAgdmFsdWU9e2Nvb3JkRm9ybWF0fVxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgbWFyZ2luPVwiZGVuc2VcIlxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgIE1lbnVQcm9wcz17e1xuICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7XG4gICAgICAgICAgICAgIHZlcnRpY2FsOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2xlZnQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjoge1xuICAgICAgICAgICAgICB2ZXJ0aWNhbDogJ3RvcCcsXG4gICAgICAgICAgICAgIGhvcml6b250YWw6ICdsZWZ0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtjb29yZGluYXRlRm9ybWF0T3B0aW9ucy5tYXAoKG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPE1lbnVJdGVtIGtleT17b3B0aW9uLnZhbHVlfSB2YWx1ZT17b3B0aW9uLnZhbHVlfT5cbiAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeSB2YXJpYW50PVwic3VidGl0bGUyXCI+e29wdGlvbi5sYWJlbH08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvU2VsZWN0PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxFeGFtcGxlQ29vcmRpbmF0ZXMgc2VsZWN0ZWQ9e2Nvb3JkRm9ybWF0fSAvPlxuICAgIDwvUm9vdD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShyZW5kZXIpXG5leHBvcnQgY29uc3QgdGVzdENvbXBvbmVudCA9IHJlbmRlclxuIl19