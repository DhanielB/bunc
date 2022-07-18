#!/usr/bin/env node

"use strict";

// @ts-ignore
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { prompt } from "enquirer";
import { version } from "../package.json";
// @ts-ignore
import bigJson from "big-json";
import { program } from "commander";
import gitUsername from "git-username";
import packageManager from "./packageManager";

const manager = new packageManager();
interface IError {
  message: string;
  requireStack: string[];
}
interface IPackageData {
  scripts: string[];
}

const startTime = performance.now();

const currentWorkingDirectory = process.cwd();

program.version(version, "-v, --version", "output the current version");

const init = program
  .command("init")
  .description("Start a project fast")
  .action(async (command: string) => {
    console.log(
      `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner`))} ${chalk.gray(
        version
      )}\n`
    );

    const defaultVersion = "1.0.1";
    const defaultEntryPoint = "src/index.js";
    const defaultProjectName = currentWorkingDirectory.split("/").reverse()[0];
    const defaultRepositoryUrl = `https://github.com/${gitUsername()}/${defaultProjectName}.git`;
    const packagePath = path.resolve(currentWorkingDirectory, "package.json");

    if (command == undefined) {
      const questions = [
        {
          name: "name",
          type: "input",
          initial: defaultProjectName,
          message: `${chalk.bold(
            chalk.gray("question")
          )} name (${defaultProjectName}): `,
        },

        {
          name: "version",
          type: "input",
          initial: defaultVersion,
          message: `${chalk.bold(
            chalk.gray("question")
          )} version (${defaultVersion}): `,
        },

        {
          name: "description",
          type: "input",
          initial: "",
          message: `${chalk.bold(chalk.gray("question"))} description : `,
        },

        {
          name: "main",
          type: "input",
          initial: defaultEntryPoint,
          message: `${chalk.bold(
            chalk.gray("question")
          )} entry point (${defaultEntryPoint}): `,
        },

        {
          name: "repository",
          type: "input",
          initial: defaultRepositoryUrl,
          message: `${chalk.bold(
            chalk.gray("question")
          )} repository url (${defaultRepositoryUrl}): `,
        },

        {
          name: "author",
          type: "input",
          initial: gitUsername(),
          message: `${chalk.bold(
            chalk.gray("question")
          )} author (${gitUsername()}): `,
        },

        {
          name: "license",
          type: "input",
          initial: "MIT",
          message: `${chalk.bold(chalk.gray("question"))} license (MIT): `,
        },

        {
          name: "private",
          type: "toggle",
          message: `${chalk.bold(chalk.gray("question"))} private (false): `,
        },
      ];

      await prompt(questions).then((chunk: object) => {
        const formatedChunk = JSON.stringify(chunk)
          .replaceAll(":", ": ")
          .replaceAll("{", "{\n\t")
          .replaceAll(",", ",\n\t")
          .replaceAll("}", "\n}")
          .replaceAll("\t}", "}");

        fs.writeFileSync(packagePath, formatedChunk);
      });
    }
  });

init.option("-y, --y, -yield, --yield").action(() => {
  const packagePath = path.resolve(currentWorkingDirectory, "package.json");

  const data = `{
  "name": "bunc",
  "version": "1.0.1",
  "description": "",
  "main": "src/index.js",
  "license": "MIT"
}`;

  fs.writeFileSync(packagePath, data);

  console.log(`${chalk.green("sucess")} Saved package.json`);
});

program
  .command("run [command]")
  .description("Run a javascript file")
  .action((command: string) => {
    console.log(
      `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner`))} ${chalk.gray(
        command
      )}\n`
    );

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
          console.log(chalk.gray(scriptExecute));
          isScript = true;
        }
      }

      if (!isScript) {
        try {
          require("sucrase/register");
          const resolvedPath = path.resolve(command);

          if (fs.existsSync(resolvedPath)) {
            require(resolvedPath);
            isFile = true;
          }
        } catch (err) {
          //@ts-ignore
          const error: IError = err;

          console.log(
            `${chalk.bold(chalk.bgBlack(chalk.red("warn")))} ${chalk.bold(
              chalk.gray(
                `${error.message}\nRequire stack:\n- ${error.requireStack}`
              )
            )}`
          );
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
    console.log(
      `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner`))} ${chalk.gray(
        packageToInstall
      )}\n`
    );

    if (!packageToInstall) {
      console.log(
        `${chalk.bold(
          chalk.bgBlack(chalk.red("warn"))
        )} Missing a package command, usage (${chalk.bold(
          "add [package]"
        )})...\n`
      );

      process.exit(1);
    }

    const packageInstalled = await manager.download(
      currentWorkingDirectory,
      packageToInstall,
      true
    );

    const from = path.resolve("modules", "axios-0.27.2.tgz");

    const filename = from.split("/").reverse()[0];
    const to = path.resolve(
      "modules",
      filename.substring(0, filename.length - 6)
    );

    //jaguar and not downloading...
  });

program.parse();

const endTime = performance.now();

var anExisttingError = false;

process.on("unhandledRejection", () => {
  anExisttingError = true;

  if (!anExisttingError) {
    console.warn(`\n${chalk.red("error")} Command failed with exit code 1.`);
    console.log(`Done in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
    process.exit(1);
  }
});

process.on("exit", () => {
  if (!anExisttingError) {
    console.log(`\nDone in ${Math.abs(startTime - endTime).toFixed(2)}s.`);
  }
});
