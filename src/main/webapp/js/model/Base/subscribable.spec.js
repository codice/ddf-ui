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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NyaWJhYmxlLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvQmFzZS9zdWJzY3JpYmFibGUuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU3QztJQUEyQixnQ0FBaUQ7SUFDMUU7UUFDRSxZQUFBLE1BQUssV0FBRSxTQUFBO1FBQ1AsVUFBVSxDQUFDO1lBQ1QsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7WUFDekMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDM0MsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBLENBQUMsc0NBQXNDOztJQUNoRCxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBUkQsQ0FBMkIsWUFBWSxHQVF0QztBQUVELFFBQVEsQ0FBQyx1Q0FBdUMsRUFBRTtJQUNoRCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsVUFBQyxJQUFJO1FBQzVCLElBQU0sZUFBZSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7UUFDMUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUMxQixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLFFBQVEsRUFBRTtnQkFDUixJQUFJLEVBQUUsQ0FBQTtZQUNSLENBQUM7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLElBQUk7UUFDOUIsSUFBTSxlQUFlLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUMxQyxJQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDO1lBQzVDLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsUUFBUSxFQUFFO2dCQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtZQUMzQyxDQUFDO1NBQ0YsQ0FBQyxDQUFBO1FBQ0YsU0FBUyxFQUFFLENBQUE7UUFDWCxVQUFVLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQTtRQUNSLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuL2Jhc2UtY2xhc3NlcydcblxuY2xhc3MgRXhhbXBsZUNsYXNzIGV4dGVuZHMgU3Vic2NyaWJhYmxlPHsgdGhpbmc6ICdvbmUnIH0gfCB7IHRoaW5nOiAndHdvJyB9PiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdvbmUnIH0pXG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAndHdvJyB9KVxuICAgIH0sIDUwMCkgLy8gMjAwMG1zIGlzIG1heCBiZWZvcmUgamVzdCBjb21wbGFpbnNcbiAgfVxufVxuXG5kZXNjcmliZSgnc3Vic2NyaWJhYmxlIGNsYXNzZXMgd29yayBhcyBleHBlY3RlZCcsICgpID0+IHtcbiAgaXQoJ2FsbG93cyBzdWJzY3JpYmluZycsIChkb25lKSA9PiB7XG4gICAgY29uc3QgZXhhbXBsZUluc3RhbmNlID0gbmV3IEV4YW1wbGVDbGFzcygpXG4gICAgZXhhbXBsZUluc3RhbmNlLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnb25lJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIGRvbmUoKVxuICAgICAgfSxcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdhbGxvd3MgdW5zdWJzY3JpYmluZycsIChkb25lKSA9PiB7XG4gICAgY29uc3QgZXhhbXBsZUluc3RhbmNlID0gbmV3IEV4YW1wbGVDbGFzcygpXG4gICAgY29uc3QgdW5zdWJDYWxsID0gZXhhbXBsZUluc3RhbmNlLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnb25lJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbicpXG4gICAgICB9LFxuICAgIH0pXG4gICAgdW5zdWJDYWxsKClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvbmUoKVxuICAgIH0sIDEwMDApXG4gIH0pXG59KVxuIl19