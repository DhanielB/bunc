#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../package.json");
// @ts-ignore
const big_json_1 = __importDefault(require("big-json"));
const commander_1 = require("commander");
const bundle_1 = __importDefault(require("./bundle"));
const packageManager_1 = __importDefault(require("./packageManager"));
const manager = new packageManager_1.default();
console.log(`${chalk_1.default.gray("$")} ${chalk_1.default.bold(chalk_1.default.magenta(`Tinner ${package_json_1.version}`))}\n`);
const startTime = performance.now();
const currentWorkingDirectory = process.cwd();
commander_1.program.version(package_json_1.version, "-v, --version", "output the current version");
commander_1.program
    .command("run [command]")
    .description("Run a javascript file")
    .action((command) => {
    if (command == undefined) {
        const packageFile = path_1.default.resolve(currentWorkingDirectory, "package.json");
        const readStream = fs_1.default.createReadStream(packageFile);
        const parseStream = big_json_1.default.createParseStream();
        parseStream.on("data", (data) => {
            const { scripts } = data;
            for (let script in scripts) {
                const scriptExecute = scripts[script];
                console.log(`\t${chalk_1.default.bold("-")} ${chalk_1.default.green(script)}\t ${chalk_1.default.gray(scriptExecute)}\n`);
            }
        });
        readStream.pipe(parseStream);
    }
    const packageFile = path_1.default.resolve(currentWorkingDirectory, "package.json");
    const readStream = fs_1.default.createReadStream(packageFile);
    const parseStream = big_json_1.default.createParseStream();
    parseStream.on("data", (data) => {
        var isScript = false;
        var isFile = false;
        const { scripts } = data;
        for (let script in scripts) {
            const scriptExecute = scripts[script];
            if (script == command) {
                console.log(chalk_1.default.gray(scriptExecute));
                isScript = true;
            }
        }
        if (!isScript) {
            try {
                const { sucess, result, error, code } = (0, bundle_1.default)(command, currentWorkingDirectory);
                if (sucess) {
                    console.log(`${chalk_1.default.bold(chalk_1.default.bgBlack(chalk_1.default.green("sucess")))} Bundled with sucess (${chalk_1.default.bold(chalk_1.default.yellow('this.filename'))})...\n`);
                    isFile = true;
                }
                else {
                    if (code != -5) {
                        console.log(error);
                    }
                }
            }
            catch (err) {
                // pass
            }
        }
        if (!(isFile || isScript)) {
            console.log(`${chalk_1.default.bold(chalk_1.default.bgBlack(chalk_1.default.red("warn")))} Missing command or file...`);
        }
    });
    readStream.pipe(parseStream);
});
commander_1.program
    .command("add [package]")
    .description("Add a package")
    .action((packageToInstall) => __awaiter(void 0, void 0, void 0, function* () {
    if (!packageToInstall) {
        console.log(`${chalk_1.default.bold(chalk_1.default.bgBlack(chalk_1.default.red("warn")))} Missing a package command, usage (${chalk_1.default.bold("add [package]")})...\n`);
        process.exit(1);
    }
    const packageInstalled = yield manager.download(currentWorkingDirectory, packageToInstall, true);
    console.log(packageInstalled);
}));
commander_1.program.parse();
const endTime = performance.now();
process.on("exit", () => {
    console.log(`\nDone in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
});
