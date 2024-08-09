import { __extends } from "tslib";
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
import { Subscribable } from '../Base/base-classes'; // Import Subscribable from base-classes module
import { Sources } from './sources';
import fetch from '../../../react-component/utils/fetch/fetch';
import { Configuration } from './configuration';
import { MetacardDefinitions } from './metacard-definitions';
var StartupData = /** @class */ (function (_super) {
    __extends(StartupData, _super);
    function StartupData() {
        var _this = _super.call(this) || this;
        _this.Configuration = new Configuration(_this);
        _this.Sources = new Sources(_this);
        _this.MetacardDefinitions = new MetacardDefinitions(_this);
        _this.fetch();
        return _this;
    }
    StartupData.prototype.handleEnhancedRoles = function () {
        var _a;
        /**
         *  The "path=/" part is so the cookie is included / available to all domain paths
         */
        document.cookie = "useElevatedRights=".concat(((_a = this.data) === null || _a === void 0 ? void 0 : _a.user.preferences.actingRole) === 'enhanced', "; path=/");
    };
    StartupData.prototype.fetch = function () {
        var _this = this;
        fetch('./internal/compose/startup')
            .then(function (response) { return response.json(); })
            .then(function (startupPayload) {
            _this.data = startupPayload;
            _this.handleEnhancedRoles();
            _this._notifySubscribers({ thing: 'fetched', args: startupPayload });
        });
    };
    return StartupData;
}(Subscribable));
export { StartupData };
export var StartupDataStore = new StartupData();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFBLENBQUMsK0NBQStDO0FBRW5HLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDbkMsT0FBTyxLQUFLLE1BQU0sNENBQTRDLENBQUE7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQy9DLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRTVEO0lBQWlDLCtCQUcvQjtJQWVBO1FBQUEsWUFDRSxpQkFBTyxTQUtSO1FBSkMsS0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxLQUFJLENBQUMsQ0FBQTtRQUM1QyxLQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFBO1FBQ2hDLEtBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLG1CQUFtQixDQUFDLEtBQUksQ0FBQyxDQUFBO1FBQ3hELEtBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7SUFDZCxDQUFDO0lBQ0QseUNBQW1CLEdBQW5COztRQUNFOztXQUVHO1FBQ0gsUUFBUSxDQUFDLE1BQU0sR0FBRyw0QkFDaEIsQ0FBQSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxNQUFLLFVBQVUsYUFDN0MsQ0FBQTtJQUNaLENBQUM7SUFDRCwyQkFBSyxHQUFMO1FBQUEsaUJBUUM7UUFQQyxLQUFLLENBQUMsNEJBQTRCLENBQUM7YUFDaEMsSUFBSSxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFmLENBQWUsQ0FBQzthQUNuQyxJQUFJLENBQUMsVUFBQyxjQUFrQztZQUN2QyxLQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQTtZQUMxQixLQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtZQUMxQixLQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBO1FBQ3JFLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQTFDRCxDQUFpQyxZQUFZLEdBMEM1Qzs7QUFFRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuLi9CYXNlL2Jhc2UtY2xhc3NlcycgLy8gSW1wb3J0IFN1YnNjcmliYWJsZSBmcm9tIGJhc2UtY2xhc3NlcyBtb2R1bGVcbmltcG9ydCB7IFN0YXJ0dXBQYXlsb2FkVHlwZSB9IGZyb20gJy4vc3RhcnR1cC50eXBlcydcbmltcG9ydCB7IFNvdXJjZXMgfSBmcm9tICcuL3NvdXJjZXMnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoL2ZldGNoJ1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29uZmlndXJhdGlvbidcbmltcG9ydCB7IE1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuL21ldGFjYXJkLWRlZmluaXRpb25zJ1xuXG5leHBvcnQgY2xhc3MgU3RhcnR1cERhdGEgZXh0ZW5kcyBTdWJzY3JpYmFibGU8e1xuICB0aGluZzogJ2ZldGNoZWQnXG4gIGFyZ3M6IFN0YXJ0dXBQYXlsb2FkVHlwZVxufT4ge1xuICBkYXRhPzogT21pdDxcbiAgICBTdGFydHVwUGF5bG9hZFR5cGUsXG4gICAgfCAnc291cmNlcydcbiAgICB8ICdoYXJ2ZXN0ZWRTb3VyY2VzJ1xuICAgIHwgJ2xvY2FsU291cmNlSWQnXG4gICAgfCAnY29uZmlnJ1xuICAgIHwgJ3BsYXRmb3JtVUlDb25maWd1cmF0aW9uJ1xuICAgIHwgJ2F0dHJpYnV0ZU1hcCdcbiAgICB8ICdzb3J0ZWRBdHRyaWJ1dGVzJ1xuICAgIHwgJ21ldGFjYXJkVHlwZXMnXG4gID5cbiAgU291cmNlczogU291cmNlc1xuICBDb25maWd1cmF0aW9uOiBDb25maWd1cmF0aW9uXG4gIE1ldGFjYXJkRGVmaW5pdGlvbnM6IE1ldGFjYXJkRGVmaW5pdGlvbnNcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuQ29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKHRoaXMpXG4gICAgdGhpcy5Tb3VyY2VzID0gbmV3IFNvdXJjZXModGhpcylcbiAgICB0aGlzLk1ldGFjYXJkRGVmaW5pdGlvbnMgPSBuZXcgTWV0YWNhcmREZWZpbml0aW9ucyh0aGlzKVxuICAgIHRoaXMuZmV0Y2goKVxuICB9XG4gIGhhbmRsZUVuaGFuY2VkUm9sZXMoKSB7XG4gICAgLyoqXG4gICAgICogIFRoZSBcInBhdGg9L1wiIHBhcnQgaXMgc28gdGhlIGNvb2tpZSBpcyBpbmNsdWRlZCAvIGF2YWlsYWJsZSB0byBhbGwgZG9tYWluIHBhdGhzXG4gICAgICovXG4gICAgZG9jdW1lbnQuY29va2llID0gYHVzZUVsZXZhdGVkUmlnaHRzPSR7XG4gICAgICB0aGlzLmRhdGE/LnVzZXIucHJlZmVyZW5jZXMuYWN0aW5nUm9sZSA9PT0gJ2VuaGFuY2VkJ1xuICAgIH07IHBhdGg9L2BcbiAgfVxuICBmZXRjaCgpIHtcbiAgICBmZXRjaCgnLi9pbnRlcm5hbC9jb21wb3NlL3N0YXJ0dXAnKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbigoc3RhcnR1cFBheWxvYWQ6IFN0YXJ0dXBQYXlsb2FkVHlwZSkgPT4ge1xuICAgICAgICB0aGlzLmRhdGEgPSBzdGFydHVwUGF5bG9hZFxuICAgICAgICB0aGlzLmhhbmRsZUVuaGFuY2VkUm9sZXMoKVxuICAgICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnZmV0Y2hlZCcsIGFyZ3M6IHN0YXJ0dXBQYXlsb2FkIH0pXG4gICAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBTdGFydHVwRGF0YVN0b3JlID0gbmV3IFN0YXJ0dXBEYXRhKClcbiJdfQ==