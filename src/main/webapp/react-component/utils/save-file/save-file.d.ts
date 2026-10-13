import { Overridable } from '../../../js/model/Base/base-classes';
export default function saveFile(name: string, type: string, data: any): Promise<any>;
export declare function getFilenameFromContentDisposition(contentDisposition: string): string | null;
export declare const OverridableSaveFile: Overridable<typeof saveFile>;
