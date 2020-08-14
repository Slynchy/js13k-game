export default class Loader {
    private queue: string[] = [];

    constructor() {}

    public add(url: string): void {
        this.queue.push(url);
    }

    public load(): Promise<{ [key: string]: HTMLImageElement }> {
        const retVal: { [key: string]: HTMLImageElement } = {};
        return new Promise<{ [key: string]: HTMLImageElement }>(async (res, rej) => {
            const promises = [];
            this.queue.forEach((e: string) => {
                retVal[e] = new Image();
                retVal[e].src = e;
                promises.push(createImagePromise(retVal[e]));
            });
            await Promise.all(promises);
            res(retVal);
        });

        function createImagePromise(img) {
            return new Promise((resolve) => (img.onload = () => resolve()));
        }
    }
}
