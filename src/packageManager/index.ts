"use strict";

import fs from "fs-extra";
import path from "path";
//@ts-ignore
import wget from "wget";
import axios from "axios";
//@ts-ignore
import jaguar from "jaguar";
//@ts-ignore
import glob from "glob";

class packageManager {
  packageMain: any[];
  packageLock: any[];

  constructor() {
    this.packageMain = [];
    this.packageLock = [];
  }

  async move(directory: string, packageName: string): Promise<string> {
    const packagePath = path.resolve(directory, "package");

    glob(`${packagePath}/*`, (err: string, files: string[]) => {
      if (err) throw err;

      for (let file of files) {
        const to = path.resolve(file.replaceAll("package/", ""));

        fs.moveSync(file, to);
      }

      fs.removeSync(packagePath);
    });

    return directory;
  }

  extract(from: string, to: string, packageName: string): string {
    const extractFile = jaguar.extract(from, to);

    extractFile.on("progress", (progress: number) => {
      const progressInteger = progress;
    });

    extractFile.on("error", (error: string) => {
      console.error(error);
    });

    extractFile.on("end", () => {
      this.move(to, packageName);
    });

    return to;
  }

  async downloadAndExtract(
    currentWorkingDirectory: string,
    packageName: string,
    IsPackageDependency: boolean = true,
    packageVersion?: string
  ) {
    const registry = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );
    const data = registry["data"];

    var packageSelectedVersion = data["dist-tags"]["latest"];

    if (IsPackageDependency) {
      this.packageMain.push(packageName);
    }

    this.packageLock.push(packageName);

    const packageVersionData = data["versions"][packageSelectedVersion];
    const packageTarball = `http://${packageVersionData["dist"][
      "tarball"
    ].substring(8)}`;
    const packageTarballName = packageTarball.split("/").reverse()[0];

    if (!fs.existsSync(path.resolve(currentWorkingDirectory, "node_modules"))) {
      fs.mkdirSync(path.resolve(currentWorkingDirectory, "node_modules"));
    }

    const src = `https://registry.npmjs.com/${packageName}/-/${packageTarballName}`;
    const output = path.resolve(
      currentWorkingDirectory,
      "node_modules",
      packageTarballName
    );

    const download = await wget.download(src, output);

    download.on("error", function (err: string) {
      console.log(err);
    });

    download.on("progress", (progress: number) => {
      const progressInteger = Math.ceil(progress);
    });

    download.on("end", (output: string) => {
      const filename = output
        .split("/")
        .reverse()[0]
        .substring(0, output.split("/").reverse()[0].indexOf(".") - 2);

      const from = path.resolve(output);
      const to = path.resolve(`node_modules/${packageName}`);

      this.extract(from, to, packageName);
    });

    for (let packageDependency in packageVersionData["dependencies"]) {
      const packageDependencyVersion =
        packageVersionData["dependencies"][packageDependency];

      console.log(`Added ${packageDependency}@${packageDependencyVersion}`);

      if (!this.packageLock.includes(packageDependency)) {
        this.downloadAndExtract(
          currentWorkingDirectory,
          packageDependency,
          false,
          packageDependencyVersion
        );
      }
    }

    return this.packageLock;
  }
}

export default packageManager;
