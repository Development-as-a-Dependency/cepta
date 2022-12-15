#!/usr/bin/env node
const fs = require('fs-extra');
const { exec } = require('child_process');

console.log("Creating new project...");

fs.copy(__dirname + '/bin', './', err =>{
  if (err) {
    console.log("Something went wrong when creating files.")
    return;
  }
  console.log('Installing packages...')
  exec('npm i', (err, stdout, stderr) => {
    if (err) {
      console.log("Something went wrong when installing packages. Please install them manually.")
      return;
    }
  });
});