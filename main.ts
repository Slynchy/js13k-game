import Engine from "./src/Engine";
import {URLS} from "./src/Constants";
import {Game} from "./src/Game";
import {TestLevel} from "./src/TestLevel";
import {TestLevel2} from "./src/TestLevel2";

async function main(): Promise<void> {
    const ENGINE: Engine = new Engine();
    ENGINE.add(URLS);
    await ENGINE.load();
    const GAME: Game = new Game(ENGINE, TestLevel);
    ENGINE.start();

    setTimeout(() => {
        GAME.loadNewLevel(TestLevel2);
    }, 5000);
}

main();
