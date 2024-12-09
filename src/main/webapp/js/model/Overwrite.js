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
import Backbone from 'backbone';
export default Backbone.Model.extend({
    defaults: function () {
        return {
            id: undefined,
            result: undefined,
            file: undefined,
            percentage: 0,
            sending: false,
            success: false,
            error: false,
            message: '',
            dropzone: undefined,
        };
    },
    initialize: function () {
        this.setupDropzoneListeners();
    },
    setupDropzoneListeners: function () {
        this.get('dropzone').on('sending', this.handleSending.bind(this));
        this.get('dropzone').on('uploadprogress', this.handleUploadProgress.bind(this));
        this.get('dropzone').on('error', this.handleError.bind(this));
        this.get('dropzone').on('success', this.handleSuccess.bind(this));
    },
    handleSending: function (file) {
        this.set({
            file: file,
            sending: true,
        });
    },
    handleUploadProgress: function (_file, percentage) {
        this.set('percentage', percentage);
    },
    handleError: function (file, response) {
        var result = this.get('result');
        var message = result.plain.metacard.properties.title +
            ' could not be overwritten by ' +
            file.name +
            response;
        this.set({
            error: true,
            message: message,
        });
    },
    handleSuccess: function (file) {
        var result = this.get('result');
        var message = result.plain.metacard.properties.title +
            ' has been overwritten by ' +
            file.name;
        this.set({
            success: true,
            message: message,
        });
        result.refreshDataOverNetwork();
    },
    removeIfUnused: function () {
        if (!this.get('sending')) {
            this.collection.remove(this);
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcndyaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL092ZXJ3cml0ZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUcvQixlQUFlLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ25DLFFBQVE7UUFDTixPQUFPO1lBQ0wsRUFBRSxFQUFFLFNBQVM7WUFDYixNQUFNLEVBQUUsU0FBUztZQUNqQixJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRSxDQUFDO1lBQ2IsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLO1lBQ1osT0FBTyxFQUFFLEVBQUU7WUFDWCxRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFBO0lBQ0gsQ0FBQztJQUNELFVBQVU7UUFDUixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtJQUMvQixDQUFDO0lBQ0Qsc0JBQXNCO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ2pFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUNyQixnQkFBZ0IsRUFDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDckMsQ0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ25FLENBQUM7SUFDRCxhQUFhLFlBQUMsSUFBUztRQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsSUFBSSxNQUFBO1lBQ0osT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0Qsb0JBQW9CLFlBQUMsS0FBVSxFQUFFLFVBQWU7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNELFdBQVcsWUFBQyxJQUFTLEVBQUUsUUFBYTtRQUNsQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBb0IsQ0FBQTtRQUNwRCxJQUFNLE9BQU8sR0FDWCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSztZQUN0QywrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLElBQUk7WUFDVCxRQUFRLENBQUE7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsS0FBSyxFQUFFLElBQUk7WUFDWCxPQUFPLFNBQUE7U0FDUixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsYUFBYSxZQUFDLElBQVM7UUFDckIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQW9CLENBQUE7UUFDcEQsSUFBTSxPQUFPLEdBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUs7WUFDdEMsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixPQUFPLFNBQUE7U0FDUixDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtJQUNqQyxDQUFDO0lBQ0QsY0FBYztRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzdCO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHVuZGVmaW5lZCxcbiAgICAgIHJlc3VsdDogdW5kZWZpbmVkLFxuICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIHNlbmRpbmc6IGZhbHNlLFxuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZmFsc2UsXG4gICAgICBtZXNzYWdlOiAnJyxcbiAgICAgIGRyb3B6b25lOiB1bmRlZmluZWQsXG4gICAgfVxuICB9LFxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2V0dXBEcm9wem9uZUxpc3RlbmVycygpXG4gIH0sXG4gIHNldHVwRHJvcHpvbmVMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5nZXQoJ2Ryb3B6b25lJykub24oJ3NlbmRpbmcnLCB0aGlzLmhhbmRsZVNlbmRpbmcuYmluZCh0aGlzKSlcbiAgICB0aGlzLmdldCgnZHJvcHpvbmUnKS5vbihcbiAgICAgICd1cGxvYWRwcm9ncmVzcycsXG4gICAgICB0aGlzLmhhbmRsZVVwbG9hZFByb2dyZXNzLmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5nZXQoJ2Ryb3B6b25lJykub24oJ2Vycm9yJywgdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuZ2V0KCdkcm9wem9uZScpLm9uKCdzdWNjZXNzJywgdGhpcy5oYW5kbGVTdWNjZXNzLmJpbmQodGhpcykpXG4gIH0sXG4gIGhhbmRsZVNlbmRpbmcoZmlsZTogYW55KSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgZmlsZSxcbiAgICAgIHNlbmRpbmc6IHRydWUsXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlVXBsb2FkUHJvZ3Jlc3MoX2ZpbGU6IGFueSwgcGVyY2VudGFnZTogYW55KSB7XG4gICAgdGhpcy5zZXQoJ3BlcmNlbnRhZ2UnLCBwZXJjZW50YWdlKVxuICB9LFxuICBoYW5kbGVFcnJvcihmaWxlOiBhbnksIHJlc3BvbnNlOiBhbnkpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmdldCgncmVzdWx0JykgYXMgTGF6eVF1ZXJ5UmVzdWx0XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZSArXG4gICAgICAnIGNvdWxkIG5vdCBiZSBvdmVyd3JpdHRlbiBieSAnICtcbiAgICAgIGZpbGUubmFtZSArXG4gICAgICByZXNwb25zZVxuICAgIHRoaXMuc2V0KHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9LFxuICBoYW5kbGVTdWNjZXNzKGZpbGU6IGFueSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZ2V0KCdyZXN1bHQnKSBhcyBMYXp5UXVlcnlSZXN1bHRcbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgIHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlICtcbiAgICAgICcgaGFzIGJlZW4gb3ZlcndyaXR0ZW4gYnkgJyArXG4gICAgICBmaWxlLm5hbWVcbiAgICB0aGlzLnNldCh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICAgIHJlc3VsdC5yZWZyZXNoRGF0YU92ZXJOZXR3b3JrKClcbiAgfSxcbiAgcmVtb3ZlSWZVbnVzZWQoKSB7XG4gICAgaWYgKCF0aGlzLmdldCgnc2VuZGluZycpKSB7XG4gICAgICB0aGlzLmNvbGxlY3Rpb24ucmVtb3ZlKHRoaXMpXG4gICAgfVxuICB9LFxufSlcbiJdfQ==