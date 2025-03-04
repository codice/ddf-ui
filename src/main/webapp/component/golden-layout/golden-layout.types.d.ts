/**
 *  Probably some competing locations for where we should put some of these types, like the componentState
 */
import { LayerType } from '../../js/controllers/layers';
import { ModeType } from '../visualization/results-visual/results-visual';
interface LabelConfig {
    close: string;
    maximise: string;
    minimise: string;
    popout: string;
    popin: string;
    tabDropdown: string;
}
export interface CesiumStateType {
    mapLayers: LayerType[];
}
export interface OpenlayersStateType {
    mapLayers: LayerType[];
}
interface TimelineState {
}
interface HistogramState {
}
export interface ResultsState {
    'results-mode': ModeType;
    'results-attributesShownTable': string[];
    'results-attributesShownList': string[];
}
interface InspectorState {
}
type ComponentState = {
    componentName: 'cesium';
    state: CesiumStateType;
} | {
    componentName: 'openlayers';
    state: OpenlayersStateType;
} | {
    componentName: 'timeline';
    state: TimelineState;
} | {
    componentName: 'histogram';
    state: HistogramState;
} | {
    componentName: 'results';
    state: ResultsState;
} | {
    componentName: 'inspector';
    state: InspectorState;
};
type ExtractComponentNames<T> = T extends {
    componentName: infer U;
} ? U : never;
export type ComponentNameType = ExtractComponentNames<ComponentState>;
export interface ContentItem {
    type: string;
    isClosable?: boolean;
    reorderEnabled: boolean;
    title: string;
    activeItemIndex?: number;
    width?: number;
    height?: number;
    content?: ContentItem[];
    componentName?: ComponentNameType;
    icon?: string;
    componentState?: ComponentState['state'];
    component?: ComponentNameType;
    header?: Record<string, any>;
}
export interface PopoutContent {
    content: ContentItem[];
    parentId: string;
    indexInParent: number;
    dimensions?: PopoutDimensions;
    reorderEnabled?: boolean;
    isClosable?: boolean;
    title?: string;
}
interface LayoutSettings {
    hasHeaders: boolean;
    constrainDragToContainer: boolean;
    reorderEnabled: boolean;
    selectionEnabled: boolean;
    popoutWholeStack: boolean;
    blockedPopoutsThrowError: boolean;
    closePopoutsOnUnload: boolean;
    showPopoutIcon: boolean;
    showMaximiseIcon: boolean;
    showCloseIcon: boolean;
    responsiveMode: string;
    tabOverlapAllowance: number;
    reorderOnTabMenuClick: boolean;
    tabControlOffset: number;
}
interface LayoutDimensions {
    borderWidth: number;
    borderGrabWidth: number;
    minItemHeight: number;
    minItemWidth: number;
    headerHeight: number;
    dragProxyWidth: number;
    dragProxyHeight: number;
}
interface PopoutDimensions {
    width: number;
    height: number;
    left: number;
    top: number;
}
export interface LayoutConfig {
    labels: LabelConfig;
    content: ContentItem[];
    id?: string | string[];
    openPopouts?: PopoutContent[];
    settings?: LayoutSettings;
    dimensions?: LayoutDimensions;
    reorderEnabled?: boolean;
    isClosable?: boolean;
    title?: string;
    maximisedItemId?: string | null;
}
export {};
