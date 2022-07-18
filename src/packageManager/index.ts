"use strict";

import fs from "fs";
import path from "path";
import http from "http";
import axios from "axios";

class packageManager {
  packageMain: any[];
  packageLock: any[];

  constructor() {
    this.packageMain = [];
    this.packageLock = [];
  }

  async download(
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
    const file = fs.createWriteStream(
      path.resolve(currentWorkingDirectory, "modules", packageTarballName)
    );

    if (!fs.existsSync(path.resolve(currentWorkingDirectory, "modules"))) {
      fs.mkdirSync(path.resolve(currentWorkingDirectory, "modules"));
    }

    http.get(packageTarball, async (response) => {
      await response.pipe(file);
    });

    for (let packageDependency in packageVersionData["dependencies"]) {
      const packageDependencyVersion =
        packageVersionData["dependencies"][packageDependency];

      console.log(`Added ${packageDependency}@${packageDependencyVersion}`);

      if (!this.packageLock.includes(packageDependency)) {
        this.download(
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
