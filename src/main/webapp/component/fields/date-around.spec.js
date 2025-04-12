import { __awaiter, __generator } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { render, waitFor } from '@testing-library/react';
import { DateAroundField } from './date-around';
import { expect } from 'chai';
import user from '../singletons/user-instance';
import Common from '../../js/Common';
// rely on static data when possible, but in these we can use the DateHelpers (a must for shifted date timezone testing)
var data = {
    date1: {
        originalISO: '2021-01-15T06:53:54.316Z',
        utcISOMinutes: '2021-01-15T06:53:00.000Z',
        userFormatISO: {
            millisecond: '2021-01-15T03:23:54.316-03:30',
            second: '2021-01-15T03:23:54-03:30',
            minute: '2021-01-15T03:23-03:30',
        },
        userFormat24: {
            millisecond: '15 Jan 2021 03:23:54.316 -03:30',
            second: '15 Jan 2021 03:23:54 -03:30',
            minute: '15 Jan 2021 03:23 -03:30',
        },
        userFormat12: {
            millisecond: '15 Jan 2021 03:23:54.316 am -03:30',
            second: '15 Jan 2021 03:23:54 am -03:30',
            minute: '15 Jan 2021 03:23 am -03:30',
        },
    },
};
describe('verify date around field works', function () {
    beforeEach(function () {
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond']);
    });
    afterEach(function () {
        user
            .get('user')
            .get('preferences')
            .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['millisecond']);
    });
    var verifyDateRender = function (format, precision, expected) {
        return function () {
            user
                .get('user')
                .get('preferences')
                .set('dateTimeFormat', Common.getDateTimeFormats()[format][precision]);
            var container = render(_jsx(DateAroundField, { value: {
                    date: data.date1.originalISO,
                    buffer: {
                        amount: '1',
                        unit: 'd',
                    },
                    direction: 'both',
                }, onChange: function () { } })).container;
            var input = container.querySelector('input');
            expect(input === null || input === void 0 ? void 0 : input.value).to.equal(expected);
        };
    };
    it('should render with ISO format and millisecond precision', verifyDateRender('ISO', 'millisecond', data.date1.userFormatISO.millisecond));
    it('should render with ISO format and second precision', verifyDateRender('ISO', 'second', data.date1.userFormatISO.second));
    it('should render with ISO format and minute precision', verifyDateRender('ISO', 'minute', data.date1.userFormatISO.minute));
    it('should render with 24hr format and millisecond precision', verifyDateRender('24', 'millisecond', data.date1.userFormat24.millisecond));
    it('should render with 24hr format and second precision', verifyDateRender('24', 'second', data.date1.userFormat24.second));
    it('should render with 24hr format and minute precision', verifyDateRender('24', 'minute', data.date1.userFormat24.minute));
    it('should render with 12hr format and millisecond precision', verifyDateRender('12', 'millisecond', data.date1.userFormat12.millisecond));
    it('should render with 12hr format and second precision', verifyDateRender('12', 'second', data.date1.userFormat12.second));
    it('should render with 12hr format and minute precision', verifyDateRender('12', 'minute', data.date1.userFormat12.minute));
    it('calls onChange with updated value when precision changes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var updatedDate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updatedDate = data.date1.userFormatISO.millisecond;
                    render(_jsx(DateAroundField, { value: {
                            date: updatedDate,
                            buffer: {
                                amount: '1',
                                unit: 'd',
                            },
                            direction: 'both',
                        }, onChange: function (updatedValue) {
                            updatedDate = updatedValue.date;
                        } }));
                    user
                        .get('user')
                        .get('preferences')
                        .set('dateTimeFormat', Common.getDateTimeFormats()['ISO']['minute']);
                    return [4 /*yield*/, waitFor(function () {
                            expect(updatedDate).to.equal(data.date1.utcISOMinutes);
                        }, { timeout: 1000 })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1hcm91bmQuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL2RhdGUtYXJvdW5kLnNwZWMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQy9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDN0IsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFHcEMsd0hBQXdIO0FBQ3hILElBQU0sSUFBSSxHQUFHO0lBQ1gsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFLDBCQUEwQjtRQUN2QyxhQUFhLEVBQUUsMEJBQTBCO1FBQ3pDLGFBQWEsRUFBRTtZQUNiLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsTUFBTSxFQUFFLDJCQUEyQjtZQUNuQyxNQUFNLEVBQUUsd0JBQXdCO1NBQ2pDO1FBQ0QsWUFBWSxFQUFFO1lBQ1osV0FBVyxFQUFFLGlDQUFpQztZQUM5QyxNQUFNLEVBQUUsNkJBQTZCO1lBQ3JDLE1BQU0sRUFBRSwwQkFBMEI7U0FDbkM7UUFDRCxZQUFZLEVBQUU7WUFDWixXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELE1BQU0sRUFBRSxnQ0FBZ0M7WUFDeEMsTUFBTSxFQUFFLDZCQUE2QjtTQUN0QztLQUNGO0NBQ0YsQ0FBQTtBQUVELFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRTtJQUN6QyxVQUFVLENBQUM7UUFDVCxJQUFJO2FBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQzthQUNYLEdBQUcsQ0FBQyxhQUFhLENBQUM7YUFDbEIsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxD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Q3JELGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQ2pFLENBQUE7SUFFRCxFQUFFLENBQUMsMERBQTBELEVBQUU7Ozs7O29CQUN6RCxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFBO29CQUV0RCxNQUFNLENBQ0osS0FBQyxlQUFlLElBQ2QsS0FBSyxFQUFFOzRCQUNMLElBQUksRUFBRSxXQUFXOzRCQUNqQixNQUFNLEVBQUU7Z0NBQ04sTUFBTSxFQUFFLEdBQUc7Z0NBQ1gsSUFBSSxFQUFFLEdBQUc7NkJBQ1Y7NEJBQ0QsU0FBUyxFQUFFLE1BQU07eUJBQ2xCLEVBQ0QsUUFBUSxFQUFFLFVBQUMsWUFBWTs0QkFDckIsV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUE7d0JBQ2pDLENBQUMsR0FDRCxDQUNILENBQUE7b0JBRUQsSUFBSTt5QkFDRCxHQUFHLENBQUMsTUFBTSxDQUFDO3lCQUNYLEdBQUcsQ0FBQyxhQUFhLENBQUM7eUJBQ2xCLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO29CQUV0RSxxQkFBTSxPQUFPLENBQ1g7NEJBQ0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTt3QkFDeEQsQ0FBQyxFQUNELEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUNsQixFQUFBOztvQkFMRCxTQUtDLENBQUE7Ozs7U0FDRixDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlbmRlciwgd2FpdEZvciB9IGZyb20gJ0B0ZXN0aW5nLWxpYnJhcnkvcmVhY3QnXG5pbXBvcnQgeyBEYXRlQXJvdW5kRmllbGQgfSBmcm9tICcuL2RhdGUtYXJvdW5kJ1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSdcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vanMvQ29tbW9uJ1xuaW1wb3J0IHsgVGltZVByZWNpc2lvbiB9IGZyb20gJ0BibHVlcHJpbnRqcy9kYXRldGltZSdcblxuLy8gcmVseSBvbiBzdGF0aWMgZGF0YSB3aGVuIHBvc3NpYmxlLCBidXQgaW4gdGhlc2Ugd2UgY2FuIHVzZSB0aGUgRGF0ZUhlbHBlcnMgKGEgbXVzdCBmb3Igc2hpZnRlZCBkYXRlIHRpbWV6b25lIHRlc3RpbmcpXG5jb25zdCBkYXRhID0ge1xuICBkYXRlMToge1xuICAgIG9yaWdpbmFsSVNPOiAnMjAyMS0wMS0xNVQwNjo1Mzo1NC4zMTZaJyxcbiAgICB1dGNJU09NaW51dGVzOiAnMjAyMS0wMS0xNVQwNjo1MzowMC4wMDBaJyxcbiAgICB1c2VyRm9ybWF0SVNPOiB7XG4gICAgICBtaWxsaXNlY29uZDogJzIwMjEtMDEtMTVUMDM6MjM6NTQuMzE2LTAzOjMwJyxcbiAgICAgIHNlY29uZDogJzIwMjEtMDEtMTVUMDM6MjM6NTQtMDM6MzAnLFxuICAgICAgbWludXRlOiAnMjAyMS0wMS0xNVQwMzoyMy0wMzozMCcsXG4gICAgfSxcbiAgICB1c2VyRm9ybWF0MjQ6IHtcbiAgICAgIG1pbGxpc2Vjb25kOiAnMTUgSmFuIDIwMjEgMDM6MjM6NTQuMzE2IC0wMzozMCcsXG4gICAgICBzZWNvbmQ6ICcxNSBKYW4gMjAyMSAwMzoyMzo1NCAtMDM6MzAnLFxuICAgICAgbWludXRlOiAnMTUgSmFuIDIwMjEgMDM6MjMgLTAzOjMwJyxcbiAgICB9LFxuICAgIHVzZXJGb3JtYXQxMjoge1xuICAgICAgbWlsbGlzZWNvbmQ6ICcxNSBKYW4gMjAyMSAwMzoyMzo1NC4zMTYgYW0gLTAzOjMwJyxcbiAgICAgIHNlY29uZDogJzE1IEphbiAyMDIxIDAzOjIzOjU0IGFtIC0wMzozMCcsXG4gICAgICBtaW51dGU6ICcxNSBKYW4gMjAyMSAwMzoyMyBhbSAtMDM6MzAnLFxuICAgIH0sXG4gIH0sXG59XG5cbmRlc2NyaWJlKCd2ZXJpZnkgZGF0ZSBhcm91bmQgZmllbGQgd29ya3MnLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHVzZXJcbiAgICAgIC5nZXQoJ3VzZXInKVxuICAgICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgLnNldCgnZGF0ZVRpbWVGb3JtYXQnLCBDb21tb24uZ2V0RGF0ZVRpbWVGb3JtYXRzKClbJ0lTTyddWydtaWxsaXNlY29uZCddKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdXNlclxuICAgICAgLmdldCgndXNlcicpXG4gICAgICAuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICAuc2V0KCdkYXRlVGltZUZvcm1hdCcsIENvbW1vbi5nZXREYXRlVGltZUZvcm1hdHMoKVsnSVNPJ11bJ21pbGxpc2Vjb25kJ10pXG4gIH0pXG5cbiAgY29uc3QgdmVyaWZ5RGF0ZVJlbmRlciA9IChcbiAgICBmb3JtYXQ6IHN0cmluZyxcbiAgICBwcmVjaXNpb246IFRpbWVQcmVjaXNpb24sXG4gICAgZXhwZWN0ZWQ6IHN0cmluZ1xuICApID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdXNlclxuICAgICAgICAuZ2V0KCd1c2VyJylcbiAgICAgICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgICAuc2V0KCdkYXRlVGltZUZvcm1hdCcsIENvbW1vbi5nZXREYXRlVGltZUZvcm1hdHMoKVtmb3JtYXRdW3ByZWNpc2lvbl0pXG5cbiAgICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSByZW5kZXIoXG4gICAgICAgIDxEYXRlQXJvdW5kRmllbGRcbiAgICAgICAgICB2YWx1ZT17e1xuICAgICAgICAgICAgZGF0ZTogZGF0YS5kYXRlMS5vcmlnaW5hbElTTyxcbiAgICAgICAgICAgIGJ1ZmZlcjoge1xuICAgICAgICAgICAgICBhbW91bnQ6ICcxJyxcbiAgICAgICAgICAgICAgdW5pdDogJ2QnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ2JvdGgnLFxuICAgICAgICAgIH19XG4gICAgICAgICAgb25DaGFuZ2U9eygpID0+IHt9fVxuICAgICAgICAvPlxuICAgICAgKVxuXG4gICAgICBjb25zdCBpbnB1dCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpXG4gICAgICBleHBlY3QoaW5wdXQ/LnZhbHVlKS50by5lcXVhbChleHBlY3RlZClcbiAgICB9XG4gIH1cblxuICBpdChcbiAgICAnc2hvdWxkIHJlbmRlciB3aXRoIElTTyBmb3JtYXQgYW5kIG1pbGxpc2Vjb25kIHByZWNpc2lvbicsXG4gICAgdmVyaWZ5RGF0ZVJlbmRlcignSVNPJywgJ21pbGxpc2Vjb25kJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0SVNPLm1pbGxpc2Vjb25kKVxuICApXG4gIGl0KFxuICAgICdzaG91bGQgcmVuZGVyIHdpdGggSVNPIGZvcm1hdCBhbmQgc2Vjb25kIHByZWNpc2lvbicsXG4gICAgdmVyaWZ5RGF0ZVJlbmRlcignSVNPJywgJ3NlY29uZCcsIGRhdGEuZGF0ZTEudXNlckZvcm1hdElTTy5zZWNvbmQpXG4gIClcbiAgaXQoXG4gICAgJ3Nob3VsZCByZW5kZXIgd2l0aCBJU08gZm9ybWF0IGFuZCBtaW51dGUgcHJlY2lzaW9uJyxcbiAgICB2ZXJpZnlEYXRlUmVuZGVyKCdJU08nLCAnbWludXRlJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0SVNPLm1pbnV0ZSlcbiAgKVxuICBpdChcbiAgICAnc2hvdWxkIHJlbmRlciB3aXRoIDI0aHIgZm9ybWF0IGFuZCBtaWxsaXNlY29uZCBwcmVjaXNpb24nLFxuICAgIHZlcmlmeURhdGVSZW5kZXIoJzI0JywgJ21pbGxpc2Vjb25kJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0MjQubWlsbGlzZWNvbmQpXG4gIClcbiAgaXQoXG4gICAgJ3Nob3VsZCByZW5kZXIgd2l0aCAyNGhyIGZvcm1hdCBhbmQgc2Vjb25kIHByZWNpc2lvbicsXG4gICAgdmVyaWZ5RGF0ZVJlbmRlcignMjQnLCAnc2Vjb25kJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0MjQuc2Vjb25kKVxuICApXG4gIGl0KFxuICAgICdzaG91bGQgcmVuZGVyIHdpdGggMjRociBmb3JtYXQgYW5kIG1pbnV0ZSBwcmVjaXNpb24nLFxuICAgIHZlcmlmeURhdGVSZW5kZXIoJzI0JywgJ21pbnV0ZScsIGRhdGEuZGF0ZTEudXNlckZvcm1hdDI0Lm1pbnV0ZSlcbiAgKVxuICBpdChcbiAgICAnc2hvdWxkIHJlbmRlciB3aXRoIDEyaHIgZm9ybWF0IGFuZCBtaWxsaXNlY29uZCBwcmVjaXNpb24nLFxuICAgIHZlcmlmeURhdGVSZW5kZXIoJzEyJywgJ21pbGxpc2Vjb25kJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0MTIubWlsbGlzZWNvbmQpXG4gIClcbiAgaXQoXG4gICAgJ3Nob3VsZCByZW5kZXIgd2l0aCAxMmhyIGZvcm1hdCBhbmQgc2Vjb25kIHByZWNpc2lvbicsXG4gICAgdmVyaWZ5RGF0ZVJlbmRlcignMTInLCAnc2Vjb25kJywgZGF0YS5kYXRlMS51c2VyRm9ybWF0MTIuc2Vjb25kKVxuICApXG4gIGl0KFxuICAgICdzaG91bGQgcmVuZGVyIHdpdGggMTJociBmb3JtYXQgYW5kIG1pbnV0ZSBwcmVjaXNpb24nLFxuICAgIHZlcmlmeURhdGVSZW5kZXIoJzEyJywgJ21pbnV0ZScsIGRhdGEuZGF0ZTEudXNlckZvcm1hdDEyLm1pbnV0ZSlcbiAgKVxuXG4gIGl0KCdjYWxscyBvbkNoYW5nZSB3aXRoIHVwZGF0ZWQgdmFsdWUgd2hlbiBwcmVjaXNpb24gY2hhbmdlcycsIGFzeW5jICgpID0+IHtcbiAgICBsZXQgdXBkYXRlZERhdGUgPSBkYXRhLmRhdGUxLnVzZXJGb3JtYXRJU08ubWlsbGlzZWNvbmRcblxuICAgIHJlbmRlcihcbiAgICAgIDxEYXRlQXJvdW5kRmllbGRcbiAgICAgICAgdmFsdWU9e3tcbiAgICAgICAgICBkYXRlOiB1cGRhdGVkRGF0ZSxcbiAgICAgICAgICBidWZmZXI6IHtcbiAgICAgICAgICAgIGFtb3VudDogJzEnLFxuICAgICAgICAgICAgdW5pdDogJ2QnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGlyZWN0aW9uOiAnYm90aCcsXG4gICAgICAgIH19XG4gICAgICAgIG9uQ2hhbmdlPXsodXBkYXRlZFZhbHVlKSA9PiB7XG4gICAgICAgICAgdXBkYXRlZERhdGUgPSB1cGRhdGVkVmFsdWUuZGF0ZVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICApXG5cbiAgICB1c2VyXG4gICAgICAuZ2V0KCd1c2VyJylcbiAgICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAgIC5zZXQoJ2RhdGVUaW1lRm9ybWF0JywgQ29tbW9uLmdldERhdGVUaW1lRm9ybWF0cygpWydJU08nXVsnbWludXRlJ10pXG5cbiAgICBhd2FpdCB3YWl0Rm9yKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBleHBlY3QodXBkYXRlZERhdGUpLnRvLmVxdWFsKGRhdGEuZGF0ZTEudXRjSVNPTWludXRlcylcbiAgICAgIH0sXG4gICAgICB7IHRpbWVvdXQ6IDEwMDAgfVxuICAgIClcbiAgfSlcbn0pXG4iXX0=