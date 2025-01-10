/// <reference types="react" />
import { Divider } from './metacard-interactions';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
export type MetacardInteractionProps = {
    model?: LazyQueryResult[];
    onClose: () => void;
};
export type Result = {
    get: (key: any) => any;
    isResource: () => boolean;
    isRevision: () => boolean;
    isDeleted: () => boolean;
    isRemote: () => boolean;
};
declare const _default: (props: MetacardInteractionProps) => JSX.Element;
export default _default;
export { Divider };
export { MetacardInteraction } from './metacard-interactions';
