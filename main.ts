import Engine from "./src/Engine";
import Sprite from "./src/Sprite";

const engine: Engine = new Engine();

const urls = [
    "assets/parallax-demon-woods-far-trees.png",
    "assets/parallax-demon-woods-mid-trees.png",
    "assets/parallax-demon-woods-close-trees.png"
];
engine.loader.add(urls[0]);
engine.loader.add(urls[1]);
engine.loader.add(urls[2]);
engine.loader.load().then((obj) => {
    let sprite1 = new Sprite({
        image: obj[urls[0]]
    });
    engine.scene.push(sprite1);
    let sprite2 = new Sprite({
        image: obj[urls[1]]
    });
    engine.scene.push(sprite2);
    let sprite3 = new Sprite({
        image: obj[urls[2]]
    });
    engine.scene.push(sprite3);
    engine.start();
});

