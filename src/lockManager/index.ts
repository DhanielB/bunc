import fs from "fs-extra";
import path from "path";
import parsedDependencies from "../parsedDepedencies";

interface IGenerate {
  name: string;
  version: string;
  resolved: string;
  integrity: string;
  dependencies: string[];
}

class lockManager {
  save(lock: string, data: object) {
    //fs.writeFileSync(lock, this.generate(data));
  }

  parse(data: string) {
    var text = data
      .replace(
        /[# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n# bunc lockfile v1]{84}/g,
        ""
      )
      .replace(/[\t]/g, "")
      .replace(/[version]{7}/, '"version"')
      .replace(/[resolved]{8}/, '"resolved"')
      .replace(/[integrity]{9}/, '"integrity"')
      .replace(/[dependencies]{12}/, '"dependencies"')
      .replace(/[ ]/g, ":")
      .replaceAll("::", ":");

    text = `{${text}`;

    if (text.indexOf("integrity") != -1) {
      const integrityStart = text.indexOf("integrity") - 1 + 15;
      var lineCount = 0;
      var integrityEnd = 0;
      var sumLength = 0;
      var newText = "";

      for (let line of text.split("\n")) {
        if (line.indexOf("integrity") != -1) {
          integrityEnd = sumLength + (line.length - 1) + 10;
        } else {
          sumLength += line.length - 1;
        }

        if (lineCount == 0) {
          newText += line + ":{";
        } else if (lineCount == text.split("\n").length - 1) {
          newText += line + "}}";
        } else {
          newText += line + ",\n";
        }

        lineCount += 1;
      }

      text = newText
        .replaceAll("[,", "[")
        .replaceAll("},", "}")
        .replaceAll("{,", "{")
        .replaceAll(",\n}", "\n}");

      const stringRegex = `${text.substring(integrityStart, integrityEnd)}`;
      const regexToRun = new RegExp(stringRegex, "gi");

      text = text.replace(
        regexToRun,
        `"${text.substring(integrityStart, integrityEnd)}"`
      );
    }

    console.log(text);

    return JSON.parse(text);
  }

  get(currentWorkingDirectory: string) {
    const resolvedLockPath = path.resolve(currentWorkingDirectory, "bunc.lock");

    if (fs.existsSync(resolvedLockPath)) {
      return this.parse(fs.readFileSync(resolvedLockPath, "utf8").toString());
    }

    return this.parse(this.generate([]));
  }

  generate(packages: IGenerate[]): string {
    var packageLock =
      "# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n# bunc lockfile v1";

    for (let packageData of packages) {
      console.log(packageData);
      const { name, version, resolved, integrity, dependencies } = packageData;

      packageLock += `"${name}@^${version}"\n`;
      packageLock += `\tversion "${version}"\n`;

      if (resolved) {
        packageLock += `\tresolved "${resolved}"\n`;
      }

      if (integrity) {
        packageLock += `\tintegrity "${integrity}"\n`;
      }

      if (dependencies) {
        const parsedData = parsedDependencies(JSON.stringify(packageData));

        packageLock += `\tdependencies: ${parsedData}`;
      }
    }

    return packageLock;
  }
}

export default lockManager;