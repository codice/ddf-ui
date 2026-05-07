export type LayerInfo = {
    name: string;
    id: string;
    warning: string;
    isRemovable: boolean;
};
export type Order = {
    order: number;
    isBottom: boolean;
    isTop: boolean;
};
export type Visibility = {
    alpha: number;
    show: boolean;
};
export type Actions = {
    updateLayerShow: () => void;
    updateLayerAlpha: (e: any) => void;
    moveDown: (e: any) => void;
    moveUp: (e: any) => void;
    onRemove: () => void;
};
export type PresentationProps = {
    layerInfo: LayerInfo;
    order: Order;
    visibility: Visibility;
    actions: Actions;
    options?: any;
};
type ContainerProps = {
    layer: Backbone.Model;
    sortable: any;
    updateOrdering: any;
    focusModel: any;
};
declare const LayerItem: (props: ContainerProps) => import("react/jsx-runtime").JSX.Element;
export default LayerItem;
