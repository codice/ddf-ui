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
//# sourceMappingURL=cesium.layer-ordering.spec.js.map