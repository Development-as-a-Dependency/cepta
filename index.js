import inquirer from "inquirer";
import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs-extra";
import axios from "axios";

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
      fs.mkdirSync(answers.projectName);
      fs.copySync("./bin", `./${answers.projectName}`);
      console.clear();
      console.log(chalk.green("Project created"));
      console.log(chalk.blue("Installing dependencies..."));
      exec(
        `cd ${answers.projectName} && npm install`,
        (error, stdout, stderr) => {
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
          fs.renameSync(
            `./${answers.projectName}/bin/www`,
            `./${answers.projectName}/bin/${answers.projectName}`
          );
          fs.renameSync(
            `./${answers.projectName}/.env.example`,
            `./${answers.projectName}/.env`
          );
          fs.readFile(
            `./${answers.projectName}/.env`,
            "utf8",
            function (err, data) {
              if (err) {
                console.log(err);
                process.exit(1);
              }
              var result = data.replace(/3000/g, answers.projectPort);
              fs.writeFile(
                `./${answers.projectName}/.env`,
                result,
                "utf8",
                function (err) {
                  if (err) {
                    console.log(err);
                    process.exit(1);
                  }
                  fs.readFile(
                    `./${answers.projectName}/package.json`,
                    "utf8",
                    function (err, data) {
                      if (err) {
                        console.log(err);
                        process.exit(1);
                      }
                      var result = data.replace(
                        /"start": "nodemon .\/bin\/www"/g,
                        `"start": "nodemon .\/bin\/${answers.projectName}"`
                      );
                      fs.writeFile(
                        `./${answers.projectName}/package.json`,
                        result,
                        "utf8",
                        function (err) {
                          if (err) {
                            console.log(err);
                            process.exit(1);
                          }
                          fs.readFile(
                            `./${answers.projectName}/package.json`,
                            "utf8",
                            function (err, data) {
                              if (err) {
                                console.log(err);
                                process.exit(1);
                              }
                              var result = data.replace(
                                /"name": "project"/g,
                                `"name": "${answers.projectName}"`
                              );
                              fs.writeFile(
                                `./${answers.projectName}/package.json`,
                                result,
                                "utf8",
                                function (err) {
                                  if (err) {
                                    console.log(err);
                                    process.exit(1);
                                  }
                                  fs.readFile(
                                    `./${answers.projectName}/bin/${answers.projectName}`,
                                    "utf8",
                                    function (err, data) {
                                      if (err) {
                                        console.log(err);
                                        process.exit(1);
                                      }
                                      var result = data.replace(
                                        /var httpport = normalizePort\(process.env.PORT \|\| '80'\);/g,
                                        `var httpport = normalizePort(process.env.PORT || '${answers.projectPort}');`
                                      );
                                      fs.writeFile(
                                        `./${answers.projectName}/bin/${answers.projectName}`,
                                        result,
                                        "utf8",
                                        function (err) {
                                          if (err) {
                                            console.log(err);
                                            process.exit(1);
                                          }
                                          console.clear();
                                          console.log(
                                            chalk.green("Project created")
                                          );
                                          console.log(
                                            chalk.green(
                                              "Dependencies installed"
                                            )
                                          );
                                          console.log(
                                            chalk.green("Project files created")
                                          );
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
                                          console.log(
                                            chalk.blue(
                                              `cd ${answers.projectName} && npm start`
                                            )
                                          );
                                          console.log(" ");
                                          console.log(
                                            "To start building the CSS for your project, run the following command:"
                                          );
                                          console.log(
                                            chalk.blue(
                                              `cd ${answers.projectName} && npm run build`
                                            )
                                          );
                                          console.log(" ");
                                          console.log(
                                            chalk.green(
                                              "Created with CEPTA CLI by Ted"
                                            )
                                          );
                                          exec(
                                            `cd ${answers.projectName}`,
                                            (error, stdout, stderr) => {
                                              if (error) {
                                                console.log(error);
                                                process.exit(1);
                                              }
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
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
    }
  });
