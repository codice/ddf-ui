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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1oaXN0b3J5L2NvbnRhaW5lci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBQzNCLE9BQU8sMkJBQTJCLE1BQU0sZ0JBQWdCLENBQUE7QUFFeEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDeEUsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFTbEM7SUFBOEIsbUNBQTZCO0lBQ3pELHlCQUFZLEtBQVk7UUFBeEIsWUFDRSxrQkFBTSxLQUFLLENBQUMsU0FPYjtRQXFDRCxhQUFPLEdBQUcsVUFBQyxLQUFVO1lBQ25CLElBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ25FLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxlQUFlLGlCQUFBLEVBQUUsQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQTtRQUNELDZCQUF1QixHQUFHOzs7Ozs7d0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTt3QkFDMUIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQTt3QkFDeEIsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFBO3dCQUMvQixxQkFBTSxLQUFLLENBQ3JCLG9DQUE2QixF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QyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUMvQyxDQUNILENBQUE7SUFDSCxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBekdELENBQThCLEtBQUssQ0FBQyxTQUFTLEdBeUc1QztBQUNELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vdXRpbHMvZmV0Y2gnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCdcbmltcG9ydCBNZXRhY2FyZEhpc3RvcnlQcmVzZW50YXRpb24gZnJvbSAnLi9wcmVzZW50YXRpb24nXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9UeXBlZFVzZXInXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG50eXBlIFByb3BzID0ge1xuICByZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxufVxudHlwZSBTdGF0ZSA9IHtcbiAgaGlzdG9yeTogYW55XG4gIHNlbGVjdGVkVmVyc2lvbjogYW55XG4gIGxvYWRpbmc6IGJvb2xlYW5cbn1cbmNsYXNzIE1ldGFjYXJkSGlzdG9yeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5tb2RlbCA9IHByb3BzLnJlc3VsdFxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICAgIHNlbGVjdGVkVmVyc2lvbjogdW5kZWZpbmVkLFxuICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICB9XG4gIH1cbiAgbW9kZWw6IExhenlRdWVyeVJlc3VsdFxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLmxvYWREYXRhKClcbiAgfVxuICBnZXRTb3VyY2VJZCgpIHtcbiAgICBjb25zdCBtZXRhY2FyZFNvdXJjZUlkID0gdGhpcy5tb2RlbC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzb3VyY2UtaWQnXVxuICAgIGNvbnN0IGhhcnZlc3RlZFNvdXJjZUlkID1cbiAgICAgIHRoaXMubW9kZWwucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snZXh0LmhhcnZlc3RlZC1mcm9tJ11cbiAgICByZXR1cm4gaGFydmVzdGVkU291cmNlSWQgfHwgbWV0YWNhcmRTb3VyY2VJZFxuICB9XG4gIGxvYWREYXRhKCkge1xuICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLm1vZGVsLnBsYWluLmlkXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLi9pbnRlcm5hbC9oaXN0b3J5LyR7aWR9LyR7dGhpcy5nZXRTb3VyY2VJZCgpfWApXG4gICAgICBpZiAoIXJlcy5vayB8fCByZXMuc3RhdHVzID09PSAyMDQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhpc3Rvcnk6IFtdLCBsb2FkaW5nOiBmYWxzZSB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCByZXMuanNvbigpXG4gICAgICBoaXN0b3J5LnNvcnQoKGhpc3RvcnlJdGVtMTogYW55LCBoaXN0b3J5SXRlbTI6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIChtb21lbnQudW5peChoaXN0b3J5SXRlbTIudmVyc2lvbmVkLnNlY29uZHMpIGFzIHVua25vd24gYXMgbnVtYmVyKSAtXG4gICAgICAgICAgKG1vbWVudC51bml4KGhpc3RvcnlJdGVtMS52ZXJzaW9uZWQuc2Vjb25kcykgYXMgdW5rbm93biBhcyBudW1iZXIpXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBoaXN0b3J5LmZvckVhY2goKGhpc3RvcnlJdGVtOiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgaGlzdG9yeUl0ZW0ubmljZURhdGUgPSBUeXBlZFVzZXJJbnN0YW5jZS5nZXRNb21lbnREYXRlKFxuICAgICAgICAgIG1vbWVudFxuICAgICAgICAgICAgLnVuaXgoaGlzdG9yeUl0ZW0udmVyc2lvbmVkLnNlY29uZHMpXG4gICAgICAgICAgICAudmFsdWVPZigpIGFzIHVua25vd24gYXMgc3RyaW5nXG4gICAgICAgIClcbiAgICAgICAgaGlzdG9yeUl0ZW0udmVyc2lvbk51bWJlciA9IGhpc3RvcnkubGVuZ3RoIC0gaW5kZXhcbiAgICAgIH0pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgaGlzdG9yeSwgbG9hZGluZzogZmFsc2UgfSlcbiAgICB9LCAxMDAwKVxuICB9XG4gIG9uQ2xpY2sgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdGVkVmVyc2lvbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJylcbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWRWZXJzaW9uIH0pXG4gIH1cbiAgcmV2ZXJ0VG9TZWxlY3RlZFZlcnNpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSlcbiAgICBjb25zdCBpZCA9IHRoaXMubW9kZWwucGxhaW4uaWRcbiAgICBjb25zdCByZXZlcnRJZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRWZXJzaW9uXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goXG4gICAgICBgLi9pbnRlcm5hbC9oaXN0b3J5L3JldmVydC8ke2lkfS8ke3JldmVydElkfS8ke3RoaXMuZ2V0U291cmNlSWQoKX1gXG4gICAgKVxuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSlcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgICAgICBtZXNzYWdlOiAnVW5hYmxlIHRvIHJldmVydCB0byB0aGUgc2VsZWN0ZWQgdmVyc2lvbicsXG4gICAgICAgIHNuYWNrUHJvcHM6IHtcbiAgICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLm1vZGVsLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXRhZ3MnXSA9IFsncmV2aXNpb24nXVxuICAgIHRoaXMubW9kZWwuc3luY1dpdGhQbGFpbigpXG4gICAgdGhpcy5tb2RlbC5yZWZyZXNoRGF0YU92ZXJOZXR3b3JrKClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vbGV0IHNvbHIgZmx1c2hcbiAgICAgIHRoaXMubW9kZWwuc3luY1dpdGhQbGFpbigpXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMubW9kZWwucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQtdGFncyddLmluZGV4T2YoXG4gICAgICAgICAgJ3JldmlzaW9uJ1xuICAgICAgICApID49IDBcbiAgICAgICkge1xuICAgICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdzbmFjaycsIHtcbiAgICAgICAgICBtZXNzYWdlOiBgV2FpdGluZyBvbiBSZXZlcnRlZCBEYXRhOiBJdCdzIHRha2luZyBhbiB1bnVzdWFsbHkgbG9uZyB0aW1lIGZvciB0aGUgcmV2ZXJ0ZWQgZGF0YSB0byBjb21lIGJhY2suICBUaGUgaXRlbSB3aWxsIGJlIHB1dCBpbiBhIHJldmlzaW9uLWxpa2Ugc3RhdGUgKHJlYWQtb25seSkgdW50aWwgZGF0YSByZXR1cm5zLmAsXG4gICAgICAgICAgc25hY2tQcm9wczoge1xuICAgICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgICBzZXZlcml0eTogJ3dhcm4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdGhpcy5sb2FkRGF0YSgpXG4gICAgfSwgMjAwMClcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBoaXN0b3J5LCBzZWxlY3RlZFZlcnNpb24sIGxvYWRpbmcgfSA9IHRoaXMuc3RhdGVcbiAgICByZXR1cm4gKFxuICAgICAgPE1ldGFjYXJkSGlzdG9yeVByZXNlbnRhdGlvblxuICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgIHJldmVydFRvU2VsZWN0ZWRWZXJzaW9uPXt0aGlzLnJldmVydFRvU2VsZWN0ZWRWZXJzaW9ufVxuICAgICAgICBoaXN0b3J5PXtoaXN0b3J5fVxuICAgICAgICBzZWxlY3RlZFZlcnNpb249e3NlbGVjdGVkVmVyc2lvbn1cbiAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgY2FuRWRpdD17VHlwZWRVc2VySW5zdGFuY2UuY2FuV3JpdGUodGhpcy5tb2RlbCl9XG4gICAgICAvPlxuICAgIClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoTWV0YWNhcmRIaXN0b3J5KVxuIl19