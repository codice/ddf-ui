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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcndyaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL092ZXJ3cml0ZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUcvQixlQUFlLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ25DLFFBQVE7UUFDTixPQUFPO1lBQ0wsRUFBRSxFQUFFLFNBQVM7WUFDYixNQUFNLEVBQUUsU0FBUztZQUNqQixJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRSxDQUFDO1lBQ2IsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLO1lBQ1osT0FBTyxFQUFFLEVBQUU7WUFDWCxRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFBO0lBQ0gsQ0FBQztJQUNELFVBQVU7UUFDUixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtJQUMvQixDQUFDO0lBQ0Qsc0JBQXNCO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ2pFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUNyQixnQkFBZ0IsRUFDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDckMsQ0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ25FLENBQUM7SUFDRCxhQUFhLFlBQUMsSUFBUztRQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsSUFBSSxNQUFBO1lBQ0osT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0Qsb0JBQW9CLFlBQUMsS0FBVSxFQUFFLFVBQWU7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNELFdBQVcsWUFBQyxJQUFTLEVBQUUsUUFBYTtRQUNsQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBb0IsQ0FBQTtRQUNwRCxJQUFNLE9BQU8sR0FDWCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSztZQUN0QywrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLElBQUk7WUFDVCxRQUFRLENBQUE7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsS0FBSyxFQUFFLElBQUk7WUFDWCxPQUFPLFNBQUE7U0FDUixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsYUFBYSxZQUFDLElBQVM7UUFDckIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQW9CLENBQUE7UUFDcEQsSUFBTSxPQUFPLEdBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUs7WUFDdEMsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixPQUFPLFNBQUE7U0FDUixDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtJQUNqQyxDQUFDO0lBQ0QsY0FBYztRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDOUIsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4vTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcblxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB1bmRlZmluZWQsXG4gICAgICByZXN1bHQ6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICBzZW5kaW5nOiBmYWxzZSxcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgbWVzc2FnZTogJycsXG4gICAgICBkcm9wem9uZTogdW5kZWZpbmVkLFxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnNldHVwRHJvcHpvbmVMaXN0ZW5lcnMoKVxuICB9LFxuICBzZXR1cERyb3B6b25lTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZ2V0KCdkcm9wem9uZScpLm9uKCdzZW5kaW5nJywgdGhpcy5oYW5kbGVTZW5kaW5nLmJpbmQodGhpcykpXG4gICAgdGhpcy5nZXQoJ2Ryb3B6b25lJykub24oXG4gICAgICAndXBsb2FkcHJvZ3Jlc3MnLFxuICAgICAgdGhpcy5oYW5kbGVVcGxvYWRQcm9ncmVzcy5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuZ2V0KCdkcm9wem9uZScpLm9uKCdlcnJvcicsIHRoaXMuaGFuZGxlRXJyb3IuYmluZCh0aGlzKSlcbiAgICB0aGlzLmdldCgnZHJvcHpvbmUnKS5vbignc3VjY2VzcycsIHRoaXMuaGFuZGxlU3VjY2Vzcy5iaW5kKHRoaXMpKVxuICB9LFxuICBoYW5kbGVTZW5kaW5nKGZpbGU6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIGZpbGUsXG4gICAgICBzZW5kaW5nOiB0cnVlLFxuICAgIH0pXG4gIH0sXG4gIGhhbmRsZVVwbG9hZFByb2dyZXNzKF9maWxlOiBhbnksIHBlcmNlbnRhZ2U6IGFueSkge1xuICAgIHRoaXMuc2V0KCdwZXJjZW50YWdlJywgcGVyY2VudGFnZSlcbiAgfSxcbiAgaGFuZGxlRXJyb3IoZmlsZTogYW55LCByZXNwb25zZTogYW55KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5nZXQoJ3Jlc3VsdCcpIGFzIExhenlRdWVyeVJlc3VsdFxuICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGUgK1xuICAgICAgJyBjb3VsZCBub3QgYmUgb3ZlcndyaXR0ZW4gYnkgJyArXG4gICAgICBmaWxlLm5hbWUgK1xuICAgICAgcmVzcG9uc2VcbiAgICB0aGlzLnNldCh7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlU3VjY2VzcyhmaWxlOiBhbnkpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmdldCgncmVzdWx0JykgYXMgTGF6eVF1ZXJ5UmVzdWx0XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZSArXG4gICAgICAnIGhhcyBiZWVuIG92ZXJ3cml0dGVuIGJ5ICcgK1xuICAgICAgZmlsZS5uYW1lXG4gICAgdGhpcy5zZXQoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgICByZXN1bHQucmVmcmVzaERhdGFPdmVyTmV0d29yaygpXG4gIH0sXG4gIHJlbW92ZUlmVW51c2VkKCkge1xuICAgIGlmICghdGhpcy5nZXQoJ3NlbmRpbmcnKSkge1xuICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlbW92ZSh0aGlzKVxuICAgIH1cbiAgfSxcbn0pXG4iXX0=