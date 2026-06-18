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
import api from './index';
var oldGet = $.get;
var oldPost = $.post;
var oldAjax = $.ajax;
var mock = function () {
    var httpRequest = function (_a) {
        var url = _a.url;
        return Promise.resolve(api(url));
    };
    // @ts-expect-error ts-migrate(2322) FIXME: Type '(url: any) => Promise<any>' is not assignabl... Remove this comment to see the full error message
    $.get = function (url) { return httpRequest({ url: url }); };
    // @ts-expect-error ts-migrate(2322) FIXME: Type '({ url }: any) => Promise<any>' is not assig... Remove this comment to see the full error message
    $.post = httpRequest;
    // @ts-expect-error ts-migrate(2322) FIXME: Type '({ url }: any) => Promise<any>' is not assig... Remove this comment to see the full error message
    $.ajax = httpRequest;
};
var unmock = function () {
    $.get = oldGet;
    $.post = oldPost;
    $.ajax = oldAjax;
};
export { mock, unmock };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1qcXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvdGVzdC9tb2NrLWFwaS9tb2NrLWpxdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBRXRCLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQTtBQUN6QixJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFBO0FBQ3BCLElBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7QUFDdEIsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtBQUV0QixJQUFNLElBQUksR0FBRztJQUNYLElBQU0sV0FBVyxHQUFHLFVBQUMsRUFBWTtZQUFWLEdBQUcsU0FBQTtRQUN4QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDbEMsQ0FBQyxDQUFBO0lBQ0QsbUpBQW1KO0lBQ25KLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBQyxHQUFRLElBQUssT0FBQSxXQUFXLENBQUMsRUFBRSxHQUFHLEtBQUEsRUFBRSxDQUFDLEVBQXBCLENBQW9CLENBQUE7SUFDMUMsbUpBQW1KO0lBQ25KLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFBO0lBQ3BCLG1KQUFtSjtJQUNuSixDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQTtBQUN0QixDQUFDLENBQUE7QUFFRCxJQUFNLE1BQU0sR0FBRztJQUNiLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFBO0lBQ2QsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuXG5pbXBvcnQgYXBpIGZyb20gJy4vaW5kZXgnXG5jb25zdCBvbGRHZXQgPSAkLmdldFxuY29uc3Qgb2xkUG9zdCA9ICQucG9zdFxuY29uc3Qgb2xkQWpheCA9ICQuYWpheFxuXG5jb25zdCBtb2NrID0gKCkgPT4ge1xuICBjb25zdCBodHRwUmVxdWVzdCA9ICh7IHVybCB9OiBhbnkpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFwaSh1cmwpKVxuICB9XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAnKHVybDogYW55KSA9PiBQcm9taXNlPGFueT4nIGlzIG5vdCBhc3NpZ25hYmwuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAkLmdldCA9ICh1cmw6IGFueSkgPT4gaHR0cFJlcXVlc3QoeyB1cmwgfSlcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICcoeyB1cmwgfTogYW55KSA9PiBQcm9taXNlPGFueT4nIGlzIG5vdCBhc3NpZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICQucG9zdCA9IGh0dHBSZXF1ZXN0XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAnKHsgdXJsIH06IGFueSkgPT4gUHJvbWlzZTxhbnk+JyBpcyBub3QgYXNzaWcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAkLmFqYXggPSBodHRwUmVxdWVzdFxufVxuXG5jb25zdCB1bm1vY2sgPSAoKSA9PiB7XG4gICQuZ2V0ID0gb2xkR2V0XG4gICQucG9zdCA9IG9sZFBvc3RcbiAgJC5hamF4ID0gb2xkQWpheFxufVxuXG5leHBvcnQgeyBtb2NrLCB1bm1vY2sgfVxuIl19