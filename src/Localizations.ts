
export enum Languages {
    // ENGLISH = "en",
    JAPANESE = "ja"
}

// tslint:disable-next-line
let currentLanguage: Languages = Languages.JAPANESE;

export function currLang(): Languages {
    return currentLanguage;
}

export const Localizations: Record<string, Record<Languages, string>> = {
    TEST: {
        // [Languages.ENGLISH]: "Test",
        [Languages.JAPANESE]: "テスト"
    },
    ChatBot_LevelEnd: {
        // [Languages.ENGLISH]: "You did\nit!!\nClick here\nto proceed\nto the\nnext level!",
        [Languages.JAPANESE]: "できたよ！\n\nこの緑の\nボタンを\nくりっくし\nたら進む！\n:)",
    },
    ThanksForPlaying: {
        // [Languages.ENGLISH]: "Thanks for playing!\n\nTotal score: ",
        [Languages.JAPANESE]: "プレイしたので\nありがとうございました!\n\n全額のスコア: "
    }
};
