import Engine from "./src/Engine";
import {TestLevel} from "./src/TestLevel";
import {GridTypes} from "./src/Enums";
import {IGrid, LevelFormat} from "./src/Interfaces";
import {Button} from "kontra/kontra";
import Text from "./src/Text";

const LEVEL_EDIT_MODE: boolean = false;
const GRID: IGrid = [];
const DEBUG_MODE: boolean = true;
const ENGINE: Engine = new Engine();
if(DEBUG_MODE) {
    // @ts-ignore
    window._engine = ENGINE;
}
const MP: {x: number, y: number} = {x: ENGINE.width / 2, y: ENGINE.height / 2}; // midpoint
const TYPE_OFFSET: number = 1;
const TYPES: string[] = [
    "何", // -1
    "Ｘ", // 0
    "火", // 1
    "水",
    "土",
    "風",
    "🡹",
];
const GAME_STATE: LevelFormat = Object.assign({}, TestLevel);
if(DEBUG_MODE) console.log(GAME_STATE.contents.grid);

const urls: string[] = [
    "./assets/button.png"
];

async function main(): Promise<void> {
    ENGINE.loader.add(urls);
    const assets: Record<string, HTMLImageElement> = await ENGINE.loader.load();

    for(let y: number = 0; y < TestLevel.height; y++) {
        GRID.push([]);
        for(let x: number = 0; x < TestLevel.width; x++) {
            const yOffset: number = 40;
            const position: {x: number, y: number} = {
                x: (MP.x - ((20 * TestLevel.width) / 2)) + (20 * x),
                y: yOffset + (20 * y)
            };

            const button: Button = new Button({
                x: position.x,
                y: position.y,
                image: assets[urls[0]],
                anchor: {x: 0, y: 1},

                // customProps
                column: x,
                row: y,
                linkedButton: null,

                onUp(): void {

                    if(DEBUG_MODE) {
                        console.log(`Button @ ${this.column}, ${this.row}`);
                    }

                    if(
                        GAME_STATE.contents.grid[this.row][this.column] === GridTypes.EMPTY
                        // GAME_STATE.contents.grid[this.row][this.column] === GridTypes
                    ) {
                        if(DEBUG_MODE) {
                            console.warn("do nothing because empty");
                        }
                        return;
                    }

                    if(
                        GAME_STATE.contents.grid[0][this.column] !== GridTypes.EMPTY
                        && GAME_STATE.contents.grid[this.row][this.column] !== GridTypes.UP
                    ) {
                        if(DEBUG_MODE) {
                            console.warn("Cannot move this higher");
                        }
                        return;
                    }

                    updateGameState(
                        this.column,
                        this.row,
                        !(GAME_STATE.contents.grid[this.row][this.column] === GridTypes.UP)
                    );
                    updateGameViewToReflectGameState();
                    updateGridColors();

                    //
                    // // tslint:disable-next-line:no-conditional-assignment
                    // // this.y += ((this.isUp = !this.isUp) ? -20 : 20);
                    // // this.y = yOffset + ((--this.row) * 20);
                    //
                    // for(let i: number = this.row; i >= 0; i--) {
                    //     GRID[i][this.column].button.y += -20;
                    //     GRID[i][this.column].button.y = Math.round(GRID[i][this.column].button.y);
                    // }
                    // updateGridColors();
                }
            });
            const text: string = getText(x, y);
            const color: string = getColor(x, y);
            const textObj: Text = new Text({
                x: position.x,
                y: position.y,
                anchor: {x: -0.1, y: 1.1},
                // image: obj[urls[0]],
                width: 16,
                height: 16,

                // custom props
                column: x,
                row: y,
                type: TestLevel.contents.grid[y][x] as GridTypes,

                text,
                color,
                font: "14px MS Gothic"
            });
            GRID[y].push({
                button,
                text: textObj,
                type: TestLevel.contents.grid[y][x] as GridTypes
            });
            ENGINE.scene.push(textObj);
            ENGINE.scene.push(button);
        }
    }

    const goals: Text[] = [];
    for(let i: number = 0; i < TestLevel.contents.goals.length; i++) {
        for(let g: number = 0; g < TestLevel.contents.goals[i].length; g++) {
            const txt: Text = new Text({
                x: 135 + (-25 * g),
                y: (23) + (20 * i),
                text: TYPES[(TestLevel.contents.goals[i][g] + 1)],
                color: "white",
                font: "17px MS Gothic",
                anchor: {x: 1, y: 0}
            });
            goals.push(txt);
            ENGINE.scene.push(txt);
        }
    }

    updateGridColors();
    ENGINE.start();
}

function updateGameViewToReflectGameState(): void {
    for(let y: number = 0; y < GRID.length; y++) {
        // tslint:disable-next-line:prefer-for-of
        for(let x: number = 0; x < GRID[y].length; x++) {
            const curr: Text = GRID[y][x].text;
            const gameStateCurr: number = GAME_STATE.contents.grid[y][x];
            curr.text = getText(x, y);
        }
    }
}

function updateGridColors(): void {
    // tslint:disable-next-line:prefer-for-of
    for(let y: number = 0; y < GAME_STATE.contents.grid.length; y++) {
        // tslint:disable-next-line:prefer-for-of
        for(let x: number = 0; x < GAME_STATE.contents.grid[y].length; x++) {
            // if(GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY) ;
            const goals: number[] = TestLevel.contents.goals[y];
            if(goals.indexOf(GAME_STATE.contents.grid[y][x]) !== -1) {
                GRID[y][x].text.color = "#00FF00";
            } else if(GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY) {
                GRID[y][x].text.color = "#FFFFFF00";
            } else {
                GRID[y][x].text.color = "#FF0000";
            }
        }
    }
}

function updateGameState(_x: number, _y: number, _goingUp: boolean): void {
    if(_goingUp) {
        for(let y: number = 0; y < _y; y++) {
            GAME_STATE.contents.grid[y][_x] = GAME_STATE.contents.grid[y+1][_x];
        }
        GAME_STATE.contents.grid[_y][_x] = GridTypes.UP;
    } else {
        for(let y: number = _y; y > 0; y--) {
            GAME_STATE.contents.grid[y][_x] = GAME_STATE.contents.grid[y-1][_x];
        }
        GAME_STATE.contents.grid[0][_x] = GridTypes.EMPTY;
    }

    if(DEBUG_MODE) {
        console.log(GAME_STATE.contents.grid);
    }
}

function getText(x: number, y: number): string {
    return GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY ?
        TYPES[(GridTypes.EMPTY+1)]
        :
        TYPES[(GAME_STATE.contents.grid[y][x] + TYPE_OFFSET)];
}

function getColor(x: number, y: number): string {
    return GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY ?
        "#FFFFFF00"
        :
        "#FFFFFFFF";
}

main();
