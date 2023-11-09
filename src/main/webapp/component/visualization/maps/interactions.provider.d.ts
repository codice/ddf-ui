import React from 'react';
import Cesium from 'cesium/Build/Cesium/Cesium';
import Backbone from 'backbone';
export type Translation = {
    longitude: number;
    latitude: number;
};
export type InteractionsContextType = {
    interactiveGeo: number | null;
    setInteractiveGeo: (interactiveGeo: number | null) => void;
    interactiveModels: Backbone.Model[];
    setInteractiveModels: (models: Backbone.Model[]) => void;
    moveFrom: Cesium.Cartographic | null;
    setMoveFrom: (moveFrom: Cesium.Cartographic | null) => void;
    translation: Translation | null;
    setTranslation: (translation: Translation | null) => void;
};
export declare const InteractionsContext: React.Context<InteractionsContextType>;
export declare function InteractionsProvider({ children }: any): JSX.Element;
