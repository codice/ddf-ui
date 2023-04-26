export type AuditItem = {
    id: String;
    'source-id'?: String;
};
export type AuditLog = {
    action: string;
    component: string;
    items: AuditItem[];
};
export declare const postAuditLog: ({ action, component, items }: AuditLog) => Promise<void>;
