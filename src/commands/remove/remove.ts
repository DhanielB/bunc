import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import lockManager from "../../lockManager";

const lockUse = new lockManager();

interface IDependencies {
  [key: string]: string;
}

interface IRemove {
  name?: string;
  version?: string;
  resolved?: string;
  integrity?: string;
  dependencies?: IDependencies;
}

export default function remove(
  packageToRemove: string,
  currentWorkingDirectory: string
) {
  console.log(
    `${chalk.gray("$")} ${chalk.bold(chalk.magenta(`Tinner`))} ${chalk.gray(
      packageToRemove
    )}\n`
  );

  var packageToRemoveObject: IRemove = {};

  const lock = [] //lockUse.get(path.resolve(currentWorkingDirectory + 'bunc.lock'));

  for (let packageData of lock) {
    if (packageData.name == packageToRemove) {
      packageToRemoveObject = packageData;
    }
  }
  
  if (packageToRemoveObject.name == undefined) {
    console.log(
      `${chalk.bgBlack(chalk.red("warn"))} Not found ${chalk.bold(
        packageToRemove
      )}`
    );

    return;
  }

  const packageToRemovePath = path.resolve("nodd_modules", packageToRemove);
  const newLock = lockUse.remove(
    packageToRemoveObject,
    currentWorkingDirectory
  );

  console.log(
    `${chalk.bgBlack(chalk.green("sucess"))} Removed ${chalk.bold(
      packageToRemove
    )}`
  );

  fs.removeSync(packageToRemovePath);

  lockUse.save(path.resolve(currentWorkingDirectory, "bunc.lock"), newLock);

  console.log(
    `${chalk.bgBlack(chalk.green("sucess"))} Saved ${path.resolve(
      currentWorkingDirectory,
      "bunc.lock"
    )}`
  );
}
