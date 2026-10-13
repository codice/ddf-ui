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
var Restrictions = /** @class */ (function () {
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
export { Restrictions };
var Security = /** @class */ (function () {
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
export { Security };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3V0aWxzL3NlY3VyaXR5L3NlY3VyaXR5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBaUJBOzs7Ozs7Ozs7O0lBVUk7QUFDSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFPMUIsTUFBTSxDQUFOLElBQVksTUFLWDtBQUxELFdBQVksTUFBTTtJQUNoQixtQ0FBUSxDQUFBO0lBQ1IsbUNBQVEsQ0FBQTtJQUNSLHFDQUFTLENBQUE7SUFDVCxxQ0FBUyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLE1BQU0sS0FBTixNQUFNLFFBS2pCO0FBRUQ7SUFBQTtJQTRDQSxDQUFDO0lBOUJDLDBEQUEwRDtJQUNuRCxpQkFBSSxHQUFYLFVBQVksR0FBUTtRQUNsQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsS0FBSyxVQUFVO1lBQy9CLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUN6QyxZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzdELGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BFLGlCQUFpQixFQUNmLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtnQkFDM0QscUJBQXFCLEVBQ25CLEdBQUcsQ0FBQyxxQkFBcUIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzlELG9CQUFvQixFQUNsQixHQUFHLENBQUMsb0JBQW9CLElBQUksR0FB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SSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUM3QixDQUFDO0lBRWMsa0JBQVMsR0FBRyxVQUFDLENBQU8sRUFBRSxDQUFPO1FBQzFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzRCxDQUFDLENBQUE7SUFDSCxlQUFDO0NBQUEsQUEzR0QsSUEyR0M7U0EzR1ksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMDcpIEZJWE1FOiBDYW5ub3QgZmluZCBtb2R1bGUgJy4uLy4uL3NoYXJpbmcnIG9yIGl0cyBjb3JyZXNwby4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgeyBJdGVtIH0gZnJvbSAnLi4vLi4vc2hhcmluZydcblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXJcbiAqIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS5cbiAqIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5leHBvcnQgdHlwZSBFbnRyeSA9IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBhY2Nlc3M6IEFjY2Vzc1xufVxuXG5leHBvcnQgZW51bSBBY2Nlc3Mge1xuICBOb25lID0gMCxcbiAgUmVhZCA9IDEsXG4gIFdyaXRlID0gMixcbiAgU2hhcmUgPSAzLFxufVxuXG5leHBvcnQgY2xhc3MgUmVzdHJpY3Rpb25zIHtcbiAgb3duZXI6IHN0cmluZ1xuICBhY2Nlc3NHcm91cHM6IHN0cmluZ1tdXG4gIGFjY2Vzc0dyb3Vwc1JlYWQ6IHN0cmluZ1tdXG4gIGFjY2Vzc0luZGl2aWR1YWxzOiBzdHJpbmdbXVxuICBhY2Nlc3NJbmRpdmlkdWFsc1JlYWQ6IHN0cmluZ1tdXG4gIGFjY2Vzc0FkbWluaXN0cmF0b3JzOiBzdHJpbmdbXVxuXG4gIHN0YXRpYyByZWFkb25seSBHcm91cHNSZWFkID0gJ3NlY3VyaXR5LmFjY2Vzcy1ncm91cHMtcmVhZCdcbiAgc3RhdGljIHJlYWRvbmx5IEdyb3Vwc1dyaXRlID0gJ3NlY3VyaXR5LmFjY2Vzcy1ncm91cHMnXG4gIHN0YXRpYyByZWFkb25seSBJbmRpdmlkdWFsc1JlYWQgPSAnc2VjdXJpdHkuYWNjZXNzLWluZGl2aWR1YWxzLXJlYWQnXG4gIHN0YXRpYyByZWFkb25seSBJbmRpdmlkdWFsc1dyaXRlID0gJ3NlY3VyaXR5LmFjY2Vzcy1pbmRpdmlkdWFscydcbiAgc3RhdGljIHJlYWRvbmx5IEFjY2Vzc0FkbWluaXN0cmF0b3JzID0gJ3NlY3VyaXR5LmFjY2Vzcy1hZG1pbmlzdHJhdG9ycydcblxuICAvLyByZW1vdmUgdGhpcyB1Z2x5IGZ1bmN0aW9uIHdoZW4gZXZlcnl0aGluZyBpcyB0eXBlc2NyaXB0XG4gIHN0YXRpYyBmcm9tKG9iajogYW55KTogUmVzdHJpY3Rpb25zIHtcbiAgICBpZiAodHlwZW9mIG9iai5nZXQgIT09ICdmdW5jdGlvbicpXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvd25lcjogb2JqLm93bmVyIHx8IG9ialsnbWV0YWNhcmQub3duZXInXSxcbiAgICAgICAgYWNjZXNzR3JvdXBzOiBvYmouYWNjZXNzR3JvdXBzIHx8IG9ialt0aGlzLkdyb3Vwc1dyaXRlXSB8fCBbXSxcbiAgICAgICAgYWNjZXNzR3JvdXBzUmVhZDogb2JqLmFjY2Vzc0dyb3Vwc1JlYWQgfHwgb2JqW3RoaXMuR3JvdXBzUmVhZF0gfHwgW10sXG4gICAgICAgIGFjY2Vzc0luZGl2aWR1YWxzOlxuICAgICAgICAgIG9iai5hY2Nlc3NJbmRpdmlkdWFscyB8fCBvYmpbdGhpcy5JbmRpdmlkdWFsc1dyaXRlXSB8fCBbXSxcbiAgICAgICAgYWNjZXNzSW5kaXZpZHVhbHNSZWFkOlxuICAgICAgICAgIG9iai5hY2Nlc3NJbmRpdmlkdWFsc1JlYWQgfHwgb2JqW3RoaXMuSW5kaXZpZHVhbHNSZWFkXSB8fCBbXSxcbiAgICAgICAgYWNjZXNzQWRtaW5pc3RyYXRvcnM6XG4gICAgICAgICAgb2JqLmFjY2Vzc0FkbWluaXN0cmF0b3JzIHx8IG9ialt0aGlzLkFjY2Vzc0FkbWluaXN0cmF0b3JzXSB8fCBbXSxcbiAgICAgIH0gYXMgUmVzdHJpY3Rpb25zXG5cbiAgICByZXR1cm4ge1xuICAgICAgb3duZXI6IG9iai5nZXQoJ293bmVyJykgfHwgb2JqLmdldCgnbWV0YWNhcmQub3duZXInKSxcbiAgICAgIGFjY2Vzc0dyb3Vwczogb2JqLmdldCh0aGlzLkdyb3Vwc1dyaXRlKSB8fCBvYmouZ2V0KCdhY2Nlc3NHcm91cHMnKSB8fCBbXSxcbiAgICAgIGFjY2Vzc0dyb3Vwc1JlYWQ6XG4gICAgICAgIG9iai5nZXQodGhpcy5Hcm91cHNSZWFkKSB8fCBvYmouZ2V0KCdhY2Nlc3NHcm91cHNSZWFkJykgfHwgW10sXG4gICAgICBhY2Nlc3NJbmRpdmlkdWFsczpcbiAgICAgICAgb2JqLmdldCh0aGlzLkluZGl2aWR1YWxzV3JpdGUpIHx8IG9iai5nZXQoJ2FjY2Vzc0luZGl2aWR1YWxzJykgfHwgW10sXG4gICAgICBhY2Nlc3NJbmRpdmlkdWFsc1JlYWQ6XG4gICAgICAgIG9iai5nZXQodGhpcy5JbmRpdmlkdWFsc1JlYWQpIHx8IG9iai5nZXQoJ2FjY2Vzc0luZGl2aWR1YWxzUmVhZCcpIHx8IFtdLFxuICAgICAgYWNjZXNzQWRtaW5pc3RyYXRvcnM6XG4gICAgICAgIG9iai5nZXQodGhpcy5BY2Nlc3NBZG1pbmlzdHJhdG9ycykgfHxcbiAgICAgICAgb2JqLmdldCgnYWNjZXNzQWRtaW5pc3RyYXRvcnMnKSB8fFxuICAgICAgICBbXSxcbiAgICB9IGFzIFJlc3RyaWN0aW9uc1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZWN1cml0eSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzOiBSZXN0cmljdGlvbnNcblxuICBjb25zdHJ1Y3RvcihyZXM6IFJlc3RyaWN0aW9ucykge1xuICAgIHRoaXMucmVzID0gcmVzXG4gIH1cblxuICBwcml2YXRlIGNhbkFjY2Vzcyh1c2VyOiBhbnksIGFjY2Vzc0xldmVsOiBBY2Nlc3MpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5yZXMub3duZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5yZXMub3duZXIgPT09IHVzZXIuZ2V0VXNlcklkKCkgfHxcbiAgICAgIHRoaXMuZ2V0QWNjZXNzKHVzZXIpID49IGFjY2Vzc0xldmVsXG4gICAgKVxuICB9XG5cbiAgY2FuUmVhZCh1c2VyOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYW5BY2Nlc3ModXNlciwgQWNjZXNzLlJlYWQpXG4gIH1cblxuICBjYW5Xcml0ZSh1c2VyOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5jYW5BY2Nlc3ModXNlciwgQWNjZXNzLldyaXRlKVxuICB9XG5cbiAgY2FuU2hhcmUodXNlcjogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuY2FuQWNjZXNzKHVzZXIsIEFjY2Vzcy5TaGFyZSlcbiAgfVxuXG4gIGlzU2hhcmVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhKFxuICAgICAgdGhpcy5yZXMuYWNjZXNzR3JvdXBzLmxlbmd0aCA9PSAwICYmXG4gICAgICB0aGlzLnJlcy5hY2Nlc3NHcm91cHNSZWFkLmxlbmd0aCA9PSAwICYmXG4gICAgICB0aGlzLnJlcy5hY2Nlc3NJbmRpdmlkdWFscy5sZW5ndGggPT0gMCAmJlxuICAgICAgdGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHNSZWFkLmxlbmd0aCA9PSAwICYmXG4gICAgICAodGhpcy5yZXMuYWNjZXNzQWRtaW5pc3RyYXRvcnMubGVuZ3RoID09IDAgfHxcbiAgICAgICAgKHRoaXMucmVzLmFjY2Vzc0FkbWluaXN0cmF0b3JzLmxlbmd0aCA9PSAxICYmXG4gICAgICAgICAgdGhpcy5yZXMuYWNjZXNzQWRtaW5pc3RyYXRvcnNbMF0gPT09IHRoaXMucmVzLm93bmVyKSlcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGdldEdyb3VwQWNjZXNzKGdyb3VwOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5yZXMuYWNjZXNzR3JvdXBzLmluZGV4T2YoZ3JvdXApID4gLTEpIHtcbiAgICAgIHJldHVybiBBY2Nlc3MuV3JpdGVcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXMuYWNjZXNzR3JvdXBzUmVhZC5pbmRleE9mKGdyb3VwKSA+IC0xKSB7XG4gICAgICByZXR1cm4gQWNjZXNzLlJlYWRcbiAgICB9XG5cbiAgICByZXR1cm4gQWNjZXNzLk5vbmVcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SW5kaXZpZHVhbEFjY2Vzcyh1c2VySWQ6IHN0cmluZykge1xuICAgIGlmICh0aGlzLnJlcy5hY2Nlc3NBZG1pbmlzdHJhdG9ycy5pbmRleE9mKHVzZXJJZCkgPiAtMSkge1xuICAgICAgcmV0dXJuIEFjY2Vzcy5TaGFyZVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlcy5hY2Nlc3NJbmRpdmlkdWFscy5pbmRleE9mKHVzZXJJZCkgPiAtMSkge1xuICAgICAgcmV0dXJuIEFjY2Vzcy5Xcml0ZVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlcy5hY2Nlc3NJbmRpdmlkdWFsc1JlYWQuaW5kZXhPZih1c2VySWQpID4gLTEpIHtcbiAgICAgIHJldHVybiBBY2Nlc3MuUmVhZFxuICAgIH1cblxuICAgIHJldHVybiBBY2Nlc3MuTm9uZVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRBY2Nlc3ModXNlcjogYW55KTogQWNjZXNzIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICB0aGlzLmdldEluZGl2aWR1YWxBY2Nlc3ModXNlci5nZXRVc2VySWQoKSksXG4gICAgICAuLi51c2VyLmdldFJvbGVzKCkubWFwKChncm91cDogc3RyaW5nKSA9PiB0aGlzLmdldEdyb3VwQWNjZXNzKGdyb3VwKSlcbiAgICApXG4gIH1cblxuICBnZXRHcm91cHMoZm9yY2VJbmNsdWRlR3JvdXBzOiBzdHJpbmdbXSk6IEVudHJ5W10ge1xuICAgIHJldHVybiBfLnVuaW9uKFxuICAgICAgZm9yY2VJbmNsdWRlR3JvdXBzLFxuICAgICAgdGhpcy5yZXMuYWNjZXNzR3JvdXBzLFxuICAgICAgdGhpcy5yZXMuYWNjZXNzR3JvdXBzUmVhZFxuICAgIClcbiAgICAgIC5tYXAoKGdyb3VwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogZ3JvdXAsXG4gICAgICAgICAgYWNjZXNzOiB0aGlzLmdldEdyb3VwQWNjZXNzKGdyb3VwKSxcbiAgICAgICAgfSBhcyBFbnRyeVxuICAgICAgfSlcbiAgICAgIC5zb3J0KFNlY3VyaXR5LmNvbXBhcmVGbilcbiAgfVxuXG4gIGdldEluZGl2aWR1YWxzKCk6IEVudHJ5W10ge1xuICAgIHJldHVybiBfLnVuaW9uKFxuICAgICAgdGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHMsXG4gICAgICB0aGlzLnJlcy5hY2Nlc3NJbmRpdmlkdWFsc1JlYWQsXG4gICAgICB0aGlzLnJlcy5hY2Nlc3NBZG1pbmlzdHJhdG9yc1xuICAgIClcbiAgICAgIC5tYXAoKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHVzZXJJZCxcbiAgICAgICAgICBhY2Nlc3M6IHRoaXMuZ2V0SW5kaXZpZHVhbEFjY2Vzcyh1c2VySWQpLFxuICAgICAgICB9IGFzIEVudHJ5XG4gICAgICB9KVxuICAgICAgLnNvcnQoU2VjdXJpdHkuY29tcGFyZUZuKVxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgY29tcGFyZUZuID0gKGE6IEl0ZW0sIGI6IEl0ZW0pOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiBhLnZhbHVlIDwgYi52YWx1ZSA/IC0xIDogYS52YWx1ZSA+IGIudmFsdWUgPyAxIDogMFxuICB9XG59XG4iXX0=