#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const enquirer_1 = require("enquirer");
const package_json_1 = require("../package.json");
// @ts-ignore
const big_json_1 = __importDefault(require("big-json"));
const commander_1 = require("commander");
const git_username_1 = __importDefault(require("git-username"));
const packageManager_1 = __importDefault(require("./packageManager"));
const manager = new packageManager_1.default();
var endTime;
const startTime = performance.now();
const currentWorkingDirectory = process.cwd();
commander_1.program.version(package_json_1.version, "-v, --version", "output the current version");
const init = commander_1.program
    .command("init")
    .description("Start a project fast")
    .action(async (command) => {
    console.log(`${chalk_1.default.gray("$")} ${chalk_1.default.bold(chalk_1.default.magenta(`Tinner`))} ${chalk_1.default.gray(package_json_1.version)}\n`);
    endTime = performance.now();
    const defaultVersion = "1.0.1";
    const defaultEntryPoint = "src/index.js";
    const defaultProjectName = currentWorkingDirectory.split("/").reverse()[0];
    const defaultRepositoryUrl = `https://github.com/${(0, git_username_1.default)()}/${defaultProjectName}.git`;
    const packagePath = path_1.default.resolve(currentWorkingDirectory, "package.json");
    if (command == undefined) {
        const questions = [
            {
                name: "name",
                type: "input",
                initial: defaultProjectName,
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} name (${defaultProjectName}): `,
            },
            {
                name: "version",
                type: "input",
                initial: defaultVersion,
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} version (${defaultVersion}): `,
            },
            {
                name: "description",
                type: "input",
                initial: "",
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} description : `,
            },
            {
                name: "main",
                type: "input",
                initial: defaultEntryPoint,
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} entry point (${defaultEntryPoint}): `,
            },
            {
                name: "repository",
                type: "input",
                initial: defaultRepositoryUrl,
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} repository url (${defaultRepositoryUrl}): `,
            },
            {
                name: "author",
                type: "input",
                initial: (0, git_username_1.default)(),
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} author (${(0, git_username_1.default)()}): `,
            },
            {
                name: "license",
                type: "input",
                initial: "MIT",
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} license (MIT): `,
            },
            {
                name: "private",
                type: "toggle",
                message: `${chalk_1.default.bold(chalk_1.default.gray("question"))} private (false): `,
            },
        ];
        await (0, enquirer_1.prompt)(questions).then((chunk) => {
            const formatedChunk = JSON.stringify(chunk)
                .replaceAll(":", ": ")
                .replaceAll("{", "{\n\t")
                .replaceAll(",", ",\n\t")
                .replaceAll("}", "\n}")
                .replaceAll("\t}", "}");
            fs_1.default.writeFileSync(packagePath, formatedChunk);
        });
    }
});
init.option("-y, --y, -yield, --yield").action(() => {
    const packagePath = path_1.default.resolve(currentWorkingDirectory, "package.json");
    const data = `{
  "name": "bunc",
  "version": "1.0.1",
  "description": "",
  "main": "src/index.js",
  "license": "MIT"
}`;
    fs_1.default.writeFileSync(packagePath, data);
    console.log(`${chalk_1.default.green("sucess")} Saved package.json`);
});
commander_1.program
    .command("run [command]")
    .description("Run a javascript file")
    .action((command) => {
    console.log(`${chalk_1.default.gray("$")} ${chalk_1.default.bold(chalk_1.default.magenta(`Tinner`))} ${chalk_1.default.gray(command)}\n`);
    endTime = performance.now();
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
                //@ts-ignore
                Promise.resolve().then(() => __importStar(require("sucrase/register")));
                const resolvedPath = path_1.default.resolve(command);
                if (fs_1.default.existsSync(resolvedPath)) {
                    Promise.resolve().then(() => __importStar(require(resolvedPath)));
                    isFile = true;
                }
            }
            catch (err) {
                //@ts-ignore
                const error = err;
                console.log(`${chalk_1.default.bold(chalk_1.default.bgBlack(chalk_1.default.red("warn")))} ${chalk_1.default.bold(chalk_1.default.gray(`${error.message}\nRequire stack:\n- ${error.requireStack}`))}`);
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
    .action(async (packageToInstall) => {
    console.log(`${chalk_1.default.gray("$")} ${chalk_1.default.bold(chalk_1.default.magenta(`Tinner`))} ${chalk_1.default.gray(packageToInstall)}\n`);
    endTime = performance.now();
    if (!packageToInstall) {
        console.log(`${chalk_1.default.bold(chalk_1.default.bgBlack(chalk_1.default.red("warn")))} Missing a package command, usage (${chalk_1.default.bold("add [package]")})...\n`);
        process.exit(1);
    }
    const packageInstalled = await manager.downloadAndExtract(currentWorkingDirectory, packageToInstall, true);
    const from = path_1.default.resolve("modules", "axios-0.27.2.tgz");
    const filename = from.split("/").reverse()[0];
    const to = path_1.default.resolve("modules", filename.substring(0, filename.length - 6));
});
commander_1.program.parse();
var anExisttingError = false;
process.on("unhandledRejection", () => {
    anExisttingError = true;
    if (!anExisttingError) {
        console.warn(`\n${chalk_1.default.red("error")} Command failed with exit code 1.`);
        console.log(`Done in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
        process.exit(1);
    }
});
process.on("exit", () => {
    if (!anExisttingError) {
        console.log(`\nDone in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
    }
});
