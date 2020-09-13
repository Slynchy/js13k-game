import {LevelFormat} from "./Interfaces";
import {TestLevel} from "../Levels/TestLevel";
import {TestLevel2} from "../Levels/TestLevel2";
import {TestLevel3} from "../Levels/TestLevel3";
import {TestLevel4} from "../Levels/TestLevel4";
import {TestLevel5} from "../Levels/TestLevel5";

export default class LevelOrder {
    private static levelOrder: LevelFormat[] = [
        TestLevel2,
        TestLevel,
        TestLevel3,
        TestLevel4,
        TestLevel5
    ];
    public static currentLevel: number = -1;
    public static getNextLevel(): LevelFormat {
        this.currentLevel++;
        if(this.currentLevel >= this.levelOrder.length) {
            return null;
        }
        return LevelOrder.levelOrder[this.currentLevel];
    }
}

// export const LevelOrder: LevelFormat[] =
