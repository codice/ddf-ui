import { __extends } from "tslib";
/**
 *  Attempt to pull out what is a fairly common pattern around subscribing
 *  to instances.
 */
var Subscribable = /** @class */ (function () {
    function Subscribable() {
        this.subscriptionsToMe = {};
    }
    Subscribable.prototype.subscribeTo = function (_a) {
        var _this = this;
        var subscribableThing = _a.subscribableThing, callback = _a.callback;
        var id = Math.random().toString();
        if (!this.subscriptionsToMe[subscribableThing]) {
            this.subscriptionsToMe[subscribableThing] = {};
        }
        this.subscriptionsToMe[subscribableThing][id] = callback;
        return function () {
            delete _this.subscriptionsToMe[subscribableThing][id];
        };
    };
    Subscribable.prototype._notifySubscribers = function (parameters) {
        var subscribers = this.subscriptionsToMe[parameters['thing']];
        if (subscribers)
            Object.values(subscribers).forEach(function (callback) {
                return callback(parameters['args']);
            });
    };
    return Subscribable;
}());
export { Subscribable };
var Overridable = /** @class */ (function (_super) {
    __extends(Overridable, _super);
    function Overridable(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    Overridable.prototype.override = function (newValue) {
        this.value = newValue;
        this._notifySubscribers({ thing: 'override', args: newValue });
    };
    Overridable.prototype.get = function () {
        return this.value;
    };
    return Overridable;
}(Subscribable));
export { Overridable };
//# sourceMappingURL=base-classes.js.map