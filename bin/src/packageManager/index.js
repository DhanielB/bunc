"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
//@ts-ignore
const wget_1 = __importDefault(require("wget"));
const axios_1 = __importDefault(require("axios"));
//@ts-ignore
const jaguar_1 = __importDefault(require("jaguar"));
//@ts-ignore
const glob_1 = __importDefault(require("glob"));
class packageManager {
    packageMain;
    packageLock;
    constructor() {
        this.packageMain = [];
        this.packageLock = [];
    }
    async move(directory, packageName) {
        const packagePath = path_1.default.resolve(directory, "package");
        (0, glob_1.default)(`${packagePath}/*`, (err, files) => {
            if (err)
                throw err;
            for (let file of files) {
                const to = path_1.default.resolve(file.replaceAll("package/", ""));
                fs_extra_1.default.moveSync(file, to);
            }
            fs_extra_1.default.removeSync(packagePath);
        });
        return directory;
    }
    extract(from, to, packageName) {
        const extractFile = jaguar_1.default.extract(from, to);
        extractFile.on("progress", (progress) => {
            const progressInteger = progress;
        });
        extractFile.on("error", (error) => {
            console.error(error);
        });
        extractFile.on("end", () => {
            this.move(to, packageName);
        });
        return to;
    }
    async downloadAndExtract(currentWorkingDirectory, packageName, IsPackageDependency = true, packageVersion) {
        const registry = await axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
        const data = registry["data"];
        var packageSelectedVersion = data["dist-tags"]["latest"];
        if (IsPackageDependency) {
            this.packageMain.push(packageName);
        }
        this.packageLock.push(packageName);
        const packageVersionData = data["versions"][packageSelectedVersion];
        const packageTarball = `http://${packageVersionData["dist"]["tarball"].substring(8)}`;
        const packageTarballName = packageTarball.split("/").reverse()[0];
        if (!fs_extra_1.default.existsSync(path_1.default.resolve(currentWorkingDirectory, "node_modules"))) {
            fs_extra_1.default.mkdirSync(path_1.default.resolve(currentWorkingDirectory, "node_modules"));
        }
        const src = `https://registry.npmjs.com/${packageName}/-/${packageTarballName}`;
        const output = path_1.default.resolve(currentWorkingDirectory, "node_modules", packageTarballName);
        const download = await wget_1.default.download(src, output);
        download.on("error", function (err) {
            console.log(err);
        });
        download.on("progress", (progress) => {
            const progressInteger = Math.ceil(progress);
        });
        download.on("end", (output) => {
            const filename = output
                .split("/")
                .reverse()[0]
                .substring(0, output.split("/").reverse()[0].indexOf(".") - 2);
            const from = path_1.default.resolve(output);
            const to = path_1.default.resolve(`node_modules/${packageName}`);
            this.extract(from, to, packageName);
        });
        for (let packageDependency in packageVersionData["dependencies"]) {
            const packageDependencyVersion = packageVersionData["dependencies"][packageDependency];
            console.log(`Added ${packageDependency}@${packageDependencyVersion}`);
            if (!this.packageLock.includes(packageDependency)) {
                this.downloadAndExtract(currentWorkingDirectory, packageDependency, false, packageDependencyVersion);
            }
        }
        return this.packageLock;
    }
}
exports.default = packageManager;
