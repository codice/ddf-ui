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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1jbGFzc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL0Jhc2UvYmFzZS1jbGFzc2VzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHO0FBQ0g7SUF5QkU7UUFDRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFBO0lBQzdCLENBQUM7SUF6QkQsa0NBQVcsR0FBWCxVQUFZLEVBTVg7UUFORCxpQkFlQztZQWRDLGlCQUFpQix1QkFBQSxFQUNqQixRQUFRLGNBQUE7UUFLUixJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQzlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtTQUMvQztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQTtRQUN4RCxPQUFPO1lBQ0wsT0FBTyxLQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN0RCxDQUFDLENBQUE7SUFDSCxDQUFDO0lBQ0QseUNBQWtCLEdBQWxCLFVBQW1CLFVBQWE7UUFDOUIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBQy9ELElBQUksV0FBVztZQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtnQkFDMUMsT0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQTVCLENBQTRCLENBQzdCLENBQUE7SUFDTCxDQUFDO0lBSUgsbUJBQUM7QUFBRCxDQUFDLEFBNUJELElBNEJDOztBQUVEO0lBQW9DLCtCQUdsQztJQUVBLHFCQUFZLEtBQVE7UUFBcEIsWUFDRSxpQkFBTyxTQUVSO1FBREMsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7O0lBQ3BCLENBQUM7SUFDRCw4QkFBUSxHQUFSLFVBQVMsUUFBVztRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQTtRQUNyQixJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFDRCx5QkFBRyxHQUFIO1FBQ0UsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUFoQkQsQ0FBb0MsWUFBWSxHQWdCL0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqICBBdHRlbXB0IHRvIHB1bGwgb3V0IHdoYXQgaXMgYSBmYWlybHkgY29tbW9uIHBhdHRlcm4gYXJvdW5kIHN1YnNjcmliaW5nXG4gKiAgdG8gaW5zdGFuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgU3Vic2NyaWJhYmxlPFQgZXh0ZW5kcyB7IHRoaW5nOiBzdHJpbmc7IGFyZ3M/OiBhbnkgfT4ge1xuICBzdWJzY3JpcHRpb25zVG9NZTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgKHZhbDogVFsnYXJncyddKSA9PiB2b2lkPj5cbiAgc3Vic2NyaWJlVG8oe1xuICAgIHN1YnNjcmliYWJsZVRoaW5nLFxuICAgIGNhbGxiYWNrLFxuICB9OiB7XG4gICAgc3Vic2NyaWJhYmxlVGhpbmc6IFRbJ3RoaW5nJ11cbiAgICBjYWxsYmFjazogKHZhbDogVFsnYXJncyddKSA9PiB2b2lkXG4gIH0pIHtcbiAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKVxuICAgIGlmICghdGhpcy5zdWJzY3JpcHRpb25zVG9NZVtzdWJzY3JpYmFibGVUaGluZ10pIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1RvTWVbc3Vic2NyaWJhYmxlVGhpbmddID0ge31cbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zVG9NZVtzdWJzY3JpYmFibGVUaGluZ11baWRdID0gY2FsbGJhY2tcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1RvTWVbc3Vic2NyaWJhYmxlVGhpbmddW2lkXVxuICAgIH1cbiAgfVxuICBfbm90aWZ5U3Vic2NyaWJlcnMocGFyYW1ldGVyczogVCkge1xuICAgIGNvbnN0IHN1YnNjcmliZXJzID0gdGhpcy5zdWJzY3JpcHRpb25zVG9NZVtwYXJhbWV0ZXJzWyd0aGluZyddXVxuICAgIGlmIChzdWJzY3JpYmVycylcbiAgICAgIE9iamVjdC52YWx1ZXMoc3Vic2NyaWJlcnMpLmZvckVhY2goKGNhbGxiYWNrKSA9PlxuICAgICAgICBjYWxsYmFjayhwYXJhbWV0ZXJzWydhcmdzJ10pXG4gICAgICApXG4gIH1cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zVG9NZSA9IHt9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE92ZXJyaWRhYmxlPFQ+IGV4dGVuZHMgU3Vic2NyaWJhYmxlPHtcbiAgdGhpbmc6ICdvdmVycmlkZSdcbiAgYXJnczogVFxufT4ge1xuICBwcml2YXRlIHZhbHVlOiBUXG4gIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG4gIG92ZXJyaWRlKG5ld1ZhbHVlOiBUKSB7XG4gICAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlXG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ292ZXJyaWRlJywgYXJnczogbmV3VmFsdWUgfSlcbiAgfVxuICBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVcbiAgfVxufVxuIl19