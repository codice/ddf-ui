/// <reference types="react" />
import { CesiumStateType } from '../../../golden-layout/golden-layout.types';
export declare const CesiumMapViewReact: ({ selectionInterface, setMap: outerSetMap, componentState, }: {
    setMap?: ((map: any) => void) | undefined;
    selectionInterface: any;
    componentState: CesiumStateType;
}) => JSX.Element | null;
