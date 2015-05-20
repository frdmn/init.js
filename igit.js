#!/usr/bin/env node

var $ = require("clor")
  , sh = require("shelljs")
  , inquirer = require('inquirer')
  , argv = require('optimist')
    .usage('Usage: $0')
    .argv;

function checkIfCwdIsGitRepository(){
  var cwd = sh.pwd();

  if (sh.test('-e', cwd + '/.git')) {
    return true;
  } else {
    return false;
  }
}

function loadPrompt(){
  inquirer.prompt([
    {
      type: "list",
      name: "theme",
      message: "What do you want to do?",
      choices: [
        "Order a pizza",
        "Make a reservation",
        new inquirer.Separator(),
        "Ask opening hours",
        "Talk to the receptionnist"
      ]
    },
    {
      type: "list",
      name: "size",
      message: "What size do you need",
      choices: [ "Jumbo", "Large", "Standard", "Medium", "Small", "Micro" ],
      filter: function( val ) { return val.toLowerCase(); }
    }
  ], function( answers ) {
      console.log( JSON.stringify(answers, null, "  ") );
    });
}

function logError(msg){
  console.log($.red('Error: ') + msg);
}

/*
 * Logic
 */

if (checkIfCwdIsGitRepository()) {
  logError('Current directory is already an exisiting git repository!');
  return false;
} else {
  loadPrompt();
}
