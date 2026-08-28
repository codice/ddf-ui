declare function ddToWkt(dd: any): string | null | undefined;
declare function validateDdPoint(point: any): boolean;
declare function validateDd(dd: any): {
    valid: boolean;
    error: string | null;
};
export { ddToWkt, validateDd, validateDdPoint };
