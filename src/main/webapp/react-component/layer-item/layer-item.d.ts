/// <reference types="react" />
/// <reference types="backbone" />
type ContainerProps = {
    layer: Backbone.Model;
    sortable: any;
    updateOrdering: any;
    focusModel: any;
};
declare const _default: (props: ContainerProps) => JSX.Element;
export default _default;
