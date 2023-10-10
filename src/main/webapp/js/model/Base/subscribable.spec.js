import { __extends } from "tslib";
import { Subscribable } from './base-classes';
var ExampleClass = /** @class */ (function (_super) {
    __extends(ExampleClass, _super);
    function ExampleClass() {
        var _this = _super.call(this) || this;
        setTimeout(function () {
            _this._notifySubscribers({ thing: 'one' });
            _this._notifySubscribers({ thing: 'two' });
        }, 500); // 2000ms is max before jest complains
        return _this;
    }
    return ExampleClass;
}(Subscribable));
describe('subscribable classes work as expected', function () {
    it('allows subscribing', function (done) {
        var exampleInstance = new ExampleClass();
        exampleInstance.subscribeTo({
            subscribableThing: 'one',
            callback: function () {
                done();
            },
        });
    });
    it('allows unsubscribing', function (done) {
        var exampleInstance = new ExampleClass();
        var unsubCall = exampleInstance.subscribeTo({
            subscribableThing: 'one',
            callback: function () {
                throw new Error('This should not happen');
            },
        });
        unsubCall();
        setTimeout(function () {
            done();
        }, 1000);
    });
});
//# sourceMappingURL=subscribable.spec.js.map