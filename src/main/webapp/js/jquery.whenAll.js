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
import $ from 'jquery';
$.whenAll = function () {
    var args = arguments, sliceDeferred = [].slice, i = 0, length = args.length, count = length, rejected, deferred = $.Deferred();
    function resolveFunc(i, reject) {
        return function (value) {
            rejected = rejected || reject;
            args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
            if (!--count) {
                // Strange bug in FF4:
                // Values changed onto the arguments object sometimes end up as undefined values
                // outside the $.when method. Cloning the object into a fresh array solves the issue
                var fn = rejected ? deferred.rejectWith : deferred.resolveWith;
                fn.call(deferred, deferred, sliceDeferred.call(args, 0));
            }
        };
    }
    for (; i < length; i++) {
        if (args[i] && $.isFunction(args[i].promise)) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            args[i].promise().then(resolveFunc(i), resolveFunc(i, true));
        }
        else {
            --count;
        }
    }
    if (count === 0) {
        deferred.resolveWith(deferred, args);
    }
    return deferred.promise();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianF1ZXJ5LndoZW5BbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvanF1ZXJ5LndoZW5BbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FDckI7QUFBQyxDQUFTLENBQUMsT0FBTyxHQUFHO0lBQ3BCLElBQUksSUFBSSxHQUFHLFNBQVMsRUFDbEIsYUFBYSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQ3hCLENBQUMsR0FBRyxDQUFDLEVBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQ3BCLEtBQUssR0FBRyxNQUFNLEVBQ2QsUUFBYSxFQUNiLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDekIsU0FBUyxXQUFXLENBQUMsQ0FBTSxFQUFFLE1BQVc7UUFDdEMsT0FBTyxVQUFVLEtBQVU7WUFDekIsUUFBUSxHQUFHLFFBQVEsSUFBSSxNQUFNLENBQUE7WUFDN0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1lBQ3pFLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRTtnQkFDWixzQkFBc0I7Z0JBQ3RCLGdGQUFnRjtnQkFDaEYsb0ZBQW9GO2dCQUNwRixJQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUE7Z0JBQ2hFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQ3pEO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUNELE9BQU8sQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1Qyw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQzdEO2FBQU07WUFDTCxFQUFFLEtBQUssQ0FBQTtTQUNSO0tBQ0Y7SUFDRCxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNyQztJQUNELE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzNCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuOygkIGFzIGFueSkud2hlbkFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgc2xpY2VEZWZlcnJlZCA9IFtdLnNsaWNlLFxuICAgIGkgPSAwLFxuICAgIGxlbmd0aCA9IGFyZ3MubGVuZ3RoLFxuICAgIGNvdW50ID0gbGVuZ3RoLFxuICAgIHJlamVjdGVkOiBhbnksXG4gICAgZGVmZXJyZWQgPSAkLkRlZmVycmVkKClcbiAgZnVuY3Rpb24gcmVzb2x2ZUZ1bmMoaTogYW55LCByZWplY3Q6IGFueSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCByZWplY3RcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IHNsaWNlRGVmZXJyZWQuY2FsbChhcmd1bWVudHMsIDApIDogdmFsdWVcbiAgICAgIGlmICghLS1jb3VudCkge1xuICAgICAgICAvLyBTdHJhbmdlIGJ1ZyBpbiBGRjQ6XG4gICAgICAgIC8vIFZhbHVlcyBjaGFuZ2VkIG9udG8gdGhlIGFyZ3VtZW50cyBvYmplY3Qgc29tZXRpbWVzIGVuZCB1cCBhcyB1bmRlZmluZWQgdmFsdWVzXG4gICAgICAgIC8vIG91dHNpZGUgdGhlICQud2hlbiBtZXRob2QuIENsb25pbmcgdGhlIG9iamVjdCBpbnRvIGEgZnJlc2ggYXJyYXkgc29sdmVzIHRoZSBpc3N1ZVxuICAgICAgICBjb25zdCBmbiA9IHJlamVjdGVkID8gZGVmZXJyZWQucmVqZWN0V2l0aCA6IGRlZmVycmVkLnJlc29sdmVXaXRoXG4gICAgICAgIGZuLmNhbGwoZGVmZXJyZWQsIGRlZmVycmVkLCBzbGljZURlZmVycmVkLmNhbGwoYXJncywgMCkpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJnc1tpXSAmJiAkLmlzRnVuY3Rpb24oYXJnc1tpXS5wcm9taXNlKSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAxLlxuICAgICAgYXJnc1tpXS5wcm9taXNlKCkudGhlbihyZXNvbHZlRnVuYyhpKSwgcmVzb2x2ZUZ1bmMoaSwgdHJ1ZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC0tY291bnRcbiAgICB9XG4gIH1cbiAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgZGVmZXJyZWQucmVzb2x2ZVdpdGgoZGVmZXJyZWQsIGFyZ3MpXG4gIH1cbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKVxufVxuIl19