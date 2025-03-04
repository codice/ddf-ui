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
import Backbone from 'backbone';
import 'backbone-associations';
import { transformResponseHighlightsToMap, } from './LazyQueryResult/LazyQueryResults';
import { Client } from 'rpc-websockets';
import { StartupDataStore } from './Startup/startup';
import { checkForErrors, } from '../../react-component/utils/fetch/fetch';
var rpc = null;
var rpcInitial = null;
var rpcConnectionInitiated = false;
if (StartupDataStore.Configuration.getWebSocketsEnabled() && window.WebSocket) {
    var protocol = { 'http:': 'ws:', 'https:': 'wss:' };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var url = "".concat(protocol[location.protocol], "//").concat(location.hostname, ":").concat(location.port).concat(location.pathname, "ws");
    rpcInitial = new Client(url, { autoconnect: false });
    // Only set rpc if the connection succeeds
    rpcInitial.once('open', function () {
        rpc = rpcInitial;
    });
}
export default Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            lazyResults: undefined,
        };
    },
    url: './internal/cql',
    initialize: function () {
        this.listenTo(this, 'error', this.handleError);
        if (rpcInitial && !rpcConnectionInitiated) {
            rpcInitial.connect();
            rpcConnectionInitiated = true;
        }
    },
    sync: function (method, model, options) {
        if (rpc !== null) {
            var handled_1 = false;
            var promise_1 = rpc
                .call('query', [options.data], options.timeout)
                .then(
            // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
            function (res) {
                if (!handled_1) {
                    handled_1 = true;
                    checkForErrors(res);
                    options.success(res);
                    return [res, 'success'];
                }
            })
                // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
                .catch(function (res) {
                if (!handled_1) {
                    handled_1 = true;
                    res.options = options;
                    switch (res.code) {
                        case 400:
                        case 404:
                        case 500:
                            options.error({
                                responseJSON: res,
                            });
                            break;
                        case -32000:
                            if (rpc !== null) {
                                rpc.close();
                                rpc = null;
                            }
                            options.error({
                                responseJSON: {
                                    message: 'User not logged in.',
                                },
                            });
                            break;
                        default:
                            // notify user and fallback to http
                            if (rpc !== null) {
                                rpc.close();
                                rpc = null;
                            }
                            options.error({
                                responseJSON: {
                                    message: 'Search failed due to unknown reasons, please try again.',
                                },
                            });
                    }
                    return [res, 'error'];
                }
            });
            model.trigger('request', model, null, options);
            return {
                abort: function () {
                    if (!handled_1) {
                        handled_1 = true;
                        options.error({
                            responseJSON: {
                                message: 'Stopped',
                            },
                        });
                    }
                },
                promise: function () {
                    var d = $.Deferred();
                    promise_1
                        .then(function (value) {
                        d.resolve(value);
                    })
                        .catch(function (err) {
                        d.reject(err);
                    });
                    return d;
                },
            };
        }
        else {
            return Backbone.AssociatedModel.prototype.sync.call(this, method, model, options);
        }
    },
    handleError: function (_resultModel, response, sent) {
        var dataJSON = JSON.parse(sent.data);
        this.get('lazyResults').updateStatusWithError({
            sources: dataJSON.srcs,
            message: response.responseJSON
                ? response.responseJSON.message
                : response.statusText,
        });
    },
    handleSync: function () { },
    parse: function (resp) {
        StartupDataStore.MetacardDefinitions.addDynamicallyFoundMetacardDefinitionsFromSearchResults(resp.types);
        var lazyResults = this.get('lazyResults');
        lazyResults.addTypes(resp.types);
        lazyResults.updateStatus(resp.statusBySource);
        lazyResults.updateDidYouMeanFields(resp.didYouMeanFields);
        lazyResults.updateShowingResultsForFields(resp.showingResultsForFields);
        lazyResults.addHighlights(transformResponseHighlightsToMap({
            highlights: resp.highlights,
        }));
        lazyResults.add({
            results: resp.results,
        });
        return {};
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlSZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeVJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sdUJBQXVCLENBQUE7QUFDOUIsT0FBTyxFQUVMLGdDQUFnQyxHQUNqQyxNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNwRCxPQUFPLEVBRUwsY0FBYyxHQUNmLE1BQU0seUNBQXlDLENBQUE7QUFFaEQsSUFBSSxHQUFHLEdBQWtCLElBQUksQ0FBQTtBQUM3QixJQUFJLFVBQVUsR0FBa0IsSUFBSSxDQUFBO0FBQ3BDLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFBO0FBRWxDLElBQUksZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlFLElBQU0sUUFBUSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUE7SUFDckQsbUpBQW1KO0lBQ25KLElBQU0sR0FBRyxHQUFHLFVBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBSyxRQUFRLENBQUMsUUFBUSxjQUM5RCxRQUFRLENBQUMsSUFBSSxTQUNaLFFBQVEsQ0FBQyxRQUFRLE9BQUksQ0FBQTtJQUN4QixVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFFcEQs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QUE7SUFDSixDQUFDO0lBQ0QsVUFBVSxnQkFBSSxDQUFDO0lBQ2YsS0FBSyxZQUFDLElBQVM7UUFDYixnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyx1REFBdUQsQ0FDMUYsSUFBSSxDQUFDLEtBQUssQ0FDWCxDQUFBO1FBQ0QsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQXFCLENBQUE7UUFDL0QsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDN0MsV0FBVyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ3pELFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtRQUN2RSxXQUFXLENBQUMsYUFBYSxDQUN2QixnQ0FBZ0MsQ0FBQztZQUMvQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDNUIsQ0FBQyxDQUNILENBQUE7UUFDRCxXQUFXLENBQUMsR0FBRyxDQUFDO1lBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3RCLENBQUMsQ0FBQTtRQUNGLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5pbXBvcnQge1xuICBMYXp5UXVlcnlSZXN1bHRzLFxuICB0cmFuc2Zvcm1SZXNwb25zZUhpZ2hsaWdodHNUb01hcCxcbn0gZnJvbSAnLi9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cydcbmltcG9ydCB7IENsaWVudCB9IGZyb20gJ3JwYy13ZWJzb2NrZXRzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHtcbiAgUXVlcnlSZXNwb25zZVR5cGUsXG4gIGNoZWNrRm9yRXJyb3JzLFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZmV0Y2gvZmV0Y2gnXG5cbmxldCBycGM6IENsaWVudCB8IG51bGwgPSBudWxsXG5sZXQgcnBjSW5pdGlhbDogQ2xpZW50IHwgbnVsbCA9IG51bGxcbmxldCBycGNDb25uZWN0aW9uSW5pdGlhdGVkID0gZmFsc2VcblxuaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRXZWJTb2NrZXRzRW5hYmxlZCgpICYmIHdpbmRvdy5XZWJTb2NrZXQpIHtcbiAgY29uc3QgcHJvdG9jb2wgPSB7ICdodHRwOic6ICd3czonLCAnaHR0cHM6JzogJ3dzczonIH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwNTMpIEZJWE1FOiBFbGVtZW50IGltcGxpY2l0bHkgaGFzIGFuICdhbnknIHR5cGUgYmVjYXVzZSBleHByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGNvbnN0IHVybCA9IGAke3Byb3RvY29sW2xvY2F0aW9uLnByb3RvY29sXX0vLyR7bG9jYXRpb24uaG9zdG5hbWV9OiR7XG4gICAgbG9jYXRpb24ucG9ydFxuICB9JHtsb2NhdGlvbi5wYXRobmFtZX13c2BcbiAgcnBjSW5pdGlhbCA9IG5ldyBDbGllbnQodXJsLCB7IGF1dG9jb25uZWN0OiBmYWxzZSB9KVxuXG4gIC8vIE9ubHkgc2V0IHJwYyBpZiB0aGUgY29ubmVjdGlvbiBzdWNjZWVkc1xuICBycGNJbml0aWFsLm9uY2UoJ29wZW4nLCAoKSA9PiB7XG4gICAgcnBjID0gcnBjSW5pdGlhbFxuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhenlSZXN1bHRzOiB1bmRlZmluZWQsXG4gICAgfVxuICB9LFxuICB1cmw6ICcuL2ludGVybmFsL2NxbCcsXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZXJyb3InLCB0aGlzLmhhbmRsZUVycm9yKVxuXG4gICAgaWYgKHJwY0luaXRpYWwgJiYgIXJwY0Nvbm5lY3Rpb25Jbml0aWF0ZWQpIHtcbiAgICAgIHJwY0luaXRpYWwuY29ubmVjdCgpXG4gICAgICBycGNDb25uZWN0aW9uSW5pdGlhdGVkID0gdHJ1ZVxuICAgIH1cbiAgfSxcbiAgc3luYyhtZXRob2Q6IGFueSwgbW9kZWw6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKHJwYyAhPT0gbnVsbCkge1xuICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZVxuICAgICAgY29uc3QgcHJvbWlzZSA9IHJwY1xuICAgICAgICAuY2FsbCgncXVlcnknLCBbb3B0aW9ucy5kYXRhXSwgb3B0aW9ucy50aW1lb3V0KVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbiAgICAgICAgICAocmVzOiBRdWVyeVJlc3BvbnNlVHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVkKSB7XG4gICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlXG4gICAgICAgICAgICAgIGNoZWNrRm9yRXJyb3JzKHJlcylcbiAgICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKHJlcylcbiAgICAgICAgICAgICAgcmV0dXJuIFtyZXMsICdzdWNjZXNzJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG4gICAgICAgIC5jYXRjaCgocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoIWhhbmRsZWQpIHtcbiAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlXG4gICAgICAgICAgICByZXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAgICAgICAgIHN3aXRjaCAocmVzLmNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA0MDA6XG4gICAgICAgICAgICAgIGNhc2UgNDA0OlxuICAgICAgICAgICAgICBjYXNlIDUwMDpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHtcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSlNPTjogcmVzLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSAtMzIwMDA6XG4gICAgICAgICAgICAgICAgaWYgKHJwYyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgcnBjLmNsb3NlKClcbiAgICAgICAgICAgICAgICAgIHJwYyA9IG51bGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih7XG4gICAgICAgICAgICAgICAgICByZXNwb25zZUpTT046IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VzZXIgbm90IGxvZ2dlZCBpbi4nLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gbm90aWZ5IHVzZXIgYW5kIGZhbGxiYWNrIHRvIGh0dHBcbiAgICAgICAgICAgICAgICBpZiAocnBjICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBycGMuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgcnBjID0gbnVsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHtcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSlNPTjoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICAgICdTZWFyY2ggZmFpbGVkIGR1ZSB0byB1bmtub3duIHJlYXNvbnMsIHBsZWFzZSB0cnkgYWdhaW4uJyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbcmVzLCAnZXJyb3InXVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIG1vZGVsLnRyaWdnZXIoJ3JlcXVlc3QnLCBtb2RlbCwgbnVsbCwgb3B0aW9ucylcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgIGlmICghaGFuZGxlZCkge1xuICAgICAgICAgICAgaGFuZGxlZCA9IHRydWVcbiAgICAgICAgICAgIG9wdGlvbnMuZXJyb3Ioe1xuICAgICAgICAgICAgICByZXNwb25zZUpTT046IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnU3RvcHBlZCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvbWlzZSgpIHtcbiAgICAgICAgICBjb25zdCBkID0gJC5EZWZlcnJlZCgpXG4gICAgICAgICAgcHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgZC5yZXNvbHZlKHZhbHVlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgZC5yZWplY3QoZXJyKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gZFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLnByb3RvdHlwZS5zeW5jLmNhbGwoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG1ldGhvZCxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIG9wdGlvbnNcbiAgICAgIClcbiAgICB9XG4gIH0sXG4gIGhhbmRsZUVycm9yKF9yZXN1bHRNb2RlbDogYW55LCByZXNwb25zZTogYW55LCBzZW50OiBhbnkpIHtcbiAgICBjb25zdCBkYXRhSlNPTiA9IEpTT04ucGFyc2Uoc2VudC5kYXRhKVxuICAgIHRoaXMuZ2V0KCdsYXp5UmVzdWx0cycpLnVwZGF0ZVN0YXR1c1dpdGhFcnJvcih7XG4gICAgICBzb3VyY2VzOiBkYXRhSlNPTi5zcmNzLFxuICAgICAgbWVzc2FnZTogcmVzcG9uc2UucmVzcG9uc2VKU09OXG4gICAgICAgID8gcmVzcG9uc2UucmVzcG9uc2VKU09OLm1lc3NhZ2VcbiAgICAgICAgOiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgIH0pXG4gIH0sXG4gIGhhbmRsZVN5bmMoKSB7fSxcbiAgcGFyc2UocmVzcDogYW55KSB7XG4gICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmFkZER5bmFtaWNhbGx5Rm91bmRNZXRhY2FyZERlZmluaXRpb25zRnJvbVNlYXJjaFJlc3VsdHMoXG4gICAgICByZXNwLnR5cGVzXG4gICAgKVxuICAgIGNvbnN0IGxhenlSZXN1bHRzID0gdGhpcy5nZXQoJ2xhenlSZXN1bHRzJykgYXMgTGF6eVF1ZXJ5UmVzdWx0c1xuICAgIGxhenlSZXN1bHRzLmFkZFR5cGVzKHJlc3AudHlwZXMpXG4gICAgbGF6eVJlc3VsdHMudXBkYXRlU3RhdHVzKHJlc3Auc3RhdHVzQnlTb3VyY2UpXG4gICAgbGF6eVJlc3VsdHMudXBkYXRlRGlkWW91TWVhbkZpZWxkcyhyZXNwLmRpZFlvdU1lYW5GaWVsZHMpXG4gICAgbGF6eVJlc3VsdHMudXBkYXRlU2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMocmVzcC5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcylcbiAgICBsYXp5UmVzdWx0cy5hZGRIaWdobGlnaHRzKFxuICAgICAgdHJhbnNmb3JtUmVzcG9uc2VIaWdobGlnaHRzVG9NYXAoe1xuICAgICAgICBoaWdobGlnaHRzOiByZXNwLmhpZ2hsaWdodHMsXG4gICAgICB9KVxuICAgIClcbiAgICBsYXp5UmVzdWx0cy5hZGQoe1xuICAgICAgcmVzdWx0czogcmVzcC5yZXN1bHRzLFxuICAgIH0pXG4gICAgcmV0dXJuIHt9XG4gIH0sXG59KVxuIl19