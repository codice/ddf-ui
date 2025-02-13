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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWludGVyZmFjZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sUUFBUSxNQUFNLHlCQUF5QixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFBO0FBQzdDLE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELE9BQU8sV0FBVyxNQUFNLDRCQUE0QixDQUFBO0FBRXBELGVBQWUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDN0MsU0FBUyxFQUFFO1FBQ1Q7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDbEIsR0FBRyxFQUFFLGNBQWM7WUFDbkIsWUFBWSxFQUFFLFVBQVU7U0FDekI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRztZQUNsQixHQUFHLEVBQUUsaUJBQWlCO1lBQ3RCLFlBQVksRUFBRSxhQUFhO1NBQzVCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDbkIsR0FBRyxFQUFFLGlCQUFpQjtZQUN0QixZQUFZLEVBQUUsUUFBUTtTQUN2QjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLEdBQUcsRUFBRSxxQkFBcUI7WUFDMUIsWUFBWSxFQUFFLFdBQVc7U0FDMUI7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNuQixHQUFHLEVBQUUsNkJBQTZCO1lBQ2xDLFlBQVksRUFBRSxXQUFXO1NBQzFCO0tBQ0Y7SUFD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QUFBO0lBQ2xFLENBQUM7SUFDRCx3QkFBd0IsWUFBQyxPQUFZO1FBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBQ0Qsa0JBQWtCLFlBQUMsT0FBWTtRQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUE7SUFDOUQsQ0FBQztJQUNELGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBQ0Qsb0JBQW9CO1FBQ2xCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFDRCxpQkFBaUIsWUFBQyxRQUFhO1FBQzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBQ0Qsb0JBQW9CLFlBQUMsUUFBYTtRQUNoQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUNELGVBQWUsWUFBQyxLQUFVO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFDRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IE1ldGFjYXJkIGZyb20gJy4uLy4uL2pzL21vZGVsL01ldGFjYXJkJ1xuaW1wb3J0IFF1ZXJ5TW9kZWwgZnJvbSAnLi4vLi4vanMvbW9kZWwvUXVlcnknXG5pbXBvcnQgUXVlcnlSZXNwb25zZSBmcm9tICcuLi8uLi9qcy9tb2RlbC9RdWVyeVJlc3BvbnNlJ1xuaW1wb3J0IFF1ZXJ5UmVzdWx0IGZyb20gJy4uLy4uL2pzL21vZGVsL1F1ZXJ5UmVzdWx0J1xuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAnY3VycmVudFF1ZXJ5JyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogUXVlcnlNb2RlbCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ2N1cnJlbnRNZXRhY2FyZCcsXG4gICAgICByZWxhdGVkTW9kZWw6IFF1ZXJ5UmVzcG9uc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5NYW55LFxuICAgICAga2V5OiAnc2VsZWN0ZWRSZXN1bHRzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogTWV0YWNhcmQsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5NYW55LFxuICAgICAga2V5OiAnYWN0aXZlU2VhcmNoUmVzdWx0cycsXG4gICAgICByZWxhdGVkTW9kZWw6IFF1ZXJ5UmVzdWx0LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ2NvbXBsZXRlQWN0aXZlU2VhcmNoUmVzdWx0cycsXG4gICAgICByZWxhdGVkTW9kZWw6IFF1ZXJ5UmVzdWx0LFxuICAgIH0sXG4gIF0sXG4gIGRlZmF1bHRzOiB7XG4gICAgY3VycmVudFF1ZXJ5OiB1bmRlZmluZWQsXG4gICAgY3VycmVudE1ldGFjYXJkOiB1bmRlZmluZWQsXG4gICAgc2VsZWN0ZWRSZXN1bHRzOiBbXSxcbiAgICBhY3RpdmVTZWFyY2hSZXN1bHRzOiBbXSxcbiAgICBhY3RpdmVTZWFyY2hSZXN1bHRzQXR0cmlidXRlczogW10sXG4gIH0sXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zZXQoJ2N1cnJlbnRSZXN1bHQnLCBuZXcgUXVlcnlSZXNwb25zZSgpKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjdXJyZW50TWV0YWNhcmQnLCB0aGlzLmhhbmRsZVVwZGF0ZSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y3VycmVudE1ldGFjYXJkJywgdGhpcy5oYW5kbGVDdXJyZW50TWV0YWNhcmQpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmN1cnJlbnRSZXN1bHQnLCB0aGlzLmhhbmRsZVJlc3VsdENoYW5nZSlcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcy5nZXQoJ2FjdGl2ZVNlYXJjaFJlc3VsdHMnKSxcbiAgICAgICd1cGRhdGUgYWRkIHJlbW92ZSByZXNldCcsXG4gICAgICB0aGlzLnVwZGF0ZUFjdGl2ZVNlYXJjaFJlc3VsdHNBdHRyaWJ1dGVzXG4gICAgKVxuICB9LFxuICBoYW5kbGVSZXN1bHRDaGFuZ2UoKSB7XG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMuZ2V0KCdjdXJyZW50UmVzdWx0JyksXG4gICAgICAnc3luYyByZXNldDpyZXN1bHRzJyxcbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0c1xuICAgIClcbiAgfSxcbiAgaGFuZGxlUmVzdWx0cygpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICdjdXJyZW50TWV0YWNhcmQnLFxuICAgICAgdGhpcy5nZXQoJ2N1cnJlbnRSZXN1bHQnKS5nZXQoJ3Jlc3VsdHMnKS5maXJzdCgpXG4gICAgKVxuICB9LFxuICB1cGRhdGVBY3RpdmVTZWFyY2hSZXN1bHRzQXR0cmlidXRlcygpIHtcbiAgICBjb25zdCBhdmFpbGFibGVBdHRyaWJ1dGVzID0gdGhpcy5nZXQoJ2FjdGl2ZVNlYXJjaFJlc3VsdHMnKVxuICAgICAgLnJlZHVjZSgoY3VycmVudEF2YWlsYWJsZTogYW55LCByZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICBjdXJyZW50QXZhaWxhYmxlID0gXy51bmlvbihcbiAgICAgICAgICBjdXJyZW50QXZhaWxhYmxlLFxuICAgICAgICAgIE9iamVjdC5rZXlzKHJlc3VsdC5nZXQoJ21ldGFjYXJkJykuZ2V0KCdwcm9wZXJ0aWVzJykudG9KU09OKCkpXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRBdmFpbGFibGVcbiAgICAgIH0sIFtdKVxuICAgICAgLnNvcnQoKVxuICAgIHRoaXMuc2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzQXR0cmlidXRlcycsIGF2YWlsYWJsZUF0dHJpYnV0ZXMpXG4gIH0sXG4gIGdldEFjdGl2ZVNlYXJjaFJlc3VsdHNBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnYWN0aXZlU2VhcmNoUmVzdWx0c0F0dHJpYnV0ZXMnKVxuICB9LFxuICBoYW5kbGVVcGRhdGUoKSB7XG4gICAgdGhpcy5jbGVhclNlbGVjdGVkUmVzdWx0cygpXG4gICAgdGhpcy5zZXRBY3RpdmVTZWFyY2hSZXN1bHRzKHRoaXMuZ2V0KCdjdXJyZW50UmVzdWx0JykuZ2V0KCdyZXN1bHRzJykpXG4gICAgdGhpcy5hZGRTZWxlY3RlZFJlc3VsdCh0aGlzLmdldCgnY3VycmVudE1ldGFjYXJkJykpXG4gIH0sXG4gIGhhbmRsZUN1cnJlbnRNZXRhY2FyZCgpIHtcbiAgICBpZiAodGhpcy5nZXQoJ2N1cnJlbnRNZXRhY2FyZCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZ2V0KCdjdXJyZW50UXVlcnknKS5jYW5jZWxDdXJyZW50U2VhcmNoZXMoKVxuICAgIH1cbiAgfSxcbiAgZ2V0QWN0aXZlU2VhcmNoUmVzdWx0cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2FjdGl2ZVNlYXJjaFJlc3VsdHMnKVxuICB9LFxuICBzZXRBY3RpdmVTZWFyY2hSZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgIHRoaXMuZ2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzJykucmVzZXQocmVzdWx0cy5tb2RlbHMgfHwgcmVzdWx0cylcbiAgfSxcbiAgYWRkVG9BY3RpdmVTZWFyY2hSZXN1bHRzKHJlc3VsdHM6IGFueSkge1xuICAgIHRoaXMuZ2V0KCdhY3RpdmVTZWFyY2hSZXN1bHRzJykuYWRkKHJlc3VsdHMubW9kZWxzIHx8IHJlc3VsdHMpXG4gIH0sXG4gIHNldFNlbGVjdGVkUmVzdWx0cyhyZXN1bHRzOiBhbnkpIHtcbiAgICB0aGlzLmdldCgnc2VsZWN0ZWRSZXN1bHRzJykucmVzZXQocmVzdWx0cy5tb2RlbHMgfHwgcmVzdWx0cylcbiAgfSxcbiAgZ2V0U2VsZWN0ZWRSZXN1bHRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc2VsZWN0ZWRSZXN1bHRzJylcbiAgfSxcbiAgY2xlYXJTZWxlY3RlZFJlc3VsdHMoKSB7XG4gICAgdGhpcy5nZXRTZWxlY3RlZFJlc3VsdHMoKS5yZXNldCgpXG4gIH0sXG4gIGFkZFNlbGVjdGVkUmVzdWx0KG1ldGFjYXJkOiBhbnkpIHtcbiAgICB0aGlzLmdldFNlbGVjdGVkUmVzdWx0cygpLmFkZChtZXRhY2FyZClcbiAgfSxcbiAgcmVtb3ZlU2VsZWN0ZWRSZXN1bHQobWV0YWNhcmQ6IGFueSkge1xuICAgIHRoaXMuZ2V0U2VsZWN0ZWRSZXN1bHRzKCkucmVtb3ZlKG1ldGFjYXJkKVxuICB9LFxuICBzZXRDdXJyZW50UXVlcnkocXVlcnk6IGFueSkge1xuICAgIHRoaXMuc2V0KCdjdXJyZW50UXVlcnknLCBxdWVyeSlcbiAgfSxcbiAgZ2V0Q3VycmVudFF1ZXJ5KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY3VycmVudFF1ZXJ5JylcbiAgfSxcbn0pXG4iXX0=