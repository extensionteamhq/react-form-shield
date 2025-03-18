import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import dts from "rollup-plugin-dts";
import { readFileSync } from "fs";
const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default [
    // CommonJS (for Node) and ES module (for bundlers) build
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
                exports: "named",
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
                exports: "named",
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({ extensions }),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
            babel({
                babelHelpers: "bundled",
                exclude: "node_modules/**",
                extensions,
            }),
            terser(),
        ],
        external: ["react", "react-dom"],
    },
    // Server-side build
    {
        input: "src/server/index.ts",
        output: [
            {
                file: "dist/server.js",
                format: "cjs",
                sourcemap: true,
                exports: "named",
            },
            {
                file: "dist/server.esm.js",
                format: "esm",
                sourcemap: true,
                exports: "named",
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({ extensions }),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
            babel({
                babelHelpers: "bundled",
                exclude: "node_modules/**",
                extensions,
            }),
            terser(),
        ],
        external: ["react", "react-dom"],
    },
    // TypeScript declaration files
    {
        input: "dist/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
    {
        input: "dist/dts/server/index.d.ts",
        output: [{ file: "dist/server.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
