export declare const dmsPoint: {
    latitude: {
        coordinate: string;
        direction: "N";
    };
    longitude: {
        coordinate: string;
        direction: "E";
    };
};
export declare const dmsModel: {
    shape: string;
    point: {
        latitude: {
            coordinate: string;
            direction: "N";
        };
        longitude: {
            coordinate: string;
            direction: "E";
        };
    };
    circle: {
        point: {
            latitude: {
                coordinate: string;
                direction: "N";
            };
            longitude: {
                coordinate: string;
                direction: "E";
            };
        };
        radius: string;
        units: string;
    };
    line: {
        list: never[];
    };
    polygon: {
        list: never[];
    };
    boundingbox: {
        north: {
            coordinate: string;
            direction: "N";
        };
        south: {
            coordinate: string;
            direction: "N";
        };
        east: {
            coordinate: string;
            direction: "E";
        };
        west: {
            coordinate: string;
            direction: "E";
        };
    };
};
