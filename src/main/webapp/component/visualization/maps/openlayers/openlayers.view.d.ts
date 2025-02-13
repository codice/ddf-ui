/// <reference types="react" />
import { OpenlayersStateType } from '../../../golden-layout/golden-layout.types';
export declare const OpenlayersMapViewReact: ({ selectionInterface, setMap: outerSetMap, componentState, }: {
    selectionInterface: any;
    setMap?: ((map: any) => void) | undefined;
    componentState: OpenlayersStateType;
}) => JSX.Element | null;
