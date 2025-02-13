import Cesium from 'cesium/Build/Cesium/Cesium';
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult';
import { ClusterType } from '../react/geometries';
export declare const LookingStraightDownOrientation: {
    heading: number;
    pitch: number;
    roll: number;
};
export default function CesiumMap(insertionElement: any, selectionInterface: any, _notificationEl: any, componentElement: any, mapModel: any, mapLayers: any): {
    onLeftClick(callback: any): void;
    onLeftClickMapAPI(callback: any): void;
    clearLeftClickMapAPI(): void;
    onRightClick(callback: any): void;
    clearRightClick(): void;
    onDoubleClick(): void;
    clearDoubleClick(): void;
    onMouseTrackingForGeoDrag({ moveFrom, down, move, up, }: {
        moveFrom?: any;
        down: any;
        move: any;
        up: any;
    }): void;
    clearMouseTrackingForGeoDrag(): void;
    onMouseTrackingForPopup(downCallback: any, moveCallback: any, upCallback: any): void;
    onMouseMove(callback: any): void;
    clearMouseMove(): void;
    timeoutIds: number[];
    onCameraMoveStart(callback: any): void;
    offCameraMoveStart(callback: any): void;
    onCameraMoveEnd(callback: any): void;
    offCameraMoveEnd(callback: any): void;
    doPanZoom(coords: any): void;
    panToResults(results: any): void;
    panToCoordinate(coords: any, duration?: number): void;
    panToExtent(): void;
    panToShapesExtent({ duration, }?: {
        duration?: number | undefined;
    }): boolean;
    getCenterPositionOfPrimitiveIds(primitiveIds: string[]): any;
    zoomToIds({ ids, duration, }: {
        ids: string[];
        duration?: number | undefined;
    }): void;
    panToRectangle(rectangle: any, opts?: {
        duration: number;
        correction: number;
    }): void;
    getShapes(): any;
    zoomToExtent(): void;
    zoomToBoundingBox({ north, south, east, west }: any): void;
    getBoundingBox(): {
        [x: string]: any;
    };
    overlayImage(model: LazyQueryResult): void;
    removeOverlay(metacardId: any): void;
    removeAllOverlays(): void;
    getCartographicCenterOfClusterInDegrees(cluster: ClusterType): any[];
    getWindowLocationsOfResults(results: LazyQueryResult[]): (any[] | undefined)[];
    addRulerPoint(coordinates: any): any;
    removeRulerPoint(billboardRef: any): void;
    addRulerLine(point: any): any;
    setRulerLine(point: any): void;
    removeRulerLine(polyline: any): void;
    addPointWithText(point: any, options: any): any;
    addPoint(point: any, options: any): any;
    addLabel(point: any, options: any): any;
    addLine(line: any, options: any): any;
    addPolygon(polygon: any, options: any): any[];
    updateCluster(geometry: any, options: any): void;
    updateGeometry(geometry: any, options: any): void;
    hideGeometry(geometry: any): void;
    showGeometry(geometry: any): void;
    removeGeometry(geometry: any): void;
    destroyShapes(): void;
    getMap(): any;
    zoomIn(): void;
    zoomOut(): void;
    destroy(): void;
};
