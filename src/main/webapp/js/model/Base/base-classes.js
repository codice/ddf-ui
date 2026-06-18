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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1jbGFzc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL0Jhc2UvYmFzZS1jbGFzc2VzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHO0FBQ0g7SUF5QkU7UUFDRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFBO0lBQzdCLENBQUM7SUF6QkQsa0NBQVcsR0FBWCxVQUFZLEVBTVg7UUFORCxpQkFlQztZQWRDLGlCQUFpQix1QkFBQSxFQUNqQixRQUFRLGNBQUE7UUFLUixJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hELENBQUM7UUFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUE7UUFDeEQsT0FBTztZQUNMLE9BQU8sS0FBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdEQsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUNELHlDQUFrQixHQUFsQixVQUFtQixVQUFhO1FBQzlCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUMvRCxJQUFJLFdBQVc7WUFDYixNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQzFDLE9BQUEsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUE1QixDQUE0QixDQUM3QixDQUFBO0lBQ0wsQ0FBQztJQUlILG1CQUFDO0FBQUQsQ0FBQyxBQTVCRCxJQTRCQzs7QUFFRDtJQUFvQywrQkFHbEM7SUFFQSxxQkFBWSxLQUFRO1FBQ2xCLFlBQUEsTUFBSyxXQUFFLFNBQUE7UUFDUCxLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7SUFDcEIsQ0FBQztJQUNELDhCQUFRLEdBQVIsVUFBUyxRQUFXO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFBO1FBQ3JCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7SUFDaEUsQ0FBQztJQUNELHlCQUFHLEdBQUg7UUFDRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQWhCRCxDQUFvQyxZQUFZLEdBZ0IvQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogIEF0dGVtcHQgdG8gcHVsbCBvdXQgd2hhdCBpcyBhIGZhaXJseSBjb21tb24gcGF0dGVybiBhcm91bmQgc3Vic2NyaWJpbmdcbiAqICB0byBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJzY3JpYmFibGU8VCBleHRlbmRzIHsgdGhpbmc6IHN0cmluZzsgYXJncz86IGFueSB9PiB7XG4gIHN1YnNjcmlwdGlvbnNUb01lOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCAodmFsOiBUWydhcmdzJ10pID0+IHZvaWQ+PlxuICBzdWJzY3JpYmVUbyh7XG4gICAgc3Vic2NyaWJhYmxlVGhpbmcsXG4gICAgY2FsbGJhY2ssXG4gIH06IHtcbiAgICBzdWJzY3JpYmFibGVUaGluZzogVFsndGhpbmcnXVxuICAgIGNhbGxiYWNrOiAodmFsOiBUWydhcmdzJ10pID0+IHZvaWRcbiAgfSkge1xuICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpXG4gICAgaWYgKCF0aGlzLnN1YnNjcmlwdGlvbnNUb01lW3N1YnNjcmliYWJsZVRoaW5nXSkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zVG9NZVtzdWJzY3JpYmFibGVUaGluZ10gPSB7fVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnNUb01lW3N1YnNjcmliYWJsZVRoaW5nXVtpZF0gPSBjYWxsYmFja1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25zVG9NZVtzdWJzY3JpYmFibGVUaGluZ11baWRdXG4gICAgfVxuICB9XG4gIF9ub3RpZnlTdWJzY3JpYmVycyhwYXJhbWV0ZXJzOiBUKSB7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSB0aGlzLnN1YnNjcmlwdGlvbnNUb01lW3BhcmFtZXRlcnNbJ3RoaW5nJ11dXG4gICAgaWYgKHN1YnNjcmliZXJzKVxuICAgICAgT2JqZWN0LnZhbHVlcyhzdWJzY3JpYmVycykuZm9yRWFjaCgoY2FsbGJhY2spID0+XG4gICAgICAgIGNhbGxiYWNrKHBhcmFtZXRlcnNbJ2FyZ3MnXSlcbiAgICAgIClcbiAgfVxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnNUb01lID0ge31cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT3ZlcnJpZGFibGU8VD4gZXh0ZW5kcyBTdWJzY3JpYmFibGU8e1xuICB0aGluZzogJ292ZXJyaWRlJ1xuICBhcmdzOiBUXG59PiB7XG4gIHByaXZhdGUgdmFsdWU6IFRcbiAgY29uc3RydWN0b3IodmFsdWU6IFQpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gIH1cbiAgb3ZlcnJpZGUobmV3VmFsdWU6IFQpIHtcbiAgICB0aGlzLnZhbHVlID0gbmV3VmFsdWVcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnb3ZlcnJpZGUnLCBhcmdzOiBuZXdWYWx1ZSB9KVxuICB9XG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZVxuICB9XG59XG4iXX0=