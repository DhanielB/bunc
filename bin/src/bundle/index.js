"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function bundle(filename, currentWorkingDirectory) {
    const mainPath = path_1.default.resolve(currentWorkingDirectory);
    const resolvedPath = path_1.default.resolve(filename);
    const checkPath = fs_1.default.existsSync(resolvedPath);
    if (!checkPath) {
        return {
            sucess: false,
            result: "",
            code: -5,
            error: "Not found file",
        };
    }
    const fileContent = fs_1.default.readFileSync(resolvedPath).toString();
    const response = fileContent;
    return {
        sucess: true,
        // @ts-ignore
        result: response.code,
        code: 0,
        error: null,
    };
}
exports.default = bundle;
