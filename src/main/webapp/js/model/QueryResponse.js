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
//# sourceMappingURL=QueryResponse.js.map