import { __read, __spreadArray } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import _ from 'underscore';
export var Access;
(function (Access) {
    Access[Access["None"] = 0] = "None";
    Access[Access["Read"] = 1] = "Read";
    Access[Access["Write"] = 2] = "Write";
    Access[Access["Share"] = 3] = "Share";
})(Access || (Access = {}));
export var Restrictions = /** @class */ (function () {
    function Restrictions() {
    }
    // remove this ugly function when everything is typescript
    Restrictions.from = function (obj) {
        if (typeof obj.get !== 'function')
            return {
                owner: obj.owner || obj['metacard.owner'],
                accessGroups: obj.accessGroups || obj[this.GroupsWrite] || [],
                accessGroupsRead: obj.accessGroupsRead || obj[this.GroupsRead] || [],
                accessIndividuals: obj.accessIndividuals || obj[this.IndividualsWrite] || [],
                accessIndividualsRead: obj.accessIndividualsRead || obj[this.IndividualsRead] || [],
                accessAdministrators: obj.accessAdministrators || obj[this.AccessAdministrators] || [],
            };
        return {
            owner: obj.get('owner') || obj.get('metacard.owner'),
            accessGroups: obj.get(this.GroupsWrite) || obj.get('accessGroups') || [],
            accessGroupsRead: obj.get(this.GroupsRead) || obj.get('accessGroupsRead') || [],
            accessIndividuals: obj.get(this.IndividualsWrite) || obj.get('accessIndividuals') || [],
            accessIndividualsRead: obj.get(this.IndividualsRead) || obj.get('accessIndividualsRead') || [],
            accessAdministrators: obj.get(this.AccessAdministrators) ||
                obj.get('accessAdministrators') ||
                [],
        };
    };
    Restrictions.GroupsRead = 'security.access-groups-read';
    Restrictions.GroupsWrite = 'security.access-groups';
    Restrictions.IndividualsRead = 'security.access-individuals-read';
    Restrictions.IndividualsWrite = 'security.access-individuals';
    Restrictions.AccessAdministrators = 'security.access-administrators';
    return Restrictions;
}());
export var Security = /** @class */ (function () {
    function Security(res) {
        this.res = res;
    }
    Security.prototype.canAccess = function (user, accessLevel) {
        return (this.res.owner === undefined ||
            this.res.owner === user.getUserId() ||
            this.getAccess(user) >= accessLevel);
    };
    Security.prototype.canRead = function (user) {
        return this.canAccess(user, Access.Read);
    };
    Security.prototype.canWrite = function (user) {
        return this.canAccess(user, Access.Write);
    };
    Security.prototype.canShare = function (user) {
        return this.canAccess(user, Access.Share);
    };
    Security.prototype.isShared = function () {
        return !(this.res.accessGroups.length == 0 &&
            this.res.accessGroupsRead.length == 0 &&
            this.res.accessIndividuals.length == 0 &&
            this.res.accessIndividualsRead.length == 0 &&
            (this.res.accessAdministrators.length == 0 ||
                (this.res.accessAdministrators.length == 1 &&
                    this.res.accessAdministrators[0] === this.res.owner)));
    };
    Security.prototype.getGroupAccess = function (group) {
        if (this.res.accessGroups.indexOf(group) > -1) {
            return Access.Write;
        }
        if (this.res.accessGroupsRead.indexOf(group) > -1) {
            return Access.Read;
        }
        return Access.None;
    };
    Security.prototype.getIndividualAccess = function (userId) {
        if (this.res.accessAdministrators.indexOf(userId) > -1) {
            return Access.Share;
        }
        if (this.res.accessIndividuals.indexOf(userId) > -1) {
            return Access.Write;
        }
        if (this.res.accessIndividualsRead.indexOf(userId) > -1) {
            return Access.Read;
        }
        return Access.None;
    };
    Security.prototype.getAccess = function (user) {
        var _this = this;
        return Math.max.apply(Math, __spreadArray([this.getIndividualAccess(user.getUserId())], __read(user.getRoles().map(function (group) { return _this.getGroupAccess(group); })), false));
    };
    Security.prototype.getGroups = function (forceIncludeGroups) {
        var _this = this;
        return _.union(forceIncludeGroups, this.res.accessGroups, this.res.accessGroupsRead)
            .map(function (group) {
            return {
                value: group,
                access: _this.getGroupAccess(group),
            };
        })
            .sort(Security.compareFn);
    };
    Security.prototype.getIndividuals = function () {
        var _this = this;
        return _.union(this.res.accessIndividuals, this.res.accessIndividualsRead, this.res.accessAdministrators)
            .map(function (userId) {
            return {
                value: userId,
                access: _this.getIndividualAccess(userId),
            };
        })
            .sort(Security.compareFn);
    };
    Security.compareFn = function (a, b) {
        return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    };
    return Security;
}());
//# sourceMappingURL=security.js.map