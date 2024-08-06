/// <reference types="react" />
/// <reference types="backbone" />
type Props = {
    removeSort: () => void;
    saveSort: () => void;
    hasSort: Boolean;
    collection: Backbone.Collection<Backbone.Model>;
};
declare const _default: ({ removeSort, saveSort, hasSort, collection }: Props) => JSX.Element;
export default _default;
