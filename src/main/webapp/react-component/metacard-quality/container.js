import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx(MetacardQualityPresentation, { attributeValidation: attributeValidation, metacardValidation: metacardValidation, loading: loading }));
    };
    return MetacardQuality;
}(React.Component));
export default MetacardQuality;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1xdWFsaXR5L2NvbnRhaW5lci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTywyQkFBMkIsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4RCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQVNsQztJQUE4QixtQ0FBNkI7SUFDekQseUJBQVksS0FBWTtRQUN0QixZQUFBLE1BQUssWUFBQyxLQUFLLENBQUMsU0FBQTtRQW9DZCxhQUFPLEdBQUcsVUFBQyxHQUFRLEVBQUUsSUFBWTtZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNaLENBQUM7Z0JBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO29CQUNwQyxPQUFPLEVBQUUsNkJBQXNCLElBQUksdUJBQW9CO29CQUN2RCxVQUFVLEVBQUU7d0JBQ1YsVUFBVSxFQUFFOzRCQUNWLFFBQVEsRUFBRSxNQUFNO3lCQUNqQjtxQkFDRjtpQkFDRixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxFQUFFLENBQUE7WUFDWCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDbkIsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUNELHVCQUFpQixHQUFHLFVBQUMsa0JBQXVCO1lBQzFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFDLGVBQW9CO2dCQUM5QyxJQUNFLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLEVBQ3JFLENBQUM7b0JBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7b0JBQ25DLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFBO29CQUN4RCxJQUFJLFlBQVksRUFBRSxDQUFDO3dCQUNqQixlQUFlLENBQUMsU0FBUyxHQUFHOzRCQUMxQixHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7NEJBQ2hDLE9BQU8sRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3hELENBQUE7b0JBQ0gsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7UUFqRUMsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBQ3pCLEtBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxtQkFBbUIsRUFBRSxFQUFFO1lBQ3ZCLGtCQUFrQixFQUFFLEVBQUU7WUFDdEIsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFBOztJQUNILENBQUM7SUFFRCwyQ0FBaUIsR0FBakI7UUFBQSxpQkEwQkM7UUF6QkMsVUFBVSxDQUFDO1lBQ1QsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO1lBQ3RDLElBQU0sT0FBTyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDakUsSUFBTSxzQkFBc0IsR0FBRyxLQUFLLENBQ2xDLDhCQUF1QixVQUFVLGNBQUksT0FBTywwQkFBdUIsQ0FDcEUsQ0FBQTtZQUNELElBQU0scUJBQXFCLEdBQUcsS0FBSyxDQUNqQyw4QkFBdUIsVUFBVSxjQUFJLE9BQU8sZ0JBQWEsQ0FDMUQsQ0FBQTtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUMvRCxVQUFPLFNBQVM7Ozs7Z0NBQ2MscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FDNUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNaLFdBQVcsQ0FDWixFQUFBOzs0QkFISyxtQkFBbUIsR0FBRyxTQUczQjs0QkFDd0IscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUFqRSxrQkFBa0IsR0FBRyxTQUE0Qzs0QkFDckUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUE7NEJBQzFDLElBQUksQ0FBQyxRQUFRLENBQUM7Z0NBQ1osbUJBQW1CLHFCQUFBO2dDQUNuQixrQkFBa0Isb0JBQUE7Z0NBQ2xCLE9BQU8sRUFBRSxLQUFLOzZCQUNmLENBQUMsQ0FBQTs7OztpQkFDSCxDQUNGLENBQUE7UUFDSCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDVixDQUFDO0lBZ0NELGdDQUFNLEdBQU47UUFDUSxJQUFBLEtBQXVELElBQUksQ0FBQyxLQUFLLEVBQS9ELG1CQUFtQix5QkFBQSxFQUFFLGtCQUFrQix3QkFBQSxFQUFFLE9BQU8sYUFBZSxDQUFBO1FBQ3ZFLE9BQU8sQ0FDTCxLQUFDLDJCQUEyQixJQUMxQixtQkFBbUIsRUFBRSxtQkFBbUIsRUFDeEMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQ3RDLE9BQU8sRUFBRSxPQUFPLEdBQ2hCLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUEvRUQsQ0FBOEIsS0FBSyxDQUFDLFNBQVMsR0ErRTVDO0FBQ0QsZUFBZSxlQUFlLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vdXRpbHMvZmV0Y2gnXG5pbXBvcnQgTWV0YWNhcmRRdWFsaXR5UHJlc2VudGF0aW9uIGZyb20gJy4vcHJlc2VudGF0aW9uJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi9qcy93cmVxcidcbnR5cGUgUHJvcHMgPSB7XG4gIHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG59XG50eXBlIFN0YXRlID0ge1xuICBhdHRyaWJ1dGVWYWxpZGF0aW9uOiBhbnlcbiAgbWV0YWNhcmRWYWxpZGF0aW9uOiBhbnlcbiAgbG9hZGluZzogYm9vbGVhblxufVxuY2xhc3MgTWV0YWNhcmRRdWFsaXR5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzLCBTdGF0ZT4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLm1vZGVsID0gcHJvcHMucmVzdWx0XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGF0dHJpYnV0ZVZhbGlkYXRpb246IFtdLFxuICAgICAgbWV0YWNhcmRWYWxpZGF0aW9uOiBbXSxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgfVxuICB9XG4gIG1vZGVsOiBMYXp5UXVlcnlSZXN1bHRcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBtZXRhY2FyZElkID0gdGhpcy5tb2RlbC5wbGFpbi5pZFxuICAgICAgY29uc3Qgc3RvcmVJZCA9IHRoaXMubW9kZWwucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ11cbiAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbGlkYXRpb25SZXMgPSBmZXRjaChcbiAgICAgICAgYC4vaW50ZXJuYWwvbWV0YWNhcmQvJHttZXRhY2FyZElkfS8ke3N0b3JlSWR9L2F0dHJpYnV0ZS92YWxpZGF0aW9uYFxuICAgICAgKVxuICAgICAgY29uc3QgbWV0YWNhcmRWYWxpZGF0aW9uUmVzID0gZmV0Y2goXG4gICAgICAgIGAuL2ludGVybmFsL21ldGFjYXJkLyR7bWV0YWNhcmRJZH0vJHtzdG9yZUlkfS92YWxpZGF0aW9uYFxuICAgICAgKVxuICAgICAgUHJvbWlzZS5hbGwoW2F0dHJpYnV0ZVZhbGlkYXRpb25SZXMsIG1ldGFjYXJkVmFsaWRhdGlvblJlc10pLnRoZW4oXG4gICAgICAgIGFzeW5jIChyZXNwb25zZXMpID0+IHtcbiAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWxpZGF0aW9uID0gYXdhaXQgdGhpcy5nZXREYXRhKFxuICAgICAgICAgICAgcmVzcG9uc2VzWzBdLFxuICAgICAgICAgICAgJ0F0dHJpYnV0ZSdcbiAgICAgICAgICApXG4gICAgICAgICAgbGV0IG1ldGFjYXJkVmFsaWRhdGlvbiA9IGF3YWl0IHRoaXMuZ2V0RGF0YShyZXNwb25zZXNbMV0sICdNZXRhY2FyZCcpXG4gICAgICAgICAgdGhpcy5jaGVja0ZvckR1cGxpY2F0ZShtZXRhY2FyZFZhbGlkYXRpb24pXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhdHRyaWJ1dGVWYWxpZGF0aW9uLFxuICAgICAgICAgICAgbWV0YWNhcmRWYWxpZGF0aW9uLFxuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0sIDEwMDApXG4gIH1cbiAgZ2V0RGF0YSA9IChyZXM6IGFueSwgdHlwZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgICAgICBtZXNzYWdlOiBgVW5hYmxlIHRvIHJldHJpZXZlICR7dHlwZX0gVmFsaWRhdGlvbiBJc3N1ZXNgLFxuICAgICAgICBzbmFja1Byb3BzOiB7XG4gICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHJldHVybiBbXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKVxuICAgIH1cbiAgfVxuICBjaGVja0ZvckR1cGxpY2F0ZSA9IChtZXRhY2FyZFZhbGlkYXRpb246IGFueSkgPT4ge1xuICAgIG1ldGFjYXJkVmFsaWRhdGlvbi5mb3JFYWNoKCh2YWxpZGF0aW9uSXNzdWU6IGFueSkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICB2YWxpZGF0aW9uSXNzdWUubWVzc2FnZS5zdGFydHNXaXRoKCdEdXBsaWNhdGUgZGF0YSBmb3VuZCBpbiBjYXRhbG9nJylcbiAgICAgICkge1xuICAgICAgICB2YXIgaWRSZWdFeCA9IG5ldyBSZWdFeHAoJ3soLio/KX0nKVxuICAgICAgICB2YXIgZXhjdXRlZHJlZ2V4ID0gaWRSZWdFeC5leGVjKHZhbGlkYXRpb25Jc3N1ZS5tZXNzYWdlKVxuICAgICAgICBpZiAoZXhjdXRlZHJlZ2V4KSB7XG4gICAgICAgICAgdmFsaWRhdGlvbklzc3VlLmR1cGxpY2F0ZSA9IHtcbiAgICAgICAgICAgIGlkczogZXhjdXRlZHJlZ2V4WzFdLnNwbGl0KCcsICcpLFxuICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvbklzc3VlLm1lc3NhZ2Uuc3BsaXQoZXhjdXRlZHJlZ2V4WzFdKSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGF0dHJpYnV0ZVZhbGlkYXRpb24sIG1ldGFjYXJkVmFsaWRhdGlvbiwgbG9hZGluZyB9ID0gdGhpcy5zdGF0ZVxuICAgIHJldHVybiAoXG4gICAgICA8TWV0YWNhcmRRdWFsaXR5UHJlc2VudGF0aW9uXG4gICAgICAgIGF0dHJpYnV0ZVZhbGlkYXRpb249e2F0dHJpYnV0ZVZhbGlkYXRpb259XG4gICAgICAgIG1ldGFjYXJkVmFsaWRhdGlvbj17bWV0YWNhcmRWYWxpZGF0aW9ufVxuICAgICAgICBsb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgLz5cbiAgICApXG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IE1ldGFjYXJkUXVhbGl0eVxuIl19