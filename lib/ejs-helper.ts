import { Schema } from './types';
const pagination = require('pagination');

export function getFormInput(schema: Schema) {
  switch (schema.type) {
    case 'markdown':
      return getMarkDown(schema);
    default:
      return getTextInput(schema);
  }
}

export function getRequiredText(schema: Schema) {
  return schema.required === true ? 'required' : '';
}

export function getTextInput(schema: Schema) {
  return `<div class="form-group">
    <label class="form-label">${schema.name}</label>
    <input type="text" class="form-control" name="${
      schema.name
    }" placeholder="${schema.name}" ${getRequiredText(schema)}>
  </div>`;
}

export function getMarkDown(schema: Schema) {
  return `<div class="form-group">
      <label class="form-label">${schema.name}</label>
      <textarea class="form-control" name="${
        schema.name
      }"rows="10" ${getRequiredText(schema)}></textarea>
    </div>`;
}

export function getPaginationData(
  prelink: string,
  current: number,
  totalResult: number,
  rowsPerPage = 24
) {
  const paginator = new pagination.SearchPaginator({
    prelink,
    current,
    rowsPerPage,
    totalResult
  });
  return paginator.getPaginationData();
}
