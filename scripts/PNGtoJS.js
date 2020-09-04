const pngjs = require("png-js");
const args = process.argv.slice(2);

async function main() {
    const pixels = await LoadAndDecodePNG(args[0]);

    console.log(pixels);
}


function LoadAndDecodePNG(path) {
    return new Promise((resolve) => {
        pngjs.decode(path, function(pixels) {
            // pixels is a 1d array (in rgba order) of decoded pixel data
            resolve(pixels);
        });
    });
}

main();
