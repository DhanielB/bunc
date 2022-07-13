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
// @ts-ignore
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { version } from "../package.json";
// @ts-ignore
import bigJson from "big-json";
import { program } from "commander";
import bundle from "./bundle";
import packageManager from "./packageManager";
const manager = new packageManager();
console.log(`${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner ${version}`))}\n`);
const startTime = performance.now();
const currentWorkingDirectory = process.cwd();
program.version(version, "-v, --version", "output the current version");
program
    .command("run [command]")
    .description("Run a javascript file")
    .action((command) => {
    if (command == undefined) {
        const packageFile = path.resolve(currentWorkingDirectory, "package.json");
        const readStream = fs.createReadStream(packageFile);
        const parseStream = bigJson.createParseStream();
        parseStream.on("data", (data) => {
            const { scripts } = data;
            for (let script in scripts) {
                const scriptExecute = scripts[script];
                console.log(`\t${chalk.bold("-")} ${chalk.green(script)}\t ${chalk.gray(scriptExecute)}\n`);
            }
        });
        readStream.pipe(parseStream);
    }
    const packageFile = path.resolve(currentWorkingDirectory, "package.json");
    const readStream = fs.createReadStream(packageFile);
    const parseStream = bigJson.createParseStream();
    parseStream.on("data", (data) => {
        var isScript = false;
        var isFile = false;
        const { scripts } = data;
        for (let script in scripts) {
            const scriptExecute = scripts[script];
            if (script == command) {
                console.log(chalk.gray(scriptExecute));
                isScript = true;
            }
        }
        if (!isScript) {
            try {
                const { sucess, result, error, code } = bundle(command, currentWorkingDirectory);
                if (sucess) {
                    console.log(`${chalk.bold(chalk.bgBlack(chalk.green("sucess")))} Bundled with sucess (${chalk.bold(chalk.yellow('this.filename'))})...\n`);
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
            console.log(`${chalk.bold(chalk.bgBlack(chalk.red("warn")))} Missing command or file...`);
        }
    });
    readStream.pipe(parseStream);
});
program
    .command("add [package]")
    .description("Add a package")
    .action((packageToInstall) => __awaiter(void 0, void 0, void 0, function* () {
    if (!packageToInstall) {
        console.log(`${chalk.bold(chalk.bgBlack(chalk.red("warn")))} Missing a package command, usage (${chalk.bold("add [package]")})...\n`);
        process.exit(1);
    }
    const packageInstalled = yield manager.download(currentWorkingDirectory, packageToInstall, true);
    console.log(packageInstalled);
}));
program.parse();
const endTime = performance.now();
process.on("exit", () => {
    console.log(`\nDone in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
});
