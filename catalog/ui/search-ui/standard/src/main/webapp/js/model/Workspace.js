/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/*global define*/

define([
        'backbone',
        'js/model/Metacard',
        'js/model/Query',
        'js/Common',
        'backboneassociations'
    ],
    function (Backbone, Metacard, Query, Common) {
        "use strict";
        var Workspace = {};

        Workspace.MetacardList = Backbone.Collection.extend({
            model: Metacard.Metacard
        });

        Workspace.SearchList = Backbone.Collection.extend({
            model: Query.Model
        });

        Workspace.Model = Backbone.AssociatedModel.extend({
            relations: [
                {
                    type: Backbone.Many,
                    key: 'searches',
                    relatedModel: Query.Model
                },
                {
                    type: Backbone.Many,
                    key: 'metacards',
                    relatedModel: Metacard.MetacardResult
                }
            ],
            initialize: function() {
                if(!this.get('searches')) {
                    this.set({searches: new Workspace.SearchList()});
                }
                if(!this.get('metacards')) {
                    this.set({metacards: new Workspace.MetacardList()});
                }
                if (!this.get('id')){
                    this.set('id', Common.generateUUID());
                }
            }
        });

        Workspace.WorkspaceList = Backbone.Collection.extend({
            model: Workspace.Model
        });

        Workspace.WorkspaceResult = new (Backbone.AssociatedModel.extend({
            relations: [
                {
                    type: Backbone.Many,
                    key: 'workspaces',
                    relatedModel: Workspace.Model,
                    collectionType: Workspace.WorkspaceList
                }
            ],
            defaults: {
                currentWorkspace: undefined
            },
            url: '/service/workspaces',
            useAjaxSync: false,
            initialize: function() {
                if(!this.get('workspaces')) {
                    this.set({workspaces: new Workspace.WorkspaceList()});
                }
                this.on({
                   'all': this.setCurrentWorkspace
                });
            },
            parse: function (resp) {
                if (resp.data) {
                    return resp.data;
                }
                return resp;
            },
            clearDeletedWorkspace: function(){
                var currentWorkspace = this.get('currentWorkspace');
                if (currentWorkspace && !this.get('workspaces').get(currentWorkspace)){
                    this.set('currentWorkspace',undefined);
                }
            },
            setCurrentWorkspace: function(){
                this.clearDeletedWorkspace();
                var currentWorkspace = this.get('currentWorkspace');
                var workspaces = this.get('workspaces');
                if (!currentWorkspace && workspaces.length !==0){
                    this.set('currentWorkspace',workspaces.models[0].get('id'));
                }
            },
            getCurrentWorkspaceName: function(){
                var currentWorkspace = this.get('currentWorkspace');
                if (currentWorkspace){
                    return this.get('workspaces').get(currentWorkspace).get('name');
                } else {
                    return undefined;
                }
            }
        }))();

        return Workspace;

    });