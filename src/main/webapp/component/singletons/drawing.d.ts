import Backbone from 'backbone';
type DrawingType = Backbone.Model & {
    turnOnDrawing: (model: Backbone.Model) => void;
    turnOffDrawing: () => void;
    isFuzzyDrawing: () => boolean;
    isDrawing: () => boolean;
    getDrawModel: () => Backbone.Model;
};
export declare const Drawing: DrawingType;
export declare const useIsDrawing: () => boolean;
export {};
