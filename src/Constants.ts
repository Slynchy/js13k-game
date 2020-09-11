import Engine from "./Engine";

export const LEVEL_EDIT_MODE: boolean = false;
export const DEBUG_MODE: boolean = true;
export const MP: {x: number, y: number} = {x: Engine.width / 2, y: Engine.height / 2}; // midpoint
export const TYPE_OFFSET: number = 1;
export const TYPES: string[] = [
    "何", // -1
    "Ｘ", // 0
    "火", // 1
    "水",
    "地",
    "風",
    "🡹",
    "  "
];
export const URLS: string[] = [
    "./assets/button.png",
    "./assets/button_y.png",
    "./assets/speechbubble.png"
];
