"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require('shelljs');
function getHumanReadableSize(path) {
    const size = shell.exec(`du -h ${path} | tail -1`);
    return size.stdout.split('\t')[0];
}
exports.getHumanReadableSize = getHumanReadableSize;
