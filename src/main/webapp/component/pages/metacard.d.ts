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
declare const MetacardRoute: () => import("react/jsx-runtime").JSX.Element;
export default MetacardRoute;
