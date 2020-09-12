import {LevelFormat} from "./Interfaces";
import {TestLevel} from "../Levels/TestLevel";
import {TestLevel2} from "../Levels/TestLevel2";

export default class LevelOrder {
    private static levelOrder: LevelFormat[] = [
        TestLevel2,
        TestLevel,
    ];
    public static currentLevel: number = -1;
    public static getNextLevel(): LevelFormat {
        return LevelOrder.levelOrder[++this.currentLevel];
    }
}

// export const LevelOrder: LevelFormat[] =
