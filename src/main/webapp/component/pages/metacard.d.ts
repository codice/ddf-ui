/// <reference types="react" />
/// <reference types="backbone" />
import { FilterBuilderClass } from '../filter-builder/filter.structure';
type UploadType = Backbone.Model<{
    uploads: Backbone.Model<{
        id: string;
        children: string[];
    }>[];
}>;
export declare const getFilterTreeForUpload: ({ upload, }: {
    upload: UploadType;
}) => FilterBuilderClass;
declare const _default: () => JSX.Element;
export default _default;
