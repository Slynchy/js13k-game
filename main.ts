import Engine from "./src/Engine";
import {LEVEL_EDIT_MODE, MP, URLS} from "./src/Constants";
import {MainMenu} from "./src/MainMenu";
import {Game} from "./src/Game";
import {createBlankLevel} from "./src/Interfaces";

async function main(): Promise<void> {
    const ENGINE: Engine = new Engine();
    ENGINE.add(URLS);
    await ENGINE.load();
    if(LEVEL_EDIT_MODE) {
        const GAME: Game = new Game(ENGINE, createBlankLevel(), false);
        GAME.start(true);
    } else {
        ENGINE.scene.push(new MainMenu(ENGINE, {
            x: MP.x,
            y: MP.y * 0.75
        }));
    }
    ENGINE.start();
}

main();
