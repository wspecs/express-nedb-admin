export function transformCollectionName(collection: string) {
  return collection.replace(/\|/, '/');
}

export function getCollectionUrl(collection: string) {
  return `/admin/collection/${collection.replace('/', '|')}`;
}
