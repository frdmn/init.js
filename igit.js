#!/usr/bin/env node

var $ = require("clor")
  , sh = require("shelljs")
  , inquirer = require('inquirer')
  , glob = require("glob");

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
 * loadReadmePrompt
 *
 * Loads the readme prompt. Accepts array containing paths to readmes.
 *
 * @param {array} readmes [array containing paths to readmes]
 *
 */

function loadReadmePrompt(readmes, callback){
  // extend readmes array
  readmes.push(new inquirer.Separator());
  readmes.push('none');

  inquirer.prompt([
    {
      type: 'list',
      name: 'readme',
      message: 'Do you want me to create a README.md template?',
      choices: readmes
    }
  ], function( answers ) {
    callback(answers);
  });
}

/**
 * loadLicensePrompt
 *
 * Loads the licenses prompt. Accepts array containing paths to readmes.
 *
 * @param {array} licenses [array containing paths to readmes]
 *
 */

function loadLicensePrompt(licenses, callback){
  // extend licenses array
  licenses.push(new inquirer.Separator());
  licenses.push('none');

  inquirer.prompt([
    {
      type: 'list',
      name: 'license',
      message: 'Which license do you want to use?',
      choices: licenses,
      filter: function( val ) { return val.toLowerCase(); }
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
    loadReadmePrompt(assets.readmes, function(readmeAnswer){
      loadLicensePrompt(assets.licenses, function(licenseAnswer){
        console.log(readmeAnswer);
        console.log(licenseAnswer);
      });
    });
  });
}
