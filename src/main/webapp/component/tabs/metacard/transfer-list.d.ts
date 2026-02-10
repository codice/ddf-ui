import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
export declare const useCustomReadOnlyCheck: () => {
    loading: boolean;
    isWritable: ({ attribute, lazyResult, }: {
        attribute: string;
        lazyResult: LazyQueryResult;
    }) => boolean;
};
declare const TransferList: ({ startingLeft, requiredAttributes, startingRight, startingHideEmpty, lazyResult, onSave, }: {
    startingLeft: string[];
    requiredAttributes?: string[];
    startingRight: string[];
    startingHideEmpty?: boolean;
    lazyResult?: LazyQueryResult;
    onSave: (arg: string[], hideEmpty: boolean | undefined) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default TransferList;
