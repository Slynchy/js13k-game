import {GridTypes} from "./Enums";
import {Button, Grid} from "kontra/kontra";
import Text from "./Text";

export type IGrid = Array<Array<{button: Button, text: Text, type: GridTypes}>>;

export type GameState = LevelFormat & {
    variables: {
        SCORE: number;
        CURR_UPS: number;
    }
};

export interface LevelFormat {
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

export interface LevelContents {
    grid: GridTypes[][];
}
