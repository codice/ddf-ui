/// <reference types="react" />
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    selectionInterface: any;
    map: any;
    isClustering: boolean;
    zoomToHome: (props: {
        map: any;
    }) => void;
};
export type ClusterType = {
    results: LazyQueryResult[];
    id: string;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
