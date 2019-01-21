"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transformCollectionName(collection) {
    return collection.replace(/\|/, '/');
}
exports.transformCollectionName = transformCollectionName;
function getCollectionUrl(collection) {
    return `/admin/collection/${collection.replace('/', '|')}`;
}
exports.getCollectionUrl = getCollectionUrl;
