#!/usr/bin/env node

var $ = require("clor")
  , sh = require("shelljs")
  , inquirer = require('inquirer')
  , glob = require("glob")
  , gitConfig = require('git-config')
  , path = require('path');

var config = gitConfig.sync();

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
      message: 'Who\'s maintaining the project?',
      default: config.user.name,
    },
    {
      type: 'list',
      name: 'readme',
      message: 'Do you want me to create a README.md template?',
      choices: readmes
    },
    {
      type: 'list',
      name: 'license',
      message: 'Which license do you want to use?',
      choices: licenses,
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
  console.log($.red('Error: ') + msg);
}

/* Prompt */

if (checkIfCwdIsGitRepository()) {
  logError('Current directory is already an exisiting git repository!');
  return false;
} else {
  loadAssets(function(assets) {
    loadPrompt(assets.readmes, assets.licenses, function(answers){
      console.log(answers);
    });
  });
}
