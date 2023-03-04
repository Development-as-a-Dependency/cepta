#!/usr/bin/env node
const fs = require("fs-extra");
const axios = require("axios");
const { exec } = require("child_process");
const chalk = require("chalk");

// if the args are create or c, create a new project
if (process.argv[2] === "create" || process.argv[2] === "c") {
  // if the project name is not specified, throw an error
  if (!process.argv[3]) {
    console.log(chalk.red("Please specify a project name."));
    return;
  }
  var projectName = process.argv[3].toLowerCase();
  console.log(chalk.blue("Creating project..."));
  fs.copy(__dirname + "/bin", "./", (err) => {
    if (err) {
      console.log(chalk.red("Something went wrong when creating the project."));
      return;
    }

    fs.readFile("package.json", "utf8", function (err, data) {
      if (err) {
        return console.log(chalk.red(err));
      }
      var result = data.replace(
        /"name": "project",/g,
        '"name": "' + projectName + '",'
      );

      fs.writeFile("package.json", result, "utf8", function (err) {
        if (err) return console.log(chalk.red(err));
        console.log(chalk.blue("Installing packages..."));
        exec("npm i", (err, stdout, stderr) => {
          if (err) {
            console.log(
              chalk.red("Something went wrong when installing packages.")
            );
            return;
          }
        });
        console.log(chalk.green("Project created successfully!"));
      });
    });
  });
} else if (process.argv[2] === "help" || process.argv[2] === "h") {
  console.log("Usage: cepta <command> <options>");
  console.log("Commands:");
  console.log("  create, c: Create a new project");
  console.log("    Options:");
  console.log("      <project name>: The name of the project");
  console.log("    Examples:");
  console.log("      cepta create banking-app-project");
  console.log("      cepta c silly-game-project");
  console.log("  version, v: Check the version of cepta");
  console.log("    Examples:");
  console.log("      cepta version");
  console.log("      cepta v");
  console.log("  help, h: Show this help message");
  console.log("    Examples:");
  console.log("      cepta help");
  console.log("      cepta h");
  console.log("  update, u: Update cepta");
  console.log("    Examples:");
  console.log("      cepta update");
  console.log("      cepta u");
} else if (process.argv[2] === "version" || process.argv[2] === "v") {
  axios.get("https://registry.npmjs.org/cepta").then(function (response) {
    // get the version from package.json
    var version = require("./package.json").version;
    console.log(chalk.yellow("Current Version: " + version));
    console.log(
      chalk.yellow("Latest Version: " + response.data["dist-tags"].latest)
    );
  });
} else if (process.argv[2] === "update" || process.argv[2] === "u") {
  console.log(chalk.blue("Updating cepta..."));
  exec("npm i -g cepta", (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red("Something went wrong when updating cepta."));
      return;
    }
    console.log(chalk.green("Cepta updated successfully!"));
  });
} else {
  console.log(chalk.red("Invalid command."));
  console.log("Use 'cepta help' to see the list of commands.");
}
