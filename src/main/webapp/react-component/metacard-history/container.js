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
import moment from 'moment';
import MetacardHistoryPresentation from './presentation';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import wreqr from '../../js/wreqr';
var MetacardHistory = /** @class */ (function (_super) {
    __extends(MetacardHistory, _super);
    function MetacardHistory(props) {
        var _this = _super.call(this, props) || this;
        _this.onClick = function (event) {
            var selectedVersion = event.currentTarget.getAttribute('data-id');
            _this.setState({ selectedVersion: selectedVersion });
        };
        _this.revertToSelectedVersion = function () { return __awaiter(_this, void 0, void 0, function () {
            var id, revertId, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({ loading: true });
                        id = this.model.plain.id;
                        revertId = this.state.selectedVersion;
                        return [4 /*yield*/, fetch("./internal/history/revert/".concat(id, "/").concat(revertId, "/").concat(this.getSourceId()))];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            this.setState({ loading: false });
                            wreqr.vent.trigger('snack', {
                                message: 'Unable to revert to the selected version',
                                snackProps: {
                                    alertProps: {
                                        severity: 'error',
                                    },
                                },
                            });
                            return [2 /*return*/];
                        }
                        this.model.plain.metacard.properties['metacard-tags'] = ['revision'];
                        this.model.syncWithPlain();
                        this.model.refreshDataOverNetwork();
                        setTimeout(function () {
                            //let solr flush
                            _this.model.syncWithPlain();
                            if (_this.model.plain.metacard.properties['metacard-tags'].indexOf('revision') >= 0) {
                                ;
                                wreqr.vent.trigger('snack', {
                                    message: "Waiting on Reverted Data: It's taking an unusually long time for the reverted data to come back.  The item will be put in a revision-like state (read-only) until data returns.",
                                    snackProps: {
                                        alertProps: {
                                            severity: 'warn',
                                        },
                                    },
                                });
                            }
                            _this.loadData();
                        }, 2000);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.model = props.result;
        _this.state = {
            history: [],
            selectedVersion: undefined,
            loading: true,
        };
        return _this;
    }
    MetacardHistory.prototype.componentDidMount = function () {
        this.loadData();
    };
    MetacardHistory.prototype.getSourceId = function () {
        var metacardSourceId = this.model.plain.metacard.properties['source-id'];
        var harvestedSourceId = this.model.plain.metacard.properties['ext.harvested-from'];
        return harvestedSourceId || metacardSourceId;
    };
    MetacardHistory.prototype.loadData = function () {
        var _this = this;
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var id, res, history;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.model.plain.id;
                        return [4 /*yield*/, fetch("./internal/history/".concat(id, "/").concat(this.getSourceId()))];
                    case 1:
                        res = _a.sent();
                        if (!res.ok || res.status === 204) {
                            this.setState({ history: [], loading: false });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, res.json()];
                    case 2:
                        history = _a.sent();
                        history.sort(function (historyItem1, historyItem2) {
                            return (moment.unix(historyItem2.versioned.seconds) -
                                moment.unix(historyItem1.versioned.seconds));
                        });
                        history.forEach(function (historyItem, index) {
                            historyItem.niceDate = TypedUserInstance.getMomentDate(moment
                                .unix(historyItem.versioned.seconds)
                                .valueOf());
                            historyItem.versionNumber = history.length - index;
                        });
                        this.setState({ history: history, loading: false });
                        return [2 /*return*/];
                }
            });
        }); }, 1000);
    };
    MetacardHistory.prototype.render = function () {
        var _a = this.state, history = _a.history, selectedVersion = _a.selectedVersion, loading = _a.loading;
        return (React.createElement(MetacardHistoryPresentation, { onClick: this.onClick, revertToSelectedVersion: this.revertToSelectedVersion, history: history, selectedVersion: selectedVersion, loading: loading, canEdit: TypedUserInstance.canWrite(this.model) }));
    };
    return MetacardHistory;
}(React.Component));
export default hot(module)(MetacardHistory);
//# sourceMappingURL=container.js.map