import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useHistory } from 'react-router-dom';
import { AsyncTasks } from '../../js/model/AsyncTask/async-task';
import { OpenSearch } from './search';
var Open = function () {
    var history = useHistory();
    return (React.createElement("div", { className: "w-full h-full p-2" },
        React.createElement("div", { className: "text-2xl pb-2" }, "Restore a search"),
        React.createElement(OpenSearch, { archived: true, label: "", constructLink: function (result) {
                var copy = JSON.parse(JSON.stringify(result.plain.metacard.properties));
                delete copy.id;
                delete copy.title;
                delete copy['metacard.deleted.date'];
                delete copy['metacard.deleted.id'];
                delete copy['metacard.deleted.tags'];
                delete copy['metacard.deleted.version'];
                delete copy['metacard-tags'];
                delete copy['metacard-type'];
                var encodedQueryModel = encodeURIComponent(JSON.stringify(copy));
                return {
                    pathname: '/search',
                    search: "?defaultQuery=".concat(encodedQueryModel),
                };
            }, onFinish: function (result) {
                AsyncTasks.restore({ lazyResult: result });
                // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                history.replace({
                    pathname: "/search/".concat(result.plain.metacard.properties['metacard.deleted.id']),
                    search: '',
                });
            }, autocompleteProps: {
                fullWidth: true,
                className: 'w-full',
            } })));
};
export default hot(module)(Open);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcGFnZXMvcmVzdG9yZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFDaEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVyQyxJQUFNLElBQUksR0FBRztJQUNYLElBQU0sT0FBTyxHQUFHLFVBQVUsRUFBRSxDQUFBO0lBQzVCLE9BQU8sQ0FDTCw2QkFBSyxTQUFTLEVBQUMsbUJBQW1CO1FBQ2hDLDZCQUFLLFNBQVMsRUFBQyxlQUFlLHVCQUF1QjtRQUNyRCxvQkFBQyxVQUFVLElBQ1QsUUFBUSxRQUNSLEtBQUssRUFBQyxFQUFFLEVBQ1IsYUFBYSxFQUFFLFVBQUMsTUFBTTtnQkFDcEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDakQsQ0FBQTtnQkFDRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUE7Z0JBQ2QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO2dCQUNqQixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO2dCQUNwQyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO2dCQUNsQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO2dCQUNwQyxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtnQkFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBRTVCLElBQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRSxPQUFPO29CQUNMLFFBQVEsRUFBRSxTQUFTO29CQUNuQixNQUFNLEVBQUUsd0JBQWlCLGlCQUFpQixDQUFFO2lCQUM3QyxDQUFBO1lBQ0gsQ0FBQyxFQUNELFFBQVEsRUFBRSxVQUFDLE1BQU07Z0JBQ2YsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO2dCQUMxQyw4SUFBOEk7Z0JBQzlJLE9BQU8sQ0FBQyxPQUFPLENBQUM7b0JBQ2QsUUFBUSxFQUFFLGtCQUFXLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFFO29CQUM5RSxNQUFNLEVBQUUsRUFBRTtpQkFDWCxDQUFDLENBQUE7WUFDSixDQUFDLEVBQ0QsaUJBQWlCLEVBQUU7Z0JBQ2pCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFNBQVMsRUFBRSxRQUFRO2FBQ3BCLEdBQ0QsQ0FDRSxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB7IHVzZUhpc3RvcnkgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IHsgQXN5bmNUYXNrcyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0FzeW5jVGFzay9hc3luYy10YXNrJ1xuaW1wb3J0IHsgT3BlblNlYXJjaCB9IGZyb20gJy4vc2VhcmNoJ1xuXG5jb25zdCBPcGVuID0gKCkgPT4ge1xuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHAtMlwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBwYi0yXCI+UmVzdG9yZSBhIHNlYXJjaDwvZGl2PlxuICAgICAgPE9wZW5TZWFyY2hcbiAgICAgICAgYXJjaGl2ZWRcbiAgICAgICAgbGFiZWw9XCJcIlxuICAgICAgICBjb25zdHJ1Y3RMaW5rPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgY29uc3QgY29weSA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICAgICAgICApXG4gICAgICAgICAgZGVsZXRlIGNvcHkuaWRcbiAgICAgICAgICBkZWxldGUgY29weS50aXRsZVxuICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLmRhdGUnXVxuICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLmlkJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC50YWdzJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC52ZXJzaW9uJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQtdGFncyddXG4gICAgICAgICAgZGVsZXRlIGNvcHlbJ21ldGFjYXJkLXR5cGUnXVxuXG4gICAgICAgICAgY29uc3QgZW5jb2RlZFF1ZXJ5TW9kZWwgPSBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY29weSkpXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhdGhuYW1lOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICBzZWFyY2g6IGA/ZGVmYXVsdFF1ZXJ5PSR7ZW5jb2RlZFF1ZXJ5TW9kZWx9YCxcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIG9uRmluaXNoPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgQXN5bmNUYXNrcy5yZXN0b3JlKHsgbGF6eVJlc3VsdDogcmVzdWx0IH0pXG4gICAgICAgICAgLy8gcmVwbGFjZSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZXkgZ2V0IHRoZSBsaW5rIGluIGNvbnN0cnVjdExpbmsgcHV0IGludG8gaGlzdG9yeSBhcyB3ZWxsIHVuZm9ydHVuYXRlbHksIHdpbGwgbmVlZCB0byBmaXggdGhpcyBtb3JlIGdlbmVyYWxseVxuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZSh7XG4gICAgICAgICAgICBwYXRobmFtZTogYC9zZWFyY2gvJHtyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQuZGVsZXRlZC5pZCddfWAsXG4gICAgICAgICAgICBzZWFyY2g6ICcnLFxuICAgICAgICAgIH0pXG4gICAgICAgIH19XG4gICAgICAgIGF1dG9jb21wbGV0ZVByb3BzPXt7XG4gICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgIGNsYXNzTmFtZTogJ3ctZnVsbCcsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKE9wZW4pXG4iXX0=