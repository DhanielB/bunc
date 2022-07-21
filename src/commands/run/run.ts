import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import bigJson from "big-json";

interface IPackageData {
  scripts: string[];
}

export default function run(command: string, currentWorkingDirectory: string) {
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
        //@ts-ignore
        import("sucrase/register");
        const resolvedPath = path.resolve(command);

        if (fs.existsSync(resolvedPath)) {
          import(resolvedPath);
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
}
