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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlSZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeVJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sdUJBQXVCLENBQUE7QUFDOUIsT0FBTyxFQUVMLGdDQUFnQyxHQUNqQyxNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNwRCxPQUFPLEVBRUwsY0FBYyxHQUNmLE1BQU0seUNBQXlDLENBQUE7QUFFaEQsSUFBSSxHQUFHLEdBQWtCLElBQUksQ0FBQTtBQUM3QixJQUFJLFVBQVUsR0FBa0IsSUFBSSxDQUFBO0FBQ3BDLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFBO0FBRWxDLElBQUksZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtJQUM3RSxJQUFNLFFBQVEsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFBO0lBQ3JELG1KQUFtSjtJQUNuSixJQUFNLEdBQUcsR0FBRyxVQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQUssUUFBUSxDQUFDLFFBQVEsY0FDOUQsUUFBUSxDQUFDLElBQUksU0FDWixRQUFRLENBQUMsUUFBUSxPQUFJLENBQUE7SUFDeEIsVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBRXBELDBDQUEw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LENBQUMsS0FBSyxDQUNYLENBQUE7UUFDRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBcUIsQ0FBQTtRQUMvRCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUM3QyxXQUFXLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDekQsV0FBVyxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1FBQ3ZFLFdBQVcsQ0FBQyxhQUFhLENBQ3ZCLGdDQUFnQyxDQUFDO1lBQy9CLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM1QixDQUFDLENBQ0gsQ0FBQTtRQUNELFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDdEIsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgJ2JhY2tib25lLWFzc29jaWF0aW9ucydcbmltcG9ydCB7XG4gIExhenlRdWVyeVJlc3VsdHMsXG4gIHRyYW5zZm9ybVJlc3BvbnNlSGlnaGxpZ2h0c1RvTWFwLFxufSBmcm9tICcuL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHRzJ1xuaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAncnBjLXdlYnNvY2tldHMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQge1xuICBRdWVyeVJlc3BvbnNlVHlwZSxcbiAgY2hlY2tGb3JFcnJvcnMsXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaC9mZXRjaCdcblxubGV0IHJwYzogQ2xpZW50IHwgbnVsbCA9IG51bGxcbmxldCBycGNJbml0aWFsOiBDbGllbnQgfCBudWxsID0gbnVsbFxubGV0IHJwY0Nvbm5lY3Rpb25Jbml0aWF0ZWQgPSBmYWxzZVxuXG5pZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFdlYlNvY2tldHNFbmFibGVkKCkgJiYgd2luZG93LldlYlNvY2tldCkge1xuICBjb25zdCBwcm90b2NvbCA9IHsgJ2h0dHA6JzogJ3dzOicsICdodHRwczonOiAnd3NzOicgfVxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzA1MykgRklYTUU6IEVsZW1lbnQgaW1wbGljaXRseSBoYXMgYW4gJ2FueScgdHlwZSBiZWNhdXNlIGV4cHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY29uc3QgdXJsID0gYCR7cHJvdG9jb2xbbG9jYXRpb24ucHJvdG9jb2xdfS8vJHtsb2NhdGlvbi5ob3N0bmFtZX06JHtcbiAgICBsb2NhdGlvbi5wb3J0XG4gIH0ke2xvY2F0aW9uLnBhdGhuYW1lfXdzYFxuICBycGNJbml0aWFsID0gbmV3IENsaWVudCh1cmwsIHsgYXV0b2Nvbm5lY3Q6IGZhbHNlIH0pXG5cbiAgLy8gT25seSBzZXQgcnBjIGlmIHRoZSBjb25uZWN0aW9uIHN1Y2NlZWRzXG4gIHJwY0luaXRpYWwub25jZSgnb3BlbicsICgpID0+IHtcbiAgICBycGMgPSBycGNJbml0aWFsXG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF6eVJlc3VsdHM6IHVuZGVmaW5lZCxcbiAgICB9XG4gIH0sXG4gIHVybDogJy4vaW50ZXJuYWwvY3FsJyxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdlcnJvcicsIHRoaXMuaGFuZGxlRXJyb3IpXG5cbiAgICBpZiAocnBjSW5pdGlhbCAmJiAhcnBjQ29ubmVjdGlvbkluaXRpYXRlZCkge1xuICAgICAgcnBjSW5pdGlhbC5jb25uZWN0KClcbiAgICAgIHJwY0Nvbm5lY3Rpb25Jbml0aWF0ZWQgPSB0cnVlXG4gICAgfVxuICB9LFxuICBzeW5jKG1ldGhvZDogYW55LCBtb2RlbDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICBpZiAocnBjICE9PSBudWxsKSB7XG4gICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlXG4gICAgICBjb25zdCBwcm9taXNlID0gcnBjXG4gICAgICAgIC5jYWxsKCdxdWVyeScsIFtvcHRpb25zLmRhdGFdLCBvcHRpb25zLnRpbWVvdXQpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuICAgICAgICAgIChyZXM6IFF1ZXJ5UmVzcG9uc2VUeXBlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWhhbmRsZWQpIHtcbiAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWVcbiAgICAgICAgICAgICAgY2hlY2tGb3JFcnJvcnMocmVzKVxuICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzKVxuICAgICAgICAgICAgICByZXR1cm4gW3JlcywgJ3N1Y2Nlc3MnXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbiAgICAgICAgLmNhdGNoKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICghaGFuZGxlZCkge1xuICAgICAgICAgICAgaGFuZGxlZCA9IHRydWVcbiAgICAgICAgICAgIHJlcy5vcHRpb25zID0gb3B0aW9uc1xuICAgICAgICAgICAgc3dpdGNoIChyZXMuY29kZSkge1xuICAgICAgICAgICAgICBjYXNlIDQwMDpcbiAgICAgICAgICAgICAgY2FzZSA0MDQ6XG4gICAgICAgICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VKU09OOiByZXMsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlIC0zMjAwMDpcbiAgICAgICAgICAgICAgICBpZiAocnBjICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBycGMuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgcnBjID0gbnVsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHtcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSlNPTjoge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVXNlciBub3QgbG9nZ2VkIGluLicsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBub3RpZnkgdXNlciBhbmQgZmFsbGJhY2sgdG8gaHR0cFxuICAgICAgICAgICAgICAgIGlmIChycGMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHJwYy5jbG9zZSgpXG4gICAgICAgICAgICAgICAgICBycGMgPSBudWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VKU09OOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgICAgJ1NlYXJjaCBmYWlsZWQgZHVlIHRvIHVua25vd24gcmVhc29ucywgcGxlYXNlIHRyeSBhZ2Fpbi4nLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtyZXMsICdlcnJvciddXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgbW9kZWwudHJpZ2dlcigncmVxdWVzdCcsIG1vZGVsLCBudWxsLCBvcHRpb25zKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgaWYgKCFoYW5kbGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZVxuICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih7XG4gICAgICAgICAgICAgIHJlc3BvbnNlSlNPTjoge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdTdG9wcGVkJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcm9taXNlKCkge1xuICAgICAgICAgIGNvbnN0IGQgPSAkLkRlZmVycmVkKClcbiAgICAgICAgICBwcm9taXNlXG4gICAgICAgICAgICAudGhlbigodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBkLnJlc29sdmUodmFsdWUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBkLnJlamVjdChlcnIpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBkXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwucHJvdG90eXBlLnN5bmMuY2FsbChcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgb3B0aW9uc1xuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlRXJyb3IoX3Jlc3VsdE1vZGVsOiBhbnksIHJlc3BvbnNlOiBhbnksIHNlbnQ6IGFueSkge1xuICAgIGNvbnN0IGRhdGFKU09OID0gSlNPTi5wYXJzZShzZW50LmRhdGEpXG4gICAgdGhpcy5nZXQoJ2xhenlSZXN1bHRzJykudXBkYXRlU3RhdHVzV2l0aEVycm9yKHtcbiAgICAgIHNvdXJjZXM6IGRhdGFKU09OLnNyY3MsXG4gICAgICBtZXNzYWdlOiByZXNwb25zZS5yZXNwb25zZUpTT05cbiAgICAgICAgPyByZXNwb25zZS5yZXNwb25zZUpTT04ubWVzc2FnZVxuICAgICAgICA6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlU3luYygpIHt9LFxuICBwYXJzZShyZXNwOiBhbnkpIHtcbiAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuYWRkRHluYW1pY2FsbHlGb3VuZE1ldGFjYXJkRGVmaW5pdGlvbnNGcm9tU2VhcmNoUmVzdWx0cyhcbiAgICAgIHJlc3AudHlwZXNcbiAgICApXG4gICAgY29uc3QgbGF6eVJlc3VsdHMgPSB0aGlzLmdldCgnbGF6eVJlc3VsdHMnKSBhcyBMYXp5UXVlcnlSZXN1bHRzXG4gICAgbGF6eVJlc3VsdHMuYWRkVHlwZXMocmVzcC50eXBlcylcbiAgICBsYXp5UmVzdWx0cy51cGRhdGVTdGF0dXMocmVzcC5zdGF0dXNCeVNvdXJjZSlcbiAgICBsYXp5UmVzdWx0cy51cGRhdGVEaWRZb3VNZWFuRmllbGRzKHJlc3AuZGlkWW91TWVhbkZpZWxkcylcbiAgICBsYXp5UmVzdWx0cy51cGRhdGVTaG93aW5nUmVzdWx0c0ZvckZpZWxkcyhyZXNwLnNob3dpbmdSZXN1bHRzRm9yRmllbGRzKVxuICAgIGxhenlSZXN1bHRzLmFkZEhpZ2hsaWdodHMoXG4gICAgICB0cmFuc2Zvcm1SZXNwb25zZUhpZ2hsaWdodHNUb01hcCh7XG4gICAgICAgIGhpZ2hsaWdodHM6IHJlc3AuaGlnaGxpZ2h0cyxcbiAgICAgIH0pXG4gICAgKVxuICAgIGxhenlSZXN1bHRzLmFkZCh7XG4gICAgICByZXN1bHRzOiByZXNwLnJlc3VsdHMsXG4gICAgfSlcbiAgICByZXR1cm4ge31cbiAgfSxcbn0pXG4iXX0=