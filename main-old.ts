import Engine from "./src/Engine";
import {Button, GameObject, Grid} from "kontra/kontra";
import {TestLevel} from "./src/TestLevel";
import {GridTypes} from "./src/Enums";
import Text from "./src/Text";
import {LevelFormat} from "./src/Interfaces";

let isHandlingInput: boolean = false;
const LEVEL_EDIT_MODE: boolean = false;
const engine: Engine = new Engine();
const mp: {x: number, y: number} = {x: 480 / 2, y: 272 / 2}; // midpoint
const textOffset: {x: number, y: number} = {x: 160, y: 39};
const types: string[] = [
    "何", // -1
    "Ｘ", // 0
    "火", // 1
    "水",
    "土",
    "空",
    "上"
];

const GAME_STATE: LevelFormat = Object.assign({}, TestLevel);
console.log(GAME_STATE.contents.grid);

interface YOffsets {
    [key: string /*N,N*/]: number;
}

const YOFFSETS: YOffsets = {};

// @ts-ignore
window._engine = engine;

const urls: string[] = [
    "./assets/button.png"
];
engine.loader.add(urls);
engine.loader.load().then((obj: {[key: string]: HTMLImageElement}) => {
    const buttons: GameObject[] = [];
    const buttonsAsGrid: Button[][] = [];
    for(let y: number = 0; y < TestLevel.height; y++) {
        buttonsAsGrid.push([]);
        for(let x: number = 0; x < TestLevel.width; x++) {
            const go: GameObject = GameObject({
                anchor: {x: 0.5, y: 0.5},
                width: 16,
                height: 16
            });
            const button: Button = Button({
                anchor: {x: 0.5, y: 0.5},

                image: obj[urls[0]],

                isUp: false,
                isAnimating: false,
                rowOffset: 0,
                row: y,
                column: x,

                width: 16,
                height: 16,

                type: TestLevel.contents.grid[y][x] as GridTypes,

                // text: {
                //     text: types[(TestLevel.contents.grid[y][x] + 1)],
                //     color: "white",
                //     font: "14px MS Gothic",
                //     anchor: {x: 0.45, y: 0.45}
                // },

                // pointer events
                onDown(): void {
                    if(this.isAnimating || this.isHandlingInput) return;
                    // console.log("DOWN");
                },
                onUp(): void {
                    if(this.isAnimating || this.isHandlingInput) return;

                    // console.log("UP, isUp?: " + this.isUp);
                    isHandlingInput = true;

                    this.isUp = !this.isUp;
                    const yOffset: number = getNumberOfUpsBelow(
                        this.column, this.row, buttonsAsGrid, false, !this.isUp
                    );
                    YOFFSETS[`${x},${y}`] = Number(this.isUp);
                    updateGameState(this.column, this.row, this.isUp, buttonsAsGrid);
                    console.log(GAME_STATE.contents.grid);
                    updateGridColors(buttonsAsGrid);
                    updateGameViewToReflectGameState(buttonsAsGrid);
                    // moveFrom(this.column, this.row + yOffset, buttonsAsGrid, yOffset, this.isUp);

                    if(LEVEL_EDIT_MODE) {
                        this.type += 1;
                        if(this.type >= GridTypes.LENGTH) {
                            this.type = GridTypes.WILDCARD;
                        }
                        this._updateText();
                    }
                },
                _updateText(): void {
                    this.text = types[this.type + 1];
                }
            });
            go.addChild(button);
            buttonsAsGrid[y].push(button);
            buttons.push(go);
            const text: Text = new Text({
                x: textOffset.x + 20 * x,
                y: textOffset.y + 20 * y,
                text: types[(TestLevel.contents.grid[y][x] + 1)],
                color: "white",
                font: "14px MS Gothic",
                anchor: {x: 0.45, y: 0.45}
            });
            if(button.type === GridTypes.EMPTY) text.color = "#FFFFFF00";
            button._text = text;
            // go.addChild(text);
            engine.scene.push(text);
        }
    }

    const grid: Grid = Grid({
        x: mp.x,
        y: mp.y * 2 - 5,
        anchor: {x: 0.5, y: 1.0},
        numCols: TestLevel.width,
        numRows: TestLevel.height,
        flow: "grid",
        rowGap: 4,
        colGap: 4,

        children: buttons
    });
    engine.scene.push(grid);

    const goals: Text[] = [];
    for(let i: number = 0; i < TestLevel.contents.goals.length; i++) {
        for(let g: number = 0; g < TestLevel.contents.goals[i].length; g++) {
            const txt: Text = new Text({
                x: 125 + (-25 * g),
                y: (30) + (20 * i),
                text: types[(TestLevel.contents.goals[i][g] + 1)],
                color: "white",
                font: "17px MS Gothic",
                anchor: {x: 1, y: 0}
            });
            goals.push(txt);
            engine.scene.push(txt);
        }
    }

    updateGridColors(buttonsAsGrid);
    engine.start();
});

