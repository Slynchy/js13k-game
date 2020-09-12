import {LevelFormat} from "../src/Interfaces";

export const TestLevel2: LevelFormat = {
    levelId: "1",
    width: 7,
    height: 11,
    targetScore: 15,
    dialogue: [
        {text: "こんにちは\n\nこれは私の\n世界です\n\nよろしく。", face: "NORMAL"},
        // {text: "これは、\n\n私を作った\nゲームです", face: "LOOK_LEFT"},
        // {text: "でも…", face: "NORMAL"},
        // {text: "誰も\n\nい・な・い\n\nです！", face: "UPSET"},
        // {text: "もし\nよかったら\n\n手伝いくれ\nませんか？", face: "SAD"},
        // {text: "ありがとう\nございます\n!!!!!!!!", face: "HAPPY"},
        // // {text: "Firstly,\nthis game\nis about\ncollecting\npoints.", face: "NORMAL"},
        // {text: "主に、\nこのゲーム\nの目標は\nポイントを\n積もる。", face: "NORMAL"},
        // // {text: "You gain\npoints by\nclicking on\noccupied\ntiles.", face: "NORMAL"},
        // {text: "ポイントの\n積もるには\n\n塞がる\nタイルを\nクリックし\nたら…", face: "NORMAL"},
        // {text: "…上に\n行くよ！", face: "NORMAL"},
        // {text: "左の漢字は\n同じなら\nポイントを\n受け取る。", face: "NORMAL"},
        // {text: "…そして、\nそのタイル\n\n緑になる。", face: "NORMAL"},
        // {text: "黄色の\nタイルを\nクリックし\nたら、\n\n外すよ！", face: "NORMAL"},
        // {text: "右上に\nスコアの\n目標にある\n\n(^_^)", face: "NORMAL"},
        // {text: "がんばって\nね～！", face: "HAPPY"}
    ],
    upAllowance: 8,
    contents: {
        grid: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [2, 0, 0, 0, 1, 0, 0],
            [2, 0, 0, 0, 3, 3, 2],
            [4, 2, 0, 0, 2, 2, 2],
            [4, 2, 3, 0, 2, 2, 3],
            [1, 4, 2, 0, 1, 1, 1],
            [4, 1, 1, 1, 4, 3, 4]
        ]
    },
    goals: [
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [2, 0],
        [0, 0],
        [1, 0],
        [0, 0]
    ]
};
