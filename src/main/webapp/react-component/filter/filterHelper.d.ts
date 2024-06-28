export type Attribute = {
    label: string;
    value: string;
    description: string | undefined;
    group?: string;
};
export declare const getGroupedFilteredAttributes: () => {
    groups: string[];
    attributes: Attribute[];
};
export declare const getFilteredAttributeList: (group?: string) => Attribute[];
export declare const getAttributeType: (attribute: string) => string;
