#!/usr/bin/env node

"use strict";

import chalk from "chalk";
import { version } from "../package.json";
// @ts-ignore
import { program } from "commander";
//@ts-ignore

import commandManager from './commands'

const commandUse = new commandManager();

var endTime: number;
const startTime = performance.now();

const currentWorkingDirectory = process.cwd();

program.version(version, "-v, --version", "Show the current version");

const init = program
  .command("init")
  .description("Start a project fast")
  .action(async (command: string) => {
    endTime = performance.now();

    commandUse.init(command, currentWorkingDirectory, version);
});

init.option("-y, --y, -yield, --yield").action(() => {
  endTime = performance.now();

  commandUse.initYield(currentWorkingDirectory);
});

program
  .command("run [command]")
  .description("Run a javascript file")
  .action((command: string) => {
    endTime = performance.now();

    commandUse.run(command, currentWorkingDirectory);
  });

program
  .command("add [package]")
  .description("Add a package")
  .action(async (packageToInstall: string) => {
    endTime = performance.now();

    commandUse.add(packageToInstall, currentWorkingDirectory);
  });

program
  .command("remove [package]")
  .description("Remove a package installed")
  .action((packageToRemove: string) => {
    endTime = performance.now();

    commandUse.remove(packageToRemove, currentWorkingDirectory);
  });

program.parse();

var anExisttingError = false;

process.on("error", () => {
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
