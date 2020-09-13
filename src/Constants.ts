import Engine from "./Engine";

export const mAnchor: {x: number, y: number} = {x: 0.5, y: 0.5};
export const LEVEL_EDIT_MODE: boolean = false;
export const DEBUG_MODE: boolean = false;
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
    "./a/b.png",
    "./a/b_y.png",
    "./a/sb.png"
];
