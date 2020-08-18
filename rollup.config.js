import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import tslint from "rollup-plugin-tslint";
import { terser } from "rollup-plugin-terser";

export default {
    input: './main.ts',
    plugins: [
        tslint(),
        typescript(),
        resolve({
            kontra: true
        }),
        terser({
            toplevel: true,
            compress: {
                arguments: true,
                booleans_as_integers: true,
                ecma: 2017,
                passes: 3,
                unsafe: true,
                unsafe_arrows: true,
                unsafe_Function: true,
                unsafe_math: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_symbols: true
            },
            mangle: {
                toplevel: true,
                eval: true
            }

        })
    ]
}
