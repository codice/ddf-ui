import { useRender } from '../hooks/useRender';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Backbone from 'backbone';
import wreqr from '../../js/wreqr';
import $ from 'jquery';
var lastDrawing = 0;
var DEBOUNCE = 250;
export var Drawing = new (Backbone.Model.extend({
    defaults: {
        drawing: false,
        drawingModel: undefined,
    },
    initialize: function () {
        this.listenTo(wreqr.vent, 'search:drawline', this.turnOnDrawing);
        this.listenTo(wreqr.vent, 'search:drawcircle', this.turnOnDrawing);
        this.listenTo(wreqr.vent, 'search:drawpoly', this.turnOnDrawing);
        this.listenTo(wreqr.vent, 'search:drawbbox', this.turnOnDrawing);
        this.listenTo(wreqr.vent, 'search:drawcancel', this.turnOffDrawing);
        this.listenTo(wreqr.vent, 'search:drawend', this.turnOffDrawing);
    },
    turnOnDrawing: function (model) {
        this.set('drawing', true);
        this.set('drawingModel', model);
        $('html').toggleClass('is-drawing', true);
    },
    turnOffDrawing: function () {
        lastDrawing = Date.now();
        this.set('drawing', false);
        $('html').toggleClass('is-drawing', false);
    },
    timeSinceLastDrawing: function () {
        return Date.now() - lastDrawing;
    },
    getDrawModel: function () {
        return this.get('drawingModel');
    },
    isFuzzyDrawing: function () {
        return this.isDrawing() || this.timeSinceLastDrawing() < DEBOUNCE;
    },
    isDrawing: function () {
        return this.get('drawing');
    },
}))();
export var useIsDrawing = function () {
    var render = useRender();
    useListenTo(Drawing, 'change:drawing', render);
    return Drawing.isDrawing();
};
//# sourceMappingURL=drawing.js.map