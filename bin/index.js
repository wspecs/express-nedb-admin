#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const prompts = require('prompts');
const shell = require('shelljs');
const dot = require('dot-object');
const log = require('great-logs');

const APP_FOLDER = `${__dirname}/..`;
const EXCLUDED_FOLDERS = new Set([
  '.git',
  'node_modules',
  'dist',
  'template',
  'package-lock.json'
]);
const PACKAGE_INFO = JSON.parse(fs.readFileSync(`${APP_FOLDER}/package.json`));

const GENERATE_MODULE_QUESTIONS = [
  {
    type: 'text',
    name: 'name',
    message: 'Name of the package',
    validate: v => v.trim().length > 0
  },
  {
    type: 'text',
    name: 'description',
    message: 'Description of the package',
    validate: v => v.trim().length > 0
  },
  {
    type: 'text',
    name: 'license',
    message: 'License type',
    initial: 'MIT',
    validate: v => v.trim().length > 0
  },
  {
    type: 'text',
    name: 'author.name',
    message: "What's your name?",
    initial: ''
  },
  {
    type: 'text',
    name: 'author.email',
    message: "What's your email?",
    initial: ''
  },
  {
    type: 'text',
    name: 'author.url',
    message: "What's your website url?",
    initial: ''
  },
  {
    type: 'text',
    name: 'author.git',
    message: "What's your GitHub repo?",
    initial: ''
  }
];

program.command('start').action(async () => generateModule());

async function generateModule() {
  const response = await prompts(GENERATE_MODULE_QUESTIONS);
  const folderName = response.name;
  copyFiles(folderName);
  const packageInfo = { ...PACKAGE_INFO, ...dot.object(response) };
  delete packageInfo.dependencies['dot-object'];
  delete packageInfo.dependencies['shelljs'];
  const packageInfoText = JSON.stringify(packageInfo, null, 2);
  fs.writeFileSync(`${folderName}/package.json`, packageInfoText, 'utf8');
  log.info('run the following command to continue');
  console.log('******************************');
  console.log(`cd ${folderName}`);
  console.log('npm i');
  console.log('npm run readme');
  console.log('******************************');
}

function copyFiles(folderName) {
  const files = fs.readdirSync(APP_FOLDER);
  shell.exec(`mkdir ./${folderName}`);
  for (const file of files) {
    if (EXCLUDED_FOLDERS.has(file)) {
    } else {
      shell.exec(`cp -r ${APP_FOLDER}/${file} ./${folderName}/`);
      log.info('copying: %s', file);
    }
  }
}

program.parse(process.argv);

if (process.argv.length === 2) {
  generateModule();
}
