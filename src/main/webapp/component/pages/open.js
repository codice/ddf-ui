import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import useSnack from '../hooks/useSnack';
import { OpenSearch } from './search';
var Open = function () {
    var navigate = useNavigate();
    var addSnack = useSnack();
    return (_jsxs("div", { className: "w-full h-full p-2", children: [_jsx("div", { className: "text-2xl pb-2", children: "Open a search" }), _jsx(OpenSearch, { label: "", constructLink: function (result) {
                    return "/search/".concat(result.plain.id);
                }, onFinish: function (value) {
                    // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                    navigate("/search/".concat(value.plain.id), {
                        replace: true,
                    });
                    addSnack("Search '".concat(value.plain.metacard.properties.title, "' opened"), {
                        alertProps: { severity: 'info' },
                    });
                }, autocompleteProps: {
                    fullWidth: true,
                    className: 'w-full',
                } })] }));
};
export default Open;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3Blbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcGFnZXMvb3Blbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5QyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRXJDLElBQU0sSUFBSSxHQUFHO0lBQ1gsSUFBTSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUE7SUFDOUIsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDM0IsT0FBTyxDQUNMLGVBQUssU0FBUyxFQUFDLG1CQUFtQixhQUNoQyxjQUFLLFNBQVMsRUFBQyxlQUFlLDhCQUFvQixFQUNsRCxLQUFDLFVBQVUsSUFDVCxLQUFLLEVBQUMsRUFBRSxFQUNSLGFBQWEsRUFBRSxVQUFDLE1BQU07b0JBQ3BCLE9BQU8sa0JBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQTtnQkFDckMsQ0FBQyxFQUNELFFBQVEsRUFBRSxVQUFDLEtBQUs7b0JBQ2QsOElBQThJO29CQUM5SSxRQUFRLENBQUMsa0JBQVcsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsRUFBRTt3QkFDcEMsT0FBTyxFQUFFLElBQUk7cUJBQ2QsQ0FBQyxDQUFBO29CQUNGLFFBQVEsQ0FBQyxrQkFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxhQUFVLEVBQUU7d0JBQ25FLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7cUJBQ2pDLENBQUMsQ0FBQTtnQkFDSixDQUFDLEVBQ0QsaUJBQWlCLEVBQUU7b0JBQ2pCLFNBQVMsRUFBRSxJQUFJO29CQUNmLFNBQVMsRUFBRSxRQUFRO2lCQUNwQixHQUNELElBQ0UsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxJQUFJLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgeyBPcGVuU2VhcmNoIH0gZnJvbSAnLi9zZWFyY2gnXG5cbmNvbnN0IE9wZW4gPSAoKSA9PiB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcC0yXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIHBiLTJcIj5PcGVuIGEgc2VhcmNoPC9kaXY+XG4gICAgICA8T3BlblNlYXJjaFxuICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgIGNvbnN0cnVjdExpbms9eyhyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gYC9zZWFyY2gvJHtyZXN1bHQucGxhaW4uaWR9YFxuICAgICAgICB9fVxuICAgICAgICBvbkZpbmlzaD17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgLy8gcmVwbGFjZSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZXkgZ2V0IHRoZSBsaW5rIGluIGNvbnN0cnVjdExpbmsgcHV0IGludG8gaGlzdG9yeSBhcyB3ZWxsIHVuZm9ydHVuYXRlbHksIHdpbGwgbmVlZCB0byBmaXggdGhpcyBtb3JlIGdlbmVyYWxseVxuICAgICAgICAgIG5hdmlnYXRlKGAvc2VhcmNoLyR7dmFsdWUucGxhaW4uaWR9YCwge1xuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGFkZFNuYWNrKGBTZWFyY2ggJyR7dmFsdWUucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0nIG9wZW5lZGAsIHtcbiAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHsgc2V2ZXJpdHk6ICdpbmZvJyB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIH19XG4gICAgICAgIGF1dG9jb21wbGV0ZVByb3BzPXt7XG4gICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgIGNsYXNzTmFtZTogJ3ctZnVsbCcsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE9wZW5cbiJdfQ==