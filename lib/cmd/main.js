"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = tslib_1.__importDefault(require("commander"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const utils_1 = require("./utils");
const action_1 = tslib_1.__importDefault(require("./action"));
const Exit = () => {
    process.exit(1);
};
const UnknownCommand = (cmdName) => {
    console.log(`${chalk_1.default.red('Unknown command')} ${chalk_1.default.yellow(cmdName)}.`);
};
const packageInfo = utils_1.GetPackageInfo();
commander_1.default.version(packageInfo.version);
commander_1.default
    .command('download [githubLink]')
    .option('--owner <ownerName>', 'git repo author.')
    .option('--repo-name <repoName>', 'git repo name.')
    .option('--ref <refName>', 'git repo branch, commit hash or tagname.')
    .option('--relative-path <relativePath>', 'specified repo relative path to download.')
    .option('-d, --dest <destPath>', 'specified dest path.')
    .option('-l, --parallel-limit, <number>', 'specified download max parallel limit.')
    .option('-u, --username, <username>', 'specified git account username.')
    .option('-p --password, <password>', 'specified git account password.')
    .option('-t --token, <token>', 'specified git account personal access token.')
    .option('-e --exclude, <relativePath,...,relativePath>', 'indicates which file paths need to be excluded in the current directory.')
    .option('-i --include, <relativePath,...,relativePath>', 'indicates which files need to be included in the exclusion file list.')
    .alias('d')
    .description('download the file with the specified path of the remote repo.')
    .action(action_1.default);
commander_1.default.on('command:*', (cmdObj = []) => {
    const [cmd] = cmdObj;
    if (cmd) {
        commander_1.default.outputHelp();
        UnknownCommand(cmd);
        Exit();
    }
});
if (process.argv.slice(2).length <= 0) {
    commander_1.default.help();
}
commander_1.default.parse(process.argv);
