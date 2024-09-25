/// <reference types="react" />
type Direction = 'N' | 'S' | 'E' | 'W';
type Point = {
    latDirection: Direction;
    lonDirection: Direction;
    lat: string;
    lon: string;
};
declare const DmsTextfield: ({ point, setPoint, deletePoint, }: {
    point: Point;
    setPoint: (point: Point) => void;
    deletePoint: () => void;
}) => JSX.Element;
export default DmsTextfield;
