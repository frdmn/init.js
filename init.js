#!/usr/bin/env node

var turbocolor = require('turbocolor')
  , sh = require('shelljs')
  , inquirer = require('inquirer')
  , glob = require('glob')
  , gitConfig = require('git-config')
  , path = require('path')
  , replace = require('replace')
  , optimist = require('optimist')
  , pjson = require('./package.json')
  , config = gitConfig.sync();

// Store file path for custom templates
var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME
    , customReadmes = path.join(homedir, '.initjs/readmes')
    , customLicenses = path.join(homedir, '.initjs/licenses');

// Construct arguments expections
var argv = optimist
    .usage('Usage: init [options]')

    .alias('h', 'help')
    .describe('h', 'Show help and usage information')
    .boolean('h')

    .alias('v', 'version')
    .default('v', false)
    .describe('v', 'Display version information')

    .alias('i', 'ignore-git')
    .default('i', false)
    .describe('i', 'Ignore existing .git folder in the current directory, can be true or false')
    .boolean('i')

    .argv;

// Check if 'help' argument is set, show usage/help information
if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}

// Check if 'version' argument is set, show version
if (argv.version) {
    console.log(pjson.version);
    process.exit(0);
}

/**
 * checkIfCwdIsGitRepository
 *
 * Checks if current working directory contains git repo.
 *
 * @return {boolean}
 *
 */

function checkIfCwdIsGitRepository(){
  var cwd = sh.pwd();

  if (sh.test('-e', cwd + '/.git')) {
    return true;
  } else {
    return false;
  }
}

/**
 * getAllPossibleReadmes
 *
 * Catches all files in /readmes folder and passes array
 * to callback function.
 *
 * @param {Function} callback
 *
 */

function getAllPossibleReadmes(callback){
  glob(path.join(__dirname, 'readmes', '*'), function (er, readmes) {
    // Get possible custom readmes
    glob(path.join(customReadmes, '*'), function (er, customReadmes) {
      callback(readmes.concat(customReadmes));
    });
  });
}

/**
 * getAllPossibleLicenses
 *
 * Catches all files in /licenses folder and passes array
 * to callback function.
 *
 * @param  {Function}
 */

function getAllPossibleLicenses(callback){
  glob(path.join(__dirname, 'licenses', '*'), function (er, licenses) {
    // Get possible custom licenses
    glob(path.join(customLicenses, '*'), function (er, customLicenses) {
      callback(licenses.concat(customLicenses));
    });
  });
}

/**
 * loadAssets
 *
 * Loads readmes and assets and returns passes data
 * to callback function.
 *
 * @param  {Function}
 */

function loadAssets(callback){
  var assets = {};
  getAllPossibleReadmes(function(readmes) {
    getAllPossibleLicenses(function(licenses) {
      assets.readmes = readmes;
      assets.licenses = licenses;
      callback(assets);
    });
  });
}

/**
 * createChoisesArray
 *
 * Turns an input array (full of paths), into an array
 * that contains objects so Inquirer.js can work with
 *
 * @param  array input
 * @return array
 */

function createChoisesArray(input){
  var output = input.map(function(readme) {
    var choiceObject = [];
    choiceObject.name = path.basename(readme.toString()).replace('_', ' ');
    choiceObject.value = readme;
    return choiceObject;
  });
  return output;
}

/**
 * loadPrompt
 *
 * Loads the pretty InquirerJS prompt. Accepts array containing paths
 * to readmes as well as a array containing paths to licenses.
 *
 * @param {array} readmes [array containing paths to readmes]
 * @param {array} licenses [array containing paths to licenses]
 *
 */

function loadPrompt(readmes, licenses, callback){
  // extend arrays
  readmes.push(new inquirer.Separator());
  readmes.push('none');
  licenses.push(new inquirer.Separator());
  licenses.push('none');

  inquirer.prompt([
    {
      type: 'input'
      , name: 'project'
      , message: 'Name of your project?'
      , default: path.basename(sh.pwd().toString())
    }
    ,{
      type: 'input'
      , name: 'maintainer'
      , message: 'Who maintains the project?'
      , default: config.user.name
    }
    , {
      type: 'list'
      , name: 'readme'
      , message: 'Do you want me to create a base README.md?'
      , choices: createChoisesArray(readmes)
    }
    , {
      type: 'list'
      , name: 'license'
      , message: 'Which license do you want to use?'
      , choices: createChoisesArray(licenses)
    }
    , {
      type: 'confirm'
      , name: 'gitinit'
      , message: 'Want me to initialize a git repository?'
      , default: true
    }
  ]).then(answers => {
    callback(answers);
  });
}

/**
 * logError
 *
 * Logs errormessages in red.
 *
 * @param {string} msg
 *
 */

function logError(msg){
  console.log(turbocolor.red('Error: ') + msg);
}

/**
 * logSuccess
 *
 * Logs success messages in green.
 *
 * @param {string} msg
 *
 */

function logSuccess(msg){
  console.log(turbocolor.green('Success: ') + msg);
}


/**
 * replaceInFiles
 *
 * Function to substitute a bunch of files at once.
 *
 * @param {string} regex search pattern
 * @param {string} replacement string
 * @param {string} array of files
 *
 */

function replaceInFiles(searchFor, replaceWith, filesToWorkWith){
  replace({
    regex: searchFor
    , replacement: replaceWith
    , paths: filesToWorkWith
    , silent: true
  });
}

/* Prompt */

if (!argv['ignore-git'] && checkIfCwdIsGitRepository()) {
  logError('Current directory is already an exisiting git repository!');
  return false;
} else {
  loadAssets(function(assets) {
    loadPrompt(assets.readmes, assets.licenses, function(answers) {
      var date = new Date()
      , filesToProcess = [];

      if (answers.license && answers.license !== 'none') {
        sh.cp('-f', answers.license, 'LICENSE');
        filesToProcess.push('./LICENSE')
      }

      if (answers.license && answers.readme !== 'none') {
        sh.cp('-f', answers.readme, 'README.md');
        filesToProcess.push('./README.md')
      }

      // Substitute placeholder
      replaceInFiles('%project%', answers.project, filesToProcess );
      replaceInFiles('%maintainer%', answers.maintainer, filesToProcess );
      replaceInFiles('%year%', date.getFullYear(), filesToProcess );
      replaceInFiles('%license%', path.basename(answers.license).replace('_', ' ').toUpperCase(), filesToProcess );
      // Check if github username is set in .gitconfig
      if (config.github && config.github.user) {
        replaceInFiles('%github%', config.github.user, filesToProcess );
      } else {
        // Otherwise add manual placeholder
        replaceInFiles('%github%', '[GitHubUsername]', filesToProcess );
      }
      // Optionally init git repo
      if (answers.gitinit) {
        sh.exec('git init', {
          silent: true
        });
      }
      logSuccess('Workspace successfully set up! Don\'t forget to adjust the missing placeholders :)');
    });
  });
}
