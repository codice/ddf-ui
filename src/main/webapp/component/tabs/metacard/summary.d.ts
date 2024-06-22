/// <reference types="react" />
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    result: LazyQueryResult;
};
export declare const Editor: ({ attr, lazyResult, onCancel, onSave, goBack, }: {
    attr: string;
    lazyResult: LazyQueryResult;
    onCancel?: (() => void) | undefined;
    onSave?: (() => void) | undefined;
    goBack?: (() => void) | undefined;
}) => JSX.Element;
declare const _default: ({ result: selection }: Props) => JSX.Element;
export default _default;
