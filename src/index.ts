#!/usr/bin/env node

"use strict";


// @ts-ignore
import fs from "fs";
import path from "path";
import chalk from "chalk";
import axios from "axios"
import { version } from "../package.json";
// @ts-ignore
import bigJson from "big-json";
import { program } from "commander";

import bundle from "./bundle";
import packageManager from "./packageManager";

const manager = new packageManager();

interface IPackageData {
  scripts: string[];
}

console.log(
  `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner ${version}`))}\n`
);

const startTime = performance.now();

const currentWorkingDirectory = process.cwd();

program.version(version, "-v, --version", "output the current version");

program
  .command("run [command]")
  .description("Run a javascript file")
  .action((command: string) => {
    if (command == undefined) {
      const packageFile = path.resolve(currentWorkingDirectory, "package.json");

      const readStream = fs.createReadStream(packageFile);
      const parseStream = bigJson.createParseStream();

      parseStream.on("data", (data: IPackageData) => {
        const { scripts } = data;

        for (let script in scripts) {
          const scriptExecute = scripts[script];

          console.log(
            `\t${chalk.bold("-")} ${chalk.green(script)}\t ${chalk.gray(
              scriptExecute
            )}\n`
          );
        }
      });

      readStream.pipe(parseStream);

    }

    const packageFile = path.resolve(currentWorkingDirectory, "package.json");

    const readStream = fs.createReadStream(packageFile);
    const parseStream = bigJson.createParseStream();

    parseStream.on("data", (data: IPackageData) => {
      var isScript = false;
      var isFile = false;

      const { scripts } = data;

      for (let script in scripts) {
        const scriptExecute = scripts[script];

        if (script == command) {
          console.log(chalk.gray(scriptExecute))
          isScript = true;
        }
      }

      if (!isScript) {
        try {
          const { sucess, result, error, code } = bundle(
            command,
            currentWorkingDirectory
          );

          if (sucess) {
            console.log(
              `${chalk.bold(
                chalk.bgBlack(chalk.green("sucess"))
              )} Bundled with sucess (${chalk.bold(chalk.yellow('this.filename'))})...\n`
            );

            isFile = true;
          } else {
            if (code != -5) {
              console.log(error);
            }
          }
        } catch(err) {
          // pass
        }
      }

      if (!(isFile || isScript)) {
        console.log(
          `${chalk.bold(
            chalk.bgBlack(chalk.red("warn"))
          )} Missing command or file...`
        );
      }
    });

    readStream.pipe(parseStream);
  });

program
  .command("add [package]")
  .description("Add a package")
  .action(async (packageToInstall: string) => {
    if (!packageToInstall) {
      console.log(
        `${chalk.bold(
          chalk.bgBlack(chalk.red("warn"))
        )} Missing a package command, usage (${chalk.bold("add [package]")})...\n`
      );

      process.exit(1)
    }

    const packageInstalled = await manager.download(currentWorkingDirectory, packageToInstall, true)

    console.log(packageInstalled)
  });

program.parse();

const endTime = performance.now();

process.on("exit", () => {
  console.log(`\nDone in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
});
