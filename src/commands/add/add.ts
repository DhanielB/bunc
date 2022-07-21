import chalk from "chalk";
import packageManager from "../../packageManager";

const packageUse = new packageManager();

export default async function add(
  packageToInstall: string,
  currentWorkingDirectory: string
) {
  console.log(
    `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner`))} ${chalk.gray(
      packageToInstall
    )}\n`
  );

  if (!packageToInstall) {
    console.log(
      `${chalk.bold(
        chalk.bgBlack(chalk.red("warn"))
      )} Missing a package command, usage (${chalk.bold("add [package]")})...\n`
    );

    process.exit(1);
  }

  const packageInstalled = await packageUse.downloadAndExtract(
    currentWorkingDirectory,
    packageToInstall,
    true
  );
}
