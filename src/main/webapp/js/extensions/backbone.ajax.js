import Backbone from 'backbone';
import { checkForErrors, throwFetchErrorEvent, } from '../../react-component/utils/fetch/fetch';
var oldBackboneAjax = Backbone.ajax;
Backbone.ajax = function (request) {
    var _this = this;
    var originalError = request.error;
    var newError = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        throwFetchErrorEvent([params[2]]);
        if (typeof originalError === 'function') {
            originalError.apply(_this, params);
        }
        else if (typeof originalError === 'object') {
            originalError.forEach(function (errorCallback) {
                if (typeof errorCallback === 'function') {
                    errorCallback.apply(_this, params);
                }
            });
        }
    };
    var originalSuccess = request.success;
    var newSuccess = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        checkForErrors(params[0]); // query response is 200 even with errors -> check if any source has an error
        if (typeof originalSuccess === 'function') {
            originalSuccess.apply(_this, params);
        }
        else if (typeof originalSuccess === 'object') {
            originalSuccess.forEach(function (successCallback) {
                if (typeof successCallback === 'function') {
                    successCallback.apply(_this, params);
                }
            });
        }
    };
    request.error = newError;
    request.success = newSuccess;
    return oldBackboneAjax(request);
};
//# sourceMappingURL=backbone.ajax.js.map