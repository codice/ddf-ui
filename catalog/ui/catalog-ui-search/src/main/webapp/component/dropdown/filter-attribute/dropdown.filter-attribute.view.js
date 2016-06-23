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
/*global define*/
define([
    'marionette',
    'underscore',
    'jquery',
    '../dropdown.view',
    'text!./dropdown.filter-attribute.hbs',
    'component/filter-attribute/filter-attribute.view',
    'properties'
], function (Marionette, _, $, DropdownView, template, ComponentView, properties) {

    return DropdownView.extend({
        template: template,
        className: 'is-filterAttribute',
        componentToShow: ComponentView,
        initializeComponentModel: function(){
            //override if you need more functionality
            this.modelForComponent = this.options.modelForComponent;
        },
        listenToComponent: function(){
            //override if you need more functionality
            this.listenTo(this.modelForComponent, 'change:type', function(){
                this.model.set('value', this.modelForComponent.get('type'));
            }.bind(this));
        },
        isCentered: true,
        getCenteringElement: function(){
            return this.el;
        },
        hasTail: true,
        serializeData: function(){
            return properties.attributeAliases[this.model.get('value')] || this.model.get('value');
        }
    });
});
