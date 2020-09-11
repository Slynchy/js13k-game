import {LevelFormat} from "./Interfaces";

export const TestLevel: LevelFormat = {
    width: 9,
    height: 12,
    targetScore: 30,
    upAllowance: 10,
    dialogue: [
        // {text: "こんにちは\n\nこれは私の\n世界です\n\nよろしく。", face: "NORMAL"},
        // {text: "これは、\n\n私を作った\nゲームです", face: "LOOK_LEFT"},
        // {text: "でも…", face: "NORMAL"},
        // {text: "誰も\n\nい・な・い\n\nです！", face: "UPSET"},
        // {text: "もし\nよかったら\n\n手伝いくれ\nませんか？", face: "SAD"},
        // {text: "ありがとう\nございます\n!!!!!!!!", face: "HAPPY"},
        // {text: "Firstly,\nthis game\nis about\ncollecting\npoints.", face: "NORMAL"},
        // {text: "You gain\npoints by\nclicking on\noccupied\ntiles.", face: "NORMAL"},
        // {text: "This moves\nthe tile\nup.", face: "NORMAL"},
        // {text: "If the\nsymbol on\nthe left\nmatches the\ntile...", face: "NORMAL"},
        // {text: "...Then\nit will\nturn green\nand give\na point.", face: "NORMAL"},
        // {text: "Simply\nclick a\nyellow\ntile to\nremove it\nagain.", face: "NORMAL"},
        // {text: "Your goal\nis to reach\nthe target\nscore,\non the\ntop-right.", face: "NORMAL"},
        {text: "Give it a\ntry!!!", face: "HAPPY"}
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
