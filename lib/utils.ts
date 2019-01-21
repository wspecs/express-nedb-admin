const shell = require('shelljs');

export function getHumanReadableSize(path: string) {
  const size = shell.exec(`du -h ${path} | tail -1`);
  return size.stdout.split('\t')[0];
}
