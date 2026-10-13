import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    result: LazyQueryResult;
};
export declare const Editor: ({ attr, lazyResult, onCancel, onSave, goBack, }: {
    attr: string;
    lazyResult: LazyQueryResult;
    onCancel?: () => void;
    onSave?: () => void;
    goBack?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
declare const Summary: ({ result: selection }: Props) => import("react/jsx-runtime").JSX.Element;
export default Summary;
