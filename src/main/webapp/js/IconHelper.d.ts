import { LazyQueryResult } from './model/LazyQueryResult/LazyQueryResult';
declare const _default_1: {
    getClassByMetacardObject(metacard: LazyQueryResult['plain']): string;
    getUnicode(): string | {
        class: string;
        style: {
            code: string;
            font: string;
            size: string;
        };
    };
    getFont(): string | {
        class: string;
        style: {
            code: string;
            font: string;
            size: string;
        };
    };
    getSize(): string | {
        class: string;
        style: {
            code: string;
            font: string;
            size: string;
        };
    };
    getFullByMetacardObject(metacard: LazyQueryResult['plain']): {
        class: string;
        style: {
            code: string;
            font: string;
            size: string;
        };
    };
    getClassByName(name: string): string;
};
export default _default_1;
