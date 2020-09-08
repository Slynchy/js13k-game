import {GridTypes} from "./Enums";
import {Button, Grid} from "kontra/kontra";
import Text from "./Text";

export type IGrid = Array<Array<{button: Button, text: Text, type: GridTypes}>>;

export interface LevelFormat {
    width: number;
    height: number;
    contents: LevelContents;
}

export interface LevelContents {
    grid: GridTypes[][];
    goals: GridTypes[][]; // length equal to height
}
