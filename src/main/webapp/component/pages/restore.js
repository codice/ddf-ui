import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { AsyncTasks } from '../../js/model/AsyncTask/async-task';
import { OpenSearch } from './search';
var Open = function () {
    var navigate = useNavigate();
    return (_jsxs("div", { className: "w-full h-full p-2", children: [_jsx("div", { className: "text-2xl pb-2", children: "Restore a search" }), _jsx(OpenSearch, { archived: true, label: "", constructLink: function (result) {
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
                    navigate("/search/".concat(result.plain.metacard.properties['metacard.deleted.id']), {
                        replace: true,
                    });
                }, autocompleteProps: {
                    fullWidth: true,
                    className: 'w-full',
                } })] }));
};
export default Open;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvcGFnZXMvcmVzdG9yZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFDaEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVyQyxJQUFNLElBQUksR0FBRztJQUNYLElBQU0sUUFBUSxHQUFHLFdBQVcsRUFBRSxDQUFBO0lBQzlCLE9BQU8sQ0FDTCxlQUFLLFNBQVMsRUFBQyxtQkFBbUIsYUFDaEMsY0FBSyxTQUFTLEVBQUMsZUFBZSxpQ0FBdUIsRUFDckQsS0FBQyxVQUFVLElBQ1QsUUFBUSxRQUNSLEtBQUssRUFBQyxFQUFFLEVBQ1IsYUFBYSxFQUFFLFVBQUMsTUFBTTtvQkFDcEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDakQsQ0FBQTtvQkFDRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUE7b0JBQ2QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO29CQUNqQixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO29CQUNwQyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO29CQUNsQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO29CQUNwQyxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO29CQUN2QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtvQkFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRTVCLElBQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO29CQUNsRSxPQUFPO3dCQUNMLFFBQVEsRUFBRSxTQUFTO3dCQUNuQixNQUFNLEVBQUUsd0JBQWlCLGlCQUFpQixDQUFFO3FCQUM3QyxDQUFBO2dCQUNILENBQUMsRUFDRCxRQUFRLEVBQUUsVUFBQyxNQUFNO29CQUNmLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtvQkFDMUMsOElBQThJO29CQUM5SSxRQUFRLENBQ04sa0JBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUUsRUFDcEU7d0JBQ0UsT0FBTyxFQUFFLElBQUk7cUJBQ2QsQ0FDRixDQUFBO2dCQUNILENBQUMsRUFDRCxpQkFBaUIsRUFBRTtvQkFDakIsU0FBUyxFQUFFLElBQUk7b0JBQ2YsU0FBUyxFQUFFLFFBQVE7aUJBQ3BCLEdBQ0QsSUFDRSxDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLElBQUksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCB7IEFzeW5jVGFza3MgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9Bc3luY1Rhc2svYXN5bmMtdGFzaydcbmltcG9ydCB7IE9wZW5TZWFyY2ggfSBmcm9tICcuL3NlYXJjaCdcblxuY29uc3QgT3BlbiA9ICgpID0+IHtcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHAtMlwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBwYi0yXCI+UmVzdG9yZSBhIHNlYXJjaDwvZGl2PlxuICAgICAgPE9wZW5TZWFyY2hcbiAgICAgICAgYXJjaGl2ZWRcbiAgICAgICAgbGFiZWw9XCJcIlxuICAgICAgICBjb25zdHJ1Y3RMaW5rPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgY29uc3QgY29weSA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICAgICAgICApXG4gICAgICAgICAgZGVsZXRlIGNvcHkuaWRcbiAgICAgICAgICBkZWxldGUgY29weS50aXRsZVxuICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLmRhdGUnXVxuICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLmlkJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC50YWdzJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC52ZXJzaW9uJ11cbiAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQtdGFncyddXG4gICAgICAgICAgZGVsZXRlIGNvcHlbJ21ldGFjYXJkLXR5cGUnXVxuXG4gICAgICAgICAgY29uc3QgZW5jb2RlZFF1ZXJ5TW9kZWwgPSBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY29weSkpXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhdGhuYW1lOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICBzZWFyY2g6IGA/ZGVmYXVsdFF1ZXJ5PSR7ZW5jb2RlZFF1ZXJ5TW9kZWx9YCxcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIG9uRmluaXNoPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgQXN5bmNUYXNrcy5yZXN0b3JlKHsgbGF6eVJlc3VsdDogcmVzdWx0IH0pXG4gICAgICAgICAgLy8gcmVwbGFjZSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZXkgZ2V0IHRoZSBsaW5rIGluIGNvbnN0cnVjdExpbmsgcHV0IGludG8gaGlzdG9yeSBhcyB3ZWxsIHVuZm9ydHVuYXRlbHksIHdpbGwgbmVlZCB0byBmaXggdGhpcyBtb3JlIGdlbmVyYWxseVxuICAgICAgICAgIG5hdmlnYXRlKFxuICAgICAgICAgICAgYC9zZWFyY2gvJHtyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQuZGVsZXRlZC5pZCddfWAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICBhdXRvY29tcGxldGVQcm9wcz17e1xuICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICBjbGFzc05hbWU6ICd3LWZ1bGwnLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcGVuXG4iXX0=