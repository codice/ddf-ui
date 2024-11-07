import _merge from 'lodash/merge';
import _ from 'underscore';
import wreqr from '../../js/wreqr';
import user from '../singletons/user-instance';
import { dispatchGoldenLayoutChangeEvent } from './golden-layout.events';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { HeaderHeight } from './stack-toolbar';
import { getDefaultComponentState } from '../visualization/settings-helpers';
function normalizeContent(content) {
    if (content.componentState === undefined && content.componentName) {
        content.componentState = getDefaultComponentState(content.componentName);
    }
    if (content.content) {
        content.content.forEach(function (subContent) {
            normalizeContent(subContent);
        });
    }
}
/**
 *  add in missing component state defaults, as we do not create layouts using golden layout all the time and sometimes they have minimal details,
 *  this will also add a default state to old layouts so they aren't seen as changed unnecessarily on load (we don't fire a change event)
 */
export function normalizeLayout(layout) {
    if (layout.content && layout.content.length > 0) {
        layout.content.forEach(function (contentItem) {
            normalizeContent(contentItem);
        });
    }
    if (layout.openPopouts && layout.openPopouts.length > 0) {
        layout.openPopouts.forEach(function (popout) {
            popout.content.forEach(function (contentItem) {
                normalizeContent(contentItem);
            });
        });
    }
    return layout;
}
export function getInstanceConfig(_a) {
    var goldenLayout = _a.goldenLayout;
    var currentConfig = goldenLayout.toConfig();
    // tagAsProcessedByGoldenLayout({ config: currentConfig })
    return removeEphemeralStateAndNormalize(currentConfig);
}
export function parseResultLayout(layoutResult) {
    var config = undefined;
    try {
        config = JSON.parse(layoutResult.metacard.properties.layout);
    }
    catch (err) {
        console.warn('issue parsing a saved layout, falling back to default');
        config = DEFAULT_GOLDEN_LAYOUT_CONTENT;
    }
    _merge(config, getGoldenLayoutSettings());
    return normalizeLayout(config);
}
export function getGoldenLayoutConfig(_a) {
    var layoutResult = _a.layoutResult, editLayoutRef = _a.editLayoutRef, configName = _a.configName;
    var currentConfig = undefined;
    if (layoutResult) {
        return parseResultLayout(layoutResult);
    }
    else if (editLayoutRef) {
        currentConfig = editLayoutRef.current;
    }
    else {
        currentConfig = user.get('user').get('preferences').get(configName);
    }
    if (currentConfig === undefined) {
        currentConfig = DEFAULT_GOLDEN_LAYOUT_CONTENT;
    }
    _merge(currentConfig, getGoldenLayoutSettings());
    return normalizeLayout(currentConfig);
}
export function handleGoldenLayoutStateChange(_a) {
    var options = _a.options, goldenLayout = _a.goldenLayout, currentConfig = _a.currentConfig, lastConfig = _a.lastConfig;
    var lastConfigValue = removeEphemeralStateAndNormalize(lastConfig.current);
    var currentConfigValue = removeEphemeralStateAndNormalize(currentConfig);
    if (_.isEqual(lastConfigValue, currentConfigValue)) {
        return;
    }
    dispatchGoldenLayoutChangeEvent(goldenLayout.container[0], {
        value: currentConfigValue,
        goldenLayout: goldenLayout,
    });
    lastConfig.current = currentConfig;
    /**
     * If we have this option, then we're editing a layout in the layout editor.
     * Otherwise, we're using a layout (or possibly custom) and need to take a change as indication of moving to custom.
     */
    if (options.editLayoutRef) {
        options.editLayoutRef.current = currentConfig;
    }
    else {
        // can technically do detections of max or empty here
        //https://github.com/deepstreamIO/golden-layout/issues/253
        if (goldenLayout.isInitialised) {
            user.get('user').get('preferences').set(options.configName, currentConfig);
            wreqr.vent.trigger('resize');
            //do not add a window resize event, that will cause an endless loop.  If you need something like that, listen to the wreqr resize event.
        }
        user.get('user').get('preferences').set({
            layoutId: 'custom',
        }, {
            internal: true,
        });
    }
}
function removeMaximisedInformation(config) {
    delete config.maximisedItemId;
}
function isLayoutConfig(config) {
    return config.openPopouts !== undefined;
}
function isPopoutContent(config) {
    return config.parentId !== undefined;
}
function removeOpenPopoutDimensionInformation(config) {
    var _a;
    delete config.dimensions;
    if (isLayoutConfig(config) &&
        config.openPopouts &&
        ((_a = config.openPopouts) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        return _.forEach(config.openPopouts, removeOpenPopoutDimensionInformation);
    }
}
function removeSettingsInformation(config) {
    delete config.settings;
}
function removeUnusedTopLevelInformation(config) {
    delete config.isClosable;
    delete config.reorderEnabled;
    if (!isLayoutConfig(config) && !isPopoutContent(config)) {
        delete config.activeItemIndex;
    }
    if (config.content !== undefined && config.content.length > 0) {
        _.forEach(config.content, removeUnusedTopLevelInformation);
    }
    if (isLayoutConfig(config) &&
        config.openPopouts &&
        config.openPopouts.length > 0) {
        _.forEach(config.openPopouts, removeUnusedTopLevelInformation);
    }
}
function normalizeOpenPopouts(config) {
    if (config.openPopouts === undefined) {
        config.openPopouts = [];
    }
}
export function removeEphemeralStateAndNormalize(config) {
    delete config.title; // only on the top level
    removeMaximisedInformation(config);
    removeOpenPopoutDimensionInformation(config);
    removeSettingsInformation(config);
    removeUnusedTopLevelInformation(config);
    normalizeOpenPopouts(config);
    return config;
}
export var FALLBACK_GOLDEN_LAYOUT = [
    {
        type: 'stack',
        content: [
            {
                type: 'component',
                componentName: 'cesium',
                title: '3D Map',
            },
            {
                type: 'component',
                componentName: 'inspector',
                title: 'Inspector',
            },
        ],
    },
];
export var DEFAULT_GOLDEN_LAYOUT_CONTENT = {
    content: StartupDataStore.Configuration.getDefaultLayout() || FALLBACK_GOLDEN_LAYOUT,
};
export var getStringifiedDefaultLayout = function () {
    try {
        return JSON.stringify(DEFAULT_GOLDEN_LAYOUT_CONTENT);
    }
    catch (err) {
        console.warn(err);
        return JSON.stringify(FALLBACK_GOLDEN_LAYOUT);
    }
};
export function getGoldenLayoutSettings() {
    return {
        settings: {
            showPopoutIcon: false,
            popoutWholeStack: true,
            responsiveMode: 'none',
        },
        dimensions: {
            borderWidth: 8,
            minItemHeight: HeaderHeight,
            minItemWidth: 50,
            headerHeight: HeaderHeight,
            dragProxyWidth: 300,
            dragProxyHeight: 200,
        },
        labels: {
            close: 'close',
            maximise: 'maximize',
            minimise: 'minimize',
            popout: 'open in new window',
            popin: 'pop in',
            tabDropdown: 'additional tabs',
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC5sYXlvdXQtY29uZmlnLWhhbmRsaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQubGF5b3V0LWNvbmZpZy1oYW5kbGluZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxPQUFPLElBQUksTUFBTSw2QkFBNkIsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN4RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUVqRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDOUMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFHNUUsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFvQjtJQUM1QyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUU7UUFDakUsT0FBTyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDekU7SUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVO1lBQ2pDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzlCLENBQUMsQ0FBQyxDQUFBO0tBQ0g7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUFvQjtJQUNsRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFB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U0FDdkI7UUFDRCxVQUFVLEVBQUU7WUFDVixXQUFXLEVBQUUsQ0FBQztZQUNkLGFBQWEsRUFBRSxZQUFZO1lBQzNCLFlBQVksRUFBRSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxZQUFZO1lBQzFCLGNBQWMsRUFBRSxHQUFHO1lBQ25CLGVBQWUsRUFBRSxHQUFHO1NBQ3JCO1FBQ0QsTUFBTSxFQUFFO1lBQ04sS0FBSyxFQUFFLE9BQU87WUFDZCxRQUFRLEVBQUUsVUFBVTtZQUNwQixRQUFRLEVBQUUsVUFBVTtZQUNwQixNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLEtBQUssRUFBRSxRQUFRO1lBQ2YsV0FBVyxFQUFFLGlCQUFpQjtTQUMvQjtLQUNGLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR29sZGVuTGF5b3V0Vmlld1Byb3BzIH0gZnJvbSAnLi9nb2xkZW4tbGF5b3V0LnZpZXcnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBfbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi9qcy93cmVxcidcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IGRpc3BhdGNoR29sZGVuTGF5b3V0Q2hhbmdlRXZlbnQgfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQuZXZlbnRzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IExheW91dENvbmZpZywgUG9wb3V0Q29udGVudCwgQ29udGVudEl0ZW0gfSBmcm9tICcuL2dvbGRlbi1sYXlvdXQudHlwZXMnXG5pbXBvcnQgeyBIZWFkZXJIZWlnaHQgfSBmcm9tICcuL3N0YWNrLXRvb2xiYXInXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29tcG9uZW50U3RhdGUgfSBmcm9tICcuLi92aXN1YWxpemF0aW9uL3NldHRpbmdzLWhlbHBlcnMnXG5pbXBvcnQgeyBSZXN1bHRUeXBlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvVHlwZXMnXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbnRlbnQoY29udGVudDogQ29udGVudEl0ZW0pIHtcbiAgaWYgKGNvbnRlbnQuY29tcG9uZW50U3RhdGUgPT09IHVuZGVmaW5lZCAmJiBjb250ZW50LmNvbXBvbmVudE5hbWUpIHtcbiAgICBjb250ZW50LmNvbXBvbmVudFN0YXRlID0gZ2V0RGVmYXVsdENvbXBvbmVudFN0YXRlKGNvbnRlbnQuY29tcG9uZW50TmFtZSlcbiAgfVxuICBpZiAoY29udGVudC5jb250ZW50KSB7XG4gICAgY29udGVudC5jb250ZW50LmZvckVhY2goKHN1YkNvbnRlbnQpID0+IHtcbiAgICAgIG5vcm1hbGl6ZUNvbnRlbnQoc3ViQ29udGVudClcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogIGFkZCBpbiBtaXNzaW5nIGNvbXBvbmVudCBzdGF0ZSBkZWZhdWx0cywgYXMgd2UgZG8gbm90IGNyZWF0ZSBsYXlvdXRzIHVzaW5nIGdvbGRlbiBsYXlvdXQgYWxsIHRoZSB0aW1lIGFuZCBzb21ldGltZXMgdGhleSBoYXZlIG1pbmltYWwgZGV0YWlscyxcbiAqICB0aGlzIHdpbGwgYWxzbyBhZGQgYSBkZWZhdWx0IHN0YXRlIHRvIG9sZCBsYXlvdXRzIHNvIHRoZXkgYXJlbid0IHNlZW4gYXMgY2hhbmdlZCB1bm5lY2Vzc2FyaWx5IG9uIGxvYWQgKHdlIGRvbid0IGZpcmUgYSBjaGFuZ2UgZXZlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMYXlvdXQobGF5b3V0OiBMYXlvdXRDb25maWcpIHtcbiAgaWYgKGxheW91dC5jb250ZW50ICYmIGxheW91dC5jb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICBsYXlvdXQuY29udGVudC5mb3JFYWNoKChjb250ZW50SXRlbSkgPT4ge1xuICAgICAgbm9ybWFsaXplQ29udGVudChjb250ZW50SXRlbSlcbiAgICB9KVxuICB9XG4gIGlmIChsYXlvdXQub3BlblBvcG91dHMgJiYgbGF5b3V0Lm9wZW5Qb3BvdXRzLmxlbmd0aCA+IDApIHtcbiAgICBsYXlvdXQub3BlblBvcG91dHMuZm9yRWFjaCgocG9wb3V0KSA9PiB7XG4gICAgICBwb3BvdXQuY29udGVudC5mb3JFYWNoKChjb250ZW50SXRlbSkgPT4ge1xuICAgICAgICBub3JtYWxpemVDb250ZW50KGNvbnRlbnRJdGVtKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG4gIHJldHVybiBsYXlvdXRcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnN0YW5jZUNvbmZpZyh7IGdvbGRlbkxheW91dCB9OiB7IGdvbGRlbkxheW91dDogYW55IH0pIHtcbiAgY29uc3QgY3VycmVudENvbmZpZyA9IGdvbGRlbkxheW91dC50b0NvbmZpZygpXG4gIC8vIHRhZ0FzUHJvY2Vzc2VkQnlHb2xkZW5MYXlvdXQoeyBjb25maWc6IGN1cnJlbnRDb25maWcgfSlcbiAgcmV0dXJuIHJlbW92ZUVwaGVtZXJhbFN0YXRlQW5kTm9ybWFsaXplKGN1cnJlbnRDb25maWcpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVJlc3VsdExheW91dChsYXlvdXRSZXN1bHQ6IFJlc3VsdFR5cGUpIHtcbiAgbGV0IGNvbmZpZyA9IHVuZGVmaW5lZFxuICB0cnkge1xuICAgIGNvbmZpZyA9IEpTT04ucGFyc2UobGF5b3V0UmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXMubGF5b3V0KVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ2lzc3VlIHBhcnNpbmcgYSBzYXZlZCBsYXlvdXQsIGZhbGxpbmcgYmFjayB0byBkZWZhdWx0JylcbiAgICBjb25maWcgPSBERUZBVUxUX0dPTERFTl9MQVlPVVRfQ09OVEVOVFxuICB9XG4gIF9tZXJnZShjb25maWcsIGdldEdvbGRlbkxheW91dFNldHRpbmdzKCkpXG4gIHJldHVybiBub3JtYWxpemVMYXlvdXQoY29uZmlnKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEdvbGRlbkxheW91dENvbmZpZyh7XG4gIGxheW91dFJlc3VsdCxcbiAgZWRpdExheW91dFJlZixcbiAgY29uZmlnTmFtZSxcbn06IEdvbGRlbkxheW91dFZpZXdQcm9wcykge1xuICBsZXQgY3VycmVudENvbmZpZyA9IHVuZGVmaW5lZFxuICBpZiAobGF5b3V0UmVzdWx0KSB7XG4gICAgcmV0dXJuIHBhcnNlUmVzdWx0TGF5b3V0KGxheW91dFJlc3VsdClcbiAgfSBlbHNlIGlmIChlZGl0TGF5b3V0UmVmKSB7XG4gICAgY3VycmVudENvbmZpZyA9IGVkaXRMYXlvdXRSZWYuY3VycmVudFxuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRDb25maWcgPSB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoY29uZmlnTmFtZSlcbiAgfVxuICBpZiAoY3VycmVudENvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY3VycmVudENvbmZpZyA9IERFRkFVTFRfR09MREVOX0xBWU9VVF9DT05URU5UXG4gIH1cbiAgX21lcmdlKGN1cnJlbnRDb25maWcsIGdldEdvbGRlbkxheW91dFNldHRpbmdzKCkpXG4gIHJldHVybiBub3JtYWxpemVMYXlvdXQoY3VycmVudENvbmZpZylcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVHb2xkZW5MYXlvdXRTdGF0ZUNoYW5nZSh7XG4gIG9wdGlvbnMsXG4gIGdvbGRlbkxheW91dCxcbiAgY3VycmVudENvbmZpZyxcbiAgbGFzdENvbmZpZyxcbn06IHtcbiAgZ29sZGVuTGF5b3V0OiBhbnlcbiAgY3VycmVudENvbmZpZzogYW55XG4gIG9wdGlvbnM6IEdvbGRlbkxheW91dFZpZXdQcm9wc1xuICBsYXN0Q29uZmlnOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PGFueT5cbn0pIHtcbiAgY29uc3QgbGFzdENvbmZpZ1ZhbHVlID0gcmVtb3ZlRXBoZW1lcmFsU3RhdGVBbmROb3JtYWxpemUobGFzdENvbmZpZy5jdXJyZW50KVxuXG4gIGNvbnN0IGN1cnJlbnRDb25maWdWYWx1ZSA9IHJlbW92ZUVwaGVtZXJhbFN0YXRlQW5kTm9ybWFsaXplKGN1cnJlbnRDb25maWcpXG4gIGlmIChfLmlzRXF1YWwobGFzdENvbmZpZ1ZhbHVlLCBjdXJyZW50Q29uZmlnVmFsdWUpKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgZGlzcGF0Y2hHb2xkZW5MYXlvdXRDaGFuZ2VFdmVudChnb2xkZW5MYXlvdXQuY29udGFpbmVyWzBdLCB7XG4gICAgdmFsdWU6IGN1cnJlbnRDb25maWdWYWx1ZSxcbiAgICBnb2xkZW5MYXlvdXQsXG4gIH0pXG4gIGxhc3RDb25maWcuY3VycmVudCA9IGN1cnJlbnRDb25maWdcbiAgLyoqXG4gICAqIElmIHdlIGhhdmUgdGhpcyBvcHRpb24sIHRoZW4gd2UncmUgZWRpdGluZyBhIGxheW91dCBpbiB0aGUgbGF5b3V0IGVkaXRvci5cbiAgICogT3RoZXJ3aXNlLCB3ZSdyZSB1c2luZyBhIGxheW91dCAob3IgcG9zc2libHkgY3VzdG9tKSBhbmQgbmVlZCB0byB0YWtlIGEgY2hhbmdlIGFzIGluZGljYXRpb24gb2YgbW92aW5nIHRvIGN1c3RvbS5cbiAgICovXG4gIGlmIChvcHRpb25zLmVkaXRMYXlvdXRSZWYpIHtcbiAgICBvcHRpb25zLmVkaXRMYXlvdXRSZWYuY3VycmVudCA9IGN1cnJlbnRDb25maWdcbiAgfSBlbHNlIHtcbiAgICAvLyBjYW4gdGVjaG5pY2FsbHkgZG8gZGV0ZWN0aW9ucyBvZiBtYXggb3IgZW1wdHkgaGVyZVxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2RlZXBzdHJlYW1JTy9nb2xkZW4tbGF5b3V0L2lzc3Vlcy8yNTNcbiAgICBpZiAoZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQpIHtcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLnNldChvcHRpb25zLmNvbmZpZ05hbWUsIGN1cnJlbnRDb25maWcpXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdyZXNpemUnKVxuICAgICAgLy9kbyBub3QgYWRkIGEgd2luZG93IHJlc2l6ZSBldmVudCwgdGhhdCB3aWxsIGNhdXNlIGFuIGVuZGxlc3MgbG9vcC4gIElmIHlvdSBuZWVkIHNvbWV0aGluZyBsaWtlIHRoYXQsIGxpc3RlbiB0byB0aGUgd3JlcXIgcmVzaXplIGV2ZW50LlxuICAgIH1cbiAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zZXQoXG4gICAgICB7XG4gICAgICAgIGxheW91dElkOiAnY3VzdG9tJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGludGVybmFsOiB0cnVlLFxuICAgICAgfVxuICAgIClcbiAgfVxufVxuZnVuY3Rpb24gcmVtb3ZlTWF4aW1pc2VkSW5mb3JtYXRpb24oY29uZmlnOiBMYXlvdXRDb25maWcpIHtcbiAgZGVsZXRlIGNvbmZpZy5tYXhpbWlzZWRJdGVtSWRcbn1cbmZ1bmN0aW9uIGlzTGF5b3V0Q29uZmlnKFxuICBjb25maWc6IExheW91dENvbmZpZyB8IFBvcG91dENvbnRlbnQgfCBDb250ZW50SXRlbVxuKTogY29uZmlnIGlzIExheW91dENvbmZpZyB7XG4gIHJldHVybiAoY29uZmlnIGFzIExheW91dENvbmZpZykub3BlblBvcG91dHMgIT09IHVuZGVmaW5lZFxufVxuZnVuY3Rpb24gaXNQb3BvdXRDb250ZW50KFxuICBjb25maWc6IExheW91dENvbmZpZyB8IFBvcG91dENvbnRlbnQgfCBDb250ZW50SXRlbVxuKTogY29uZmlnIGlzIFBvcG91dENvbnRlbnQge1xuICByZXR1cm4gKGNvbmZpZyBhcyBQb3BvdXRDb250ZW50KS5wYXJlbnRJZCAhPT0gdW5kZWZpbmVkXG59XG5mdW5jdGlvbiByZW1vdmVPcGVuUG9wb3V0RGltZW5zaW9uSW5mb3JtYXRpb24oXG4gIGNvbmZpZzogTGF5b3V0Q29uZmlnIHwgUG9wb3V0Q29udGVudFxuKTogYW55IHtcbiAgZGVsZXRlIGNvbmZpZy5kaW1lbnNpb25zXG4gIGlmIChcbiAgICBpc0xheW91dENvbmZpZyhjb25maWcpICYmXG4gICAgY29uZmlnLm9wZW5Qb3BvdXRzICYmXG4gICAgY29uZmlnLm9wZW5Qb3BvdXRzPy5sZW5ndGggPiAwXG4gICkge1xuICAgIHJldHVybiBfLmZvckVhY2goY29uZmlnLm9wZW5Qb3BvdXRzLCByZW1vdmVPcGVuUG9wb3V0RGltZW5zaW9uSW5mb3JtYXRpb24pXG4gIH1cbn1cbmZ1bmN0aW9uIHJlbW92ZVNldHRpbmdzSW5mb3JtYXRpb24oY29uZmlnOiBMYXlvdXRDb25maWcpIHtcbiAgZGVsZXRlIGNvbmZpZy5zZXR0aW5nc1xufVxuZnVuY3Rpb24gcmVtb3ZlVW51c2VkVG9wTGV2ZWxJbmZvcm1hdGlvbihcbiAgY29uZmlnOiBMYXlvdXRDb25maWcgfCBDb250ZW50SXRlbSB8IFBvcG91dENvbnRlbnRcbikge1xuICBkZWxldGUgY29uZmlnLmlzQ2xvc2FibGVcbiAgZGVsZXRlIGNvbmZpZy5yZW9yZGVyRW5hYmxlZFxuICBpZiAoIWlzTGF5b3V0Q29uZmlnKGNvbmZpZykgJiYgIWlzUG9wb3V0Q29udGVudChjb25maWcpKSB7XG4gICAgZGVsZXRlIGNvbmZpZy5hY3RpdmVJdGVtSW5kZXhcbiAgfVxuICBpZiAoY29uZmlnLmNvbnRlbnQgIT09IHVuZGVmaW5lZCAmJiBjb25maWcuY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgXy5mb3JFYWNoKGNvbmZpZy5jb250ZW50LCByZW1vdmVVbnVzZWRUb3BMZXZlbEluZm9ybWF0aW9uKVxuICB9XG4gIGlmIChcbiAgICBpc0xheW91dENvbmZpZyhjb25maWcpICYmXG4gICAgY29uZmlnLm9wZW5Qb3BvdXRzICYmXG4gICAgY29uZmlnLm9wZW5Qb3BvdXRzLmxlbmd0aCA+IDBcbiAgKSB7XG4gICAgXy5mb3JFYWNoKGNvbmZpZy5vcGVuUG9wb3V0cywgcmVtb3ZlVW51c2VkVG9wTGV2ZWxJbmZvcm1hdGlvbilcbiAgfVxufVxuZnVuY3Rpb24gbm9ybWFsaXplT3BlblBvcG91dHMoY29uZmlnOiBMYXlvdXRDb25maWcpIHtcbiAgaWYgKGNvbmZpZy5vcGVuUG9wb3V0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uZmlnLm9wZW5Qb3BvdXRzID0gW11cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXBoZW1lcmFsU3RhdGVBbmROb3JtYWxpemUoY29uZmlnOiBMYXlvdXRDb25maWcpIHtcbiAgZGVsZXRlIGNvbmZpZy50aXRsZSAvLyBvbmx5IG9uIHRoZSB0b3AgbGV2ZWxcbiAgcmVtb3ZlTWF4aW1pc2VkSW5mb3JtYXRpb24oY29uZmlnKVxuICByZW1vdmVPcGVuUG9wb3V0RGltZW5zaW9uSW5mb3JtYXRpb24oY29uZmlnKVxuICByZW1vdmVTZXR0aW5nc0luZm9ybWF0aW9uKGNvbmZpZylcbiAgcmVtb3ZlVW51c2VkVG9wTGV2ZWxJbmZvcm1hdGlvbihjb25maWcpXG4gIG5vcm1hbGl6ZU9wZW5Qb3BvdXRzKGNvbmZpZylcbiAgcmV0dXJuIGNvbmZpZ1xufVxuZXhwb3J0IGNvbnN0IEZBTExCQUNLX0dPTERFTl9MQVlPVVQgPSBbXG4gIHtcbiAgICB0eXBlOiAnc3RhY2snLFxuICAgIGNvbnRlbnQ6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgIGNvbXBvbmVudE5hbWU6ICdjZXNpdW0nLFxuICAgICAgICB0aXRsZTogJzNEIE1hcCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgY29tcG9uZW50TmFtZTogJ2luc3BlY3RvcicsXG4gICAgICAgIHRpdGxlOiAnSW5zcGVjdG9yJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbl1cbmV4cG9ydCBjb25zdCBERUZBVUxUX0dPTERFTl9MQVlPVVRfQ09OVEVOVCA9IHtcbiAgY29udGVudDpcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RGVmYXVsdExheW91dCgpIHx8IEZBTExCQUNLX0dPTERFTl9MQVlPVVQsXG59XG5cbmV4cG9ydCBjb25zdCBnZXRTdHJpbmdpZmllZERlZmF1bHRMYXlvdXQgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KERFRkFVTFRfR09MREVOX0xBWU9VVF9DT05URU5UKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oZXJyKVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShGQUxMQkFDS19HT0xERU5fTEFZT1VUKVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0R29sZGVuTGF5b3V0U2V0dGluZ3MoKSB7XG4gIHJldHVybiB7XG4gICAgc2V0dGluZ3M6IHtcbiAgICAgIHNob3dQb3BvdXRJY29uOiBmYWxzZSxcbiAgICAgIHBvcG91dFdob2xlU3RhY2s6IHRydWUsXG4gICAgICByZXNwb25zaXZlTW9kZTogJ25vbmUnLFxuICAgIH0sXG4gICAgZGltZW5zaW9uczoge1xuICAgICAgYm9yZGVyV2lkdGg6IDgsXG4gICAgICBtaW5JdGVtSGVpZ2h0OiBIZWFkZXJIZWlnaHQsXG4gICAgICBtaW5JdGVtV2lkdGg6IDUwLFxuICAgICAgaGVhZGVySGVpZ2h0OiBIZWFkZXJIZWlnaHQsXG4gICAgICBkcmFnUHJveHlXaWR0aDogMzAwLFxuICAgICAgZHJhZ1Byb3h5SGVpZ2h0OiAyMDAsXG4gICAgfSxcbiAgICBsYWJlbHM6IHtcbiAgICAgIGNsb3NlOiAnY2xvc2UnLFxuICAgICAgbWF4aW1pc2U6ICdtYXhpbWl6ZScsXG4gICAgICBtaW5pbWlzZTogJ21pbmltaXplJyxcbiAgICAgIHBvcG91dDogJ29wZW4gaW4gbmV3IHdpbmRvdycsXG4gICAgICBwb3BpbjogJ3BvcCBpbicsXG4gICAgICB0YWJEcm9wZG93bjogJ2FkZGl0aW9uYWwgdGFicycsXG4gICAgfSxcbiAgfVxufVxuIl19