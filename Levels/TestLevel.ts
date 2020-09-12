import {LevelFormat} from "../src/Interfaces";

export const TestLevel: LevelFormat = {
    levelId: "2",
    width: 9,
    height: 12,
    targetScore: 30,
    upAllowance: 11,
    dialogue: [
        {text: "次の\nレベルは、\nちょっと\n難しいと\n思うけど…", face: "HAPPY"},
        {text: "でも、\n信じて\nいます!\n\n頑張ろう!", face: "HAPPY"}
    ],
    contents: {
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 4, 1, 0],
            [0, 0, 0, 0, 0, 0, 1, 4, 4],
            [1, 4, 0, 4, 4, 0, 1, 4, 2],
            [3, 4, 3, 4, 4, 4, 1, 4, 2],
            [2, 4, 3, 2, 2, 4, 2, 4, 3],
            [3, 4, 2, 2, 4, 3, 1, 3, 3],
            [1, 2, 1, 1, 3, 1, 1, 1, 1]
        ]
    },
    goals: [
        [1,4],
        [1,2],
        [2],
        [1,2],
        [4,2],
        [3],
        [3],
        [3],
        [4],
        [3,4],
        [1,3],
        [1,3]
    ]
};