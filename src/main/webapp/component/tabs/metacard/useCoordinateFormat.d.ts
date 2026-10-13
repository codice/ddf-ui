/**
 * Provides a hook for converting wkts to the user's preferred
 * coordinate format
 */
declare const useCoordinateFormat: () => (value: string) => string;
export default useCoordinateFormat;
