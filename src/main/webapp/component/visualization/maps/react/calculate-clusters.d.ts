import * as React from 'react';
import { ClusterType } from './geometries';
import { LazyResultsType } from '../../../selection-interface/hooks';
type Props = {
    isClustering: boolean;
    map: any;
    setClusters: React.Dispatch<React.SetStateAction<ClusterType[]>>;
    lazyResults: LazyResultsType;
};
declare const CalculateClusters: ({ map, setClusters, isClustering, lazyResults, }: Props) => import("react/jsx-runtime").JSX.Element;
export default CalculateClusters;
