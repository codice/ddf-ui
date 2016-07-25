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
    './hint.hbs',
    'js/CustomElements',
    'wreqr'
], function (Marionette, _, $, template, CustomElements, wreqr) {

    return Marionette.ItemView.extend({
        template: template,
        tagName: CustomElements.register('hint'),
        events: {
        },
        onRender: function(){
           this.el.innerHTML = this.model.get('hint');
        }
    });
});