#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const { promisify } = require("util");
const execAsync = promisify(require("child_process").exec);
const fs = require("fs-extra");
const path = require("path");

(async () => {
  try {
    const arg = process.argv.find((v) => v.startsWith("-"));

    switch (arg) {
      case "--help":
      case "-h":
        return console.log(
          chalk.blue`${fs
            .readFileSync(path.join(__dirname, "/src/helpmsg"))
            .toString()}`
        );

      case "--version":
      case "-v":
        const { stdout } = await execAsync("npm view cepta version");
        const ceptaVersion = require(`${__dirname}/package.json`).version;
        console.log(
          chalk.blue`Cepta version: ${ceptaVersion}\nLatest version: ${stdout}`
        );
        break;

      case "--update":
      case "-u":
        await execAsync("npm install -g cepta");
        console.log(chalk.green("Cepta updated"));
        break;

      default:
        const answers = await inquirer.prompt([
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
            message:
              "Would you like to create this project in a new directory?",
          },
          {
            type: "confirm",
            name: "project",
            message: "Are you sure you want to create this project?",
          },
        ]);

        if (answers.project) {
          answers.projectName = answers.projectName
            .replace(/\s(.)/g, (s) => s.toUpperCase())
            .replace(/\s/g, "")
            .replace(/^(.)/, (s) => s.toLowerCase());

          console.clear();
          console.log(chalk.blue`Creating project...`);
          // check direcotry hasnt alredy been made
          if (answers.directory) {
            if (await fs.pathExists(answers.projectName)) {
              console.log(chalk.red`Directory already exists`);
              process.exit(1);
            }
          }
          if (answers.directory) await fs.mkdir(answers.projectName);
          await fs.copy(
            path.join(__dirname, "/bin"),
            `./${answers.directory ? answers.projectName : ""}`
          );
          console.clear();
          console.log(chalk.green`Project created`);
          console.log(chalk.blue`Installing dependencies...`);
          await execAsync(
            answers.directory
              ? `cd ${answers.projectName} && npm install`
              : `npm install`
          );

          console.clear();
          console.log(chalk.green`Project created`);
          console.log(chalk.blue`Dependencies installed`);
          console.log(chalk.blue`Creating project files...`);

          await Promise.all([
            fs.rename(
              `./${
                answers.directory ? `${answers.projectName}/` : ""
              }bin/www.js`,
              `./${answers.directory ? `${answers.projectName}/` : ""}bin/${
                answers.projectName
              }.js`
            ),
            fs.rename(
              `./${
                answers.directory ? `${answers.projectName}/` : ""
              }.env.example`,
              `./${answers.directory ? `${answers.projectName}/` : ""}.env`
            ),
          ]);

          const envPath = answers.directory
            ? `./${answers.projectName}/.env`
            : `./.env`;
          const packageJsonPath = answers.directory
            ? `./${answers.projectName}/package.json`
            : `./package.json`;

          const [envContent, packageJsonContent] = await Promise.all([
            fs.readFile(envPath, "utf8"),
            fs.readFile(packageJsonPath, "utf8"),
          ]);

          await Promise.all([
            fs.writeFile(
              envPath,
              envContent.replace(/3000/g, answers.projectPort),
              "utf8"
            ),
            fs.writeFile(
              packageJsonPath,
              packageJsonContent.replace(
                /"start": "nodemon .\/bin\/www"/g,
                `"start": "nodemon .\/bin\/${answers.projectName}"`
              ),
              "utf8"
            ),
          ]);

          const binFileContent = await fs.readFile(
            `./${
              answers.directory
                ? `${answers.projectName}/bin/${answers.projectName}.js`
                : `./bin/${answers.projectName}.js`
            }`,
            "utf8"
          );
          await fs.writeFile(
            `./${
              answers.directory
                ? `${answers.projectName}/bin/${answers.projectName}.js`
                : `./bin/${answers.projectName}.js`
            }`,
            binFileContent.replace(
              /const DEFAULT_PORT = '3000';/g,
              `const DEFAULT_PORT = '${answers.projectPort}';`
            ),
            "utf8"
          );
        }
        break;
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
