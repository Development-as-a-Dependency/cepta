#!/usr/bin/env node
const fs = require('fs-extra');
const axios = require('axios');
const { exec } = require('child_process');

// if the args are create or c, create a new project
if (process.argv[2] === 'create' || process.argv[2] === 'c') {
  // if the project name is not specified, throw an error
  if (!process.argv[3]) {
    console.log("Please specify a project name. Example: cepta create <project name>");
    return;
  }
  var projectName = process.argv[3].toLowerCase();
  console.log("Creating new project " + projectName + "...");

  fs.copy(__dirname + '/bin', './', err =>{
    if (err) {
      console.log("Something went wrong when creating files.")
      return;
    }

    fs.readFile('package.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/"name": "project",/g, '"name": "' + projectName + '",');
    
      fs.writeFile('package.json', result, 'utf8', function (err) {
        if (err) return console.log(err);
        console.log('Installing packages...')
        exec('npm i', (err, stdout, stderr) => {
          if (err) {
            console.log("Something went wrong when installing packages. Please install them manually.")
            return;
          }
        });
        console.log("Project created successfully. You can now run 'npm start' to start the server.");
      });
    });
  });
} else if (process.argv[2] === '-help' || process.argv[2] === '-h') {
  console.log("Usage: cepta create <project name>");
} else if (process.argv[2] === '-version' || process.argv[2] === '-v') {
  axios.get('https://registry.npmjs.org/cepta')
  .then(function (response) {
    // get the version from package.json
    var version = require('./package.json').version;
    console.log("Installed Version: " + version);
    console.log("Latest Version: " + response.data['dist-tags'].latest);
  })
} else {
  console.log("The command you entered is not valid. Run 'cepta -help' for help.");
};