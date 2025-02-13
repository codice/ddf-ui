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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NyaWJhYmxlLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvQmFzZS9zdWJzY3JpYmFibGUuc3BlYy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU3QztJQUEyQixnQ0FBaUQ7SUFDMUU7UUFBQSxZQUNFLGlCQUFPLFNBS1I7UUFKQyxVQUFVLENBQUM7WUFDVCxLQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtZQUN6QyxLQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUMzQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUEsQ0FBQyxzQ0FBc0M7O0lBQ2hELENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUFSRCxDQUEyQixZQUFZLEdBUXRDO0FBRUQsUUFBUSxDQUFDLHVDQUF1QyxFQUFFO0lBQ2hELEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLElBQUk7UUFDNUIsSUFBTSxlQUFlLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUMxQyxlQUFlLENBQUMsV0FBVyxDQUFDO1lBQzFCLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsUUFBUSxFQUFFO2dCQUNSLElBQUksRUFBRSxDQUFBO1lBQ1IsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUMsSUFBSTtRQUM5QixJQUFNLGVBQWUsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO1FBQzFDLElBQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7WUFDNUMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1lBQzNDLENBQUM7U0FDRixDQUFDLENBQUE7UUFDRixTQUFTLEVBQUUsQ0FBQTtRQUNYLFVBQVUsQ0FBQztZQUNULElBQUksRUFBRSxDQUFBO1FBQ1IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ1YsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YnNjcmliYWJsZSB9IGZyb20gJy4vYmFzZS1jbGFzc2VzJ1xuXG5jbGFzcyBFeGFtcGxlQ2xhc3MgZXh0ZW5kcyBTdWJzY3JpYmFibGU8eyB0aGluZzogJ29uZScgfSB8IHsgdGhpbmc6ICd0d28nIH0+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ29uZScgfSlcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICd0d28nIH0pXG4gICAgfSwgNTAwKSAvLyAyMDAwbXMgaXMgbWF4IGJlZm9yZSBqZXN0IGNvbXBsYWluc1xuICB9XG59XG5cbmRlc2NyaWJlKCdzdWJzY3JpYmFibGUgY2xhc3NlcyB3b3JrIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICBpdCgnYWxsb3dzIHN1YnNjcmliaW5nJywgKGRvbmUpID0+IHtcbiAgICBjb25zdCBleGFtcGxlSW5zdGFuY2UgPSBuZXcgRXhhbXBsZUNsYXNzKClcbiAgICBleGFtcGxlSW5zdGFuY2Uuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdvbmUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgZG9uZSgpXG4gICAgICB9LFxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ2FsbG93cyB1bnN1YnNjcmliaW5nJywgKGRvbmUpID0+IHtcbiAgICBjb25zdCBleGFtcGxlSW5zdGFuY2UgPSBuZXcgRXhhbXBsZUNsYXNzKClcbiAgICBjb25zdCB1bnN1YkNhbGwgPSBleGFtcGxlSW5zdGFuY2Uuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdvbmUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuJylcbiAgICAgIH0sXG4gICAgfSlcbiAgICB1bnN1YkNhbGwoKVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZG9uZSgpXG4gICAgfSwgMTAwMClcbiAgfSlcbn0pXG4iXX0=