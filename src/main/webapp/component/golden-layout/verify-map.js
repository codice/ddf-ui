import { __read, __spreadArray } from "tslib";
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
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import wreqr from '../../js/wreqr';
import { Visualizations } from '../visualization/visualizations';
function findMap(item) {
    return item.componentName === 'openlayers' || item.componentName === 'cesium';
}
function searchPopouts(popouts) {
    var popoutItems = [];
    popouts.forEach(function (popout) {
        popoutItems.push.apply(popoutItems, __spreadArray([], __read(popout.getGlInstance().root.getItemsByFilter(findMap)), false));
    });
    return popoutItems;
}
/**
 *  Notice that we are only forwarding events that start with 'search' for now, as these are drawing events.
 */
export var useVerifyMapExistsWhenDrawing = function (_a) {
    var goldenLayout = _a.goldenLayout, isInitialized = _a.isInitialized;
    useListenTo(wreqr.vent, 'search:drawline search:drawpoly search:drawbbox search:drawcircle', function () {
        if (goldenLayout && isInitialized) {
            //     // Launch the 2D Map (openlayers) if it's not already open
            var contentItems = goldenLayout.root.getItemsByFilter(findMap);
            var popoutItems = searchPopouts(goldenLayout.openPopouts);
            if (contentItems.length === 0 && popoutItems.length === 0) {
                var configs = Visualizations.reduce(function (cfg, viz) {
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isClosable' does not exist on type 'Visu... Remove this comment to see the full error message
                    var id = viz.id, title = viz.title, icon = viz.icon, _a = viz.isClosable, isClosable = _a === void 0 ? true : _a;
                    cfg[id] = {
                        title: title,
                        type: 'component',
                        componentName: id,
                        icon: icon,
                        componentState: {},
                        isClosable: isClosable,
                    };
                    return cfg;
                }, {});
                if (goldenLayout.root.contentItems.length === 0) {
                    goldenLayout.root.addChild({
                        type: 'column',
                        content: [configs['openlayers']],
                    });
                }
                else {
                    if (goldenLayout.root.contentItems[0].isColumn) {
                        goldenLayout.root.contentItems[0].contentItems[0].addChild(configs['openlayers'], 0);
                    }
                    else {
                        goldenLayout.root.contentItems[0].addChild(configs['openlayers'], 0);
                    }
                }
            }
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LW1hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZ29sZGVuLWxheW91dC92ZXJpZnktbWFwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFHaEUsU0FBUyxPQUFPLENBQUMsSUFBUztJQUN4QixPQUFPLElBQUksQ0FBQyxhQUFhLEtBQUssWUFBWSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssUUFBUSxDQUFBO0FBQy9FLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxPQUF3QjtJQUM3QyxJQUFJLFdBQVcsR0FBa0IsRUFBRSxDQUFBO0lBQ25DLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1FBQ3JCLFdBQVcsQ0FBQyxJQUFJLE9BQWhCLFdBQVcsMkJBQVMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsV0FBQztJQUM1RSxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sV0FBVyxDQUFBO0FBQ3BCLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFVBQUMsRUFNN0M7UUFMQyxZQUFZLGtCQUFBLEVBQ1osYUFBYSxtQkFBQTtJQUtiLFdBQVcsQ0FDUixLQUFhLENBQUMsSUFBSSxFQUNuQixtRUFBbUUsRUFDbkU7UUFDRSxJQUFJLFlBQVksSUFBSSxhQUFhLEVBQUU7WUFDakMsaUVBQWlFO1lBQ2pFLElBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDaEUsSUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUMzRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxJQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7b0JBQzdDLG1KQUFtSjtvQkFDM0ksSUFBQSxFQUFFLEdBQXFDLEdBQUcsR0FBeEMsRUFBRSxLQUFLLEdBQThCLEdBQUcsTUFBakMsRUFBRSxJQUFJLEdBQXdCLEdBQUcsS0FBM0IsRUFBRSxLQUFzQixHQUFHLFdBQVIsRUFBakIsVUFBVSxtQkFBRyxJQUFJLEtBQUEsQ0FBUTtvQkFDbEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHO3dCQUNSLEtBQUssT0FBQTt3QkFDTCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsYUFBYSxFQUFFLEVBQUU7d0JBQ2pCLElBQUksTUFBQTt3QkFDSixjQUFjLEVBQUUsRUFBRTt3QkFDbEIsVUFBVSxZQUFBO3FCQUNYLENBQUE7b0JBQ0QsT0FBTyxHQUFHLENBQUE7Z0JBQ1osQ0FBQyxFQUFFLEVBQTRCLENBQUMsQ0FBQTtnQkFDaEMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDekIsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO3FCQUNqQyxDQUFDLENBQUE7aUJBQ0g7cUJBQU07b0JBQ0wsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7d0JBQzlDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQ3hELE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFDckIsQ0FBQyxDQUNGLENBQUE7cUJBQ0Y7eUJBQU07d0JBQ0wsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUN4QyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQ3JCLENBQUMsQ0FDRixDQUFBO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtJQUNILENBQUMsQ0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgVmlzdWFsaXphdGlvbnMgfSBmcm9tICcuLi92aXN1YWxpemF0aW9uL3Zpc3VhbGl6YXRpb25zJ1xuaW1wb3J0IHsgQnJvd3NlcldpbmRvdywgQ29udGVudEl0ZW0gfSBmcm9tICdnb2xkZW4tbGF5b3V0J1xuXG5mdW5jdGlvbiBmaW5kTWFwKGl0ZW06IGFueSkge1xuICByZXR1cm4gaXRlbS5jb21wb25lbnROYW1lID09PSAnb3BlbmxheWVycycgfHwgaXRlbS5jb21wb25lbnROYW1lID09PSAnY2VzaXVtJ1xufVxuXG5mdW5jdGlvbiBzZWFyY2hQb3BvdXRzKHBvcG91dHM6IEJyb3dzZXJXaW5kb3dbXSkge1xuICBsZXQgcG9wb3V0SXRlbXM6IENvbnRlbnRJdGVtW10gPSBbXVxuICBwb3BvdXRzLmZvckVhY2goKHBvcG91dCkgPT4ge1xuICAgIHBvcG91dEl0ZW1zLnB1c2goLi4ucG9wb3V0LmdldEdsSW5zdGFuY2UoKS5yb290LmdldEl0ZW1zQnlGaWx0ZXIoZmluZE1hcCkpXG4gIH0pXG4gIHJldHVybiBwb3BvdXRJdGVtc1xufVxuXG4vKipcbiAqICBOb3RpY2UgdGhhdCB3ZSBhcmUgb25seSBmb3J3YXJkaW5nIGV2ZW50cyB0aGF0IHN0YXJ0IHdpdGggJ3NlYXJjaCcgZm9yIG5vdywgYXMgdGhlc2UgYXJlIGRyYXdpbmcgZXZlbnRzLlxuICovXG5leHBvcnQgY29uc3QgdXNlVmVyaWZ5TWFwRXhpc3RzV2hlbkRyYXdpbmcgPSAoe1xuICBnb2xkZW5MYXlvdXQsXG4gIGlzSW5pdGlhbGl6ZWQsXG59OiB7XG4gIGdvbGRlbkxheW91dDogYW55XG4gIGlzSW5pdGlhbGl6ZWQ6IGJvb2xlYW5cbn0pID0+IHtcbiAgdXNlTGlzdGVuVG8oXG4gICAgKHdyZXFyIGFzIGFueSkudmVudCxcbiAgICAnc2VhcmNoOmRyYXdsaW5lIHNlYXJjaDpkcmF3cG9seSBzZWFyY2g6ZHJhd2Jib3ggc2VhcmNoOmRyYXdjaXJjbGUnLFxuICAgICgpID0+IHtcbiAgICAgIGlmIChnb2xkZW5MYXlvdXQgJiYgaXNJbml0aWFsaXplZCkge1xuICAgICAgICAvLyAgICAgLy8gTGF1bmNoIHRoZSAyRCBNYXAgKG9wZW5sYXllcnMpIGlmIGl0J3Mgbm90IGFscmVhZHkgb3BlblxuICAgICAgICBjb25zdCBjb250ZW50SXRlbXMgPSBnb2xkZW5MYXlvdXQucm9vdC5nZXRJdGVtc0J5RmlsdGVyKGZpbmRNYXApXG4gICAgICAgIGNvbnN0IHBvcG91dEl0ZW1zID0gc2VhcmNoUG9wb3V0cyhnb2xkZW5MYXlvdXQub3BlblBvcG91dHMpXG4gICAgICAgIGlmIChjb250ZW50SXRlbXMubGVuZ3RoID09PSAwICYmIHBvcG91dEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGNvbmZpZ3MgPSBWaXN1YWxpemF0aW9ucy5yZWR1Y2UoKGNmZywgdml6KSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdpc0Nsb3NhYmxlJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICdWaXN1Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGNvbnN0IHsgaWQsIHRpdGxlLCBpY29uLCBpc0Nsb3NhYmxlID0gdHJ1ZSB9ID0gdml6XG4gICAgICAgICAgICBjZmdbaWRdID0ge1xuICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6IGlkLFxuICAgICAgICAgICAgICBpY29uLFxuICAgICAgICAgICAgICBjb21wb25lbnRTdGF0ZToge30sXG4gICAgICAgICAgICAgIGlzQ2xvc2FibGUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ZnXG4gICAgICAgICAgfSwge30gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSlcbiAgICAgICAgICBpZiAoZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZ29sZGVuTGF5b3V0LnJvb3QuYWRkQ2hpbGQoe1xuICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgY29udGVudDogW2NvbmZpZ3NbJ29wZW5sYXllcnMnXV0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zWzBdLmlzQ29sdW1uKSB7XG4gICAgICAgICAgICAgIGdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXS5jb250ZW50SXRlbXNbMF0uYWRkQ2hpbGQoXG4gICAgICAgICAgICAgICAgY29uZmlnc1snb3BlbmxheWVycyddLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zWzBdLmFkZENoaWxkKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3NbJ29wZW5sYXllcnMnXSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIClcbn1cbiJdfQ==