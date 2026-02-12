import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult';
import { ClusterType } from './geometries';
type Props = {
    lazyResult: LazyQueryResult;
    map: any;
    clusters: ClusterType[];
};
declare const Geometry: ({ lazyResult, map, clusters }: Props) => null;
export default Geometry;
