"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parsedDependencies(dependencies) {
    const parsedDependencies = dependencies
        .replace(/[\n]/gi, "")
        .replace(/[[]/gi, "[\n\t")
        .replace(/[,]/gi, ",\n\t")
        .replace(/[\t]/gi, "]");
    return parsedDependencies;
}
exports.default = parsedDependencies;
