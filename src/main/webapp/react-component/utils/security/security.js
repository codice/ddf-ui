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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3V0aWxzL3NlY3VyaXR5L3NlY3VyaXR5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBaUJBOzs7Ozs7Ozs7O0lBVUk7QUFDSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFPMUIsTUFBTSxDQUFOLElBQVksTUFLWDtBQUxELFdBQVksTUFBTTtJQUNoQixtQ0FBUSxDQUFBO0lBQ1IsbUNBQVEsQ0FBQTtJQUNSLHFDQUFTLENBQUE7SUFDVCxxQ0FBUyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLE1BQU0sS0FBTixNQUFNLFFBS2pCO0FBRUQ7SUFBQTtJQTRDQSxDQUFDO0lBOUJDLDBEQUEwRDtJQUNuRCxpQkFBSSxHQUFYLFVBQVksR0FBUTtRQUNsQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsS0FBSyxVQUFVO1lBQy9CLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUN6QyxZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzdELGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BFLGlCQUFpQixFQUNmLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtnQkFDM0QscUJBQXFCLEVBQ25CLEdBQUcsQ0FBQyxxQkFBcUIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzlELG9CQUFvQixFQUNsQixHQUFHLENBQUMsb0JBQW9CLElBQUksR0FB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LENBQU8sRUFBRSxDQUFPO1FBQzFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzRCxDQUFDLENBQUE7SUFDSCxlQUFDO0NBQUEsQUEzR0QsSUEyR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzA3KSBGSVhNRTogQ2Fubm90IGZpbmQgbW9kdWxlICcuLi8uLi9zaGFyaW5nJyBvciBpdHMgY29ycmVzcG8uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uLy4uL3NoYXJpbmcnXG5cbi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyXG4gKiB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuXG4gKiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuZXhwb3J0IHR5cGUgRW50cnkgPSB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgYWNjZXNzOiBBY2Nlc3Ncbn1cblxuZXhwb3J0IGVudW0gQWNjZXNzIHtcbiAgTm9uZSA9IDAsXG4gIFJlYWQgPSAxLFxuICBXcml0ZSA9IDIsXG4gIFNoYXJlID0gMyxcbn1cblxuZXhwb3J0IGNsYXNzIFJlc3RyaWN0aW9ucyB7XG4gIG93bmVyOiBzdHJpbmdcbiAgYWNjZXNzR3JvdXBzOiBzdHJpbmdbXVxuICBhY2Nlc3NHcm91cHNSZWFkOiBzdHJpbmdbXVxuICBhY2Nlc3NJbmRpdmlkdWFsczogc3RyaW5nW11cbiAgYWNjZXNzSW5kaXZpZHVhbHNSZWFkOiBzdHJpbmdbXVxuICBhY2Nlc3NBZG1pbmlzdHJhdG9yczogc3RyaW5nW11cblxuICBzdGF0aWMgcmVhZG9ubHkgR3JvdXBzUmVhZCA9ICdzZWN1cml0eS5hY2Nlc3MtZ3JvdXBzLXJlYWQnXG4gIHN0YXRpYyByZWFkb25seSBHcm91cHNXcml0ZSA9ICdzZWN1cml0eS5hY2Nlc3MtZ3JvdXBzJ1xuICBzdGF0aWMgcmVhZG9ubHkgSW5kaXZpZHVhbHNSZWFkID0gJ3NlY3VyaXR5LmFjY2Vzcy1pbmRpdmlkdWFscy1yZWFkJ1xuICBzdGF0aWMgcmVhZG9ubHkgSW5kaXZpZHVhbHNXcml0ZSA9ICdzZWN1cml0eS5hY2Nlc3MtaW5kaXZpZHVhbHMnXG4gIHN0YXRpYyByZWFkb25seSBBY2Nlc3NBZG1pbmlzdHJhdG9ycyA9ICdzZWN1cml0eS5hY2Nlc3MtYWRtaW5pc3RyYXRvcnMnXG5cbiAgLy8gcmVtb3ZlIHRoaXMgdWdseSBmdW5jdGlvbiB3aGVuIGV2ZXJ5dGhpbmcgaXMgdHlwZXNjcmlwdFxuICBzdGF0aWMgZnJvbShvYmo6IGFueSk6IFJlc3RyaWN0aW9ucyB7XG4gICAgaWYgKHR5cGVvZiBvYmouZ2V0ICE9PSAnZnVuY3Rpb24nKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3duZXI6IG9iai5vd25lciB8fCBvYmpbJ21ldGFjYXJkLm93bmVyJ10sXG4gICAgICAgIGFjY2Vzc0dyb3Vwczogb2JqLmFjY2Vzc0dyb3VwcyB8fCBvYmpbdGhpcy5Hcm91cHNXcml0ZV0gfHwgW10sXG4gICAgICAgIGFjY2Vzc0dyb3Vwc1JlYWQ6IG9iai5hY2Nlc3NHcm91cHNSZWFkIHx8IG9ialt0aGlzLkdyb3Vwc1JlYWRdIHx8IFtdLFxuICAgICAgICBhY2Nlc3NJbmRpdmlkdWFsczpcbiAgICAgICAgICBvYmouYWNjZXNzSW5kaXZpZHVhbHMgfHwgb2JqW3RoaXMuSW5kaXZpZHVhbHNXcml0ZV0gfHwgW10sXG4gICAgICAgIGFjY2Vzc0luZGl2aWR1YWxzUmVhZDpcbiAgICAgICAgICBvYmouYWNjZXNzSW5kaXZpZHVhbHNSZWFkIHx8IG9ialt0aGlzLkluZGl2aWR1YWxzUmVhZF0gfHwgW10sXG4gICAgICAgIGFjY2Vzc0FkbWluaXN0cmF0b3JzOlxuICAgICAgICAgIG9iai5hY2Nlc3NBZG1pbmlzdHJhdG9ycyB8fCBvYmpbdGhpcy5BY2Nlc3NBZG1pbmlzdHJhdG9yc10gfHwgW10sXG4gICAgICB9IGFzIFJlc3RyaWN0aW9uc1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG93bmVyOiBvYmouZ2V0KCdvd25lcicpIHx8IG9iai5nZXQoJ21ldGFjYXJkLm93bmVyJyksXG4gICAgICBhY2Nlc3NHcm91cHM6IG9iai5nZXQodGhpcy5Hcm91cHNXcml0ZSkgfHwgb2JqLmdldCgnYWNjZXNzR3JvdXBzJykgfHwgW10sXG4gICAgICBhY2Nlc3NHcm91cHNSZWFkOlxuICAgICAgICBvYmouZ2V0KHRoaXMuR3JvdXBzUmVhZCkgfHwgb2JqLmdldCgnYWNjZXNzR3JvdXBzUmVhZCcpIHx8IFtdLFxuICAgICAgYWNjZXNzSW5kaXZpZHVhbHM6XG4gICAgICAgIG9iai5nZXQodGhpcy5JbmRpdmlkdWFsc1dyaXRlKSB8fCBvYmouZ2V0KCdhY2Nlc3NJbmRpdmlkdWFscycpIHx8IFtdLFxuICAgICAgYWNjZXNzSW5kaXZpZHVhbHNSZWFkOlxuICAgICAgICBvYmouZ2V0KHRoaXMuSW5kaXZpZHVhbHNSZWFkKSB8fCBvYmouZ2V0KCdhY2Nlc3NJbmRpdmlkdWFsc1JlYWQnKSB8fCBbXSxcbiAgICAgIGFjY2Vzc0FkbWluaXN0cmF0b3JzOlxuICAgICAgICBvYmouZ2V0KHRoaXMuQWNjZXNzQWRtaW5pc3RyYXRvcnMpIHx8XG4gICAgICAgIG9iai5nZXQoJ2FjY2Vzc0FkbWluaXN0cmF0b3JzJykgfHxcbiAgICAgICAgW10sXG4gICAgfSBhcyBSZXN0cmljdGlvbnNcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VjdXJpdHkge1xuICBwcml2YXRlIHJlYWRvbmx5IHJlczogUmVzdHJpY3Rpb25zXG5cbiAgY29uc3RydWN0b3IocmVzOiBSZXN0cmljdGlvbnMpIHtcbiAgICB0aGlzLnJlcyA9IHJlc1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5BY2Nlc3ModXNlcjogYW55LCBhY2Nlc3NMZXZlbDogQWNjZXNzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucmVzLm93bmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMucmVzLm93bmVyID09PSB1c2VyLmdldFVzZXJJZCgpIHx8XG4gICAgICB0aGlzLmdldEFjY2Vzcyh1c2VyKSA+PSBhY2Nlc3NMZXZlbFxuICAgIClcbiAgfVxuXG4gIGNhblJlYWQodXNlcjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FuQWNjZXNzKHVzZXIsIEFjY2Vzcy5SZWFkKVxuICB9XG5cbiAgY2FuV3JpdGUodXNlcjogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuY2FuQWNjZXNzKHVzZXIsIEFjY2Vzcy5Xcml0ZSlcbiAgfVxuXG4gIGNhblNoYXJlKHVzZXI6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmNhbkFjY2Vzcyh1c2VyLCBBY2Nlc3MuU2hhcmUpXG4gIH1cblxuICBpc1NoYXJlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIShcbiAgICAgIHRoaXMucmVzLmFjY2Vzc0dyb3Vwcy5sZW5ndGggPT0gMCAmJlxuICAgICAgdGhpcy5yZXMuYWNjZXNzR3JvdXBzUmVhZC5sZW5ndGggPT0gMCAmJlxuICAgICAgdGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHMubGVuZ3RoID09IDAgJiZcbiAgICAgIHRoaXMucmVzLmFjY2Vzc0luZGl2aWR1YWxzUmVhZC5sZW5ndGggPT0gMCAmJlxuICAgICAgKHRoaXMucmVzLmFjY2Vzc0FkbWluaXN0cmF0b3JzLmxlbmd0aCA9PSAwIHx8XG4gICAgICAgICh0aGlzLnJlcy5hY2Nlc3NBZG1pbmlzdHJhdG9ycy5sZW5ndGggPT0gMSAmJlxuICAgICAgICAgIHRoaXMucmVzLmFjY2Vzc0FkbWluaXN0cmF0b3JzWzBdID09PSB0aGlzLnJlcy5vd25lcikpXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRHcm91cEFjY2Vzcyhncm91cDogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMucmVzLmFjY2Vzc0dyb3Vwcy5pbmRleE9mKGdyb3VwKSA+IC0xKSB7XG4gICAgICByZXR1cm4gQWNjZXNzLldyaXRlXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVzLmFjY2Vzc0dyb3Vwc1JlYWQuaW5kZXhPZihncm91cCkgPiAtMSkge1xuICAgICAgcmV0dXJuIEFjY2Vzcy5SZWFkXG4gICAgfVxuXG4gICAgcmV0dXJuIEFjY2Vzcy5Ob25lXG4gIH1cblxuICBwcml2YXRlIGdldEluZGl2aWR1YWxBY2Nlc3ModXNlcklkOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5yZXMuYWNjZXNzQWRtaW5pc3RyYXRvcnMuaW5kZXhPZih1c2VySWQpID4gLTEpIHtcbiAgICAgIHJldHVybiBBY2Nlc3MuU2hhcmVcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHMuaW5kZXhPZih1c2VySWQpID4gLTEpIHtcbiAgICAgIHJldHVybiBBY2Nlc3MuV3JpdGVcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHNSZWFkLmluZGV4T2YodXNlcklkKSA+IC0xKSB7XG4gICAgICByZXR1cm4gQWNjZXNzLlJlYWRcbiAgICB9XG5cbiAgICByZXR1cm4gQWNjZXNzLk5vbmVcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QWNjZXNzKHVzZXI6IGFueSk6IEFjY2VzcyB7XG4gICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgdGhpcy5nZXRJbmRpdmlkdWFsQWNjZXNzKHVzZXIuZ2V0VXNlcklkKCkpLFxuICAgICAgLi4udXNlci5nZXRSb2xlcygpLm1hcCgoZ3JvdXA6IHN0cmluZykgPT4gdGhpcy5nZXRHcm91cEFjY2Vzcyhncm91cCkpXG4gICAgKVxuICB9XG5cbiAgZ2V0R3JvdXBzKGZvcmNlSW5jbHVkZUdyb3Vwczogc3RyaW5nW10pOiBFbnRyeVtdIHtcbiAgICByZXR1cm4gXy51bmlvbihcbiAgICAgIGZvcmNlSW5jbHVkZUdyb3VwcyxcbiAgICAgIHRoaXMucmVzLmFjY2Vzc0dyb3VwcyxcbiAgICAgIHRoaXMucmVzLmFjY2Vzc0dyb3Vwc1JlYWRcbiAgICApXG4gICAgICAubWFwKChncm91cDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGdyb3VwLFxuICAgICAgICAgIGFjY2VzczogdGhpcy5nZXRHcm91cEFjY2Vzcyhncm91cCksXG4gICAgICAgIH0gYXMgRW50cnlcbiAgICAgIH0pXG4gICAgICAuc29ydChTZWN1cml0eS5jb21wYXJlRm4pXG4gIH1cblxuICBnZXRJbmRpdmlkdWFscygpOiBFbnRyeVtdIHtcbiAgICByZXR1cm4gXy51bmlvbihcbiAgICAgIHRoaXMucmVzLmFjY2Vzc0luZGl2aWR1YWxzLFxuICAgICAgdGhpcy5yZXMuYWNjZXNzSW5kaXZpZHVhbHNSZWFkLFxuICAgICAgdGhpcy5yZXMuYWNjZXNzQWRtaW5pc3RyYXRvcnNcbiAgICApXG4gICAgICAubWFwKCh1c2VySWQ6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiB1c2VySWQsXG4gICAgICAgICAgYWNjZXNzOiB0aGlzLmdldEluZGl2aWR1YWxBY2Nlc3ModXNlcklkKSxcbiAgICAgICAgfSBhcyBFbnRyeVxuICAgICAgfSlcbiAgICAgIC5zb3J0KFNlY3VyaXR5LmNvbXBhcmVGbilcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGNvbXBhcmVGbiA9IChhOiBJdGVtLCBiOiBJdGVtKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gYS52YWx1ZSA8IGIudmFsdWUgPyAtMSA6IGEudmFsdWUgPiBiLnZhbHVlID8gMSA6IDBcbiAgfVxufVxuIl19