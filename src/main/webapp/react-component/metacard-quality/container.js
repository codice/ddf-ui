import { __awaiter, __extends, __generator } from "tslib";
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
import { hot } from 'react-hot-loader';
import * as React from 'react';
import fetch from '../utils/fetch';
import MetacardQualityPresentation from './presentation';
import wreqr from '../../js/wreqr';
var MetacardQuality = /** @class */ (function (_super) {
    __extends(MetacardQuality, _super);
    function MetacardQuality(props) {
        var _this = _super.call(this, props) || this;
        _this.getData = function (res, type) {
            if (!res.ok) {
                ;
                wreqr.vent.trigger('snack', {
                    message: "Unable to retrieve ".concat(type, " Validation Issues"),
                    snackProps: {
                        alertProps: {
                            severity: 'warn',
                        },
                    },
                });
                return [];
            }
            else {
                return res.json();
            }
        };
        _this.checkForDuplicate = function (metacardValidation) {
            metacardValidation.forEach(function (validationIssue) {
                if (validationIssue.message.startsWith('Duplicate data found in catalog')) {
                    var idRegEx = new RegExp('{(.*?)}');
                    var excutedregex = idRegEx.exec(validationIssue.message);
                    if (excutedregex) {
                        validationIssue.duplicate = {
                            ids: excutedregex[1].split(', '),
                            message: validationIssue.message.split(excutedregex[1]),
                        };
                    }
                }
            });
        };
        _this.model = props.result;
        _this.state = {
            attributeValidation: [],
            metacardValidation: [],
            loading: true,
        };
        return _this;
    }
    MetacardQuality.prototype.componentDidMount = function () {
        var _this = this;
        setTimeout(function () {
            var metacardId = _this.model.plain.id;
            var storeId = _this.model.plain.metacard.properties['source-id'];
            var attributeValidationRes = fetch("./internal/metacard/".concat(metacardId, "/").concat(storeId, "/attribute/validation"));
            var metacardValidationRes = fetch("./internal/metacard/".concat(metacardId, "/").concat(storeId, "/validation"));
            Promise.all([attributeValidationRes, metacardValidationRes]).then(function (responses) { return __awaiter(_this, void 0, void 0, function () {
                var attributeValidation, metacardValidation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getData(responses[0], 'Attribute')];
                        case 1:
                            attributeValidation = _a.sent();
                            return [4 /*yield*/, this.getData(responses[1], 'Metacard')];
                        case 2:
                            metacardValidation = _a.sent();
                            this.checkForDuplicate(metacardValidation);
                            this.setState({
                                attributeValidation: attributeValidation,
                                metacardValidation: metacardValidation,
                                loading: false,
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        }, 1000);
    };
    MetacardQuality.prototype.render = function () {
        var _a = this.state, attributeValidation = _a.attributeValidation, metacardValidation = _a.metacardValidation, loading = _a.loading;
        return (React.createElement(MetacardQualityPresentation, { attributeValidation: attributeValidation, metacardValidation: metacardValidation, loading: loading }));
    };
    return MetacardQuality;
}(React.Component));
export default hot(module)(MetacardQuality);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1xdWFsaXR5L2NvbnRhaW5lci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTywyQkFBMkIsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQVNsQztJQUE4QixtQ0FBNkI7SUFDekQseUJBQVksS0FBWTtRQUF4QixZQUNFLGtCQUFNLEtBQUssQ0FBQyxTQU9iO1FBNkJELGFBQU8sR0FBRyxVQUFDLEdBQVEsRUFBRSxJQUFZO1lBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUNYLENBQUM7Z0JBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO29CQUNwQyxPQUFPLEVBQUUsNkJBQXNCLElBQUksdUJBQW9CO29CQUN2RCxVQUFVLEVBQUU7d0JBQ1YsVUFBVSxFQUFFOzRCQUNWLFFBQVEsRUFBRSxNQUFNO3lCQUNqQjtxQkFDRjtpQkFDRixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxFQUFFLENBQUE7YUFDVjtpQkFBTTtnQkFDTCxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTthQUNsQjtRQUNILENBQUMsQ0FBQTtRQUNELHVCQUFpQixHQUFHLFVBQUMsa0JBQXVCO1lBQzFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFDLGVBQW9CO2dCQUM5QyxJQUNFLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLEVBQ3JFO29CQUNBLElBQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUNuQyxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtvQkFDeEQsSUFBSSxZQUFZLEVBQUU7d0JBQ2hCLGVBQWUsQ0FBQyxTQUFTLEdBQUc7NEJBQzFCLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzs0QkFDaEMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDeEQsQ0FBQTtxQkFDRjtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBakVDLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQTtRQUN6QixLQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsbUJBQW1CLEVBQUUsRUFBRTtZQUN2QixrQkFBa0IsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQTs7SUFDSCxDQUFDO0lBRUQsMkNBQWlCLEdBQWpCO1FBQUEsaUJBMEJDO1FBekJDLFVBQVUsQ0FBQztZQUNULElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQTtZQUN0QyxJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ2pFLElBQU0sc0JBQXNCLEdBQUcsS0FBSyxDQUNsQyw4QkFBdUIsVUFBVSxjQUFJLE9BQU8sMEJBQXVCLENBQ3BFLENBQUE7WUFDRCxJQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FDakMsOEJBQXVCLFVBQVUsY0FBSSxPQUFPLGdCQUFhLENBQzFELENBQUE7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsc0JBQXNCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDL0QsVUFBTyxTQUFTOzs7O2dDQUNjLHFCQUFNLElBQUksQ0FBQyxPQUFPLENBQzVDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFDWixXQUFXLENBQ1osRUFBQTs7NEJBSEssbUJBQW1CLEdBQUcsU0FHM0I7NEJBQ3dCLHFCQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBakUsa0JBQWtCLEdBQUcsU0FBNEM7NEJBQ3JFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBOzRCQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dDQUNaLG1CQUFtQixxQkFBQTtnQ0FDbkIsa0JBQWtCLG9CQUFBO2dDQUNsQixPQUFPLEVBQUUsS0FBSzs2QkFDZixDQUFDLENBQUE7Ozs7aUJBQ0gsQ0FDRixDQUFBO1FBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQWdDRCxnQ0FBTSxHQUFOO1FBQ1EsSUFBQSxLQUF1RCxJQUFJLENBQUMsS0FBSyxFQUEvRCxtQkFBbUIseUJBQUEsRUFBRSxrQkFBa0Isd0JBQUEsRUFBRSxPQUFPLGFBQWUsQ0FBQTtRQUN2RSxPQUFPLENBQ0wsb0JBQUMsMkJBQTJCLElBQzFCLG1CQUFtQixFQUFFLG1CQUFtQixFQUN4QyxrQkFBa0IsRUFBRSxrQkFBa0IsRUFDdEMsT0FBTyxFQUFFLE9BQU8sR0FDaEIsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQS9FRCxDQUE4QixLQUFLLENBQUMsU0FBUyxHQStFNUM7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGZldGNoIGZyb20gJy4uL3V0aWxzL2ZldGNoJ1xuaW1wb3J0IE1ldGFjYXJkUXVhbGl0eVByZXNlbnRhdGlvbiBmcm9tICcuL3ByZXNlbnRhdGlvbidcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG50eXBlIFByb3BzID0ge1xuICByZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxufVxudHlwZSBTdGF0ZSA9IHtcbiAgYXR0cmlidXRlVmFsaWRhdGlvbjogYW55XG4gIG1ldGFjYXJkVmFsaWRhdGlvbjogYW55XG4gIGxvYWRpbmc6IGJvb2xlYW5cbn1cbmNsYXNzIE1ldGFjYXJkUXVhbGl0eSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5tb2RlbCA9IHByb3BzLnJlc3VsdFxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhdHRyaWJ1dGVWYWxpZGF0aW9uOiBbXSxcbiAgICAgIG1ldGFjYXJkVmFsaWRhdGlvbjogW10sXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgIH1cbiAgfVxuICBtb2RlbDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgbWV0YWNhcmRJZCA9IHRoaXMubW9kZWwucGxhaW4uaWRcbiAgICAgIGNvbnN0IHN0b3JlSWQgPSB0aGlzLm1vZGVsLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddXG4gICAgICBjb25zdCBhdHRyaWJ1dGVWYWxpZGF0aW9uUmVzID0gZmV0Y2goXG4gICAgICAgIGAuL2ludGVybmFsL21ldGFjYXJkLyR7bWV0YWNhcmRJZH0vJHtzdG9yZUlkfS9hdHRyaWJ1dGUvdmFsaWRhdGlvbmBcbiAgICAgIClcbiAgICAgIGNvbnN0IG1ldGFjYXJkVmFsaWRhdGlvblJlcyA9IGZldGNoKFxuICAgICAgICBgLi9pbnRlcm5hbC9tZXRhY2FyZC8ke21ldGFjYXJkSWR9LyR7c3RvcmVJZH0vdmFsaWRhdGlvbmBcbiAgICAgIClcbiAgICAgIFByb21pc2UuYWxsKFthdHRyaWJ1dGVWYWxpZGF0aW9uUmVzLCBtZXRhY2FyZFZhbGlkYXRpb25SZXNdKS50aGVuKFxuICAgICAgICBhc3luYyAocmVzcG9uc2VzKSA9PiB7XG4gICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsaWRhdGlvbiA9IGF3YWl0IHRoaXMuZ2V0RGF0YShcbiAgICAgICAgICAgIHJlc3BvbnNlc1swXSxcbiAgICAgICAgICAgICdBdHRyaWJ1dGUnXG4gICAgICAgICAgKVxuICAgICAgICAgIGxldCBtZXRhY2FyZFZhbGlkYXRpb24gPSBhd2FpdCB0aGlzLmdldERhdGEocmVzcG9uc2VzWzFdLCAnTWV0YWNhcmQnKVxuICAgICAgICAgIHRoaXMuY2hlY2tGb3JEdXBsaWNhdGUobWV0YWNhcmRWYWxpZGF0aW9uKVxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXR0cmlidXRlVmFsaWRhdGlvbixcbiAgICAgICAgICAgIG1ldGFjYXJkVmFsaWRhdGlvbixcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9LCAxMDAwKVxuICB9XG4gIGdldERhdGEgPSAocmVzOiBhbnksIHR5cGU6IHN0cmluZykgPT4ge1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzbmFjaycsIHtcbiAgICAgICAgbWVzc2FnZTogYFVuYWJsZSB0byByZXRyaWV2ZSAke3R5cGV9IFZhbGlkYXRpb24gSXNzdWVzYCxcbiAgICAgICAgc25hY2tQcm9wczoge1xuICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgIHNldmVyaXR5OiAnd2FybicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICByZXR1cm4gW11cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlcy5qc29uKClcbiAgICB9XG4gIH1cbiAgY2hlY2tGb3JEdXBsaWNhdGUgPSAobWV0YWNhcmRWYWxpZGF0aW9uOiBhbnkpID0+IHtcbiAgICBtZXRhY2FyZFZhbGlkYXRpb24uZm9yRWFjaCgodmFsaWRhdGlvbklzc3VlOiBhbnkpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgdmFsaWRhdGlvbklzc3VlLm1lc3NhZ2Uuc3RhcnRzV2l0aCgnRHVwbGljYXRlIGRhdGEgZm91bmQgaW4gY2F0YWxvZycpXG4gICAgICApIHtcbiAgICAgICAgdmFyIGlkUmVnRXggPSBuZXcgUmVnRXhwKCd7KC4qPyl9JylcbiAgICAgICAgdmFyIGV4Y3V0ZWRyZWdleCA9IGlkUmVnRXguZXhlYyh2YWxpZGF0aW9uSXNzdWUubWVzc2FnZSlcbiAgICAgICAgaWYgKGV4Y3V0ZWRyZWdleCkge1xuICAgICAgICAgIHZhbGlkYXRpb25Jc3N1ZS5kdXBsaWNhdGUgPSB7XG4gICAgICAgICAgICBpZHM6IGV4Y3V0ZWRyZWdleFsxXS5zcGxpdCgnLCAnKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25Jc3N1ZS5tZXNzYWdlLnNwbGl0KGV4Y3V0ZWRyZWdleFsxXSksXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBhdHRyaWJ1dGVWYWxpZGF0aW9uLCBtZXRhY2FyZFZhbGlkYXRpb24sIGxvYWRpbmcgfSA9IHRoaXMuc3RhdGVcbiAgICByZXR1cm4gKFxuICAgICAgPE1ldGFjYXJkUXVhbGl0eVByZXNlbnRhdGlvblxuICAgICAgICBhdHRyaWJ1dGVWYWxpZGF0aW9uPXthdHRyaWJ1dGVWYWxpZGF0aW9ufVxuICAgICAgICBtZXRhY2FyZFZhbGlkYXRpb249e21ldGFjYXJkVmFsaWRhdGlvbn1cbiAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgIC8+XG4gICAgKVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShNZXRhY2FyZFF1YWxpdHkpXG4iXX0=