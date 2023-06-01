#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const { exec } = require("child_process");
const fse = require("fs-extra");
const fs = require("fs")

switch (process.argv.filter(v => v.startsWith("-"))[0]) {
    case '--help':
    case '-h':
        return console.log(chalk.blue`${fs.readFileSync(`${__dirname}/src/helpmsg`).toString()}`);
    case '--version':
    case '-v':
        return exec("npm view cepta version", (error, stdout, _) => (error) ? console.log(chalk.red`Error checking version\n${error}`) : console.log(chalk.blue`Cepta version: ${require(`${__dirname}/package.json`).version}\nLatest version: ${stdout}`));
    case '--update':
    case '-u':
        return exec("npm install -g cepta", (error, ..._) => (error) ? console.log(chalk`{red Error Updating Cepta}\n${error}`) : console.log(chalk.green("Cepta updated")));
    default:
        const errorhandler = (error) => { console.log(error); process.exit(1) }
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
                        .replace(/\s(.)/g, ((s) => s.toUpperCase()))
                        .replace(/\s/g, "")
                        .replace(/^(.)/, ((s) => s.toLowerCase()));
                    console.clear();
                    console.log(chalk.blue`Creating project...`);
                    if (answers.directory) fse.mkdirSync(answers.projectName);
                    fse.copySync(__dirname + "/bin", `./${(answers.directory) ? answers.projectName : ''}`);
                    console.clear();
                    console.log(chalk.green`Project created`);
                    console.log(chalk.blue`Installing dependencies...`);
                    exec((answers.directory) ? `cd ${answers.projectName} && npm install` : `npm install`, (error, ..._) => {
                        if (error) {
                            console.clear();
                            console.log(chalk.green`Project created`);
                            console.log(chalk.red`Error installing dependencies`);
                            errorhandler(error)
                        }
                        console.clear();
                        console.log(chalk.green`Project created`);
                        console.log(chalk.green`Dependencies installed`);
                        console.log(chalk.blue`Creating project files...`);
                        fse.renameSync(`./${(answers.directory) ? `${answers.projectName}/` : ''}bin/www`, `./${(answers.directory) ? `${answers.projectName}/` : ''}bin/${answers.projectName}`);
                        fse.renameSync(`./${(answers.directory) ? `${answers.projectName}/` : ''}.env.example`, `./${(answers.directory) ? `${answers.projectName}/` : ''}.env`);
                        fse.readFile((answers.directory) ? `./${answers.projectName}/.env` : `./.env`, "utf8", function (err, data) {
                            if (err) errorhandler(err)
                            fse.writeFile((answers.directory) ? `./${answers.projectName}/.env` : `./.env`, data.replace(/3000/g, answers.projectPort), "utf8", function (err) {
                                if (err) errorhandler(err)
                            });
                        });
                        fse.readFile((answers.directory) ? `./${answers.projectName}/package.json` : `./package.json`, "utf8", function (err, data) {
                            if (err) errorhandler(err)
                            fse.writeFile((answers.directory) ? `./${answers.projectName}/package.json` : `./package.json`, data.replace(/"start": "nodemon .\/bin\/www"/g, `"start": "nodemon .\/bin\/${answers.projectName}"`), "utf8", function (err) {
                                if (err) errorhandler(err)
                            });
                        });
                        fse.readFile((answers.directory) ? `./${answers.projectName}/bin/${answers.projectName}` : `./bin/${answers.projectName}`, "utf8", function (err, data) {
                            if (err) errorhandler(err)
                            fse.writeFile((answers.directory) ? `./${answers.projectName}/bin/${answers.projectName}` : `./bin/${answers.projectName}`, data.replace(/"name": "project"/g, `"name": "${answers.projectName}"`), "utf8", function (err) {
                                if (err) errorhandler(err)
                            });
                        });
                        fse.readFile((answers.directory) ? `./${answers.projectName}/bin/${answers.projectName}` : `./bin/${answers.projectName}`, "utf8", function (err, data) {
                            if (err) errorhandler(err)
                            fse.writeFile(
                                (answers.directory) ? `./${answers.projectName}/bin/${answers.projectName}` : `./bin/${answers.projectName}`,
                                data.replace(/var httpport = normalizePort\(process.env.PORT \|\| '80'\);/g, `var httpport = normalizePort(process.env.PORT || '${answers.projectPort}');`),
                                "utf8",
                                (err) => (err) ? errorhandler(err) : undefined
                            );

                        });
                        console.clear();
                        console.log(chalk.green`🔥 Your project has been created successfully`);
                        console.log(" ");
                        console.log(`To to start your project on port ${answers.projectPort}, run the following command:\n${chalk.blue`${(answers.directory) ? `cd ${answers.projectName} && ` : ''}npm start`}`);
                        console.log(" ");
                        console.log(`To start building the CSS for your project, run the following command:\n${chalk.blue`${(answers.directory) ? `cd ${answers.projectName} && ` : ''}npm run build`}`);
                        console.log(" ");
                        console.log(chalk.green`Created with CEPTA CLI by DAAD`)
                        exec((answers.directory) ? `code ${answers.projectName}` : `code .`, (error, ..._) => {
                            if (error) errorhandler(error)
                        });
                        exec(
                            `npm i -g nodemon`,
                            (error, ..._) => {
                                if (error) errorhandler(error)
                            }
                        );
                    });
                } else {
                    console.log(chalk.red`Aborting project creation...`);
                    process.exit(1);
                }
            })
            .catch((error) => {
                if (error.isTtyError) return console.log(chalk.red`Prompt couldn't be rendered in the current environment`);
                console.log(chalk.red`Something has gone wrong`);
                console.log(error);
                console.log("test");
            });
        break;
}