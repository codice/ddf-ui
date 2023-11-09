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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import withListenTo from '../backbone-container';
import fetch from '../utils/fetch';
import MetacardArchivePresentation from './presentation';
import wreqr from '../../js/wreqr';
var MetacardArchive = /** @class */ (function (_super) {
    __extends(MetacardArchive, _super);
    function MetacardArchive(props) {
        var _this = _super.call(this, props) || this;
        _this.onArchiveConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
            var body, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = JSON.stringify(this.state.collection.map(function (result) {
                            return result.plain.id;
                        }));
                        this.setState({ loading: true });
                        return [4 /*yield*/, fetch('./internal/metacards', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: body,
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            this.setState({ loading: false });
                            wreqr.vent.trigger('snack', {
                                message: 'Unable to archive the selected item(s).',
                                snackProps: {
                                    alertProps: {
                                        severity: 'error',
                                    },
                                },
                            });
                            return [2 /*return*/];
                        }
                        setTimeout(function () {
                            _this.setState({ isDeleted: true, loading: false });
                            _this.state.collection.forEach(function (result) {
                                result.plain.metacard.properties['metacard-tags'] = ['deleted'];
                                result.syncWithPlain();
                            });
                            _this.refreshResults();
                        }, 2000);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.onRestoreConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                this.setState({ loading: true });
                promises = this.state.collection.map(function (result) {
                    var metacardDeletedId = result.plain.metacard.properties['metacard.deleted.id'];
                    var metacardDeletedVersion = result.plain.metacard.properties['metacard.deleted.version'];
                    var storeId = result.plain.metacard.properties['source-id'];
                    return fetch("./internal/history/revert/".concat(metacardDeletedId, "/").concat(metacardDeletedVersion, "/").concat(storeId));
                });
                Promise.all(promises).then(function (responses) {
                    var isResponseOk = responses.every(function (resp) {
                        return resp.ok;
                    });
                    if (!isResponseOk) {
                        _this.setState({ loading: false });
                        wreqr.vent.trigger('snack', {
                            message: 'Unable to restore the selected item(s).',
                            snackProps: {
                                alertProps: {
                                    severity: 'error',
                                },
                            },
                        });
                    }
                    _this.state.collection.map(function (result) {
                        result.refreshDataOverNetwork();
                    });
                    setTimeout(function () {
                        _this.setState({ isDeleted: false, loading: false });
                    }, 2000);
                });
                return [2 /*return*/];
            });
        }); };
        _this.refreshResults = function () {
            _this.state.collection.forEach(function (result) {
                result.refreshDataOverNetwork();
            });
        };
        var collection = props.results;
        var isDeleted = collection.some(function (result) {
            return result.isDeleted();
        });
        _this.state = {
            collection: collection,
            isDeleted: isDeleted,
            loading: false,
        };
        return _this;
    }
    MetacardArchive.prototype.render = function () {
        var _a = this.state, isDeleted = _a.isDeleted, loading = _a.loading;
        return (React.createElement(MetacardArchivePresentation, { onArchiveConfirm: this.onArchiveConfirm, onRestoreConfirm: this.onRestoreConfirm, isDeleted: isDeleted, loading: loading }));
    };
    return MetacardArchive;
}(React.Component));
export default hot(module)(withListenTo(MetacardArchive));
//# sourceMappingURL=container.js.map