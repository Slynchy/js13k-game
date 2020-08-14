import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default {
    input: './main.ts',
    plugins: [
        typescript(),
        resolve({
            kontra: true
        }),
        terser({

        })
    ]
}
