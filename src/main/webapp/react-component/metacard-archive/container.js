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
        return (_jsx(MetacardArchivePresentation, { onArchiveConfirm: this.onArchiveConfirm, onRestoreConfirm: this.onRestoreConfirm, isDeleted: isDeleted, loading: loading }));
    };
    return MetacardArchive;
}(React.Component));
export default withListenTo(MetacardArchive);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1hcmNoaXZlL2NvbnRhaW5lci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFHOUIsT0FBTyxZQUFtQyxNQUFNLHVCQUF1QixDQUFBO0FBQ3ZFLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFBO0FBQ2xDLE9BQU8sMkJBQTJCLE1BQU0sZ0JBQWdCLENBQUE7QUFDeEQsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFTbEM7SUFBOEIsbUNBQTZCO0lBQ3pELHlCQUFZLEtBQVk7UUFDdEIsWUFBQSxNQUFLLFlBQUMsS0FBSyxDQUFDLFNBQUE7UUFZZCxzQkFBZ0IsR0FBRzs7Ozs7O3dCQUNYLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNOzRCQUMvQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFBO3dCQUN4QixDQUFDLENBQUMsQ0FDSCxDQUFBO3dCQUNELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTt3QkFDcEIscUJBQU0sS0FBSyxDQUFDLHNCQUFzQixFQUFFO2dDQUM5QyxNQUFNLEVBQUUsUUFBUTtnQ0FDaEIsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFO2dDQUMvQyxJQUFJLE1BQUE7NkJBQ0wsQ0FBQyxFQUFBOzt3QkFKSSxHQUFHLEdBQUcsU0FJVjt3QkFDRixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsRUFB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VUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07Z0JBQ25DLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFBO1lBQ2pDLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBbkZDLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUE7UUFDaEMsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07WUFDdkMsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDM0IsQ0FBQyxDQUFDLENBQUE7UUFFRixLQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsVUFBVSxZQUFBO1lBQ1YsU0FBUyxXQUFBO1lBQ1QsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFBOztJQUNILENBQUM7SUEwRUQsZ0NBQU0sR0FBTjtRQUNRLElBQUEsS0FBeUIsSUFBSSxDQUFDLEtBQUssRUFBakMsU0FBUyxlQUFBLEVBQUUsT0FBTyxhQUFlLENBQUE7UUFDekMsT0FBTyxDQUNMLEtBQUMsMkJBQTJCLElBQzFCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFDdkMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUN2QyxTQUFTLEVBQUUsU0FBUyxFQUNwQixPQUFPLEVBQUUsT0FBTyxHQUNoQixDQUNILENBQUE7SUFDSCxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBbEdELENBQThCLEtBQUssQ0FBQyxTQUFTLEdBa0c1QztBQUNELGVBQWUsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB3aXRoTGlzdGVuVG8sIHsgV2l0aEJhY2tib25lUHJvcHMgfSBmcm9tICcuLi9iYWNrYm9uZS1jb250YWluZXInXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vdXRpbHMvZmV0Y2gnXG5pbXBvcnQgTWV0YWNhcmRBcmNoaXZlUHJlc2VudGF0aW9uIGZyb20gJy4vcHJlc2VudGF0aW9uJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uL2pzL3dyZXFyJ1xudHlwZSBQcm9wcyA9IHtcbiAgcmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0W11cbn0gJiBXaXRoQmFja2JvbmVQcm9wc1xudHlwZSBTdGF0ZSA9IHtcbiAgY29sbGVjdGlvbjogTGF6eVF1ZXJ5UmVzdWx0W11cbiAgaXNEZWxldGVkOiBib29sZWFuXG4gIGxvYWRpbmc6IGJvb2xlYW5cbn1cbmNsYXNzIE1ldGFjYXJkQXJjaGl2ZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHByb3BzLnJlc3VsdHNcbiAgICBjb25zdCBpc0RlbGV0ZWQgPSBjb2xsZWN0aW9uLnNvbWUoKHJlc3VsdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlc3VsdC5pc0RlbGV0ZWQoKVxuICAgIH0pXG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY29sbGVjdGlvbixcbiAgICAgIGlzRGVsZXRlZCxcbiAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgIH1cbiAgfVxuICBvbkFyY2hpdmVDb25maXJtID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShcbiAgICAgIHRoaXMuc3RhdGUuY29sbGVjdGlvbi5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzdWx0LnBsYWluLmlkXG4gICAgICB9KVxuICAgIClcbiAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcuL2ludGVybmFsL21ldGFjYXJkcycsIHtcbiAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHksXG4gICAgfSlcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzbmFjaycsIHtcbiAgICAgICAgbWVzc2FnZTogJ1VuYWJsZSB0byBhcmNoaXZlIHRoZSBzZWxlY3RlZCBpdGVtKHMpLicsXG4gICAgICAgIHNuYWNrUHJvcHM6IHtcbiAgICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0RlbGV0ZWQ6IHRydWUsIGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgICB0aGlzLnN0YXRlLmNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10gPSBbJ2RlbGV0ZWQnXVxuICAgICAgICByZXN1bHQuc3luY1dpdGhQbGFpbigpXG4gICAgICB9KVxuICAgICAgdGhpcy5yZWZyZXNoUmVzdWx0cygpXG4gICAgfSwgMjAwMClcbiAgfVxuICBvblJlc3RvcmVDb25maXJtID0gYXN5bmMgKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pXG4gICAgY29uc3QgcHJvbWlzZXMgPSB0aGlzLnN0YXRlLmNvbGxlY3Rpb24ubWFwKChyZXN1bHQpID0+IHtcbiAgICAgIGNvbnN0IG1ldGFjYXJkRGVsZXRlZElkID1cbiAgICAgICAgcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLmRlbGV0ZWQuaWQnXVxuICAgICAgY29uc3QgbWV0YWNhcmREZWxldGVkVmVyc2lvbiA9XG4gICAgICAgIHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLnZlcnNpb24nXVxuICAgICAgY29uc3Qgc3RvcmVJZCA9IHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzb3VyY2UtaWQnXVxuICAgICAgcmV0dXJuIGZldGNoKFxuICAgICAgICBgLi9pbnRlcm5hbC9oaXN0b3J5L3JldmVydC8ke21ldGFjYXJkRGVsZXRlZElkfS8ke21ldGFjYXJkRGVsZXRlZFZlcnNpb259LyR7c3RvcmVJZH1gXG4gICAgICApXG4gICAgfSlcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigocmVzcG9uc2VzOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGlzUmVzcG9uc2VPayA9IHJlc3BvbnNlcy5ldmVyeSgocmVzcDogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwLm9rXG4gICAgICB9KVxuICAgICAgaWYgKCFpc1Jlc3BvbnNlT2spIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgICAgICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gcmVzdG9yZSB0aGUgc2VsZWN0ZWQgaXRlbShzKS4nLFxuICAgICAgICAgIHNuYWNrUHJvcHM6IHtcbiAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLnN0YXRlLmNvbGxlY3Rpb24ubWFwKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmVzdWx0LnJlZnJlc2hEYXRhT3Zlck5ldHdvcmsoKVxuICAgICAgfSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNEZWxldGVkOiBmYWxzZSwgbG9hZGluZzogZmFsc2UgfSlcbiAgICAgIH0sIDIwMDApXG4gICAgfSlcbiAgfVxuICByZWZyZXNoUmVzdWx0cyA9ICgpID0+IHtcbiAgICB0aGlzLnN0YXRlLmNvbGxlY3Rpb24uZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICByZXN1bHQucmVmcmVzaERhdGFPdmVyTmV0d29yaygpXG4gICAgfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBpc0RlbGV0ZWQsIGxvYWRpbmcgfSA9IHRoaXMuc3RhdGVcbiAgICByZXR1cm4gKFxuICAgICAgPE1ldGFjYXJkQXJjaGl2ZVByZXNlbnRhdGlvblxuICAgICAgICBvbkFyY2hpdmVDb25maXJtPXt0aGlzLm9uQXJjaGl2ZUNvbmZpcm19XG4gICAgICAgIG9uUmVzdG9yZUNvbmZpcm09e3RoaXMub25SZXN0b3JlQ29uZmlybX1cbiAgICAgICAgaXNEZWxldGVkPXtpc0RlbGV0ZWR9XG4gICAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAvPlxuICAgIClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgd2l0aExpc3RlblRvKE1ldGFjYXJkQXJjaGl2ZSlcbiJdfQ==