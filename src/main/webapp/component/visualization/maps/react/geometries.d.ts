import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    selectionInterface: any;
    map: any;
    isClustering: boolean;
};
export type ClusterType = {
    results: LazyQueryResult[];
    id: string;
};
declare const Geometries: (props: Props) => import("react/jsx-runtime").JSX.Element;
export default Geometries;
