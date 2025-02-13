import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useHistory } from 'react-router-dom';
import useSnack from '../hooks/useSnack';
import { OpenSearch } from './search';
var Open = function () {
    var history = useHistory();
    var addSnack = useSnack();
    return (React.createElement("div", { className: "w-full h-full p-2" },
        React.createElement("div", { className: "text-2xl pb-2" }, "Open a search"),
        React.createElement(OpenSearch, { label: "", constructLink: function (result) {
                return "/search/".concat(result.plain.id);
            }, onFinish: function (value) {
                // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                history.replace({
                    pathname: "/search/".concat(value.plain.id),
                    search: '',
                });
                addSnack("Search '".concat(value.plain.metacard.properties.title, "' opened"), {
                    alertProps: { severity: 'info' },
                });
            }, autocompleteProps: {
                fullWidth: true,
                className: 'w-full',
            } })));
};
export default hot(module)(Open);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3Blbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcGFnZXMvb3Blbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM3QyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRXJDLElBQU0sSUFBSSxHQUFHO0lBQ1gsSUFBTSxPQUFPLEdBQUcsVUFBVSxFQUFFLENBQUE7SUFDNUIsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDM0IsT0FBTyxDQUNMLDZCQUFLLFNBQVMsRUFBQyxtQkFBbUI7UUFDaEMsNkJBQUssU0FBUyxFQUFDLGVBQWUsb0JBQW9CO1FBQ2xELG9CQUFDLFVBQVUsSUFDVCxLQUFLLEVBQUMsRUFBRSxFQUNSLGFBQWEsRUFBRSxVQUFDLE1BQU07Z0JBQ3BCLE9BQU8sa0JBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQTtZQUNyQyxDQUFDLEVBQ0QsUUFBUSxFQUFFLFVBQUMsS0FBSztnQkFDZCw4SUFBOEk7Z0JBQzlJLE9BQU8sQ0FBQyxPQUFPLENBQUM7b0JBQ2QsUUFBUSxFQUFFLGtCQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFFO29CQUNyQyxNQUFNLEVBQUUsRUFBRTtpQkFDWCxDQUFDLENBQUE7Z0JBQ0YsUUFBUSxDQUFDLGtCQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLGFBQVUsRUFBRTtvQkFDbkUsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtpQkFDakMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxFQUNELGlCQUFpQixFQUFFO2dCQUNqQixTQUFTLEVBQUUsSUFBSTtnQkFDZixTQUFTLEVBQUUsUUFBUTthQUNwQixHQUNELENBQ0UsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyB1c2VIaXN0b3J5IH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi9ob29rcy91c2VTbmFjaydcbmltcG9ydCB7IE9wZW5TZWFyY2ggfSBmcm9tICcuL3NlYXJjaCdcblxuY29uc3QgT3BlbiA9ICgpID0+IHtcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcC0yXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIHBiLTJcIj5PcGVuIGEgc2VhcmNoPC9kaXY+XG4gICAgICA8T3BlblNlYXJjaFxuICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgIGNvbnN0cnVjdExpbms9eyhyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gYC9zZWFyY2gvJHtyZXN1bHQucGxhaW4uaWR9YFxuICAgICAgICB9fVxuICAgICAgICBvbkZpbmlzaD17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgLy8gcmVwbGFjZSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZXkgZ2V0IHRoZSBsaW5rIGluIGNvbnN0cnVjdExpbmsgcHV0IGludG8gaGlzdG9yeSBhcyB3ZWxsIHVuZm9ydHVuYXRlbHksIHdpbGwgbmVlZCB0byBmaXggdGhpcyBtb3JlIGdlbmVyYWxseVxuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZSh7XG4gICAgICAgICAgICBwYXRobmFtZTogYC9zZWFyY2gvJHt2YWx1ZS5wbGFpbi5pZH1gLFxuICAgICAgICAgICAgc2VhcmNoOiAnJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGFkZFNuYWNrKGBTZWFyY2ggJyR7dmFsdWUucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0nIG9wZW5lZGAsIHtcbiAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHsgc2V2ZXJpdHk6ICdpbmZvJyB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH19XG4gICAgICAgIGF1dG9jb21wbGV0ZVByb3BzPXt7XG4gICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgIGNsYXNzTmFtZTogJ3ctZnVsbCcsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKE9wZW4pXG4iXX0=