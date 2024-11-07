/// <reference types="react" />
export type MetacardType = {
    getPreview: Function;
    getTitle: Function;
    id: String;
    toJSON: () => any;
};
export type LocationType = {
    left: number;
    top: number;
};
type Props = {
    map: any;
    selectionInterface: {
        getSelectedResults: () => {
            models: MetacardType[];
        } & Array<MetacardType>;
        getActiveSearchResults: () => {
            models: MetacardType[];
        } & Array<MetacardType>;
        clearSelectedResults: () => void;
        addSelectedResult: (metacard: MetacardType) => void;
    };
    mapModel: any;
};
declare const _default: (props: Props) => JSX.Element | null;
export default _default;
