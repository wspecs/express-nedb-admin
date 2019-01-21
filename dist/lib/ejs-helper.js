"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pagination = require('pagination');
function getFormInput(schema) {
    switch (schema.type) {
        case 'markdown':
            return getMarkDown(schema);
        default:
            return getTextInput(schema);
    }
}
exports.getFormInput = getFormInput;
function getRequiredText(schema) {
    return schema.required === true ? 'required' : '';
}
exports.getRequiredText = getRequiredText;
function getTextInput(schema) {
    return `<div class="form-group">
    <label class="form-label">${schema.name}</label>
    <input type="text" class="form-control" name="${schema.name}" placeholder="${schema.name}" ${getRequiredText(schema)}>
  </div>`;
}
exports.getTextInput = getTextInput;
function getMarkDown(schema) {
    return `<div class="form-group">
      <label class="form-label">${schema.name}</label>
      <textarea class="form-control" name="${schema.name}"rows="10" ${getRequiredText(schema)}></textarea>
    </div>`;
}
exports.getMarkDown = getMarkDown;
function getPaginationData(prelink, current, totalResult, rowsPerPage = 24) {
    const paginator = new pagination.SearchPaginator({
        prelink,
        current,
        rowsPerPage,
        totalResult
    });
    return paginator.getPaginationData();
}
exports.getPaginationData = getPaginationData;
