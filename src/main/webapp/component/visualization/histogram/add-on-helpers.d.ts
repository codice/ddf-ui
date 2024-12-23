import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
export type CustomHover = {
    text: string;
    bgColor: string;
    fontColor: string;
};
export declare const getCustomHover: (results: LazyQueryResult[], defaultHoverlabel: {
    bgcolor: string;
    font: {
        color: string;
    };
}) => CustomHover;
export declare const getCustomHoverTemplates: (name: string, customHoverArray: CustomHover[]) => string[];
export declare const getCustomHoverLabels: (customHoverArray: CustomHover[]) => {
    bgcolor: string[];
    font: {
        color: string[];
    };
};
