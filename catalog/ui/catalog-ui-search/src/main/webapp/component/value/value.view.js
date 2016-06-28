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
/*global define, alert*/
define([
    'marionette',
    'underscore',
    'jquery',
    'text!./value.hbs',
    'js/CustomElements',
    'component/input/input.view',
    'component/input/thumbnail/input-thumbnail.view',
    'component/input/date/input-date.view',
    'component/location-old/location-old.view'
], function (Marionette, _, $, template, CustomElements, InputView, InputThumbnailView, InputDateView, LocationOldView) {

    return Marionette.LayoutView.extend({
        template: template,
        tagName: CustomElements.register('value'),
        events: {
            'click .value-delete': 'delete'
        },
        regions: {
            input: '.value-input'
        },
        initialize: function(){
            this.listenTo(this.model.get('property'), 'change:isEditing', this.handleEdit);
        },
        onRender: function () {
            this.handleEdit();
            this.handleMultivalue();
        },
        onBeforeShow: function(){
            switch (this.model.get('property').get('calculatedType')) {
                case 'date':
                    this.input.show(new InputDateView({
                        model: this.model
                    }));
                    break;
                case 'thumbnail':
                    this.input.show(new InputThumbnailView({
                        model: this.model
                    }));
                    break;
                case 'location':
                    this.input.show(new LocationOldView({
                        model: this.model
                    }));
                    break;
                case 'text':
                    this.input.show(new InputView({
                        model: this.model
                    }));
                    break;
                default:
                    this.input.show(new InputView({
                        model: this.model
                    }));
                    break;
            }
        },
        hasChanged: function(){
            return this.input.currentView.hasChanged();
        },
        handleEdit: function () {
            this.$el.toggleClass('is-editing', this.model.isEditing());
        },
        handleMultivalue: function(){
            this.$el.toggleClass('is-multivalued', this.model.isMultivalued());
        },
        focus: function(){
            this.input.currentView.focus();
        },
        delete: function(){
            this.model.destroy();
        },
        getCurrentValue: function(){
            return this.input.currentView.getCurrentValue();
        }
    });
});