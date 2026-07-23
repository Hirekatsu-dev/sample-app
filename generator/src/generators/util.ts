import fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';

export function toSnakeCase(value: string) {
  return _.snakeCase(value);
}

export function toUpperSnakeCase(value: string) {
  return _.snakeCase(value).toUpperCase();
}

export function toPascalCase(value: string) {
  return _.upperFirst(toCamelCase(value));
}

export function toCamelCase(value: string) {
  return _.camelCase(value);
}

function getRepositoryRoot(): string {
  // generator2/src/generators/util.ts から見てリポジトリルートは ../../../
  return path.resolve(__dirname, '../../../');
}

export function render(content: string, relativePath: string) {
  const repositoryRoot = getRepositoryRoot();
  const absolutePath = path.resolve(repositoryRoot, relativePath);

  const directory = path.dirname(absolutePath);
  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(absolutePath, content);
}

export function clear(relativePath: string) {
  const repositoryRoot = getRepositoryRoot();
  const absolutePath = path.resolve(repositoryRoot, relativePath);
  if (fs.existsSync(absolutePath)) {
    fs.rmSync(absolutePath, { recursive: true, force: true });
  }
}

export function renderIfNotExists(content: string, relativePath: string) {
  const repositoryRoot = getRepositoryRoot();
  const absolutePath = path.resolve(repositoryRoot, relativePath);

  if (fs.existsSync(absolutePath)) {
    return;
  }

  const directory = path.dirname(absolutePath);
  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(absolutePath, content);
}
