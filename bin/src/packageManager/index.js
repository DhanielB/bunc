"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const axios_1 = __importDefault(require("axios"));
class packageManager {
    constructor() {
        this.packageMain = [];
        this.packageLock = [];
    }
    download(currentWorkingDirectory, packageName, IsPackageDependency = true, packageVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = yield axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
            const data = registry["data"];
            var packageSelectedVersion = data["dist-tags"]["latest"];
            if (IsPackageDependency) {
                this.packageMain.push(packageName);
            }
            this.packageLock.push(packageName);
            const packageVersionData = data["versions"][packageSelectedVersion];
            const packageTarball = `http://${packageVersionData["dist"]["tarball"].substring(8)}`;
            const packageTarballName = packageTarball.split("/").reverse()[0];
            const file = fs_1.default.createWriteStream(path_1.default.resolve(currentWorkingDirectory, "modules", packageTarballName));
            if (!fs_1.default.existsSync(path_1.default.resolve(currentWorkingDirectory, "modules"))) {
                fs_1.default.mkdirSync(path_1.default.resolve(currentWorkingDirectory, "modules"));
            }
            http_1.default.get(packageTarball, (response) => __awaiter(this, void 0, void 0, function* () {
                yield response.pipe(file);
            }));
            for (let packageDependency in packageVersionData["dependencies"]) {
                const packageDependencyVersion = packageVersionData["dependencies"][packageDependency];
                console.log(`Added ${packageDependency}@${packageDependencyVersion}`);
                if (!this.packageLock.includes(packageDependency)) {
                    this.download(currentWorkingDirectory, packageDependency, false, packageDependencyVersion);
                }
            }
            return this.packageLock;
        });
    }
}
exports.default = packageManager;
