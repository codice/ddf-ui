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
//# sourceMappingURL=base-classes.js.map