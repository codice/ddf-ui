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
    'icanhaz',
    'underscore',
    'jquery',
    'text!templates/workspace/workspaceSelector.handlebars',
    'js/CustomElements'
], function (Marionette, ich, _, $, workspaceSelectorTemplate, CustomElements) {

    ich.addTemplate('workspaceSelectorTemplate', workspaceSelectorTemplate);

    var currentWorkspace;

    var WorkspaceSelectorView = Marionette.ItemView.extend({
        template: 'workspaceSelectorTemplate',
        tagName: CustomElements.register('workspace-selector'),
        modelEvents: {
            'sync': 'handleSync'
        },
        initialize: function(){
        },
        serializeData: function(){
            return _.extend(this.model.toJSON(), {currentWorkspace: currentWorkspace});
        },
        handleSync: function(){
            var workspaces = this.model.get('workspaces').models;
            if (workspaces.length > 0){
                currentWorkspace = workspaces[0].get('name');
            }
            this.render();
        }
    });

    return WorkspaceSelectorView;
});