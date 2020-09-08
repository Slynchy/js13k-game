import Engine from "./src/Engine";
import {Button, Grid} from "kontra/kontra";

const LEVEL_EDIT_MODE: boolean = true;
const engine: Engine = new Engine();
const mp: {x: number, y: number} = {x: 480 / 2, y: 272 / 2}; // midpoint
const gridsize: {x: number, y: number} = {x: 9, y: 12}; // gridsize
const types: string[] = [
    "何", // -1
    "Ｘ", // 0
    "火", // 1
    "水",
    "土",
    "空"
];

enum GridTypes {
    WILDCARD = -1,
    EMPTY,
    TYPE1,
    TYPE2,
    TYPE3,
    TYPE4,
    LENGTH
}

// tslint:disable-next-line:no-any
const levelTemplate: any = {
    contents: [
        [
            {
                contents: []
            },
        ]
    ]
};

const urls: string[] = [
];
engine.loader.add(urls);
engine.loader.load().then((obj: {[key: string]: HTMLImageElement}) => {

    const buttons: Button[] = [];
    const buttonAsGrid: Button[][] = [];
    for(let x: number = 0; x < gridsize.x; x++) {
        buttonAsGrid.push([]);
        for(let y: number = 0; y < gridsize.y; y++) {
            const button: Button = Button({
                anchor: {x: 0.5, y: 0.5},

                type: GridTypes.EMPTY,

                // text properties
                text: {
                    text: types[1],
                    color: "white",
                    font: "17px Arial, sans-serif",
                    anchor: {x: 0.5, y: 0.5}
                },

                // pointer events
                onDown(): void {
                    console.log("DOWN!");
                },
                onUp(): void {
                    console.log("UP!");
                    this.type += 1;
                    if(this.type >= GridTypes.LENGTH) {
                        this.type = GridTypes.WILDCARD;
                    }
                    this._updateText();
                },
                _updateText(): void {
                    this.text = types[this.type + 1];
                }
            });
            buttonAsGrid[x].push(button);
            buttons.push(button);
        }
    }
    if(LEVEL_EDIT_MODE) { // @ts-ignore
        window.grid = buttonAsGrid;
    }

    const grid: Grid = Grid({
        x: mp.x,
        y: mp.y * 2,
        anchor: {x: 0.5, y: 1.0},
        numCols: gridsize.x,
        numRows: gridsize.y,
        flow: "grid",
        rowGap: 4,
        colGap: 4,

        children: buttons
    });

    engine.scene.push(grid);
    engine.start();
});

function pickRandElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

(window as unknown as {exportLevel: Function}).exportLevel = (): void => {
    const result: LevelFormat = {
        width: gridsize.x,
        height: gridsize.y,
        contents: {
            grid: [],
            goals: null
        }
    };
    result.contents.goals = [];
    for(let i: number = 0; i < gridsize.y; i++) {
        result.contents.goals.push([0]); // empty the goals for editing later
    }

    for(let x: number = 0; x < gridsize.x; x++) {
        result.contents.grid.push([]);
        for (let y: number = 0; y < gridsize.y; y++) {
            // @ts-ignore
            result.contents.grid[x].push(window.grid[x][y].type);
        }
    }

    console.log(result);
};
