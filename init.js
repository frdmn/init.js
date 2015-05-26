#!/usr/bin/env node

var clor = require('clor')
  , sh = require('shelljs')
  , inquirer = require('inquirer')
  , glob = require('glob')
  , gitConfig = require('git-config')
  , path = require('path')
  , config = gitConfig.sync();

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

  if (sh.test('-e', cwd + '/.gits')) {
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
  glob(__dirname + '/readmes/*', function (er, readmes) {
    var readmeNames = readmes.map(function(readme){
      return readme.replace(__dirname + '/readmes/', '').replace('_', ' ');
    });
    callback(readmeNames);
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
  glob(__dirname + '/licenses/*', function (er, licenses) {
    var licenseNames = licenses.map(function(license){
      return license.replace(__dirname + '/licenses/', '').replace('_', ' ');
    });
    callback(licenseNames);
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
    getAllPossibleLicenses(function(licenses){
      assets.readmes = readmes;
      assets.licenses = licenses;
      callback(assets);
    });
  });
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
  readmes.push('✘ none');
  licenses.push(new inquirer.Separator());
  licenses.push('✘ none');

  inquirer.prompt([
    {
      type: 'input',
      name: 'project',
      message: 'Name of your project?',
      default: path.basename(sh.pwd()),
    },
    {
      type: 'input',
      name: 'maintainer',
      message: 'Who maintains the project?',
      default: config.user.name,
    },
    {
      type: 'list',
      name: 'readme',
      message: 'Do you want me to create a base README.md?',
      choices: readmes
    },
    {
      type: 'list',
      name: 'license',
      message: 'Which license do you want to use?',
      choices: licenses,
    },
    {
      type: 'confirm',
      name: 'gitinit',
      message: 'Want me to initialize a git repository?',
      default: true
    }
  ], function( answers ) {
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
  console.log(clor.red('Error: ') + msg);
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
  console.log(clor.green('Success: ') + msg);
}

/* Prompt */

if (checkIfCwdIsGitRepository()) {
  logError('Current directory is already an exisiting git repository!');
  return false;
} else {
  loadAssets(function(assets) {
    loadPrompt(assets.readmes, assets.licenses, function(answers){
      var date = new Date();
      sh.cp('-f', __dirname + '/readmes/' + answers.readme, 'README.md');
      sh.cp('-f', __dirname + '/licenses/' + answers.license, 'LICENSE');
      sh.sed('-i', '%project%', answers.project, 'README.md');
      sh.sed('-i', '%project%', answers.project, 'LICENSE');
      sh.sed('-i', '%maintainer%', answers.maintainer, 'README.md');
      sh.sed('-i', '%maintainer%', answers.maintainer, 'LICENSE');
      sh.sed('-i', '%year%', date.getFullYear(), 'README.md');
      sh.sed('-i', '%year%', date.getFullYear(), 'LICENSE');
      sh.sed('-i', '%license%', answers.license.toUpperCase(), 'README.md');
      sh.sed('-i', '%license%', answers.license.toUpperCase(), 'LICENSE');
      if (config.github && config.github.user) {
        sh.sed('-i', '%github%', config.github.user, 'README.md');
        sh.sed('-i', '%github%', config.github.user, 'LICENSE');
      } else {
        sh.sed('-i', '%github%', '[GitHubUsername]', 'README.md');
        sh.sed('-i', '%github%', '[GitHubUsername]', 'LICENSE');
      }
      if (answers.gitinit) {
        sh.exec('git init', {
          silent: true
        });
      }
      logSuccess('Workspace successfully set up! Don\'t forget to adjust the mising placeholders :)');
    });
  });
}
