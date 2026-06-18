type UtmUpsPoint = {
    easting: number;
    northing: number;
    zoneNumber: number;
    hemisphere: 'Northern' | 'Southern';
};
declare const UtmupsTextfield: ({ point, setPoint, deletePoint, }: {
    point: UtmUpsPoint;
    setPoint: (point: UtmUpsPoint) => void;
    deletePoint: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default UtmupsTextfield;
