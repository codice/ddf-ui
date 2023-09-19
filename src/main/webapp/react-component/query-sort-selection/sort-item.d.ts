/// <reference types="react" />
import { SortItemType, Option } from './sort-selections';
type Props = {
    sortItem: SortItemType;
    attributeOptions: Option[];
    directionOptions: Option[];
    updateAttribute: (attribute: string) => void;
    updateDirection: (direction: string) => void;
    onRemove: () => void;
    showRemove?: boolean;
};
declare const SortItem: ({ sortItem, attributeOptions, directionOptions, updateAttribute, updateDirection, onRemove, showRemove, }: Props) => JSX.Element;
export default SortItem;
