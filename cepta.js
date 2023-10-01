#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import { exec as execAsync } from "child_process";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory name of the current module using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const spinner = ora();
  try {
    const arg = process.argv.find((v) => v.startsWith("-"));

    switch (arg) {
      case "--help":
      case "-h":
        const helpMsg = fs
          .readFileSync(path.join(__dirname, "/src/helpmsg"))
          .toString();
        console.log(chalk.blue`${helpMsg}`);
        break;

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
        spinner.start(chalk.blue("Updating Cepta..."));
        await execAsync("npm install -g cepta");
        spinner.succeed(chalk.green("Cepta updated"));
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
          const start = Date.now();
          answers.projectName = answers.projectName
            .replace(/\s(.)/g, (s) => s.toUpperCase())
            .replace(/\s/g, "")
            .replace(/^(.)/, (s) => s.toLowerCase());

          console.clear();
          spinner.start(chalk.blue("Creating project..."));
          if (answers.directory) {
            if (await fs.pathExists(answers.projectName)) {
              spinner.fail(chalk.red("Directory already exists"));
              process.exit(1);
            }
          }
          if (answers.directory) await fs.mkdir(answers.projectName);
          await fs.copy(
            path.join(__dirname, "/bin"),
            `./${answers.directory ? answers.projectName : ""}`
          );
          spinner.succeed(chalk.green("Project created"));
          spinner.start(chalk.blue("Installing dependencies..."));
          await execAsync(
            answers.directory
              ? `cd ${answers.projectName} && npm install`
              : `npm install`
          );

          spinner.succeed(chalk.green("Dependencies installed"));
          spinner.start(chalk.blue("Creating project files..."));

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

          spinner.succeed(chalk.green("Project files created"));
          console.log(" ");
          console.log(
            chalk.yellow(
              `------------------------------------------------------`
            )
          );
          console.log(" ");
          const end = Date.now();
          const time = ((end - start) / 1000).toFixed(1);
          console.log(
            chalk.white(
              `🎉 Project ${chalk.green("created")} in ${chalk.blue(
                time + "s"
              )}`
            )
          );
          console.log(
            chalk.green(
              `🔗 ${answers.directory ? "./" + answers.projectName : "./"}`
            )
          );
          console.log(" ");
          console.log(
            chalk.white(
              "👉 Run " + chalk.blue("npm start") + " to start the project"
            )
          );
          console.log(" ");
          console.log(
            chalk.yellow(
              `------------------------------------------------------`
            )
          );
          console.log(" ");
          if (answers.directory) process.chdir(answers.projectName);
          process.exit(0);
        }
        break;
    }
  } catch (error) {
    spinner.fail(`An error occurred: ${error.message}`);
    process.exit(1);
  }
})();
