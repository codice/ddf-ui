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
import metacardDefinitions from '../../component/singletons/metacard-definitions';
import properties from '../properties';
import 'backbone-associations';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'rpc-... Remove this comment to see the full error message
import * as rpcwebsockets from 'rpc-websockets';
var rpc = null;
if (properties.webSocketsEnabled && window.WebSocket) {
    var Client = rpcwebsockets.Client;
    var protocol = { 'http:': 'ws:', 'https:': 'wss:' };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var url = "".concat(protocol[location.protocol], "//").concat(location.hostname, ":").concat(location.port).concat(location.pathname, "ws");
    rpc = new Client(url);
}
export default Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            lazyResults: undefined
        };
    },
    url: './internal/cql',
    initialize: function () {
        this.listenTo(this, 'error', this.handleError);
    },
    sync: function (method, model, options) {
        if (rpc !== null) {
            var handled_1 = false;
            var promise_1 = rpc
                .call('query', [options.data], options.timeout)
                // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
                .then(function (res) {
                if (!handled_1) {
                    handled_1 = true;
                    options.success(res);
                    return [res, 'success'];
                }
            })["catch"](function (res) {
                if (!handled_1) {
                    handled_1 = true;
                    res.options = options;
                    switch (res.code) {
                        case 400:
                        case 404:
                        case 500:
                            options.error({
                                responseJSON: res
                            });
                            break;
                        case -32000:
                            if (rpc !== null) {
                                rpc.close();
                                rpc = null;
                            }
                            options.error({
                                responseJSON: {
                                    message: 'User not logged in.'
                                }
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
                                    message: 'Search failed due to unknown reasons, please try again.'
                                }
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
                                message: 'Stopped'
                            }
                        });
                    }
                },
                promise: function () {
                    var d = $.Deferred();
                    promise_1
                        .then(function (value) {
                        d.resolve(value);
                    })["catch"](function (err) {
                        d.reject(err);
                    });
                    return d;
                }
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
                : response.statusText
        });
    },
    handleSync: function () { },
    parse: function (resp) {
        metacardDefinitions.addMetacardDefinitions(resp.types);
        this.get('lazyResults').addTypes(resp.types);
        this.get('lazyResults').updateStatus(resp.statusBySource);
        this.get('lazyResults').updateDidYouMeanFields(resp.didYouMeanFields);
        this.get('lazyResults').updateShowingResultsForFields(resp.showingResultsForFields);
        this.get('lazyResults').add({
            results: resp.results,
            highlights: resp.highlights || []
        });
        return {};
    }
});
//# sourceMappingURL=QueryResponse.js.map