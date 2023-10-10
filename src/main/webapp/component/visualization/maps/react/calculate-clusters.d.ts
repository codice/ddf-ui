import * as React from 'react';
import { ClusterType } from './geometries';
import { LazyResultsType } from '../../../selection-interface/hooks';
type Props = {
    isClustering: boolean;
    map: any;
    setClusters: React.Dispatch<React.SetStateAction<ClusterType[]>>;
    lazyResults: LazyResultsType;
};
declare const _default: ({ map, setClusters, isClustering, lazyResults, }: Props) => JSX.Element;
export default _default;
