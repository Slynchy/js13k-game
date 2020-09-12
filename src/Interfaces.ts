import {GridTypes} from "./Enums";
import {Button} from "kontra/kontra";
import Text from "./Text";
import {Game} from "./Game";

export type IGrid = Array<Array<{button: Button, text: Text, type: GridTypes}>>;

export type GameState = LevelFormat & {
    variables: {
        SCORE: number;
        CURR_UPS: number;
    }
};

export interface LevelFormat {
    levelId: string;
    width: number;
    height: number;
    targetScore: number;
    upAllowance: number;
    dialogue?: Array<{
        text: string;
        face: string; // key
    }>;
    goals: GridTypes[][]; // length equal to height
    contents: LevelContents;
}

export function createBlankLevel(): LevelFormat {
    const goals: GridTypes[][] = [];
    const grid: GridTypes[][] = [];

    for(let y: number = 0; y < Game.maxHeight; y++) {
        goals.push([
            GridTypes.TYPE1,
            GridTypes.TYPE1
        ]);
        grid.push([]);
        for(let x: number = 0; x < Game.maxWidth; x++) {
            grid[y].push(GridTypes.EMPTY);
        }
    }

    return {
        levelId: "X",
        width: Game.maxWidth,
        height: Game.maxHeight,
        targetScore: 10,
        upAllowance: Game.maxHeight,
        goals,
        contents: {
            grid
        }
    };
}

export interface LevelContents {
    grid: GridTypes[][];
}
