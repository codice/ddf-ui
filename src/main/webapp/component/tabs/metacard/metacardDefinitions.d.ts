/**
 * types for metacard defs
 */
type Attributetypes = 'BINARY' | 'DATE' | 'LOCATION' | 'GEOMETRY' | 'LONG' | 'DOUBLE' | 'FLOAT' | 'INTEGER' | 'SHORT' | 'STRING' | 'BOOLEAN' | 'XML';
export declare const TypedMetacardDefs: {
    /**
     * We exclude thumbnail because although it is a type of attribute (BINARY) we don't usually support viewing in the UI, we handle it
     */
    isHiddenTypeExceptThumbnail({ attr }: {
        attr: string;
    }): boolean;
    isHidden({ attr }: {
        attr: string;
    }): boolean;
    getAllKnownAttributes: () => string[];
    getSearchOnlyAttributes: () => string[];
    getSortedMetacardTypes: () => {
        alias?: string;
        hidden: boolean;
        id: string;
        isInjected: boolean;
        multivalued: boolean;
        readOnly: boolean;
        type: 'BOOLEAN' | 'DATE' | 'LOCATION' | 'STRING' | 'BINARY' | 'INTEGER' | 'FLOAT' | 'GEOMETRY' | 'LONG' | 'SHORT' | 'XML' | 'DOUBLE';
    }[];
    getType({ attr }: {
        attr: string;
    }): Attributetypes;
    getAlias({ attr }: {
        attr: string;
    }): string;
    isMulti({ attr }: {
        attr: string;
    }): boolean;
    isReadonly({ attr }: {
        attr: string;
    }): boolean;
    getImageSrc({ val }: {
        val: string;
    }): string;
    getDefinition({ type }: {
        type: string;
    }): {
        [key: string]: {
            alias: undefined | string;
            hidden: boolean;
            id: string;
            isInjected: boolean;
            multivalued: boolean;
            readOnly: boolean;
            type: Attributetypes;
        };
    };
    getEnum({ attr }: {
        attr: string;
    }): string[] | undefined;
    getDeprecatedEnum({ attr }: {
        attr: string;
    }): string[] | undefined;
    typesFetched(): boolean;
    addMetacardDefinition(name: string, definition: {
        [key: string]: {
            id: string;
            type: Attributetypes;
        };
    }): boolean;
    addMetacardDefinitions(definitions: {
        [key: string]: {
            [key: string]: {
                id: string;
                type: Attributetypes;
            };
        };
    }): void;
};
declare const _default: {
    /**
     * We exclude thumbnail because although it is a type of attribute (BINARY) we don't usually support viewing in the UI, we handle it
     */
    isHiddenTypeExceptThumbnail({ attr }: {
        attr: string;
    }): boolean;
    isHidden({ attr }: {
        attr: string;
    }): boolean;
    getAllKnownAttributes: () => string[];
    getSearchOnlyAttributes: () => string[];
    getSortedMetacardTypes: () => {
        alias?: string | undefined;
        hidden: boolean;
        id: string;
        isInjected: boolean;
        multivalued: boolean;
        readOnly: boolean;
        type: "XML" | "STRING" | "DATE" | "INTEGER" | "DOUBLE" | "BINARY" | "GEOMETRY" | "LONG" | "BOOLEAN" | "LOCATION" | "FLOAT" | "SHORT";
    }[];
    getType({ attr }: {
        attr: string;
    }): Attributetypes;
    getAlias({ attr }: {
        attr: string;
    }): string;
    isMulti({ attr }: {
        attr: string;
    }): boolean;
    isReadonly({ attr }: {
        attr: string;
    }): boolean;
    getImageSrc({ val }: {
        val: string;
    }): string;
    getDefinition({ type }: {
        type: string;
    }): {
        [key: string]: {
            alias: string | undefined;
            hidden: boolean;
            id: string;
            isInjected: boolean;
            multivalued: boolean;
            readOnly: boolean;
            type: Attributetypes;
        };
    };
    getEnum({ attr }: {
        attr: string;
    }): string[] | undefined;
    getDeprecatedEnum({ attr }: {
        attr: string;
    }): string[] | undefined;
    typesFetched(): boolean;
    addMetacardDefinition(name: string, definition: {
        [key: string]: {
            id: string;
            type: Attributetypes;
        };
    }): boolean;
    addMetacardDefinitions(definitions: {
        [key: string]: {
            [key: string]: {
                id: string;
                type: Attributetypes;
            };
        };
    }): void;
};
export default _default;
