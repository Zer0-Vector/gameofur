/*
SpaceId format: s1c2 (space on row 1, column 2)
row 1 is top, column 1 is left
min row/column = 1

spaces = max/cuts | coords: [[TOP,LEFT],...]
{
    "spaces": {
        "bottomRight": [8,3],
        "cuts": [
            [5,1], [6,1], [5,3], [6,3]
        ]
    },
    "styles": {
        "default": {

        },
        "others": [
            {
                "space": [1,1], 
                "face": "rosette",
                "bg": "p1",

            },
            {
                "coords": [2,1],
                "face": "twelvedots",
            }
        ],
    },
    "paths": [
        [ [4,1], [3,1], [2,1], [1,1], [1,2], [2,2], [3,2], [4,2], [5, 2], [6,2], [7,2], [8,2], [8,1], [7,1] ],
        [ [4,3], [3,3], [2,3], [1,3], [1,2], [2,2], [3,2], [4,2], [5, 2], [6,2], [7,2], [8,2], [8,3], [7,3] ]
    ]
}
*/

type Coord = [number, number];
type AdditiveContstructionBoard = Coord[];

interface SubtractiveContstructionBoard {
    bottomRight:Coord;
    cuts:Coord[];
}

type SpacesDescriptor = SubtractiveContstructionBoard | AdditiveContstructionBoard;

type PathDescriptor = Coord[];

interface StyleDescriptor {
    face?:string; // these are provided by another URI
    bg?:string; // also provided by another URI
}

interface RowDescriptor {
    row: number;
    cols?: number[];
}

interface ColumnDescriptor {
    col: number;
    rows?: number[];
}

type LocationDescriptor = RowDescriptor | ColumnDescriptor | {space:Coord};

interface SpaceStyleDescriptor extends StyleDescriptor {
    locations: LocationDescriptor[];
}

interface StylesDescriptor {
    default:StyleDescriptor;
    others:SpaceStyleDescriptor[];
}

interface BoardDescriptor {
    spaces:SpacesDescriptor;
    styles:StylesDescriptor;
    paths:[PathDescriptor, PathDescriptor];
}

function parseBoardDescriptor(json:string): BoardDescriptor {
    return JSON.parse(json);
}


