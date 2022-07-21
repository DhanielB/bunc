import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { prompt } from "enquirer";
import gitUsername from "git-username";

export default async function init(
  command: string,
  currentWorkingDirectory: string,
  version: string
) {
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
        //@ts-ignore
        .replaceAll(":", ": ")
        .replaceAll("{", "{\n\t")
        .replaceAll(",", ",\n\t")
        .replaceAll("}", "\n}")
        .replaceAll("\t}", "}");

      fs.writeFileSync(packagePath, formatedChunk);
    });
  }
}
