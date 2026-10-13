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
import _ from 'underscore';
import Backbone from 'backbone';
import Metacard from '../../js/model/Metacard';
import QueryModel from '../../js/model/Query';
import QueryResponse from '../../js/model/QueryResponse';
import QueryResult from '../../js/model/QueryResult';
export default Backbone.AssociatedModel.extend({
    relations: [
        {
            type: Backbone.One,
            key: 'currentQuery',
            relatedModel: QueryModel,
        },
        {
            type: Backbone.One,
            key: 'currentMetacard',
            relatedModel: QueryResponse,
        },
        {
            type: Backbone.Many,
            key: 'selectedResults',
            relatedModel: Metacard,
        },
        {
            type: Backbone.Many,
            key: 'activeSearchResults',
            relatedModel: QueryResult,
        },
        {
            type: Backbone.Many,
            key: 'completeActiveSearchResults',
            relatedModel: QueryResult,
        },
    ],
    defaults: {
        currentQuery: undefined,
        currentMetacard: undefined,
        selectedResults: [],
        activeSearchResults: [],
        activeSearchResultsAttributes: [],
    },
    initialize: function () {
        this.set('currentResult', new QueryResponse());
        this.listenTo(this, 'change:currentMetacard', this.handleUpdate);
        this.listenTo(this, 'change:currentMetacard', this.handleCurrentMetacard);
        this.listenTo(this, 'change:currentResult', this.handleResultChange);
        this.listenTo(this.get('activeSearchResults'), 'update add remove reset', this.updateActiveSearchResultsAttributes);
    },
    handleResultChange: function () {
        this.listenTo(this.get('currentResult'), 'sync reset:results', this.handleResults);
    },
    handleResults: function () {
        this.set('currentMetacard', this.get('currentResult').get('results').first());
    },
    updateActiveSearchResultsAttributes: function () {
        var availableAttributes = this.get('activeSearchResults')
            .reduce(function (currentAvailable, result) {
            currentAvailable = _.union(currentAvailable, Object.keys(result.get('metacard').get('properties').toJSON()));
            return currentAvailable;
        }, [])
            .sort();
        this.set('activeSearchResultsAttributes', availableAttributes);
    },
    getActiveSearchResultsAttributes: function () {
        return this.get('activeSearchResultsAttributes');
    },
    handleUpdate: function () {
        this.clearSelectedResults();
        this.setActiveSearchResults(this.get('currentResult').get('results'));
        this.addSelectedResult(this.get('currentMetacard'));
    },
    handleCurrentMetacard: function () {
        if (this.get('currentMetacard') !== undefined) {
            this.get('currentQuery').cancelCurrentSearches();
        }
    },
    getActiveSearchResults: function () {
        return this.get('activeSearchResults');
    },
    setActiveSearchResults: function (results) {
        this.get('activeSearchResults').reset(results.models || results);
    },
    addToActiveSearchResults: function (results) {
        this.get('activeSearchResults').add(results.models || results);
    },
    setSelectedResults: function (results) {
        this.get('selectedResults').reset(results.models || results);
    },
    getSelectedResults: function () {
        return this.get('selectedResults');
    },
    clearSelectedResults: function () {
        this.getSelectedResults().reset();
    },
    addSelectedResult: function (metacard) {
        this.getSelectedResults().add(metacard);
    },
    removeSelectedResult: function (metacard) {
        this.getSelectedResults().remove(metacard);
    },
    setCurrentQuery: function (query) {
        this.set('currentQuery', query);
    },
    getCurrentQuery: function () {
        return this.get('currentQuery');
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWludGVyZmFjZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sUUFBUSxNQUFNLHlCQUF5QixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFBO0FBQzdDLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELE9BQU8sV0FBVyxNQUFNLDRCQUE0QixDQUFBO0FBRXBELGVBQWUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDN0MsU0FBUyxFQUFFO1FBQ1Q7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDbEIsR0FBRyxFQUFFLGNBQWM7WUFDbkIsWUFBWSxFQUFFLFVBQVU7U0FDekI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRztZQUNsQixHQUFHLEVBQUUsaUJBQWlCO1lBQ3RCLFlBQVksRUFBRSxhQUFhO1NBQzVCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDbkIsR0FBRyxFQUFFLGlCQUFpQjtZQUN0QixZQUFZLEVBQUUsUUFBUTtTQUN2QjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLEdBQUcsRUFBRSxxQkFBcUI7WUFDMUIsWUFBWSxFQUFFLFdBQVc7U0FDMUI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNuQixHQUFHLEVBQUUsNkJBQTZCO1lBQ2xDLFlBQVksRUFBRSxXQUFXO1NBQzFCO0tBQ0Y7SUFD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QUFPLENBQUMsQ0FBQTtJQUNsRSxDQUFDO0lBQ0Qsd0JBQXdCLFlBQUMsT0FBWTtRQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUE7SUFDaEUsQ0FBQztJQUNELGtCQUFrQixZQUFDLE9BQVk7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFBO0lBQzlELENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNuQyxDQUFDO0lBQ0QsaUJBQWlCLFlBQUMsUUFBYTtRQUM3QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUNELG9CQUFvQixZQUFDLFFBQWE7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFDRCxlQUFlLFlBQUMsS0FBVTtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQ0QsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCBNZXRhY2FyZCBmcm9tICcuLi8uLi9qcy9tb2RlbC9NZXRhY2FyZCdcbmltcG9ydCBRdWVyeU1vZGVsIGZyb20gJy4uLy4uL2pzL21vZGVsL1F1ZXJ5J1xuaW1wb3J0IFF1ZXJ5UmVzcG9uc2UgZnJvbSAnLi4vLi4vanMvbW9kZWwvUXVlcnlSZXNwb25zZSdcbmltcG9ydCBRdWVyeVJlc3VsdCBmcm9tICcuLi8uLi9qcy9tb2RlbC9RdWVyeVJlc3VsdCdcblxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ2N1cnJlbnRRdWVyeScsXG4gICAgICByZWxhdGVkTW9kZWw6IFF1ZXJ5TW9kZWwsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdjdXJyZW50TWV0YWNhcmQnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3BvbnNlLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ3NlbGVjdGVkUmVzdWx0cycsXG4gICAgICByZWxhdGVkTW9kZWw6IE1ldGFjYXJkLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ2FjdGl2ZVNlYXJjaFJlc3VsdHMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3VsdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk1hbnksXG4gICAgICBrZXk6ICdjb21wbGV0ZUFjdGl2ZVNlYXJjaFJlc3VsdHMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3VsdCxcbiAgICB9LFxuICBdLFxuICBkZWZhdWx0czoge1xuICAgIGN1cnJlbnRRdWVyeTogdW5kZWZpbmVkLFxuICAgIGN1cnJlbnRNZXRhY2FyZDogdW5kZWZpbmVkLFxuICAgIHNlbGVjdGVkUmVzdWx0czogW10sXG4gICAgYWN0aXZlU2VhcmNoUmVzdWx0czogW10sXG4gICAgYWN0aXZlU2VhcmNoUmVzdWx0c0F0dHJpYnV0ZXM6IFtdLFxuICB9LFxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2V0KCdjdXJyZW50UmVzdWx0JywgbmV3IFF1ZXJ5UmVzcG9uc2UoKSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y3VycmVudE1ldGFjYXJkJywgdGhpcy5oYW5kbGVVcGRhdGUpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmN1cnJlbnRNZXRhY2FyZCcsIHRoaXMuaGFuZGxlQ3VycmVudE1ldGFjYXJkKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjdXJyZW50UmVzdWx0JywgdGhpcy5oYW5kbGVSZXN1bHRDaGFuZ2UpXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMuZ2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzJyksXG4gICAgICAndXBkYXRlIGFkZCByZW1vdmUgcmVzZXQnLFxuICAgICAgdGhpcy51cGRhdGVBY3RpdmVTZWFyY2hSZXN1bHRzQXR0cmlidXRlc1xuICAgIClcbiAgfSxcbiAgaGFuZGxlUmVzdWx0Q2hhbmdlKCkge1xuICAgIHRoaXMubGlzdGVuVG8oXG4gICAgICB0aGlzLmdldCgnY3VycmVudFJlc3VsdCcpLFxuICAgICAgJ3N5bmMgcmVzZXQ6cmVzdWx0cycsXG4gICAgICB0aGlzLmhhbmRsZVJlc3VsdHNcbiAgICApXG4gIH0sXG4gIGhhbmRsZVJlc3VsdHMoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnY3VycmVudE1ldGFjYXJkJyxcbiAgICAgIHRoaXMuZ2V0KCdjdXJyZW50UmVzdWx0JykuZ2V0KCdyZXN1bHRzJykuZmlyc3QoKVxuICAgIClcbiAgfSxcbiAgdXBkYXRlQWN0aXZlU2VhcmNoUmVzdWx0c0F0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3QgYXZhaWxhYmxlQXR0cmlidXRlcyA9IHRoaXMuZ2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzJylcbiAgICAgIC5yZWR1Y2UoKGN1cnJlbnRBdmFpbGFibGU6IGFueSwgcmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgY3VycmVudEF2YWlsYWJsZSA9IF8udW5pb24oXG4gICAgICAgICAgY3VycmVudEF2YWlsYWJsZSxcbiAgICAgICAgICBPYmplY3Qua2V5cyhyZXN1bHQuZ2V0KCdtZXRhY2FyZCcpLmdldCgncHJvcGVydGllcycpLnRvSlNPTigpKVxuICAgICAgICApXG4gICAgICAgIHJldHVybiBjdXJyZW50QXZhaWxhYmxlXG4gICAgICB9LCBbXSlcbiAgICAgIC5zb3J0KClcbiAgICB0aGlzLnNldCgnYWN0aXZlU2VhcmNoUmVzdWx0c0F0dHJpYnV0ZXMnLCBhdmFpbGFibGVBdHRyaWJ1dGVzKVxuICB9LFxuICBnZXRBY3RpdmVTZWFyY2hSZXN1bHRzQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2FjdGl2ZVNlYXJjaFJlc3VsdHNBdHRyaWJ1dGVzJylcbiAgfSxcbiAgaGFuZGxlVXBkYXRlKCkge1xuICAgIHRoaXMuY2xlYXJTZWxlY3RlZFJlc3VsdHMoKVxuICAgIHRoaXMuc2V0QWN0aXZlU2VhcmNoUmVzdWx0cyh0aGlzLmdldCgnY3VycmVudFJlc3VsdCcpLmdldCgncmVzdWx0cycpKVxuICAgIHRoaXMuYWRkU2VsZWN0ZWRSZXN1bHQodGhpcy5nZXQoJ2N1cnJlbnRNZXRhY2FyZCcpKVxuICB9LFxuICBoYW5kbGVDdXJyZW50TWV0YWNhcmQoKSB7XG4gICAgaWYgKHRoaXMuZ2V0KCdjdXJyZW50TWV0YWNhcmQnKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmdldCgnY3VycmVudFF1ZXJ5JykuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICB9XG4gIH0sXG4gIGdldEFjdGl2ZVNlYXJjaFJlc3VsdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzJylcbiAgfSxcbiAgc2V0QWN0aXZlU2VhcmNoUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICB0aGlzLmdldCgnYWN0aXZlU2VhcmNoUmVzdWx0cycpLnJlc2V0KHJlc3VsdHMubW9kZWxzIHx8IHJlc3VsdHMpXG4gIH0sXG4gIGFkZFRvQWN0aXZlU2VhcmNoUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICB0aGlzLmdldCgnYWN0aXZlU2VhcmNoUmVzdWx0cycpLmFkZChyZXN1bHRzLm1vZGVscyB8fCByZXN1bHRzKVxuICB9LFxuICBzZXRTZWxlY3RlZFJlc3VsdHMocmVzdWx0czogYW55KSB7XG4gICAgdGhpcy5nZXQoJ3NlbGVjdGVkUmVzdWx0cycpLnJlc2V0KHJlc3VsdHMubW9kZWxzIHx8IHJlc3VsdHMpXG4gIH0sXG4gIGdldFNlbGVjdGVkUmVzdWx0cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3NlbGVjdGVkUmVzdWx0cycpXG4gIH0sXG4gIGNsZWFyU2VsZWN0ZWRSZXN1bHRzKCkge1xuICAgIHRoaXMuZ2V0U2VsZWN0ZWRSZXN1bHRzKCkucmVzZXQoKVxuICB9LFxuICBhZGRTZWxlY3RlZFJlc3VsdChtZXRhY2FyZDogYW55KSB7XG4gICAgdGhpcy5nZXRTZWxlY3RlZFJlc3VsdHMoKS5hZGQobWV0YWNhcmQpXG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkUmVzdWx0KG1ldGFjYXJkOiBhbnkpIHtcbiAgICB0aGlzLmdldFNlbGVjdGVkUmVzdWx0cygpLnJlbW92ZShtZXRhY2FyZClcbiAgfSxcbiAgc2V0Q3VycmVudFF1ZXJ5KHF1ZXJ5OiBhbnkpIHtcbiAgICB0aGlzLnNldCgnY3VycmVudFF1ZXJ5JywgcXVlcnkpXG4gIH0sXG4gIGdldEN1cnJlbnRRdWVyeSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2N1cnJlbnRRdWVyeScpXG4gIH0sXG59KVxuIl19