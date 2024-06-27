var _this = this;
import { __read, __spreadArray } from "tslib";
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
import { expect } from 'chai';
import { addLayer, shiftLayers, getShift } from './cesium.layer-ordering';
describe('Cesium Layer Ordering', function () {
    var checkOrdering = function (_a) {
        var actual = _a.actual, expected = _a.expected;
        return expect(actual).to.have.same.ordered.members(expected);
    };
    describe('addLayer()', function () {
        describe('Returns correct layer order when adding to:', function () {
            var initialized = ['b', 'd'];
            var all = ['a', 'b', 'c', 'd', 'e'];
            var testData = [
                { test: 'beginning', layer: 'a', expectedOrder: ['a', 'b', 'd'] },
                { test: 'middle', layer: 'c', expectedOrder: ['b', 'c', 'd'] },
                { test: 'end', layer: 'e', expectedOrder: ['b', 'd', 'e'] },
            ];
            testData.forEach(function (_a) {
                var test = _a.test, layer = _a.layer, expectedOrder = _a.expectedOrder;
                it("".concat(test), function () {
                    var newLayerOrder = addLayer({
                        initialized: initialized,
                        all: all,
                        layer: layer,
                    });
                    checkOrdering({ actual: newLayerOrder, expected: expectedOrder });
                });
            });
        });
        it('Can add layer to empty ordering', function () {
            var newLayerOrder = addLayer({
                initialized: [],
                all: ['a', 'b', 'c', 'd', 'e'],
                layer: 'a',
            });
            checkOrdering({ actual: newLayerOrder, expected: ['a'] });
        });
        it('Does not duplicate an existing layer', function () {
            var newLayerOrder = addLayer({
                initialized: ['a', 'c', 'd'],
                all: ['a', 'b', 'c', 'd', 'e'],
                layer: 'c',
            });
            checkOrdering({ actual: newLayerOrder, expected: ['a', 'c', 'd'] });
        });
        it('Does not add a layer that does not exist', function () {
            var newLayerOrder = addLayer({
                initialized: ['a', 'c', 'd'],
                all: ['a', 'b', 'c', 'd', 'e'],
                layer: 'g',
            });
            checkOrdering({ actual: newLayerOrder, expected: ['a', 'c', 'd'] });
        });
        it('Throws the correct error when the passed in layer orders have different orders', function () {
            expect(addLayer.bind(_this, {
                initialized: ['d', 'a', 'b'],
                all: ['a', 'b', 'c', 'd', 'e'],
                layer: 'c',
            })).to.throw(Error, 'addLayer: the two layer orders cannot have different orders');
        });
        it('Throws the correct error when the when the set of all layers is not a superset of the initialized layers', function () {
            expect(addLayer.bind(_this, {
                initialized: ['a', 'g', 'd'],
                all: ['a', 'b', 'c', 'd', 'e'],
                layer: 'c',
            })).to.throw(Error, 'addLayer: the set of all layers must be a superset of initialized layers');
        });
    });
    describe('Shift Layers', function () {
        var testData = [
            //shift from ['a', 'b', 'c', 'd', 'e']
            { test: 'from beginning to middle', cur: ['b', 'c', 'a', 'd', 'e'] },
            { test: 'from beginning to end', cur: ['b', 'c', 'd', 'e', 'a'] },
            { test: 'from middle to beginning', cur: ['c', 'a', 'b', 'd', 'e'] },
            { test: 'from middle to end', cur: ['a', 'b', 'd', 'e', 'c'] },
            { test: 'from middle leftwards', cur: ['a', 'c', 'b', 'd', 'e'] },
            { test: 'from middle rightwards', cur: ['a', 'b', 'd', 'c', 'e'] },
            { test: 'from end to middle', cur: ['a', 'b', 'e', 'c', 'd'] },
            { test: 'from end to beginning', cur: ['e', 'a', 'b', 'c', 'd'] },
            { test: 'no change in ordering', cur: ['a', 'b', 'c', 'd', 'e'] },
        ];
        describe('shiftLayers()', function () {
            describe('All layers initialized', function () {
                var prev = ['a', 'b', 'c', 'd', 'e'];
                describe('Returns correct layer order for shifts:', function () {
                    testData.forEach(function (_a) {
                        var test = _a.test, cur = _a.cur;
                        it("".concat(test), function () {
                            var newLayerOrder = shiftLayers({ prev: prev, cur: cur });
                            checkOrdering({ actual: newLayerOrder, expected: cur });
                        });
                    });
                });
            });
            describe('Not all layers initialized', function () {
                var prev = ['b', 'c', 'e'];
                var previousLayers = new Set(prev);
                describe('Returns correct layer order for shifts:', function () {
                    testData.forEach(function (_a) {
                        var test = _a.test, cur = _a.cur;
                        it("".concat(test), function () {
                            var newLayerOrder = shiftLayers({ prev: prev, cur: cur });
                            checkOrdering({
                                actual: newLayerOrder,
                                expected: cur.filter(function (layer) { return previousLayers.has(layer); }),
                            });
                        });
                    });
                });
            });
        });
        describe('getShift()', function () {
            var prev = ['a', 'b', 'c', 'd', 'e'];
            var applyShift = function (_a) {
                var previousLayerOrder = _a.prev, layer = _a.layer, method = _a.method, count = _a.count;
                var METHOD_RAISE = 'raise';
                var shiftLayerToIndex = function (_a) {
                    var layerOrder = _a.layerOrder, layerId = _a.layer, index = _a.index;
                    var layerIdRemoved = layerOrder.filter(function (id) { return id !== layerId; });
                    return __spreadArray(__spreadArray(__spreadArray([], __read(layerIdRemoved.slice(0, index)), false), [
                        layerId
                    ], false), __read(layerIdRemoved.slice(index)), false);
                };
                var modifier = method === METHOD_RAISE ? 1 : -1;
                var index = previousLayerOrder.indexOf(layer) + modifier * count;
                return shiftLayerToIndex({
                    layerOrder: previousLayerOrder,
                    layer: layer,
                    index: index,
                });
            };
            describe('Returns the correct shift:', function () {
                testData.forEach(function (_a) {
                    var test = _a.test, cur = _a.cur;
                    it("".concat(test), function () {
                        var _a = getShift({
                            prev: prev,
                            cur: cur,
                        }), layer = _a.layer, method = _a.method, count = _a.count;
                        var appliedShift = applyShift({ prev: prev, layer: layer, method: method, count: count });
                        checkOrdering({ actual: appliedShift, expected: cur });
                    });
                });
                it('Throws the correct error when the passed in layer orders do not contain the same ids', function () {
                    expect(getShift.bind(_this, {
                        prev: ['a', 'b', 'c', 'd'],
                        cur: ['a', 'b'],
                    })).to.throw(Error, 'getShift: arrays must contain the same ids');
                });
                it('Throws the correct error when more than one shift is required', function () {
                    expect(getShift.bind(_this, {
                        prev: ['d', 'a', 'b'],
                        cur: ['b', 'a', 'd'],
                    })).to.throw(Error, 'getShift: unable to find shift');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VzaXVtLmxheWVyLW9yZGVyaW5nLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY29udHJvbGxlcnMvY2VzaXVtLmxheWVyLW9yZGVyaW5nLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBY0EsaUJBb0xBOztBQWxNQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUM3QixPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUV6RSxRQUFRLENBQUMsdUJBQXVCLEVBQUU7SUFDaEMsSUFBTSxhQUFhLEdBQUcsVUFBQyxFQUF5QjtZQUF2QixNQUFNLFlBQUEsRUFBRSxRQUFRLGNBQUE7UUFDdkMsT0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFBckQsQ0FBcUQsQ0FBQTtJQUV2RCxRQUFRLENBQUMsWUFBWSxFQUFFO1FBQ3JCLFFBQVEsQ0FBQyw2Q0FBNkMsRUFBRTtZQUN0RCxJQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUM5QixJQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNyQyxJQUFNLFFBQVEsR0FBRztnQkFDZixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNqRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsQ0FB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RUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO29CQUN4RCxDQUFDLENBQUMsQ0FBQTtnQkFDSixDQUFDLENBQUMsQ0FBQTtnQkFDRixFQUFFLENBQUMsc0ZBQXNGLEVBQUU7b0JBQ3pGLE1BQU0sQ0FDSixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUksRUFBRTt3QkFDbEIsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO3dCQUMxQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3FCQUNoQixDQUFDLENBQ0gsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSw0Q0FBNEMsQ0FBQyxDQUFBO2dCQUNqRSxDQUFDLENBQUMsQ0FBQTtnQkFDRixFQUFFLENBQUMsK0RBQStELEVBQUU7b0JBQ2xFLE1BQU0sQ0FDSixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUksRUFBRTt3QkFDbEIsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7d0JBQ3JCLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO3FCQUNyQixDQUFDLENBQ0gsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFBO2dCQUNyRCxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuaW1wb3J0IHsgYWRkTGF5ZXIsIHNoaWZ0TGF5ZXJzLCBnZXRTaGlmdCB9IGZyb20gJy4vY2VzaXVtLmxheWVyLW9yZGVyaW5nJ1xuXG5kZXNjcmliZSgnQ2VzaXVtIExheWVyIE9yZGVyaW5nJywgKCkgPT4ge1xuICBjb25zdCBjaGVja09yZGVyaW5nID0gKHsgYWN0dWFsLCBleHBlY3RlZCB9OiBhbnkpID0+XG4gICAgZXhwZWN0KGFjdHVhbCkudG8uaGF2ZS5zYW1lLm9yZGVyZWQubWVtYmVycyhleHBlY3RlZClcblxuICBkZXNjcmliZSgnYWRkTGF5ZXIoKScsICgpID0+IHtcbiAgICBkZXNjcmliZSgnUmV0dXJucyBjb3JyZWN0IGxheWVyIG9yZGVyIHdoZW4gYWRkaW5nIHRvOicsICgpID0+IHtcbiAgICAgIGNvbnN0IGluaXRpYWxpemVkID0gWydiJywgJ2QnXVxuICAgICAgY29uc3QgYWxsID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnXVxuICAgICAgY29uc3QgdGVzdERhdGEgPSBbXG4gICAgICAgIHsgdGVzdDogJ2JlZ2lubmluZycsIGxheWVyOiAnYScsIGV4cGVjdGVkT3JkZXI6IFsnYScsICdiJywgJ2QnXSB9LFxuICAgICAgICB7IHRlc3Q6ICdtaWRkbGUnLCBsYXllcjogJ2MnLCBleHBlY3RlZE9yZGVyOiBbJ2InLCAnYycsICdkJ10gfSxcbiAgICAgICAgeyB0ZXN0OiAnZW5kJywgbGF5ZXI6ICdlJywgZXhwZWN0ZWRPcmRlcjogWydiJywgJ2QnLCAnZSddIH0sXG4gICAgICBdXG5cbiAgICAgIHRlc3REYXRhLmZvckVhY2goKHsgdGVzdCwgbGF5ZXIsIGV4cGVjdGVkT3JkZXIgfSkgPT4ge1xuICAgICAgICBpdChgJHt0ZXN0fWAsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdMYXllck9yZGVyID0gYWRkTGF5ZXIoe1xuICAgICAgICAgICAgaW5pdGlhbGl6ZWQsXG4gICAgICAgICAgICBhbGwsXG4gICAgICAgICAgICBsYXllcixcbiAgICAgICAgICB9KVxuICAgICAgICAgIGNoZWNrT3JkZXJpbmcoeyBhY3R1YWw6IG5ld0xheWVyT3JkZXIsIGV4cGVjdGVkOiBleHBlY3RlZE9yZGVyIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gICAgaXQoJ0NhbiBhZGQgbGF5ZXIgdG8gZW1wdHkgb3JkZXJpbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXdMYXllck9yZGVyID0gYWRkTGF5ZXIoe1xuICAgICAgICBpbml0aWFsaXplZDogW10sXG4gICAgICAgIGFsbDogWydhJywgJ2InLCAnYycsICdkJywgJ2UnXSxcbiAgICAgICAgbGF5ZXI6ICdhJyxcbiAgICAgIH0pXG4gICAgICBjaGVja09yZGVyaW5nKHsgYWN0dWFsOiBuZXdMYXllck9yZGVyLCBleHBlY3RlZDogWydhJ10gfSlcbiAgICB9KVxuICAgIGl0KCdEb2VzIG5vdCBkdXBsaWNhdGUgYW4gZXhpc3RpbmcgbGF5ZXInLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXdMYXllck9yZGVyID0gYWRkTGF5ZXIoe1xuICAgICAgICBpbml0aWFsaXplZDogWydhJywgJ2MnLCAnZCddLFxuICAgICAgICBhbGw6IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10sXG4gICAgICAgIGxheWVyOiAnYycsXG4gICAgICB9KVxuICAgICAgY2hlY2tPcmRlcmluZyh7IGFjdHVhbDogbmV3TGF5ZXJPcmRlciwgZXhwZWN0ZWQ6IFsnYScsICdjJywgJ2QnXSB9KVxuICAgIH0pXG4gICAgaXQoJ0RvZXMgbm90IGFkZCBhIGxheWVyIHRoYXQgZG9lcyBub3QgZXhpc3QnLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXdMYXllck9yZGVyID0gYWRkTGF5ZXIoe1xuICAgICAgICBpbml0aWFsaXplZDogWydhJywgJ2MnLCAnZCddLFxuICAgICAgICBhbGw6IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10sXG4gICAgICAgIGxheWVyOiAnZycsXG4gICAgICB9KVxuICAgICAgY2hlY2tPcmRlcmluZyh7IGFjdHVhbDogbmV3TGF5ZXJPcmRlciwgZXhwZWN0ZWQ6IFsnYScsICdjJywgJ2QnXSB9KVxuICAgIH0pXG4gICAgaXQoJ1Rocm93cyB0aGUgY29ycmVjdCBlcnJvciB3aGVuIHRoZSBwYXNzZWQgaW4gbGF5ZXIgb3JkZXJzIGhhdmUgZGlmZmVyZW50IG9yZGVycycsICgpID0+IHtcbiAgICAgIGV4cGVjdChcbiAgICAgICAgYWRkTGF5ZXIuYmluZCh0aGlzLCB7XG4gICAgICAgICAgaW5pdGlhbGl6ZWQ6IFsnZCcsICdhJywgJ2InXSxcbiAgICAgICAgICBhbGw6IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10sXG4gICAgICAgICAgbGF5ZXI6ICdjJyxcbiAgICAgICAgfSlcbiAgICAgICkudG8udGhyb3coXG4gICAgICAgIEVycm9yLFxuICAgICAgICAnYWRkTGF5ZXI6IHRoZSB0d28gbGF5ZXIgb3JkZXJzIGNhbm5vdCBoYXZlIGRpZmZlcmVudCBvcmRlcnMnXG4gICAgICApXG4gICAgfSlcbiAgICBpdCgnVGhyb3dzIHRoZSBjb3JyZWN0IGVycm9yIHdoZW4gdGhlIHdoZW4gdGhlIHNldCBvZiBhbGwgbGF5ZXJzIGlzIG5vdCBhIHN1cGVyc2V0IG9mIHRoZSBpbml0aWFsaXplZCBsYXllcnMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoXG4gICAgICAgIGFkZExheWVyLmJpbmQodGhpcywge1xuICAgICAgICAgIGluaXRpYWxpemVkOiBbJ2EnLCAnZycsICdkJ10sXG4gICAgICAgICAgYWxsOiBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZSddLFxuICAgICAgICAgIGxheWVyOiAnYycsXG4gICAgICAgIH0pXG4gICAgICApLnRvLnRocm93KFxuICAgICAgICBFcnJvcixcbiAgICAgICAgJ2FkZExheWVyOiB0aGUgc2V0IG9mIGFsbCBsYXllcnMgbXVzdCBiZSBhIHN1cGVyc2V0IG9mIGluaXRpYWxpemVkIGxheWVycydcbiAgICAgIClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdTaGlmdCBMYXllcnMnLCAoKSA9PiB7XG4gICAgY29uc3QgdGVzdERhdGEgPSBbXG4gICAgICAvL3NoaWZ0IGZyb20gWydhJywgJ2InLCAnYycsICdkJywgJ2UnXVxuICAgICAgeyB0ZXN0OiAnZnJvbSBiZWdpbm5pbmcgdG8gbWlkZGxlJywgY3VyOiBbJ2InLCAnYycsICdhJywgJ2QnLCAnZSddIH0sXG4gICAgICB7IHRlc3Q6ICdmcm9tIGJlZ2lubmluZyB0byBlbmQnLCBjdXI6IFsnYicsICdjJywgJ2QnLCAnZScsICdhJ10gfSxcbiAgICAgIHsgdGVzdDogJ2Zyb20gbWlkZGxlIHRvIGJlZ2lubmluZycsIGN1cjogWydjJywgJ2EnLCAnYicsICdkJywgJ2UnXSB9LFxuICAgICAgeyB0ZXN0OiAnZnJvbSBtaWRkbGUgdG8gZW5kJywgY3VyOiBbJ2EnLCAnYicsICdkJywgJ2UnLCAnYyddIH0sXG4gICAgICB7IHRlc3Q6ICdmcm9tIG1pZGRsZSBsZWZ0d2FyZHMnLCBjdXI6IFsnYScsICdjJywgJ2InLCAnZCcsICdlJ10gfSxcbiAgICAgIHsgdGVzdDogJ2Zyb20gbWlkZGxlIHJpZ2h0d2FyZHMnLCBjdXI6IFsnYScsICdiJywgJ2QnLCAnYycsICdlJ10gfSxcbiAgICAgIHsgdGVzdDogJ2Zyb20gZW5kIHRvIG1pZGRsZScsIGN1cjogWydhJywgJ2InLCAnZScsICdjJywgJ2QnXSB9LFxuICAgICAgeyB0ZXN0OiAnZnJvbSBlbmQgdG8gYmVnaW5uaW5nJywgY3VyOiBbJ2UnLCAnYScsICdiJywgJ2MnLCAnZCddIH0sXG4gICAgICB7IHRlc3Q6ICdubyBjaGFuZ2UgaW4gb3JkZXJpbmcnLCBjdXI6IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10gfSxcbiAgICBdXG4gICAgZGVzY3JpYmUoJ3NoaWZ0TGF5ZXJzKCknLCAoKSA9PiB7XG4gICAgICBkZXNjcmliZSgnQWxsIGxheWVycyBpbml0aWFsaXplZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJldiA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ11cblxuICAgICAgICBkZXNjcmliZSgnUmV0dXJucyBjb3JyZWN0IGxheWVyIG9yZGVyIGZvciBzaGlmdHM6JywgKCkgPT4ge1xuICAgICAgICAgIHRlc3REYXRhLmZvckVhY2goKHsgdGVzdCwgY3VyIH0pID0+IHtcbiAgICAgICAgICAgIGl0KGAke3Rlc3R9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBuZXdMYXllck9yZGVyID0gc2hpZnRMYXllcnMoeyBwcmV2LCBjdXIgfSlcbiAgICAgICAgICAgICAgY2hlY2tPcmRlcmluZyh7IGFjdHVhbDogbmV3TGF5ZXJPcmRlciwgZXhwZWN0ZWQ6IGN1ciB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIGRlc2NyaWJlKCdOb3QgYWxsIGxheWVycyBpbml0aWFsaXplZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJldiA9IFsnYicsICdjJywgJ2UnXVxuICAgICAgICBjb25zdCBwcmV2aW91c0xheWVycyA9IG5ldyBTZXQocHJldilcbiAgICAgICAgZGVzY3JpYmUoJ1JldHVybnMgY29ycmVjdCBsYXllciBvcmRlciBmb3Igc2hpZnRzOicsICgpID0+IHtcbiAgICAgICAgICB0ZXN0RGF0YS5mb3JFYWNoKCh7IHRlc3QsIGN1ciB9KSA9PiB7XG4gICAgICAgICAgICBpdChgJHt0ZXN0fWAsICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbmV3TGF5ZXJPcmRlciA9IHNoaWZ0TGF5ZXJzKHsgcHJldiwgY3VyIH0pXG4gICAgICAgICAgICAgIGNoZWNrT3JkZXJpbmcoe1xuICAgICAgICAgICAgICAgIGFjdHVhbDogbmV3TGF5ZXJPcmRlcixcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogY3VyLmZpbHRlcigobGF5ZXIpID0+IHByZXZpb3VzTGF5ZXJzLmhhcyhsYXllcikpLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlc2NyaWJlKCdnZXRTaGlmdCgpJywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJldiA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ11cbiAgICAgIGNvbnN0IGFwcGx5U2hpZnQgPSAoe1xuICAgICAgICBwcmV2OiBwcmV2aW91c0xheWVyT3JkZXIsXG4gICAgICAgIGxheWVyLFxuICAgICAgICBtZXRob2QsXG4gICAgICAgIGNvdW50LFxuICAgICAgfTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IE1FVEhPRF9SQUlTRSA9ICdyYWlzZSdcbiAgICAgICAgY29uc3Qgc2hpZnRMYXllclRvSW5kZXggPSAoe1xuICAgICAgICAgIGxheWVyT3JkZXIsXG4gICAgICAgICAgbGF5ZXI6IGxheWVySWQsXG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgIH06IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGxheWVySWRSZW1vdmVkID0gbGF5ZXJPcmRlci5maWx0ZXIoKGlkOiBhbnkpID0+IGlkICE9PSBsYXllcklkKVxuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5sYXllcklkUmVtb3ZlZC5zbGljZSgwLCBpbmRleCksXG4gICAgICAgICAgICBsYXllcklkLFxuICAgICAgICAgICAgLi4ubGF5ZXJJZFJlbW92ZWQuc2xpY2UoaW5kZXgpLFxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb2RpZmllciA9IG1ldGhvZCA9PT0gTUVUSE9EX1JBSVNFID8gMSA6IC0xXG4gICAgICAgIGNvbnN0IGluZGV4ID0gcHJldmlvdXNMYXllck9yZGVyLmluZGV4T2YobGF5ZXIpICsgbW9kaWZpZXIgKiBjb3VudFxuICAgICAgICByZXR1cm4gc2hpZnRMYXllclRvSW5kZXgoe1xuICAgICAgICAgIGxheWVyT3JkZXI6IHByZXZpb3VzTGF5ZXJPcmRlcixcbiAgICAgICAgICBsYXllcixcbiAgICAgICAgICBpbmRleCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGRlc2NyaWJlKCdSZXR1cm5zIHRoZSBjb3JyZWN0IHNoaWZ0OicsICgpID0+IHtcbiAgICAgICAgdGVzdERhdGEuZm9yRWFjaCgoeyB0ZXN0LCBjdXIgfSkgPT4ge1xuICAgICAgICAgIGl0KGAke3Rlc3R9YCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBsYXllciwgbWV0aG9kLCBjb3VudCB9ID0gZ2V0U2hpZnQoe1xuICAgICAgICAgICAgICBwcmV2LFxuICAgICAgICAgICAgICBjdXIsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY29uc3QgYXBwbGllZFNoaWZ0ID0gYXBwbHlTaGlmdCh7IHByZXYsIGxheWVyLCBtZXRob2QsIGNvdW50IH0pXG4gICAgICAgICAgICBjaGVja09yZGVyaW5nKHsgYWN0dWFsOiBhcHBsaWVkU2hpZnQsIGV4cGVjdGVkOiBjdXIgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBpdCgnVGhyb3dzIHRoZSBjb3JyZWN0IGVycm9yIHdoZW4gdGhlIHBhc3NlZCBpbiBsYXllciBvcmRlcnMgZG8gbm90IGNvbnRhaW4gdGhlIHNhbWUgaWRzJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChcbiAgICAgICAgICAgIGdldFNoaWZ0LmJpbmQodGhpcywge1xuICAgICAgICAgICAgICBwcmV2OiBbJ2EnLCAnYicsICdjJywgJ2QnXSxcbiAgICAgICAgICAgICAgY3VyOiBbJ2EnLCAnYiddLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApLnRvLnRocm93KEVycm9yLCAnZ2V0U2hpZnQ6IGFycmF5cyBtdXN0IGNvbnRhaW4gdGhlIHNhbWUgaWRzJylcbiAgICAgICAgfSlcbiAgICAgICAgaXQoJ1Rocm93cyB0aGUgY29ycmVjdCBlcnJvciB3aGVuIG1vcmUgdGhhbiBvbmUgc2hpZnQgaXMgcmVxdWlyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KFxuICAgICAgICAgICAgZ2V0U2hpZnQuYmluZCh0aGlzLCB7XG4gICAgICAgICAgICAgIHByZXY6IFsnZCcsICdhJywgJ2InXSxcbiAgICAgICAgICAgICAgY3VyOiBbJ2InLCAnYScsICdkJ10sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICkudG8udGhyb3coRXJyb3IsICdnZXRTaGlmdDogdW5hYmxlIHRvIGZpbmQgc2hpZnQnKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==