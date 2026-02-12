export type AuditItem = {
    id: String;
    'source-id'?: String;
};
export type AuditLog = {
    action: string;
    component: string;
    items: AuditItem[];
};
export type SimpleAuditLog = {
    action: string;
    component: string;
};
export declare const postAuditLog: ({ action, component, items }: AuditLog) => Promise<void>;
export declare const postSimpleAuditLog: ({ action, component, }: SimpleAuditLog) => Promise<void>;
