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
//# sourceMappingURL=container.js.map