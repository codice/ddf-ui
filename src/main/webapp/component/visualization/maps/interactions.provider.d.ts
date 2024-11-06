import React from 'react';
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
    moveFrom: any;
    setMoveFrom: (moveFrom: any) => void;
    translation: Translation | null;
    setTranslation: (translation: Translation | null) => void;
};
export declare const InteractionsContext: React.Context<InteractionsContextType>;
export declare function InteractionsProvider({ children }: any): JSX.Element;