function getYOffset(x: number, y: number): number {
    let offset: number = 0;
    for(let i: number = y; i < TestLevel.height; i++) {
        offset += (YOFFSETS[`${x},${i}`] || 0);
    }
    return offset;
}

function updateGameViewToReflectGameState(buttons: Button[][]): void {
    for(let y: number = 0; y < buttons.length; y++) {
        // tslint:disable-next-line:prefer-for-of
        for(let x: number = 0; x < buttons[y].length; x++) {
            const curr: Button = buttons[y][x];
            const text: Text = curr._text;
            text.y = textOffset.y + (20 * (y + (curr.rowOffset * -1)));
            console.warn(curr.rowOffset);
        }
    }
}

function pickRandElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// @ts-ignore
// tslint:disable-next-line
function easeOutQuad (t, b, c, d) { // t = time, b = beginning value, c = change in value, d = duration
    return -c * (t /= d) * (t - 2) + b;
}

// function moveFrom(x: number, y: number, buttons: Button[][], yOffset: number, moveUp?: boolean): void {
//     // tslint:disable-next-line:prefer-for-of
//     for(
//         let i: number = 0;
//         i <= y;
//         i++
//     ) {
//         const offset: number = moveUp ? -20 : 20;
//         const butt: Button = buttons[i][x] as Button;
//         const curr: Button = buttons[i][x]._text as Button;
//         let intervalId: number = -0;
//         const startYPos: number = curr.y;
//         const startTimeMS: number = Date.now();
//         butt.isAnimating = true;
//         intervalId = setInterval(function(): void {
//             if(Date.now() - startTimeMS >= 600) {
//                 clearInterval(intervalId);
//                 curr.y = startYPos + offset;
//                 butt.isAnimating = false;
//                 // if(butt.column === x && butt.row === y + yOffset) {
//                 //     butt.isUp = !moveUp;
//                 // }
//                 isHandlingInput = false;
//             }
//             curr.y = easeOutQuad(
//                 // t = time, b = beginning value, c = change in value, d = duration
//                 Date.now() - startTimeMS,
//                 startYPos,
//                 offset,
//                 600
//             );
//         }, 1) as unknown as number;
//     }
// }

function getNumberOfUpsBelow(
    x: number,
    y: number,
    buttonsAsGrid: Button[][],
    excludeSelf?: boolean,
    invert?: boolean
): number {
    let count: number = 0;
    if(invert) {
        for(
            let i: number = y-Number(!excludeSelf);
            i >= 0;
            i--
        ) {
            const curr: Button = buttonsAsGrid[i][x];
            if(curr.isUp) count++;
        }
    } else {
        for(
            let i: number = y+Number(!excludeSelf);
            i < TestLevel.height;
            i++
        ) {
            const curr: Button = buttonsAsGrid[i][x];
            if(curr.isUp) count++;
        }
    }
    return count;
}

function updateGridColors(buttons: Button[][]): void {
    for(let y: number = 0; y < buttons.length; y++) {
        // tslint:disable-next-line:prefer-for-of
        for(let x: number = 0; x < buttons[y].length; x++) {
            if(buttons[y][x].type === GridTypes.EMPTY) continue;
            const yOffset: number = getNumberOfUpsBelow(x, y + (buttons[y][x].isUp ? -1 : 0), buttons, true);
                // YOFFSETS[`${x},${y}`] || 0;
            if(y - yOffset <= -1) {
                console.warn("illegal position");
            }
            const goals: number[] = TestLevel.contents.goals[y - yOffset];
            if(goals.indexOf(buttons[y][x].type) !== -1) {
                buttons[y][x]._text.color = "#00FF00";
            } else {
                buttons[y][x]._text.color = "#FF0000";
            }
        }
    }
}

function updateGameState(_x: number, _y: number, _goingUp: boolean, buttons: Button[][]): void {
    if(_goingUp) {
        for(let y: number = 0; y < _y; y++) {
            GAME_STATE.contents.grid[y][_x] = GAME_STATE.contents.grid[y+1][_x];
            buttons[y][_x].rowOffset += 1;
        }
        GAME_STATE.contents.grid[_y][_x] = GridTypes.UP;
        buttons[_y][_x].rowOffset += 1;
    } else {
        for(let y: number = _y; y > 0; y--) {
            GAME_STATE.contents.grid[y][_x] = GAME_STATE.contents.grid[y-1][_x];
            buttons[y][_x].rowOffset -= 1;
        }
        GAME_STATE.contents.grid[0][_x] = GridTypes.EMPTY;
        buttons[0][_x].rowOffset -= 1;
    }
}
