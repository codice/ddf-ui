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
import { __awaiter, __generator } from "tslib";
import { hot } from 'react-hot-loader';
import * as React from 'react';
import Button from '@mui/material/Button';
import ProgressButton from '../progress-button';
import { useDialog } from '../../component/dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useSnack from '../../component/hooks/useSnack';
var render = function (props) {
    var onArchiveConfirm = props.onArchiveConfirm, onRestoreConfirm = props.onRestoreConfirm, isDeleted = props.isDeleted, loading = props.loading;
    var addSnack = useSnack();
    var dialogContext = useDialog();
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogTitle, null,
            isDeleted ? 'Restore' : 'Delete',
            " Item(s)"),
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null,
                "Are you sure you want to ",
                isDeleted ? 'restore' : 'delete',
                "?"),
            React.createElement(DialogContentText, null,
                "Doing so will ",
                isDeleted ? 'include' : 'remove',
                " the item(s)",
                ' ',
                isDeleted ? 'in' : 'from',
                " future search results.")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: function () {
                    dialogContext.setProps({ open: false });
                } }, "Cancel"),
            React.createElement(ProgressButton, { dataId: "archive-confirm", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, err_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 5, 6, 7]);
                                dialogContext.setProps({
                                    onClose: function (_event, reason) {
                                        if (reason === 'backdropClick' ||
                                            reason === 'escapeKeyDown') {
                                            return;
                                        }
                                        dialogContext.setProps({
                                            open: false,
                                        });
                                    },
                                });
                                if (!isDeleted) return [3 /*break*/, 2];
                                return [4 /*yield*/, onRestoreConfirm()];
                            case 1:
                                _a = _b.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, onArchiveConfirm()];
                            case 3:
                                _a = _b.sent();
                                _b.label = 4;
                            case 4:
                                _a;
                                addSnack("Successfully ".concat(isDeleted ? "restored" : "deleted"));
                                return [3 /*break*/, 7];
                            case 5:
                                err_1 = _b.sent();
                                console.log('Error: ', err_1);
                                addSnack("An error occurred while trying to ".concat(isDeleted ? 'restore' : 'delete', "."), {
                                    status: 'error',
                                });
                                return [3 /*break*/, 7];
                            case 6:
                                if (!loading)
                                    dialogContext.setProps({ open: false });
                                return [7 /*endfinally*/];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); }, variant: "contained", color: "primary", disabled: loading, loading: loading }, isDeleted ? 'Restore' : 'Delete'))));
};
export default hot(module)(render);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1hcmNoaXZlL3ByZXNlbnRhdGlvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUE7QUFDL0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2xELE9BQU8sYUFBYSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZELE9BQU8sYUFBYSxNQUFNLDZCQUE2QixDQUFBO0FBQ3ZELE9BQU8saUJBQWlCLE1BQU0saUNBQWlDLENBQUE7QUFDL0QsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxRQUFRLE1BQU0sZ0NBQWdDLENBQUE7QUFTckQsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFZO0lBQ2xCLElBQUEsZ0JBQWdCLEdBQTJDLEtBQUssaUJBQWhELEVBQUUsZ0JBQWdCLEdBQXlCLEtBQUssaUJBQTlCLEVBQUUsU0FBUyxHQUFjLEtBQUssVUFBbkIsRUFBRSxPQUFPLEdBQUssS0FBSyxRQUFWLENBQVU7SUFDeEUsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDM0IsSUFBTSxhQUFhLEdBQUcsU0FBUyxFQUFFLENBQUE7SUFDakMsT0FBTyxDQUNMO1FBQ0Usb0JBQUMsV0FBVztZQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRO3VCQUF1QjtRQUNyRSxvQkFBQyxhQUFhO1lBQ1osb0JBQUMsaUJBQWlCOztnQkFDVSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUTtvQkFDeEM7WUFDcEIsb0JBQUMsaUJBQWlCOztnQkFDRCxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUTs7Z0JBQWMsR0FBRztnQkFDL0QsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU07MENBQ1IsQ0FDTjtRQUNoQixvQkFBQyxhQUFhO1lBQ1osb0JBQUMsTUFBTSxJQUNMLE9BQU8sRUFBRTtvQkFDUCxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7Z0JBQ3pDLENBQUMsYUFHTTtZQUNULG9CQUFDLGNBQWMsSUFDYixNQUFNLEVBQUMsaUJBQWlCLEVBQ3hCLE9BQU8sRUFBRTs7Ozs7O2dDQUVMLGFBQWEsQ0FBQyxRQUFRLENBQUM7b0NBQ3JCLE9BQU8sRUFBRSxVQUFDLE1BQU0sRUFBRSxNQUFNO3dDQUN0QixJQUNFLE1BQU0sS0FBSyxlQUFlOzRDQUMxQixNQUFNLEtBQUssZUFBZSxFQUMxQjs0Q0FDQSxPQUFNO3lDQUNQO3dDQUNELGFBQWEsQ0FBQyxRQUFRLENBQUM7NENBQ3JCLElBQUksRUFBRSxLQUFLO3lDQUNaLENBQUMsQ0FBQTtvQ0FDSixDQUFDO2lDQUNGLENBQUMsQ0FBQTtxQ0FDRixTQUFTLEVBQVQsd0JBQVM7Z0NBQUcscUJBQU0sZ0JBQWdCLEVBQUUsRUFBQTs7Z0NBQXhCLEtBQUEsU0FBd0IsQ0FBQTs7b0NBQUcscUJBQU0sZ0JBQWdCLEVBQUUsRUFBQTs7Z0NBQXhCLEtBQUEsU0FBd0IsQ0FBQTs7O2dDQUEvRCxHQUErRDtnQ0FDL0QsUUFBUSxDQUFDLHVCQUFnQixTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQTs7OztnQ0FFOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBRyxDQUFDLENBQUE7Z0NBQzNCLFFBQVEsQ0FDTiw0Q0FDRSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxNQUMvQixFQUNIO29DQUNFLE1BQU0sRUFBRSxPQUFPO2lDQUNoQixDQUNGLENBQUE7OztnQ0FFRCxJQUFJLENBQUMsT0FBTztvQ0FBRSxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7Ozs7O3FCQUV4RCxFQUNELE9BQU8sRUFBQyxXQUFXLEVBQ25CLEtBQUssRUFBQyxTQUFTLEVBQ2YsUUFBUSxFQUFFLE9BQU8sRUFDakIsT0FBTyxFQUFFLE9BQU8sSUFFZixTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUNsQixDQUNILENBQ2YsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBQcm9ncmVzc0J1dHRvbiBmcm9tICcuLi9wcm9ncmVzcy1idXR0b24nXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvZGlhbG9nJ1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IERpYWxvZ0NvbnRlbnRUZXh0IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudFRleHQnXG5pbXBvcnQgRGlhbG9nVGl0bGUgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dUaXRsZSdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi8uLi9jb21wb25lbnQvaG9va3MvdXNlU25hY2snXG5cbnR5cGUgUHJvcHMgPSB7XG4gIG9uQXJjaGl2ZUNvbmZpcm06ICgpID0+IFByb21pc2U8dm9pZD5cbiAgb25SZXN0b3JlQ29uZmlybTogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICBpc0RlbGV0ZWQ6IGJvb2xlYW5cbiAgbG9hZGluZzogYm9vbGVhblxufVxuXG5jb25zdCByZW5kZXIgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgb25BcmNoaXZlQ29uZmlybSwgb25SZXN0b3JlQ29uZmlybSwgaXNEZWxldGVkLCBsb2FkaW5nIH0gPSBwcm9wc1xuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxEaWFsb2dUaXRsZT57aXNEZWxldGVkID8gJ1Jlc3RvcmUnIDogJ0RlbGV0ZSd9IEl0ZW0ocyk8L0RpYWxvZ1RpdGxlPlxuICAgICAgPERpYWxvZ0NvbnRlbnQ+XG4gICAgICAgIDxEaWFsb2dDb250ZW50VGV4dD5cbiAgICAgICAgICBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8ge2lzRGVsZXRlZCA/ICdyZXN0b3JlJyA6ICdkZWxldGUnfT9cbiAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgICAgPERpYWxvZ0NvbnRlbnRUZXh0PlxuICAgICAgICAgIERvaW5nIHNvIHdpbGwge2lzRGVsZXRlZCA/ICdpbmNsdWRlJyA6ICdyZW1vdmUnfSB0aGUgaXRlbShzKXsnICd9XG4gICAgICAgICAge2lzRGVsZXRlZCA/ICdpbicgOiAnZnJvbSd9IGZ1dHVyZSBzZWFyY2ggcmVzdWx0cy5cbiAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7IG9wZW46IGZhbHNlIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIENhbmNlbFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPFByb2dyZXNzQnV0dG9uXG4gICAgICAgICAgZGF0YUlkPVwiYXJjaGl2ZS1jb25maXJtXCJcbiAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgICBvbkNsb3NlOiAoX2V2ZW50LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uID09PSAnYmFja2Ryb3BDbGljaycgfHxcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uID09PSAnZXNjYXBlS2V5RG93bidcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgaXNEZWxldGVkID8gYXdhaXQgb25SZXN0b3JlQ29uZmlybSgpIDogYXdhaXQgb25BcmNoaXZlQ29uZmlybSgpXG4gICAgICAgICAgICAgIGFkZFNuYWNrKGBTdWNjZXNzZnVsbHkgJHtpc0RlbGV0ZWQgPyBgcmVzdG9yZWRgIDogYGRlbGV0ZWRgfWApXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnLCBlcnIpXG4gICAgICAgICAgICAgIGFkZFNuYWNrKFxuICAgICAgICAgICAgICAgIGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB0cnlpbmcgdG8gJHtcbiAgICAgICAgICAgICAgICAgIGlzRGVsZXRlZCA/ICdyZXN0b3JlJyA6ICdkZWxldGUnXG4gICAgICAgICAgICAgICAgfS5gLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIGlmICghbG9hZGluZykgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7IG9wZW46IGZhbHNlIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfX1cbiAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxuICAgICAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAgID5cbiAgICAgICAgICB7aXNEZWxldGVkID8gJ1Jlc3RvcmUnIDogJ0RlbGV0ZSd9XG4gICAgICAgIDwvUHJvZ3Jlc3NCdXR0b24+XG4gICAgICA8L0RpYWxvZ0FjdGlvbnM+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkocmVuZGVyKVxuIl19