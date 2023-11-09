export type Entry = {
    value: string;
    access: Access;
};
export declare enum Access {
    None = 0,
    Read = 1,
    Write = 2,
    Share = 3
}
export declare class Restrictions {
    owner: string;
    accessGroups: string[];
    accessGroupsRead: string[];
    accessIndividuals: string[];
    accessIndividualsRead: string[];
    accessAdministrators: string[];
    static readonly GroupsRead = "security.access-groups-read";
    static readonly GroupsWrite = "security.access-groups";
    static readonly IndividualsRead = "security.access-individuals-read";
    static readonly IndividualsWrite = "security.access-individuals";
    static readonly AccessAdministrators = "security.access-administrators";
    static from(obj: any): Restrictions;
}
export declare class Security {
    private readonly res;
    constructor(res: Restrictions);
    private canAccess;
    canRead(user: any): boolean;
    canWrite(user: any): boolean;
    canShare(user: any): boolean;
    isShared(): boolean;
    private getGroupAccess;
    private getIndividualAccess;
    private getAccess;
    getGroups(forceIncludeGroups: string[]): Entry[];
    getIndividuals(): Entry[];
    private static compareFn;
}
