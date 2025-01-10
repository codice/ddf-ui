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
import { validateWkt, validateDd, validateDms, validateUsng, ddToWkt, dmsToWkt, usngToWkt, } from './utils';
import { ddModel, dmsModel, usngModel } from './models';
export default Backbone.AssociatedModel.extend({
    defaults: {
        showErrors: true,
        valid: true,
        error: null,
        mode: 'wkt',
        wkt: '',
        dd: ddModel,
        dms: dmsModel,
        usng: usngModel,
    },
    initialize: function () {
        this.listenTo(this, 'change:wkt change:dms change:dd change:usng change:mode', this.validate.bind(this));
    },
    isValid: function () {
        return this.get('valid');
    },
    /*
     * Return the active input converted to WKT. If the input failed validation, return "INVALID".
     * If the input is blank, return null.
     */
    getValue: function () {
        if (!this.isValid()) {
            return 'INVALID';
        }
        var mode = this.get('mode');
        switch (mode) {
            case 'wkt':
                return this.get(mode);
            case 'dd':
                return ddToWkt(this.get(mode));
            case 'dms':
                return dmsToWkt(this.get(mode));
            case 'usng':
                return usngToWkt(this.get(mode));
            default:
                return null;
        }
    },
    /* Run the appropriate validator for the active mode. Blank input is considered valid */
    validate: function () {
        var mode = this.get('mode');
        var validationReport;
        switch (mode) {
            case 'wkt':
                validationReport = validateWkt(this.get(mode));
                break;
            case 'dd':
                validationReport = validateDd(this.get(mode));
                break;
            case 'dms':
                validationReport = validateDms(this.get(mode));
                break;
            case 'usng':
                validationReport = validateUsng(this.get(mode));
                break;
        }
        this.set('valid', validationReport ? validationReport.valid : true);
        this.set('error', validationReport ? validationReport.error : false);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24tbmV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvbG9jYXRpb24tbmV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFFL0IsT0FBTyxFQUNMLFdBQVcsRUFDWCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFlBQVksRUFDWixPQUFPLEVBQ1AsUUFBUSxFQUNSLFNBQVMsR0FDVixNQUFNLFNBQVMsQ0FBQTtBQUVoQixPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFdkQsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRLEVBQUU7UUFDUixVQUFVLEVBQUUsSUFBSTtRQUNoQixLQUFLLEVBQUUsSUFBSTtRQUNYLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLEtBQUs7UUFDWCxHQUFHLEVBQUUsRUFBRTtRQUNQLEVBQUUsRUFBRSxPQUFPO1FBQ1gsR0FBRyxFQUFFLFFBQVE7UUFDYixJQUFJLEVBQUUsU0FBUztLQUNoQjtJQUVELFVBQVU7UUFDUixJQUFJLENBQUMsUUFBUSxDQUNYLElBQUksRUFDSix5REFBeUQsRUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3pCLENBQUE7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkIsT0FBTyxTQUFTLENBQUE7U0FDakI7UUFFRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzdCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxLQUFLO2dCQUNSLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUN2QixLQUFLLElBQUk7Z0JBQ1AsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1lBQ2hDLEtBQUssS0FBSztnQkFDUixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7WUFDakMsS0FBSyxNQUFNO2dCQUNULE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtZQUNsQztnQkFDRSxPQUFPLElBQUksQ0FBQTtTQUNkO0lBQ0gsQ0FBQztJQUVELHdGQUF3RjtJQUN4RixRQUFRO1FBQ04sSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLGdCQUFnQixDQUFBO1FBQ3BCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxLQUFLO2dCQUNSLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7Z0JBQzlDLE1BQUs7WUFDUCxLQUFLLElBQUk7Z0JBQ1AsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtnQkFDN0MsTUFBSztZQUNQLEtBQUssS0FBSztnQkFDUixnQkFBZ0IsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUM5QyxNQUFLO1lBQ1AsS0FBSyxNQUFNO2dCQUNULGdCQUFnQixHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7Z0JBQy9DLE1BQUs7U0FDUjtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25FLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RFLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuXG5pbXBvcnQge1xuICB2YWxpZGF0ZVdrdCxcbiAgdmFsaWRhdGVEZCxcbiAgdmFsaWRhdGVEbXMsXG4gIHZhbGlkYXRlVXNuZyxcbiAgZGRUb1drdCxcbiAgZG1zVG9Xa3QsXG4gIHVzbmdUb1drdCxcbn0gZnJvbSAnLi91dGlscydcblxuaW1wb3J0IHsgZGRNb2RlbCwgZG1zTW9kZWwsIHVzbmdNb2RlbCB9IGZyb20gJy4vbW9kZWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHM6IHtcbiAgICBzaG93RXJyb3JzOiB0cnVlLFxuICAgIHZhbGlkOiB0cnVlLFxuICAgIGVycm9yOiBudWxsLFxuICAgIG1vZGU6ICd3a3QnLFxuICAgIHdrdDogJycsXG4gICAgZGQ6IGRkTW9kZWwsXG4gICAgZG1zOiBkbXNNb2RlbCxcbiAgICB1c25nOiB1c25nTW9kZWwsXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6d2t0IGNoYW5nZTpkbXMgY2hhbmdlOmRkIGNoYW5nZTp1c25nIGNoYW5nZTptb2RlJyxcbiAgICAgIHRoaXMudmFsaWRhdGUuYmluZCh0aGlzKVxuICAgIClcbiAgfSxcblxuICBpc1ZhbGlkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndmFsaWQnKVxuICB9LFxuXG4gIC8qXG4gICAqIFJldHVybiB0aGUgYWN0aXZlIGlucHV0IGNvbnZlcnRlZCB0byBXS1QuIElmIHRoZSBpbnB1dCBmYWlsZWQgdmFsaWRhdGlvbiwgcmV0dXJuIFwiSU5WQUxJRFwiLlxuICAgKiBJZiB0aGUgaW5wdXQgaXMgYmxhbmssIHJldHVybiBudWxsLlxuICAgKi9cbiAgZ2V0VmFsdWUoKSB7XG4gICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgcmV0dXJuICdJTlZBTElEJ1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGUgPSB0aGlzLmdldCgnbW9kZScpXG4gICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICBjYXNlICd3a3QnOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXQobW9kZSlcbiAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgcmV0dXJuIGRkVG9Xa3QodGhpcy5nZXQobW9kZSkpXG4gICAgICBjYXNlICdkbXMnOlxuICAgICAgICByZXR1cm4gZG1zVG9Xa3QodGhpcy5nZXQobW9kZSkpXG4gICAgICBjYXNlICd1c25nJzpcbiAgICAgICAgcmV0dXJuIHVzbmdUb1drdCh0aGlzLmdldChtb2RlKSlcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9LFxuXG4gIC8qIFJ1biB0aGUgYXBwcm9wcmlhdGUgdmFsaWRhdG9yIGZvciB0aGUgYWN0aXZlIG1vZGUuIEJsYW5rIGlucHV0IGlzIGNvbnNpZGVyZWQgdmFsaWQgKi9cbiAgdmFsaWRhdGUoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuZ2V0KCdtb2RlJylcbiAgICBsZXQgdmFsaWRhdGlvblJlcG9ydFxuICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgY2FzZSAnd2t0JzpcbiAgICAgICAgdmFsaWRhdGlvblJlcG9ydCA9IHZhbGlkYXRlV2t0KHRoaXMuZ2V0KG1vZGUpKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnZGQnOlxuICAgICAgICB2YWxpZGF0aW9uUmVwb3J0ID0gdmFsaWRhdGVEZCh0aGlzLmdldChtb2RlKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2Rtcyc6XG4gICAgICAgIHZhbGlkYXRpb25SZXBvcnQgPSB2YWxpZGF0ZURtcyh0aGlzLmdldChtb2RlKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3VzbmcnOlxuICAgICAgICB2YWxpZGF0aW9uUmVwb3J0ID0gdmFsaWRhdGVVc25nKHRoaXMuZ2V0KG1vZGUpKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgICB0aGlzLnNldCgndmFsaWQnLCB2YWxpZGF0aW9uUmVwb3J0ID8gdmFsaWRhdGlvblJlcG9ydC52YWxpZCA6IHRydWUpXG4gICAgdGhpcy5zZXQoJ2Vycm9yJywgdmFsaWRhdGlvblJlcG9ydCA/IHZhbGlkYXRpb25SZXBvcnQuZXJyb3IgOiBmYWxzZSlcbiAgfSxcbn0pXG4iXX0=