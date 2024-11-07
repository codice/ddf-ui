import { __awaiter, __generator } from "tslib";
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
import $ from 'jquery';
import { Overridable } from '../../../js/model/Base/base-classes';
export default function saveFile(name, type, data) {
    return __awaiter(this, void 0, void 0, function () {
        var a, url;
        return __generator(this, function (_a) {
            if (data != null && navigator.msSaveBlob)
                return [2 /*return*/, navigator.msSaveBlob(new Blob([data], { type: type }), name)];
            a = $("<a style='display: none;'/>");
            url = window.URL.createObjectURL(new Blob([data], { type: type }));
            a.attr('href', url);
            a.attr('download', name);
            $('body').append(a);
            a[0].click();
            window.URL.revokeObjectURL(url);
            a.remove();
            return [2 /*return*/];
        });
    });
}
// return filename portion of content-disposition
export function getFilenameFromContentDisposition(contentDisposition) {
    if (contentDisposition == null) {
        return null;
    }
    var parts = contentDisposition.split('=', 2);
    if (parts.length !== 2) {
        return null;
    }
    return parts[1];
}
export var OverridableSaveFile = new Overridable(saveFile);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91dGlscy9zYXZlLWZpbGUvc2F2ZS1maWxlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFakUsTUFBTSxDQUFDLE9BQU8sVUFBZ0IsUUFBUSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsSUFBUzs7OztZQUMxRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUssU0FBaUIsQ0FBQyxVQUFVO2dCQUMvQyxzQkFBUSxTQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUE7WUFDMUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO1lBQ3BDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUN0RSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNuQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUN4QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtZQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQy9CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTs7OztDQUNYO0FBRUQsaURBQWlEO0FBQ2pELE1BQU0sVUFBVSxpQ0FBaUMsQ0FBQyxrQkFBMEI7SUFDMUUsSUFBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7UUFDOUIsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQUksS0FBSyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDNUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixPQUFPLElBQUksQ0FBQTtLQUNaO0lBQ0QsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgeyBPdmVycmlkYWJsZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBzYXZlRmlsZShuYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gIGlmIChkYXRhICE9IG51bGwgJiYgKG5hdmlnYXRvciBhcyBhbnkpLm1zU2F2ZUJsb2IpXG4gICAgcmV0dXJuIChuYXZpZ2F0b3IgYXMgYW55KS5tc1NhdmVCbG9iKG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiB0eXBlIH0pLCBuYW1lKVxuICBsZXQgYSA9ICQoXCI8YSBzdHlsZT0nZGlzcGxheTogbm9uZTsnLz5cIilcbiAgbGV0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiB0eXBlIH0pKVxuICBhLmF0dHIoJ2hyZWYnLCB1cmwpXG4gIGEuYXR0cignZG93bmxvYWQnLCBuYW1lKVxuICAkKCdib2R5JykuYXBwZW5kKGEpXG4gIGFbMF0uY2xpY2soKVxuICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpXG4gIGEucmVtb3ZlKClcbn1cblxuLy8gcmV0dXJuIGZpbGVuYW1lIHBvcnRpb24gb2YgY29udGVudC1kaXNwb3NpdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVuYW1lRnJvbUNvbnRlbnREaXNwb3NpdGlvbihjb250ZW50RGlzcG9zaXRpb246IHN0cmluZykge1xuICBpZiAoY29udGVudERpc3Bvc2l0aW9uID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgbGV0IHBhcnRzID0gY29udGVudERpc3Bvc2l0aW9uLnNwbGl0KCc9JywgMilcbiAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgcmV0dXJuIHBhcnRzWzFdXG59XG5cbmV4cG9ydCBjb25zdCBPdmVycmlkYWJsZVNhdmVGaWxlID0gbmV3IE92ZXJyaWRhYmxlKHNhdmVGaWxlKVxuIl19