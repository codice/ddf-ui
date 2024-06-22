import { Subscribable } from '../Base/base-classes';
import { StartupData } from './startup';
import { AttributeDefinitionType, AttributeMapType, MetacardDefinitionType, MetacardDefinitionsType, SearchResultMetacardDefinitionType, StartupPayloadType } from './startup.types';
declare class MetacardDefinitions extends Subscribable<{
    thing: 'metacard-definitions-update';
}> {
    attributeMap?: StartupPayloadType['attributeMap'];
    sortedAttributes?: StartupPayloadType['sortedAttributes'];
    metacardTypes?: StartupPayloadType['metacardTypes'];
    constructor(startupData?: StartupData);
    addDynamicallyFoundMetacardDefinitionsFromSearchResults: (definitions: SearchResultMetacardDefinitionType) => void;
    addDynamicallyFoundMetacardDefinitions: (definitions: MetacardDefinitionsType) => void;
    addUnknownMetacardType: ({ name, definition, }: {
        name: string;
        definition: MetacardDefinitionType;
    }) => void;
    addUnknownAttributes: (definition: MetacardDefinitionType) => void;
    addUnknownAttribute: ({ attributeDefinition, attributeName, }: {
        attributeName: string;
        attributeDefinition: AttributeDefinitionType;
    }) => void;
    isUnknownAttribute: (attributeName: string) => boolean;
    isUnknownMetacardType: (metacardType: string) => boolean;
    resortKnownMetacardAttributes: () => void;
    isHiddenAttribute: (id: string) => boolean;
    getMetacardDefinition: (metacardTypeName: string) => AttributeMapType;
    getAlias: (attributeName: string) => string;
    getType: (attributeName: string) => import("./startup.types").AttributeTypes;
    isMulti: (attributeName: string) => boolean;
    getEnum: (attributeName: string) => string[];
    getSearchOnlyAttributes: () => string[];
    getSortedAttributes: () => import("./startup.types").SortedAttributesType;
    getAttributeMap: () => AttributeMapType;
    getAttributeDefinition: (id: string) => AttributeDefinitionType | undefined;
}
export { MetacardDefinitions };
