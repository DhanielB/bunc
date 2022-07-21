import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

export default function initYield(currentWorkingDirectory: string) {
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
}
