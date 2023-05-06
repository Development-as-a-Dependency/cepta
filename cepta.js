#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const { exec } = require("child_process");
const fs = require("fs-extra");

if (
  process.argv[2] == "--help" ||
  process.argv[2] == "-h" ||
  process.argv[1] == "-h" ||
  process.argv[1] == "--help"
) {
  console.log(chalk.blue("Cepta Help Menu:"));
  console.log(chalk.blue("    cepta"));
  console.log(chalk.blue("        Create a new project"));
  console.log(chalk.blue("        Questions:"));
  console.log(chalk.blue("            What is your project name?"));
  console.log(chalk.blue("                Default: myProject"));
  console.log(chalk.blue("            What type of project is this?"));
  console.log(chalk.blue("                Choices: Express"));
  console.log(chalk.blue("            What port shall this project run on?"));
  console.log(chalk.blue("                Default: 3000"));
  console.log(chalk.blue("    cepta --help / -h"));
  console.log(chalk.blue("        Show this help menu"));
  console.log(chalk.blue("    cepta --version / -v"));
  console.log(
    chalk.blue("        Check version of Cepta compared to latest version")
  );
  console.log(chalk.blue("    cepta --update / -u"));
  console.log(
    chalk.blue("        Update Cepta to the latest version from NPM")
  );
} else if (
  process.argv[2] == "--version" ||
  process.argv[2] == "-v" ||
  process.argv[1] == "-v" ||
  process.argv[1] == "--version"
) {
  var package = require(__dirname + "/package.json");
  var version = package.version;
  exec("npm view cepta version", (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.red("Error checking version"));
      console.log(error);
    }
    console.log(chalk.blue("Cepta version: " + version));
    console.log(chalk.blue("Latest version: " + stdout));
  });
} else if (
  process.argv[2] == "--update" ||
  process.argv[2] == "-u" ||
  process.argv[1] == "-u" ||
  process.argv[1] == "--update"
) {
  exec("npm install -g cepta", (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.red("Error updating Cepta"));
      console.log(error);
    }
    console.log(chalk.green("Cepta updated"));
  });
} else {
  inquirer
    .prompt([
      {
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        default: "myProject",
      },
      {
        type: "list",
        name: "projectScriptType",
        message: "What type of project is this?",
        choices: ["Express"],
      },
      {
        type: "input",
        name: "projectPort",
        message: "What port shall this project run on?",
        default: "3000",
      },
      {
        type: "confirm",
        name: "directory",
        message: "Would you like to create this project in a new directory?",
      },
      {
        type: "confirm",
        name: "project",
        message: "Are you sure you want to create this project?",
      },
    ])
    .then((answers) => {
      if (answers.project) {
        answers.projectName = answers.projectName
          .replace(/\s(.)/g, function ($1) {
            return $1.toUpperCase();
          })
          .replace(/\s/g, "")
          .replace(/^(.)/, function ($1) {
            return $1.toLowerCase();
          });

        console.clear();
        console.log(chalk.blue("Creating project..."));
        if (answers.directory) {
          fs.mkdirSync(answers.projectName);
          fs.copySync(__dirname + "/bin", `./${answers.projectName}`);
        } else {
          fs.copySync(__dirname + "/bin", `./`);
        }
        console.clear();
        console.log(chalk.green("Project created"));
        console.log(chalk.blue("Installing dependencies..."));
        var exec1;
        if (answers.directory) {
          exec1 = `cd ${answers.projectName} && npm install`;
        } else {
          exec1 = `npm install`;
        }
        exec(exec1, (error, stdout, stderr) => {
          if (error) {
            console.clear();
            console.log(chalk.green("Project created"));
            console.log(chalk.red("Error installing dependencies"));
            console.log(error);
            process.exit(1);
          }
          console.clear();
          console.log(chalk.green("Project created"));
          console.log(chalk.green("Dependencies installed"));
          console.log(chalk.blue("Creating project files..."));
          if (answers.directory) {
            fs.renameSync(
              `./${answers.projectName}/bin/www`,
              `./${answers.projectName}/bin/${answers.projectName}`
            );
            fs.renameSync(
              `./${answers.projectName}/.env.example`,
              `./${answers.projectName}/.env`
            );
          } else {
            fs.renameSync(`./bin/www`, `./bin/${answers.projectName}`);
            fs.renameSync(`./.env.example`, `./.env`);
          }
          var readfile1;
          if (answers.directory) {
            readfile1 = `./${answers.projectName}/.env`;
          } else {
            readfile1 = `./.env`;
          }
          fs.readFile(readfile1, "utf8", function (err, data) {
            if (err) {
              console.log(err);
              process.exit(1);
            }
            var result = data.replace(/3000/g, answers.projectPort);
            var writefile;
            if (answers.directory) {
              writefile = `./${answers.projectName}/.env`;
            } else {
              writefile = `./.env`;
            }
            fs.writeFile(writefile, result, "utf8", function (err) {
              if (err) {
                console.log(err);
                process.exit(1);
              }
              var readfile2;
              if (answers.directory) {
                readfile2 = `./${answers.projectName}/package.json`;
              } else {
                readfile2 = `./package.json`;
              }
              fs.readFile(readfile2, "utf8", function (err, data) {
                if (err) {
                  console.log(err);
                  process.exit(1);
                }
                var result = data.replace(
                  /"start": "nodemon .\/bin\/www"/g,
                  `"start": "nodemon .\/bin\/${answers.projectName}"`
                );
                var writefile2;
                if (answers.directory) {
                  writefile2 = `./${answers.projectName}/package.json`;
                } else {
                  writefile2 = `./package.json`;
                }
                fs.writeFile(writefile2, result, "utf8", function (err) {
                  if (err) {
                    console.log(err);
                    process.exit(1);
                  }
                  var readfile3;
                  if (answers.directory) {
                    readfile3 = `./${answers.projectName}/bin/${answers.projectName}`;
                  } else {
                    readfile3 = `./bin/${answers.projectName}`;
                  }
                  fs.readFile(readfile3, "utf8", function (err, data) {
                    if (err) {
                      console.log(err);
                      process.exit(1);
                    }
                    var result = data.replace(
                      /"name": "project"/g,
                      `"name": "${answers.projectName}"`
                    );
                    var writefile3;
                    if (answers.directory) {
                      writefile3 = `./${answers.projectName}/bin/${answers.projectName}`;
                    } else {
                      writefile3 = `./bin/${answers.projectName}`;
                    }
                    fs.writeFile(writefile3, result, "utf8", function (err) {
                      if (err) {
                        console.log(err);
                        process.exit(1);
                      }
                      var readfile4;
                      if (answers.directory) {
                        readfile4 = `./${answers.projectName}/bin/${answers.projectName}`;
                      } else {
                        readfile4 = `./bin/${answers.projectName}`;
                      }

                      fs.readFile(readfile4, "utf8", function (err, data) {
                        if (err) {
                          console.log(err);
                          process.exit(1);
                        }
                        var result = data.replace(
                          /var httpport = normalizePort\(process.env.PORT \|\| '80'\);/g,
                          `var httpport = normalizePort(process.env.PORT || '${answers.projectPort}');`
                        );
                        var writefile4;
                        if (answers.directory) {
                          writefile4 = `./${answers.projectName}/bin/${answers.projectName}`;
                        } else {
                          writefile4 = `./bin/${answers.projectName}`;
                        }
                        fs.writeFile(
                          writefile4,
                          result,
                          "utf8",
                          function (err) {
                            if (err) {
                              console.log(err);
                              process.exit(1);
                            }
                            console.clear();
                            console.log(
                              chalk.green(
                                "🔥 Your project has been created successfully"
                              )
                            );
                            console.log(" ");
                            console.log(
                              "To to start your project on port " +
                                answers.projectPort +
                                ", run the following command:"
                            );
                            if (answers.directory) {
                              console.log(
                                chalk.blue(
                                  `cd ${answers.projectName} && npm start`
                                )
                              );
                            } else {
                              console.log(chalk.blue(`npm start`));
                            }
                            console.log(" ");
                            console.log(
                              "To start building the CSS for your project, run the following command:"
                            );
                            if (answers.directory) {
                              console.log(
                                chalk.blue(
                                  `cd ${answers.projectName} && npm run build`
                                )
                              );
                            } else {
                              console.log(chalk.blue(`npm run build`));
                            }
                            console.log(" ");
                            console.log(
                              chalk.green("Created with CEPTA CLI by Ted")
                            );
                            var exec6;
                            if (answers.directory) {
                              exec6 = `code ${answers.projectName}`;
                            } else {
                              exec6 = `code .`;
                            }
                            exec(exec6, (error, stdout, stderr) => {
                              if (error) {
                                console.log(error);
                                process.exit(1);
                              }
                              exec(
                                `npm i -g nodemon`,
                                (error, stdout, stderr) => {
                                  if (error) {
                                    console.log(error);
                                    process.exit(1);
                                  }
                                }
                              );
                            });
                          }
                        );
                      });
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        console.log(chalk.red("Aborting project creation..."));
        process.exit(1);
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(
          chalk.red("Prompt couldn't be rendered in the current environment")
        );
      } else {
        console.log(chalk.red("Something has gone wrong"));
        console.log(error);
        console.log("test");
      }
    });
}
